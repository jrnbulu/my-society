/**
 * Firebase Cloud Messaging helpers – request permission, get token, save to Firestore.
 */
import { getToken, onMessage } from "firebase/messaging";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db, getMessagingInstance } from "../firebase";

export async function requestNotificationPermission(uid) {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });

  if (token && uid) {
    await updateDoc(doc(db, "users", uid), {
      fcmTokens: arrayUnion(token),
    });
  }
  return token;
}

export async function onForegroundMessage(callback) {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}
