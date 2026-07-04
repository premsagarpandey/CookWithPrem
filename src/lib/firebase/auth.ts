// ============================================
// CookWithPrem — Firebase Auth Helpers
// ============================================

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import type { UserProfile } from "@/types";

const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google OAuth popup.
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await createUserProfile(result.user);
  return result.user;
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Create account with email and password.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  await sendEmailVerification(result.user);
  await createUserProfile(result.user, displayName);
  return result.user;
}

/**
 * Send a password reset email.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Send email verification.
 */
export async function sendVerification(user: User): Promise<void> {
  await sendEmailVerification(user);
}

/**
 * Sign out the current user.
 */
export async function logOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Create or update user profile in Firestore.
 */
async function createUserProfile(
  user: User,
  displayName?: string
): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const profile: Omit<UserProfile, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> } = {
      uid: user.uid,
      email: user.email || "",
      displayName: displayName || user.displayName || "User",
      photoURL: user.photoURL || "",
      role: "user",
      bookmarks: [],
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, profile);
  }
}

/**
 * Get user profile from Firestore.
 */
export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { ...userSnap.data(), uid: userSnap.id } as UserProfile;
  }
  return null;
}
