"use client";

import YouTube from "react-youtube";
import { useEffect, useRef, useState } from "react";
import { ref, onValue, get, remove, set } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Props {
  isAdmin?: boolean;
}

export default function YouTubePlayer({ isAdmin = false }: Props) {
  const playerRef = useRef<any>(null);
  const currentVideoIdRef = useRef<string | null>(null);
  const syncingRef = useRef(false);

  const [muted, setMuted] = useState(!isAdmin);

  useEffect(() => {
    const playerRefDB = ref(db, "player");

    const unsubscribe = onValue(playerRefDB, (snapshot) => {
      const data = snapshot.val();
      if (!data || !playerRef.current) return;

      const { videoId, startedAt } = data;

      const expectedTime = (Date.now() - startedAt) / 1000;
      const playerTime = playerRef.current.getCurrentTime?.() || 0;

      // 🔁 TROCOU O VÍDEO
      if (videoId !== currentVideoIdRef.current) {
        currentVideoIdRef.current = videoId;
        syncingRef.current = true;

        playerRef.current.loadVideoById({
          videoId,
          startSeconds: Math.max(expectedTime, 0),
        });

        setTimeout(() => {
          syncingRef.current = false;
        }, 1000);

        return;
      }

      // ⏱️ AJUSTE FINO
      const diff = Math.abs(playerTime - expectedTime);
      if (diff > 2 && !syncingRef.current) {
        syncingRef.current = true;
        playerRef.current.seekTo(expectedTime, true);

        setTimeout(() => {
          syncingRef.current = false;
        }, 500);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🎬 Player pronto
  const handleReady = (e: any) => {
    playerRef.current = e.target;

    if (!isAdmin) {
      e.target.mute();       // 🔥 garante autoplay
      e.target.playVideo(); // 🔥 inicia sozinho
    }
  };

  // 🔊 BOTÃO DE VOLUME
  const toggleMute = () => {
    if (!playerRef.current) return;

    if (muted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(40); // volume confortável
    } else {
      playerRef.current.mute();
    }

    setMuted(!muted);
  };

  // 👑 SOMENTE ADMIN CONTROLA FILA
  const handleStateChange = async (event: any) => {
    if (!isAdmin) return;

    if (event.data === 0) {
      const snapshot = await get(ref(db, "queue"));
      if (!snapshot.exists()) return;

      const queue = snapshot.val();
      const firstKey = Object.keys(queue)[0];
      const next = queue[firstKey];

      await set(ref(db, "player"), {
        videoId: next.videoId,
        title: next.title,
        requestedBy: next.requestedBy,
        startedAt: Date.now(),
      });

      await remove(ref(db, `queue/${firstKey}`));
    }
  };

  return (
    <div>
      <YouTube
        onReady={handleReady}
        onStateChange={handleStateChange}
        opts={{
          width: "100%",
          height: "390",
          playerVars: {
            autoplay: 1,
            controls: isAdmin ? 1 : 0,
            mute: isAdmin ? 0 : 1,
            disablekb: 1,
            modestbranding: 1,
          },
        }}
      />

      {/* 🔊 BOTÃO SÓ PARA ALUNO */}
      {!isAdmin && (
        <button
          onClick={toggleMute}
          style={{
            marginTop: 10,
            padding: "8px 14px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {muted ? "🔊 Ativar som" : "🔇 Silenciar"}
        </button>
      )}
    </div>
  );
}
