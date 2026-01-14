"use client";

import { useState } from "react";
import Head from "next/head";
import Splash from "@/app/students/components/Splash";
import Login from "@/app/students/components/Login";
import Dashboard from "@/app/students/components/Dashboard";

interface User {
  nome: string;
  telefone: string;
}

export default function students() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  return (
    <>
      <Head>
        <title>Gotham Play</title>
        <script src="https://www.youtube.com/iframe_api" />
      </Head>

      {splashVisible && <Splash onFinish={() => setSplashVisible(false)} />}

      {!splashVisible && !user && <Login onLogin={(user) => setUser(user)} />}

      {user && <Dashboard user={user} />}
    </>
  );
}
