import { getAuth, signInAnonymously } from "firebase/auth";

export async function ensureAuth() {
  const auth = getAuth();

  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}
