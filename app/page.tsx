"use client";

import { database } from "@/app/lib/firebase";
import { ref, onValue, remove, runTransaction } from "firebase/database";
import { useEffect, useState } from "react";
import Head from "next/head";
import Splash from "@/app/components/Splash";
import Login from "@/app/components/Login";
import Dashboard from "@/app/components/Dashboard";
import Player from "@/app/components/Player";

interface User {
  nome: string;
  telefone: string;
}

export default function Home() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Para música atual + votos
  const [musicaAtual, setMusicaAtual] = useState<string | null>(null);
  const [votos, setVotos] = useState<{ [key: string]: boolean }>({});

  // 🔐 Recupera login salvo
  useEffect(() => {
    const saved = localStorage.getItem("gotham_user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoadingUser(false);
  }, []);

  // Sincroniza música atual
  useEffect(() => {
    const musicaRef = ref(database, "musicaAtual");
    return onValue(musicaRef, (snapshot) => {
      setMusicaAtual(snapshot.val());
    });
  }, []);

  // Sincroniza votos
  useEffect(() => {
    const votosRef = ref(database, "votosPular");
    return onValue(votosRef, (snapshot) => {
      setVotos(snapshot.val() || {});
    });
  }, []);

  // Função votar para pular música
  const votarParaPular = async () => {
    if (!user?.nome || !musicaAtual) return;

    const votosRef = ref(database, "votosPular");

    await runTransaction(votosRef, (current) => {
      if (!current) current = {};
      if (current[user.nome]) return current;
      current[user.nome] = true;
      return current;
    }).then(async (result) => {
      if (!result.committed) return;

      const votosAtuais = result.snapshot.val();
      const totalVotos = Object.keys(votosAtuais).length;

      if (totalVotos >= 5) {
        await remove(ref(database, "musicaAtual"));
        await remove(ref(database, "votosPular"));
      }
    });
  };

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

      {user && (
  <Dashboard user={user}>
    <div className="p-4 border-2 border-red-600 rounded-xl">

      <h3>Tocando agora</h3>
      <p>ID: {musicaAtual?.id || "Nenhuma"}</p>
      <p>Tempo: {musicaAtual?.tempo ?? 0}s</p>

      <button
        onClick={votarParaPular}
        className="mt-2 p-2 bg-red-600 text-white rounded"
      >
        Pular Música
      </button>

    </div>
  </Dashboard>
)}
    </>
  );
}






