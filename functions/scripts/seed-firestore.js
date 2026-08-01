const admin = require("firebase-admin");

function initializeFirestore() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }

  return admin.firestore();
}

function buildSeedData() {
  const now = admin.firestore.Timestamp.now();
  const dueDate = admin.firestore.Timestamp.fromDate(new Date("2026-04-10T00:00:00.000Z"));
  const paidAt = admin.firestore.Timestamp.fromDate(new Date("2026-04-05T10:30:00.000Z"));
  const meetingDate = admin.firestore.Timestamp.fromDate(new Date("2026-04-20T05:30:00.000Z"));
  const utilityRecordedAt = admin.firestore.Timestamp.fromDate(new Date("2026-04-01T06:00:00.000Z"));
  const expenseDate = admin.firestore.Timestamp.fromDate(new Date("2026-04-12T09:00:00.000Z"));
  const salaryPaidDate = admin.firestore.Timestamp.fromDate(new Date("2026-04-30T11:00:00.000Z"));

  return {
    users: {
      admin1: {
        userId: "admin1",
        name: "Admin User",
        phone: "+911234567890",
        email: "admin@example.com",
        role: "ADMIN",
        flatId: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        fcmToken: "sample-admin-device-token",
        profileImageUrl: "",
      },
      owner1: {
        userId: "owner1",
        name: "Jyoti Nayak",
        phone: "+919876543210",
        email: "jyoti@example.com",
        role: "OWNER",
        flatId: "flat_101",
        isActive: true,
        createdAt: now,
        updatedAt: now,
        fcmToken: "sample-owner-device-token",
        profileImageUrl: "",
      },
      tenant1: {
        userId: "tenant1",
        name: "Aarav Mehta",
        phone: "+919812345678",
        email: "aarav@example.com",
        role: "TENANT",
        flatId: "flat_101",
        isActive: true,
        createdAt: now,
        updatedAt: now,
        fcmToken: "sample-tenant-device-token",
        profileImageUrl: "",
      },
      caretaker1: {
        userId: "caretaker1",
        name: "Ramesh",
        phone: "+919900112233",
        email: "caretaker@example.com",
        role: "CARETAKER",
        flatId: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        fcmToken: "sample-caretaker-device-token",
        profileImageUrl: "",
      },
    },
    flats: {
      flat_101: {
        flatId: "flat_101",
        flatNumber: "A-101",
        block: "A",
        floor: 1,
        ownerId: "owner1",
        tenantId: "tenant1",
        areaSqFt: 1200,
        parkingSlots: ["P1", "P2"],
        maintenanceRate: 2.5,
        createdAt: now,
      },
    },
    bills: {
      bill_2026_04_flat_101: {
        billId: "bill_2026_04_flat_101",
        flatId: "flat_101",
        month: "2026-04",
        maintenanceAmount: 3000,
        utilityAmount: 1200,
        otherCharges: 500,
        penalty: 0,
        totalAmount: 4700,
        status: "PAID",
        dueDate,
        generatedAt: now,
        paidAt,
        paymentIds: ["payment_001"],
        breakdown: {
          electricity: 800,
          water: 400,
        },
      },
    },
    payments: {
      payment_001: {
        paymentId: "payment_001",
        billId: "bill_2026_04_flat_101",
        flatId: "flat_101",
        userId: "owner1",
        amount: 4700,
        mode: "UPI",
        upiApp: "GPay",
        transactionId: "UPI123ABC",
        status: "SUCCESS",
        paidAt,
        verifiedBy: "admin1",
        proofImage: "",
      },
    },
    utilities: {
      util_101_apr_electricity: {
        utilityId: "util_101_apr_electricity",
        flatId: "flat_101",
        type: "ELECTRICITY",
        previousReading: 1200,
        currentReading: 1333,
        unitsConsumed: 133,
        ratePerUnit: 6,
        amount: 798,
        recordedAt: utilityRecordedAt,
        recordedBy: "caretaker1",
      },
      util_101_apr_water: {
        utilityId: "util_101_apr_water",
        flatId: "flat_101",
        type: "WATER",
        previousReading: 300,
        currentReading: 340,
        unitsConsumed: 40,
        ratePerUnit: 10,
        amount: 400,
        recordedAt: utilityRecordedAt,
        recordedBy: "caretaker1",
      },
    },
    expenses: {
      exp_001: {
        expenseId: "exp_001",
        title: "Lift repair",
        description: "Motor replacement",
        amount: 15000,
        category: "REPAIR",
        paidTo: "Vendor Name",
        invoiceUrl: "",
        date: expenseDate,
        createdBy: "admin1",
      },
    },
    salaries: {
      sal_apr_001: {
        salaryId: "sal_apr_001",
        employeeName: "Ramesh",
        role: "CARETAKER",
        amount: 12000,
        month: "2026-04",
        status: "PAID",
        paidDate: salaryPaidDate,
        paymentMode: "UPI",
      },
    },
    meetings: {
      meet_001: {
        meetingId: "meet_001",
        title: "Monthly Meeting",
        agenda: "Budget discussion",
        date: meetingDate,
        createdBy: "admin1",
        notes: "Finalized maintenance increase",
        attendees: ["admin1", "owner1", "tenant1"],
      },
    },
  };
}

async function writeCollection(batch, db, collectionName, documents) {
  Object.entries(documents).forEach(([id, data]) => {
    batch.set(db.collection(collectionName).doc(id), data, { merge: true });
  });
}

async function seedDatabase() {
  const db = initializeFirestore();
  const seedData = buildSeedData();
  const batch = db.batch();

  writeCollection(batch, db, "users", seedData.users);
  writeCollection(batch, db, "flats", seedData.flats);
  writeCollection(batch, db, "bills", seedData.bills);
  writeCollection(batch, db, "payments", seedData.payments);
  writeCollection(batch, db, "utilities", seedData.utilities);
  writeCollection(batch, db, "expenses", seedData.expenses);
  writeCollection(batch, db, "salaries", seedData.salaries);
  writeCollection(batch, db, "meetings", seedData.meetings);

  await batch.commit();

  const summary = Object.entries(seedData)
    .map(([collection, docs]) => `${collection}: ${Object.keys(docs).length}`)
    .join(", ");

  console.log(`Firestore seed completed successfully (${summary}).`);
}

seedDatabase().catch((error) => {
  console.error("Firestore seed failed.");
  console.error(error.message);
  process.exitCode = 1;
});
