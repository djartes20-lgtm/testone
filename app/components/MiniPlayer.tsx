"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface MiniPlayerProps {
  isAdmin?: boolean;
  skipMusic?: () => void; // Função de pular música do admin
}

interface PlayerData {
  videoId: string;
  title: string;
  requestedBy: string;
  startedAt: number;
  mode: "queue" | "autodj";
}

export default function MiniPlayer({ isAdmin = false, skipMusic }: MiniPlayerProps) {
  const [player, setPlayer] = useState<PlayerData | null>(null);

  useEffect(() => {
    const playerRef = ref(db, "player");
    const unsub = onValue(playerRef, (snap) => {
      const data = snap.val();
      if (!data) return setPlayer(null);
      setPlayer(data);
    });

    return () => unsub();
  }, []);

  if (!player) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${player.videoId}/default.jpg`;

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      width: 250,
      background: "#000",
      border: "2px solid #ff0707",
      borderRadius: 10,
      padding: "10px 12px",
      boxShadow: "0 0 10px #ff0707, 0 0 20px #ff0707",
      color: "#fff",
      display: "flex",
      gap: 10,
      alignItems: "center",
      zIndex: 999,
    }}>
      <img src={thumbnailUrl} alt={player.title} width={60} height={45} style={{ borderRadius: 6 }} />

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "bold", color: "#ff0707", fontSize: 14 }}>
          {player.title}
        </div>
        <div style={{ fontSize: 12, color: "#fff" }}>
          Pedido por: {player.requestedBy}
        </div>
      </div>

      {isAdmin && skipMusic && (
        <button
          onClick={skipMusic}
          style={{
            background: "#ff0707",
            color: "#000",
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ⏭️
        </button>
      )}
    </div>
  );
}
