import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ─── Static / semi-static data cached in memory ────────────────────────────
const CACHE = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 min

const cached = (key, fetcher) => {
  const now = Date.now();
  if (CACHE[key] && now - CACHE[key].ts < CACHE_TTL) return Promise.resolve(CACHE[key].data);
  return fetcher().then((data) => {
    CACHE[key] = { data, ts: now };
    return data;
  });
};

export function AppProvider({ children }) {
  const { currentUser, userProfile } = useAuth();
  const [society, setSociety] = useState(null);
  const [flats, setFlats] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // ── Load society config (cached) ──────────────────────────────────────────
  useEffect(() => {
    if (!userProfile?.societyId) return;
    cached(`society_${userProfile.societyId}`, () =>
      getDoc(doc(db, "societies", userProfile.societyId)).then((s) =>
        s.exists() ? { id: s.id, ...s.data() } : null
      )
    ).then(setSociety);
  }, [userProfile?.societyId]);

  // ── Load flats list (cached) ───────────────────────────────────────────────
  useEffect(() => {
    if (!userProfile?.societyId) return;
    cached(`flats_${userProfile.societyId}`, () =>
      getDocs(
        query(
          collection(db, "flats"),
          where("societyId", "==", userProfile.societyId),
          orderBy("flatNumber")
        )
      ).then((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    ).then(setFlats);
  }, [userProfile?.societyId]);

  // ── Unread notifications count ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "notifications"),
      where("recipientUids", "array-contains", currentUser.uid),
      where("read", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => setUnreadNotifications(snap.size));
    return unsub;
  }, [currentUser]);

  const invalidateCache = (key) => {
    delete CACHE[key];
  };

  const value = {
    society,
    flats,
    unreadNotifications,
    invalidateCache,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
