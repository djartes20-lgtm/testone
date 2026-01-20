"use client";

import Player from "@/app/components/Player";
import Queue from "@/app/components/Queue";
/*
import History from "@/app/components/History";
import ProfileMenu from "@/app/components/ProfileMenu";
import ModeSelector from "@/app/components/ModeSelector";
*/
export default function AdminPage() {
  return (
    <div className="min-h-screen p-6 space-y-6">

      <h1 className="text-3xl font-bold text-red-600 drop-shadow">
        Gotham Play — Painel Admin
      </h1>

      <Player />
      <Queue />
      {/*
      <History />
      <ModeSelector />      <ProfileMenu />
*/}
    </div>
  );
}
