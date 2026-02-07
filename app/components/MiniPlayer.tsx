"use client";

import { useEffect, useState } from "react";

interface MiniPlayerProps {
  isAdmin?: boolean;
  skipMusic?: () => void;
  currentVideo?: { title: string; requestedBy: string };
}

export default function MiniPlayer({ isAdmin, skipMusic, currentVideo }: MiniPlayerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      background: "#000",
      color: "#ff0707",
      padding: "12px 18px",
      borderRadius: 10,
      boxShadow: "0 0 10px #ff0707, 0 0 20px #ff0707",
      zIndex: 9999,
      minWidth: 250,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      {currentVideo && (
        <div style={{ fontWeight: "bold" }}>
          🎵 {currentVideo.title} <br />
          Pedido: {currentVideo.requestedBy}
        </div>
      )}
      {isAdmin && skipMusic && (
        <button
          onClick={skipMusic}
          style={{
            marginTop: 6,
            padding: "6px 10px",
            borderRadius: 6,
            background: "#ff0707",
            color: "#000",
            border: "none",
            cursor: "pointer",
          }}
        >
          ⏭️ Pular música
        </button>
      )}
    </div>
  );
}

