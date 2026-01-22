"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await signInAnonymously(auth);
      } else {
        setUser(user);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return { user, loading };
}
