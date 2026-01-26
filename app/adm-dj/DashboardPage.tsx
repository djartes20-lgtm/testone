"use client";

import { useState } from "react";
import YouTubePlayer from "@/app/components/YouTubePlayer";
import QueueList from "@/app/components/QueueList";
import SearchMusic from "@/app/components/SearchMusic";
import Avisos from "@/app/components/avisos";
import History from "@/app/components/History";
import MaisTocadas from "@/app/components/MaisTocadas";
import Clock from "@/app/components/RelogioeData";
import AdminAlerts from "@/app/components/AdminAlerts";
import EstatisticasDashboard from "@/app/components/EstatisticasDashboard";
import GeneroRestricao from "@/app/components/GeneroRestricao";
import { useQueue } from "@/app/hooks/useQueue";
import OnlineUsers from "./OnlineUsers";

export default function DashboardPage() {
  const isAdmin = true;
  const queueHook = useQueue();
  const [activeTab, setActiveTab] = useState<"player" | "queue" | "history" | "maisTocadas">("player");

  return (
    <main className="min-h-screen p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-red-600 drop-shadow">
          Gotham Play — Painel Admin
        </h1>
        <Clock />
      </div>

      {/* MOBILE TABS */}
      <div className="md:hidden mb-4 flex justify-around">
        {["player", "queue", "history", "maisTocadas"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 py-1 rounded ${
              activeTab === tab ? "bg-red-600 text-white" : "bg-black text-red-600 border border-red-600"
            }`}
          >
            {tab === "player"
              ? "🎵 Player"
              : tab === "queue"
              ? "📜 Fila"
              : tab === "history"
              ? "🕒 Histórico"
              : "🔥 Mais Tocadas"}
          </button>
        ))}
      </div>

      {/* PLAYER */}
      <div className={`${activeTab === "player" ? "block" : "hidden"} md:block space-y-4`}>
        <YouTubePlayer isAdmin={isAdmin} />
        <SearchMusic />
        <GeneroRestricao />
        <div
          style={{
            border: "1px solid #ff0707",
            borderRadius: 10,
            padding: 10,
            background: "#000",
            maxHeight: 260,
            boxShadow: `
              0 0 6px rgba(255,7,7,0.6),
              0 0 14px rgba(255,7,7,0.45),
              0 0 24px rgba(255,7,7,0.25)
            `,
          }}
        >
          <Avisos />
        </div>
      </div>

      {/* QUEUE */}
      <div className={`${activeTab === "queue" ? "block" : "hidden"} md:block`}>
        <QueueList
          queue={queueHook.queue}
          isAdmin={isAdmin}
          removeFromQueue={queueHook.removeFromQueue}
        />
      </div>

      {/* HISTORY */}
      <div className={`${activeTab === "history" ? "block" : "hidden"} md:block`}>
        <History />
      </div>

      {/* MAIS TOCADAS 
      <div className={`${activeTab === "maisTocadas" ? "block" : "hidden"} md:block`}>
        <MaisTocadas />
      </div>
*/}
      {/* DESKTOP EXTRAS */}
      <div className="hidden md:block space-y-4">
        <EstatisticasDashboard />
        <AdminAlerts />
      </div>
      
<div>
  <OnlineUsers />
</div>
    </main>
  );
}

