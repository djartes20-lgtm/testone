"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import DashboardPage from "./DashboardPage";


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/adm-dj"); // ✅ SEM validação
      }
    });

    return () => unsub();
  }, []);

    return (<DashboardPage/>);

}


