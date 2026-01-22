"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface CurrentMusic {
  title: string;
  requestedBy: string;
  startedAt: number;
}

export default function CurrentMusic() {
  const [music, setMusic] = useState<CurrentMusic | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const playerRef = ref(db, "player");

    const unsub = onValue(playerRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setMusic({
        title: data.title,
        requestedBy: data.requestedBy,
        startedAt: data.startedAt,
      });
    });

    return () => unsub();
  }, []);

  // contador de tempo
  useEffect(() => {
    if (!music) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - music.startedAt) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [music]);

  if (!music) return null;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div style={{ marginBottom: 20 }}>
      <h2>🎵 Tocando agora</h2>
      <p><strong>{music.title}</strong></p>
      <p>Pedido por: {music.requestedBy}</p>
      <p>
        ⏱️ {minutes}:{seconds.toString().padStart(2, "0")}
      </p>
    </div>
  );
}
