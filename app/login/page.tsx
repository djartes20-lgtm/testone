"use client";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

export default function LoginButton() {
  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <button onClick={login}>
      🔐 Entrar com Google
    </button>
  );
}
