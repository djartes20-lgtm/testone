"use client";

import Player from "@/app/components2/Player";
import Queue from "@/app/components2/Queue";

import History from "@/app/components2/History";
import ProfileMenu from "@/app/components2/ProfileMenu";
import ModeSelector from "@/app/components2/ModeSelector";

export default function AdminPage() {
  return (
    <div className="min-h-screen p-6 space-y-6">

      <h1 className="text-3xl font-bold text-red-600 drop-shadow">
        Gotham Play — Painel Admin
      </h1>

      <Player />
      <Queue />
      
      <History />
      <ModeSelector />      <ProfileMenu />

    </div>
  );
}
