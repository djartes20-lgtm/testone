"use client";

import { db } from "@/app/lib/firebase";
import { ref, onValue, remove, runTransaction } from "firebase/database";
import { useEffect, useState } from "react";
import Head from "next/head";

import Splash from "@/app/components2/Splash";
import Login from "@/app/components2/Login";
import Dashboard from "@/app/components2/Dashboard";
import Player from "@/app/components2/Player";
import AlunoPage from "./aluno/page";

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
    const musicaRef = ref(db, "musicaAtual");
    return onValue(musicaRef, (snapshot) => {
      setMusicaAtual(snapshot.val());
    });
  }, []);

  // Sincroniza votos
  useEffect(() => {
    const votosRef = ref(db, "votosPular");
    return onValue(votosRef, (snapshot) => {
      setVotos(snapshot.val() || {});
    });
  }, []);

  // Função votar para pular música
  const votarParaPular = async () => {
    if (!user?.nome || !musicaAtual) return;

    const votosRef = ref(db, "votosPular");

    await runTransaction(votosRef, (current) => {
      if (!current) current = {};
      if (current[user.nome]) return current;
      current[user.nome] = true;
      return current;
    }).then(async (result) => {
      if (!result.committed) return;

      const votosAtuais = result.snapshot.val();
      const totalVotos = Object.keys(votosAtuais).length;

      if (totalVotos >= 1) {
        await remove(ref(db, "musicaAtual"));
        await remove(ref(db, "votosPular"));
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
  <AlunoPage />
)}
    </>
  );
}






