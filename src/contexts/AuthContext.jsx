import { createContext, useContext, useEffect, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // ── Fetch user profile from Firestore ──────────────────────────────────────
  const fetchUserProfile = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = snap.data();
      setUserProfile(data);
      // cache lightweight profile in sessionStorage
      sessionStorage.setItem("userProfile", JSON.stringify(data));
      return data;
    }
    return null;
  };

  // ── Auth state listener ────────────────────────────────────────────────────
  useEffect(() => {
    const cached = sessionStorage.getItem("userProfile");
    if (cached) setUserProfile(JSON.parse(cached));

    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
        sessionStorage.removeItem("userProfile");
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Send OTP ───────────────────────────────────────────────────────────────
  const setupRecaptcha = (containerId) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
        callback: () => {},
      });
    }
    return window.recaptchaVerifier;
  };

  const sendOTP = async (phoneNumber, containerId) => {
    const verifier = setupRecaptcha(containerId);
    const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    setConfirmationResult(result);
    return result;
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const verifyOTP = async (otp) => {
    if (!confirmationResult) throw new Error("No OTP sent");
    const credential = await confirmationResult.confirm(otp);
    const user = credential.user;

    // Create user doc if first login
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        phone: user.phoneNumber,
        role: "pending", // Admin assigns role later
        createdAt: serverTimestamp(),
        isActive: true,
        fcmTokens: [],
      });
    }

    await fetchUserProfile(user.uid);
    return user;
  };

  const logout = async () => {
    await signOut(auth);
    sessionStorage.clear();
    window.recaptchaVerifier = null;
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    sendOTP,
    verifyOTP,
    logout,
    refreshProfile: () => currentUser && fetchUserProfile(currentUser.uid),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
