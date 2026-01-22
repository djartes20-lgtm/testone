"use client";

import YouTubePlayer from "@/app/components/YouTubePlayer";
import QueueList from "@/app/components/QueueList";
import { useQueue } from "@/app/hooks/useQueue";
import SearchMusic from "../components/SearchMusic";

export default function Home() {
  const isAdmin = true; // depois liga no auth
  const queueHook = useQueue();

  return (
    <main style={{ padding: 20 }}>
      <YouTubePlayer isAdmin={isAdmin} />

<SearchMusic/>
      <QueueList
        queue={queueHook.queue}
        isAdmin={isAdmin}
        removeFromQueue={queueHook.removeFromQueue}
      />
    </main>
  );
}
