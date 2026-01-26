"use client";

import YouTubePlayer from "@/app/components/YouTubePlayer";
import QueueList from "@/app/components/QueueList";
import { useQueue } from "@/app/hooks/useQueue";
import SearchMusic from "../components/SearchMusic";
import Clock from "@/app/components/RelogioeData";
import History from "@/app/components/AlunoHistory";
import MaisTocadas from "@/app/components/MaisTocadas";
import AlunosGenerosRestritos from "@/app/components/AlunosGenerosRestritos";


import { useEffect, useState } from "react";
import LoginButton from "../components/LoginButton";

interface GothamUser {
  nome: string;
}

export default function AlunoPage() {
  const [user, setUser] = useState<GothamUser | null>(null);

  const isAdmin = false;
  const queueHook = useQueue();

  // 🔹 Carrega usuário do localStorage
  useEffect(() => {
    const data = localStorage.getItem("gotham_user");
    if (data) {
      setUser(JSON.parse(data));
    }
  }, []);

  return (
    <main className="flex flex-col gap-2 min-h-screen p-6">
      {/* HEADER */}
      <div className="p-3">
        <h1>Olá {user?.nome}</h1>
        <LoginButton />
        <h2>Boas-vindas à Gotham Play</h2>
      </div>

      {/* PLAYER */}
      <YouTubePlayer isAdmin={isAdmin} />

{/* ABA DO ALUNO PARA VER GÊNEROS BLOQUEADOS */}
<div>
  <AlunosGenerosRestritos />
</div>

      {/* 🔎 BUSCAR MÚSICA */}
      <SearchMusic />

      {/* FILA */}
      <QueueList
        queue={queueHook.queue}
        isAdmin={isAdmin}
        removeFromQueue={queueHook.removeFromQueue}
      />

      {/* 📜 HISTÓRICO — SEM BOTÃO, ABRE DIRETO */}
      <History />

      {/* MAIS TOCADAS (sempre visível) */}
      <div>
        <MaisTocadas />
      </div>

      {/* RELÓGIO */}
      <Clock />
    </main>
  );
}


