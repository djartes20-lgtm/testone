"use client";

import YouTubePlayer from "@/app/components/YouTubePlayer";
import QueueList from "@/app/components/QueueList";
import { useQueue } from "@/app/hooks/useQueue";
import SearchMusic from "../components/SearchMusic";

import Player from "@/app/components2/Player";
/*
import Queue from "@/app/components2/Queue";

import History from "@/app/components2/History";
import ProfileMenu from "@/app/components2/ProfileMenu";
import ModeSelector from "@/app/components2/ModeSelector";
*/
export default function AlunoPage() {
  const isAdmin = false; // depois liga no auth
  const queueHook = useQueue();
  return (
    <main className=" flex flex-col gap-0.5 min-h-screen p-6 space-y-6 " >
      <h1 className="text-3xl font-bold text-red-600 drop-shadow">
        Gotham Play 
      </h1>

      <YouTubePlayer isAdmin={isAdmin} />

      <SearchMusic />
      {/** fila de musicas */}
      <QueueList
        queue={queueHook.queue}
        isAdmin={isAdmin}
        removeFromQueue={queueHook.removeFromQueue}
      />


      {/**
       *       <Player />

      <History />
      <ProfileMenu />
*/}

    </main>

  );
}
