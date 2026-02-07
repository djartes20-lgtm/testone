"use client";

import { useState } from "react";
import YouTubePlayer from "@/app/components/YouTubePlayer";
import QueueList from "@/app/components/QueueList";
import SearchMusic from "@/app/components/SearchMusic";
import Avisos from "@/app/components/avisos";
import History from "@/app/components/History";
import Clock from "@/app/components/RelogioeData";
import AdminAlerts from "@/app/components/AdminAlerts";
import GeneroRestricao from "@/app/components/GeneroRestricao";
import { useQueue } from "@/app/hooks/useQueue";
import OnlineUsers from "./OnlineUsers";
import AdminTabs from "@/app/components/AdminTabs";
import ChatGotham from "@/app/components/ChatGotham";
import { useFirebase } from "@/app/hooks/useFirebase";

export default function DashboardPage() {
  const isAdmin = true;
  const queueHook = useQueue();

  // 🔹 Hook do Firebase com admin = true
  const { adicionarMusica } = useFirebase(true);

  const [activeTab, setActiveTab] = useState<"player" | "queue" | "history">(
    "player"
  );

  return (
    <main className="min-h-screen p-4 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-2">
        <h1 className="text-2xl font-bold text-red-600 drop-shadow text-center md:text-left">
          Painel Admin
        </h1>
        {/* Clock apenas no desktop */}
        <div className="hidden md:block">
          <Clock />
        </div>
      </div>

      {/* MOBILE TABS */}
      <div className="md:hidden mb-4 flex justify-around flex-wrap gap-2">
        {["player", "queue", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 py-1 rounded min-w-[70px] text-sm ${
              activeTab === tab
                ? "bg-red-600 text-white"
                : "bg-black text-red-600 border border-red-600"
            }`}
          >
            {tab === "player"
              ? "🎵 Player"
              : tab === "queue"
              ? "📜 Fila"
              : "🕒 Histórico"}
          </button>
        ))}
      </div>

      {/* PLAYER (Mobile) */}
      <div
        className={`${activeTab === "player" ? "block" : "hidden"} md:block space-y-4`}
      >
        <div className="w-full">
          <YouTubePlayer isAdmin={isAdmin} />
        </div>

        <div className="flex flex-col gap-2">
          {/* 🔹 Barra de pesquisa do Admin escondida */}
          {false && (
            <SearchMusic
              isAdmin={isAdmin}
              onAddMusic={async (video) => {
                await adicionarMusica(video.videoId);
              }}
            />
          )}

          <GeneroRestricao />
          <div className="border border-red-600 rounded-lg p-2 bg-black">
            <Avisos />
          </div>
        </div>
      </div>

      {/* CHAT GLOBAL (ADM) */}
      <ChatGotham userName="ADM" isAdmin />


      {/* QUEUE (Mobile) */}
      <div className={`${activeTab === "queue" ? "block" : "hidden"} md:block`}>
        <QueueList
          queue={queueHook.queue}
          isAdmin={isAdmin}
          removeFromQueue={queueHook.removeFromQueue}
        />
      </div>

      {/* HISTORY (Mobile) */}
      <div className={`${activeTab === "history" ? "block" : "hidden"} md:block`}>
        <History />
      </div>

      {/* DESKTOP EXTRAS */}
      <div className="hidden md:block space-y-4">
        <AdminAlerts />
      </div>

      return (
    <main className="p-6">
      <h1 className="text-red-500 font-bold text-xl mb-4">Painel do ADM</h1>

      {/* 🔀 Componente de reorganização de abas */}
      <AdminTabs />

      {/* Aqui você continua renderizando o resto das abas */}
      {/* Exemplo: */}
      {/* <QueueList /> */}
      {/* <Reports /> */}
      {/* <History /> */}
      {/* <ChatGotham /> */}
    </main>
  );


      {/* ONLINE USERS */}
      <div>
        <OnlineUsers />
      </div>
    </main>
  );
}

