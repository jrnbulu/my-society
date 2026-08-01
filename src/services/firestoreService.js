/**
 * Firestore service helpers – thin wrappers with consistent error handling.
 * All collection paths follow the schema defined in docs/FIRESTORE_SCHEMA.md
 */
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const now = () => serverTimestamp();
export const ts = (date) => Timestamp.fromDate(date);

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersCol = () => collection(db, "users");

export const getUser = (uid) => getDoc(doc(db, "users", uid));

export const updateUser = (uid, data) =>
  updateDoc(doc(db, "users", uid), { ...data, updatedAt: now() });

export const getUsersByFlat = (societyId, flatId) =>
  getDocs(
    query(usersCol(), where("societyId", "==", societyId), where("flatId", "==", flatId))
  );

export const getUsersBySociety = (societyId) =>
  getDocs(query(usersCol(), where("societyId", "==", societyId)));

// ─── Societies ────────────────────────────────────────────────────────────────
export const getSociety = (id) => getDoc(doc(db, "societies", id));

// ─── Flats ────────────────────────────────────────────────────────────────────
export const flatsCol = () => collection(db, "flats");

export const getFlat = (flatId) => getDoc(doc(db, "flats", flatId));

export const getFlatsBySociety = (societyId) =>
  getDocs(
    query(flatsCol(), where("societyId", "==", societyId), orderBy("flatNumber"))
  );

export const updateFlat = (flatId, data) =>
  updateDoc(doc(db, "flats", flatId), { ...data, updatedAt: now() });

// ─── Bills ────────────────────────────────────────────────────────────────────
export const billsCol = () => collection(db, "bills");

export const createBill = (data) => addDoc(billsCol(), { ...data, createdAt: now() });

export const getBillsByFlat = (societyId, flatId) =>
  getDocs(
    query(
      billsCol(),
      where("societyId", "==", societyId),
      where("flatId", "==", flatId),
      orderBy("dueDate", "desc")
    )
  );

export const getUnpaidBills = (societyId) =>
  getDocs(
    query(
      billsCol(),
      where("societyId", "==", societyId),
      where("status", "==", "unpaid"),
      orderBy("dueDate", "asc")
    )
  );

export const updateBill = (billId, data) =>
  updateDoc(doc(db, "bills", billId), { ...data, updatedAt: now() });

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsCol = () => collection(db, "payments");

export const recordPayment = (data) =>
  addDoc(paymentsCol(), { ...data, createdAt: now() });

export const getPaymentsByFlat = (societyId, flatId) =>
  getDocs(
    query(
      paymentsCol(),
      where("societyId", "==", societyId),
      where("flatId", "==", flatId),
      orderBy("paidAt", "desc")
    )
  );

// Atomically mark bill as paid + record payment
export const markBillPaid = async (billId, paymentData) => {
  const batch = writeBatch(db);
  const payRef = doc(paymentsCol());
  batch.set(payRef, { ...paymentData, billId, createdAt: now() });
  batch.update(doc(db, "bills", billId), {
    status: "paid",
    paidAt: now(),
    paymentId: payRef.id,
    updatedAt: now(),
  });
  await batch.commit();
  return payRef.id;
};

// ─── Utilities ────────────────────────────────────────────────────────────────
export const utilitiesCol = () => collection(db, "utilityReadings");

export const addUtilityReading = (data) =>
  addDoc(utilitiesCol(), { ...data, createdAt: now() });

export const getUtilityReadings = (societyId, flatId, month) =>
  getDocs(
    query(
      utilitiesCol(),
      where("societyId", "==", societyId),
      where("flatId", "==", flatId),
      where("month", "==", month)
    )
  );

// ─── Parking ──────────────────────────────────────────────────────────────────
export const parkingCol = () => collection(db, "parkingSlots");

export const getParkingSlots = (societyId) =>
  getDocs(query(parkingCol(), where("societyId", "==", societyId), orderBy("slotNumber")));

export const updateParkingSlot = (slotId, data) =>
  updateDoc(doc(db, "parkingSlots", slotId), { ...data, updatedAt: now() });

// ─── Expenses ─────────────────────────────────────────────────────────────────
export const expensesCol = () => collection(db, "expenses");

export const addExpense = (data) => addDoc(expensesCol(), { ...data, createdAt: now() });

export const getExpenses = (societyId, month) =>
  getDocs(
    query(
      expensesCol(),
      where("societyId", "==", societyId),
      where("month", "==", month),
      orderBy("date", "desc")
    )
  );

// ─── Salaries ─────────────────────────────────────────────────────────────────
export const salariesCol = () => collection(db, "salaries");

export const addSalaryRecord = (data) =>
  addDoc(salariesCol(), { ...data, createdAt: now() });

export const getSalaries = (societyId, month) =>
  getDocs(
    query(
      salariesCol(),
      where("societyId", "==", societyId),
      where("month", "==", month)
    )
  );

// ─── Meetings ─────────────────────────────────────────────────────────────────
export const meetingsCol = () => collection(db, "meetings");

export const createMeeting = (data) =>
  addDoc(meetingsCol(), { ...data, createdAt: now() });

export const getMeetings = (societyId) =>
  getDocs(
    query(
      meetingsCol(),
      where("societyId", "==", societyId),
      orderBy("scheduledAt", "desc"),
      limit(20)
    )
  );

export const updateMeeting = (meetingId, data) =>
  updateDoc(doc(db, "meetings", meetingId), { ...data, updatedAt: now() });

// ─── Notices ──────────────────────────────────────────────────────────────────
export const noticesCol = () => collection(db, "notices");

export const createNotice = (data) =>
  addDoc(noticesCol(), { ...data, createdAt: now() });

export const getNotices = (societyId) =>
  getDocs(
    query(
      noticesCol(),
      where("societyId", "==", societyId),
      orderBy("createdAt", "desc"),
      limit(30)
    )
  );

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsCol = () => collection(db, "notifications");

export const markNotificationRead = (notifId) =>
  updateDoc(doc(db, "notifications", notifId), { read: true });

export const getNotifications = (uid) =>
  getDocs(
    query(
      notificationsCol(),
      where("recipientUids", "array-contains", uid),
      orderBy("createdAt", "desc"),
      limit(50)
    )
  );
