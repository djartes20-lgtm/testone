"use client";

import YouTubePlayer from "@/app/components/YouTubePlayer";
import QueueList from "@/app/components/QueueList";
import AddToQueue from "@/app/components/AddToQueue";
import { useQueue } from "@/app/hooks/useQueue";

export default function Home() {
  const queueHook = useQueue();

  return (
    <main style={{ padding: 20 }}>
      <YouTubePlayer isAdmin />

      <AddToQueue addToQueue={queueHook.addToQueue} />

      <QueueList
        queue={queueHook.queue}
        removeFromQueue={queueHook.removeFromQueue}
      />
    </main>
  );
}
