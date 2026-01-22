"use client";

import { useState } from "react";
import Player from "./Player";
import YouTubeMusic from "./YouTubeMusic";

export default function MusicApp() {
  const [busca, setBusca] = useState<string | null>(null);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Player busca={busca} />
      <YouTubeMusic onBuscar={setBusca} />
    </div>
  );
}
