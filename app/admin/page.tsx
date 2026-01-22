"use client";

import YouTubePlayer from "@/app/components/YouTubePlayer";
import SearchMusic from "@/app/components/SearchMusic";
import QueueList from "@/app/components/QueueList";

export default function AdminPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>🎛️ Admin - Controle de Música</h1>

      <SearchMusic />

      <QueueList />

      <YouTubePlayer isAdmin />
    </div>
  );
}
