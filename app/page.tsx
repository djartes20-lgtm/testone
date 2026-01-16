"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import Splash from "@/app/components/Splash";
import Login from "@/app/components/Login";
import Dashboard from "@/app/components/Dashboard";

interface User {
  nome: string;
  telefone: string;
}

export default function Home() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 🔐 Recupera login salvo
  useEffect(() => {
    const saved = localStorage.getItem("gotham_user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoadingUser(false);
  }, []);

  if (loadingUser) return null;

  return (
    <>
      <Head>
        <title>Gotham Play</title>
        <script src="https://www.youtube.com/iframe_api" />
      </Head>

      {splashVisible && <Splash onFinish={() => setSplashVisible(false)} />}

      {!splashVisible && !user && (
        <Login onLogin={(u) => setUser(u)} />
      )}

      {user && <Dashboard user={user} />}
    </>
  );
}


