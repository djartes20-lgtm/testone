"use client";

import YouTubePlayer from "@/app/components/YouTubePlayer";
import RequestMusic from "@/app/components/RequestMusic";
import CurrentMusic from "@/app/components/CurrentMusic";

export default function AlunoPage() {
  return ( 
    <div style={{ padding: 20 }}>
      <h1>🎶 Música da Academia</h1>

      <CurrentMusic />
      <YouTubePlayer />
      <RequestMusic />
    </div>
  );
}
