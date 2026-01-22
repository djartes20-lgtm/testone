"use client";

import YouTube from "react-youtube";
import { useEffect, useRef, useState } from "react";
import { ref, onValue, get, remove, set } from "firebase/database";
import { db } from "@/app/lib/firebase";
import Card from "../components2/Card";
import AutoDJToggle from "./AutoDJToggle";

interface Props {
  isAdmin?: boolean;
}

export default function YouTubePlayer({ isAdmin = false }: Props) {
  const playerRef = useRef<any>(null);
  const currentVideoIdRef = useRef<string | null>(null);
  const syncingRef = useRef(false);

  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [muted, setMuted] = useState(!isAdmin);

  /**
   * 🔄 Sincronização com Firebase
   */
  useEffect(() => {
    const playerDBRef = ref(db, "player");

    const unsubscribe = onValue(playerDBRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || !playerRef.current) return;

      const { videoId, startedAt } = data;
      if (!videoId || !startedAt) return;

      const expectedTime = Math.floor(
        (Date.now() - startedAt) / 1000
      );

      const playerTime =
        playerRef.current.getCurrentTime?.() || 0;

      // ▶️ Vídeo mudou
      if (videoId !== currentVideoIdRef.current) {
        currentVideoIdRef.current = videoId;
        setCurrentVideoId(videoId);

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

      // ⏱️ Ajuste fino (sem reload)
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

  /**
   * 🎬 Player pronto
   */
  const handleReady = (e: any) => {
    playerRef.current = e.target;

    if (!isAdmin) {
      e.target.mute();       // permite autoplay
      e.target.playVideo();
    }
  };

  /**
   * 🔊 Volume (aluno)
   */
  const toggleMute = () => {
    if (!playerRef.current) return;

    if (muted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(40);
    } else {
      playerRef.current.mute();
    }

    setMuted(!muted);
  };

  /**
   * ⏭️ Avançar fila (ADMIN)
   */
  const playNextFromQueue = async () => {
    const snapshot = await get(ref(db, "queue"));
    if (!snapshot.exists()) return;

    const queue = snapshot.val();

    const sorted = Object.entries(queue).sort(
      (a: any, b: any) => a[1].createdAt - b[1].createdAt
    );

    const [firstKey, next]: any = sorted[0];
    if (!next?.videoId) return;

    await set(ref(db, "player"), {
      videoId: next.videoId,
      title: next.title || "",
      requestedBy: next.requestedBy || "",
      startedAt: Date.now(),
    });

    await remove(ref(db, `queue/${firstKey}`));
  };

  /**
   * ⏭️ Botão pular (ADMIN)
   */
  const skipMusic = async () => {
    if (!isAdmin) return;
    await playNextFromQueue();
  };

  /**
   * 🎯 Fim do vídeo (ADMIN)
   */
  const handleStateChange = async (event: any) => {
    if (!isAdmin) return;

    // 0 = ENDED
    if (event.data === 0) {
      await playNextFromQueue();
    }
  };

  return (

   
       <Card title="🎵 Tocando Agora">

      <YouTube
        videoId={currentVideoId ?? undefined}
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

      {isAdmin && (
        <button
          onClick={skipMusic}
          style={{
            marginTop: 12,
            padding: "10px 18px",
            borderRadius: 8,
            border: "#ff0707",
            background: "#000",
            color: "#ff0707",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 14,

          }}
        >
          ⏭️ Pular música
        </button>
      )}
<AutoDJToggle/>

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
  </Card>
  );
}

export function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);

    // youtu.be/ID
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }

    // youtube.com/watch?v=ID
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }

    // youtube.com/embed/ID
    if (parsed.pathname.includes("/embed/")) {
      return parsed.pathname.split("/embed/")[1];
    }

    return null;
  } catch {
    return null;
  }
}

