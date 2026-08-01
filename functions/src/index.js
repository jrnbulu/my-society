/**
 * Firebase Cloud Functions – My Society App
 *
 * Functions:
 *  1. generateMonthlyBills   – Scheduled: 1st of every month 00:00 IST
 *  2. sendPaymentReminders   – Scheduled: every day 09:00 IST
 *  3. onPaymentRecorded      – Firestore trigger: payments collection
 *  4. detectExpenseInsights  – Scheduled: 1st of every month 06:00 IST
 *  5. notifyMeetingReminder  – Scheduled: every hour (checks upcoming meetings)
 *  6. onNewNotice            – Firestore trigger: notices collection
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const axios = require("axios");

initializeApp();
const db = getFirestore();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function prevMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function sendFCM(tokens, title, body, data = {}) {
  if (!tokens || tokens.length === 0) return;
  const message = {
    notification: { title, body },
    data: { ...data },
    tokens,
  };
  try {
    await getMessaging().sendEachForMulticast(message);
  } catch (e) {
    console.error("FCM error:", e.message);
  }
}

async function sendSMS(phone, message) {
  const apiKey = process.env.MSG91_API_KEY;
  if (!apiKey) return;
  try {
    await axios.post("https://api.msg91.com/api/v5/otp/retry", null, {
      params: {
        authkey: apiKey,
        mobiles: phone,
        message,
        sender: "MYSOC",
        route: "4",
      },
    });
  } catch (e) {
    console.error("SMS error:", e.message);
  }
}

async function createNotification(societyId, recipientUids, title, body, type) {
  await db.collection("notifications").add({
    societyId,
    recipientUids,
    title,
    body,
    type,
    read: false,
    createdAt: Timestamp.now(),
  });
}

// ─── 1. Generate Monthly Bills ────────────────────────────────────────────────
exports.generateMonthlyBills = onSchedule(
  {
    schedule: "0 0 1 * *",  // 1st of every month midnight UTC
    timeZone: "Asia/Kolkata",
    region: "asia-south1",
  },
  async () => {
    const month = currentMonth();
    console.log(`Generating bills for month: ${month}`);

    const societiesSnap = await db.collection("societies").get();

    for (const societyDoc of societiesSnap.docs) {
      const society = societyDoc.data();
      const societyId = societyDoc.id;
      const maintenanceRate = society.monthlyMaintenance || 2000;

      const flatsSnap = await db
        .collection("flats")
        .where("societyId", "==", societyId)
        .get();

      const batch = db.batch();
      const dueDate = new Date();
      dueDate.setDate(10); // due by 10th of month

      for (const flatDoc of flatsSnap.docs) {
        const flat = flatDoc.data();

        // Check if bill already exists for this month
        const existing = await db
          .collection("bills")
          .where("societyId", "==", societyId)
          .where("flatId", "==", flatDoc.id)
          .where("month", "==", month)
          .where("type", "==", "Maintenance")
          .limit(1)
          .get();

        if (!existing.empty) continue;

        const billRef = db.collection("bills").doc();
        batch.set(billRef, {
          societyId,
          flatId: flatDoc.id,
          flatNumber: flat.flatNumber,
          type: "Maintenance",
          month,
          baseAmount: maintenanceRate,
          lateFeePct: 10,
          totalAmount: maintenanceRate,
          status: "unpaid",
          dueDate: Timestamp.fromDate(dueDate),
          createdBy: "system",
          createdAt: Timestamp.now(),
        });
      }

      await batch.commit();
      console.log(`Bills created for society ${societyId}`);
    }
  }
);

// ─── 2. Send Payment Reminders ────────────────────────────────────────────────
exports.sendPaymentReminders = onSchedule(
  {
    schedule: "0 9 * * *",  // daily 9am IST
    timeZone: "Asia/Kolkata",
    region: "asia-south1",
  },
  async () => {
    const today = new Date();

    const unpaidSnap = await db
      .collection("bills")
      .where("status", "==", "unpaid")
      .where("dueDate", "<=", Timestamp.fromDate(today))
      .get();

    const flatUserMap = {};

    for (const billDoc of unpaidSnap.docs) {
      const bill = billDoc.data();
      const flatId = bill.flatId;

      if (!flatUserMap[flatId]) {
        const usersSnap = await db
          .collection("users")
          .where("flatId", "==", flatId)
          .where("isActive", "==", true)
          .get();
        flatUserMap[flatId] = usersSnap.docs.map((u) => u.data());
      }

      const users = flatUserMap[flatId];
      for (const user of users) {
        const tokens = user.fcmTokens || [];
        await sendFCM(
          tokens,
          "Payment Reminder 🔔",
          `Your ${bill.type} bill of ₹${bill.totalAmount} for ${bill.month} is overdue.`,
          { billId: billDoc.id }
        );

        if (user.phone) {
          await sendSMS(
            user.phone,
            `Dear ${user.name || "Resident"}, your ${bill.type} bill of Rs.${bill.totalAmount} for ${bill.month} is due. Please pay at: https://my-society.web.app`
          );
        }

        // Create in-app notification
        await createNotification(
          bill.societyId,
          [user.uid],
          "Payment Overdue",
          `Your ${bill.type} bill of ₹${bill.totalAmount} for ${bill.month} is overdue.`,
          "reminder"
        );
      }
    }

    console.log(`Reminders sent for ${unpaidSnap.size} overdue bills`);
  }
);

// ─── 3. On Payment Recorded ───────────────────────────────────────────────────
exports.onPaymentRecorded = onDocumentCreated(
  {
    document: "payments/{paymentId}",
    region: "asia-south1",
  },
  async (event) => {
    const payment = event.data.data();
    const { uid, societyId, billType, month, amount } = payment;

    const userDoc = await db.collection("users").doc(uid).get();
    const user = userDoc.data();
    const tokens = user?.fcmTokens || [];

    await sendFCM(
      tokens,
      "Payment Received ✅",
      `₹${amount} received for ${billType} (${month}). Thank you!`,
      { paymentId: event.params.paymentId }
    );

    await createNotification(
      societyId,
      [uid],
      "Payment Confirmed",
      `₹${amount} received for ${billType} – ${month}. Thank you!`,
      "payment"
    );
  }
);

// ─── 4. Expense Insights ──────────────────────────────────────────────────────
exports.detectExpenseInsights = onSchedule(
  {
    schedule: "0 6 1 * *",
    timeZone: "Asia/Kolkata",
    region: "asia-south1",
  },
  async () => {
    const last = prevMonth();
    const societiesSnap = await db.collection("societies").get();

    for (const societyDoc of societiesSnap.docs) {
      const societyId = societyDoc.id;

      const expSnap = await db
        .collection("expenses")
        .where("societyId", "==", societyId)
        .where("month", "==", last)
        .get();

      if (expSnap.empty) continue;

      const total = expSnap.docs.reduce((s, d) => s + (d.data().amount || 0), 0);

      // Category breakdown
      const byCategory = {};
      for (const doc of expSnap.docs) {
        const { category, amount } = doc.data();
        byCategory[category] = (byCategory[category] || 0) + amount;
      }

      const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

      // Notify admin
      const adminsSnap = await db
        .collection("users")
        .where("societyId", "==", societyId)
        .where("role", "==", "admin")
        .get();

      const adminUids = adminsSnap.docs.map((d) => d.id);
      const adminTokens = adminsSnap.docs.flatMap((d) => d.data().fcmTokens || []);

      await sendFCM(
        adminTokens,
        `Expense Insight – ${last}`,
        `Total expenses: ₹${total}. Top category: ${topCategory?.[0]} (₹${topCategory?.[1]}).`
      );

      await createNotification(
        societyId,
        adminUids,
        `Expense Insight – ${last}`,
        `Total: ₹${total}. Top: ${topCategory?.[0]} ₹${topCategory?.[1]}.`,
        "insight"
      );
    }
  }
);

// ─── 5. Meeting Reminders ─────────────────────────────────────────────────────
exports.notifyMeetingReminder = onSchedule(
  {
    schedule: "0 * * * *",  // every hour
    timeZone: "Asia/Kolkata",
    region: "asia-south1",
  },
  async () => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const meetingsSnap = await db
      .collection("meetings")
      .where("status", "==", "scheduled")
      .where("scheduledAt", ">=", Timestamp.fromDate(in24h))
      .where("scheduledAt", "<=", Timestamp.fromDate(in25h))
      .get();

    for (const meetingDoc of meetingsSnap.docs) {
      const meeting = meetingDoc.data();
      const { societyId, title, venue } = meeting;

      const usersSnap = await db
        .collection("users")
        .where("societyId", "==", societyId)
        .where("isActive", "==", true)
        .get();

      const allUids = usersSnap.docs.map((d) => d.id);
      const allTokens = usersSnap.docs.flatMap((d) => d.data().fcmTokens || []);

      await sendFCM(
        allTokens,
        `Meeting Tomorrow: ${title}`,
        `Venue: ${venue || "Society Hall"}. Check the app for details.`,
        { meetingId: meetingDoc.id }
      );

      await createNotification(
        societyId,
        allUids,
        `Meeting Reminder: ${title}`,
        `Tomorrow · ${venue || "Society Hall"}`,
        "meeting"
      );
    }
  }
);

// ─── 6. Broadcast notice to all residents ─────────────────────────────────────
exports.onNewNotice = onDocumentCreated(
  {
    document: "notices/{noticeId}",
    region: "asia-south1",
  },
  async (event) => {
    const notice = event.data.data();
    const { societyId, title, body, type } = notice;

    const usersSnap = await db
      .collection("users")
      .where("societyId", "==", societyId)
      .where("isActive", "==", true)
      .get();

    const allUids = usersSnap.docs.map((d) => d.id);
    const allTokens = usersSnap.docs.flatMap((d) => d.data().fcmTokens || []);

    await sendFCM(allTokens, `📢 ${type} Notice`, title);

    await createNotification(societyId, allUids, title, body, "notice");
  }
);
