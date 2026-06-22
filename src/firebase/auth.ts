import { getAuth } from "firebase/auth";
import app from "./firebase";

// FUTURE IMPLEMENTATION — Firebase Authentication
// All auth logic is prepared but disabled until backend auth flow is wired up.

export const auth = getAuth(app);

// FUTURE IMPLEMENTATION — Login with email/password
// export async function loginWithEmail(email: string, password: string) {
//   const { signInWithEmailAndPassword } = await import("firebase/auth");
//   return signInWithEmailAndPassword(auth, email, password);
// }

// FUTURE IMPLEMENTATION — Create new account
// export async function signupWithEmail(email: string, password: string) {
//   const { createUserWithEmailAndPassword } = await import("firebase/auth");
//   return createUserWithEmailAndPassword(auth, email, password);
// }

// FUTURE IMPLEMENTATION — Sign out and clear session
// export async function logout() {
//   const { signOut } = await import("firebase/auth");
//   return signOut(auth);
// }

// FUTURE IMPLEMENTATION — Send password reset email
// export async function resetPassword(email: string) {
//   const { sendPasswordResetEmail } = await import("firebase/auth");
//   return sendPasswordResetEmail(auth, email);
// }

// FUTURE IMPLEMENTATION — Auth state observer
// export function onAuthChange(callback: (user: User | null) => void) {
//   const { onAuthStateChanged } = await import("firebase/auth");
//   return onAuthStateChanged(auth, callback);
// }

// FUTURE IMPLEMENTATION — Role-Based Authentication
// After login, fetch user document from Firestore users/{uid} to get role.
// Roles: "Admin" | "Manager" | "Data Entry Operator" | "Viewer"
// Gate route access based on role via middleware or layout check.

// FUTURE IMPLEMENTATION — Session Management
// Use Firebase ID tokens (JWT). On each request, verify token server-side.
// Token refresh is handled automatically by the Firebase SDK.
// For Next.js SSR: use firebase-admin to verify token in API routes / middleware.

export default auth;
