"use client";

import YouTube from "react-youtube";
import { useEffect, useRef } from "react";
import { ref, onValue, get, remove, set, push } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Props {
  isAdmin?: boolean;
}

// ===============================
// AUTO DJ 100% FUNCIONAL
// ===============================

// Playlists por dia da semana
// 0 = Domingo
// 1 = Segunda
// 2 = Terça
// 3 = Quarta
// 4 = Quinta
// 5 = Sexta
// 6 = Sábado

const AUTO_DJ_PLAYLISTS: Record<number, string[]> = {
  0: ["GVLMhpzYic0", "HP5XR0LiCYI", "ToHf7SZfceE"],
  1: ["WrJEqTJr9k8", "QChwm0w9nxc", "D6voxRbuecs"],
  2: ["TCLGN6m6AMI", "_lj5BGCwsf8", "rQ2bIzanCEU"],
  3: ["lYBUbBu4W08", "J3H--06Xw6g", "CA0OQwuepPo"],
  4: ["HzdD8kbDzZA", "STr4Da8ghh4", "Xz3g4HblpE4"],
  5: ["MPGXj3q2Oqc", "_oNeLdw7T2o", "LjtvF_UuRIU"],
  6: ["9OUurVdRGsc", "6xzN8Nt0Pok", "d9jhDwxt22Y"]
};

let autoDjIndex = 0;

export function getNextAutoDj(): string {
  const today = new Date().getDay();

  const todayList =
    AUTO_DJ_PLAYLISTS[today] ||
    AUTO_DJ_PLAYLISTS[1];

  if (!todayList || todayList.length === 0) {
    return "GVLMhpzYic0"; // fallback absoluto
  }

  const id = todayList[autoDjIndex % todayList.length];

  autoDjIndex++;

  return id;
}


export default function YouTubePlayer({ isAdmin = false }: Props) {
  const playerRef = useRef<any>(null);
  const currentVideoRef = useRef<string | null>(null);
  const currentModeRef = useRef<"queue" | "autodj" | null>(null);
  const syncingRef = useRef(false);
  const lastSyncRef = useRef(0);

  const getTodayKey = () => new Date().toISOString().split("T")[0];

  const addToHistory = async (
    videoId: string,
    title: string,
    requestedBy: string
  ) => {
    const dayKey = getTodayKey();
    await push(ref(db, `history/${dayKey}`), {
      videoId,
      title,
      requestedBy,
      startedAt: Date.now(),
    });
  };

  const playVideo = async (
    videoId: string,
    mode: "queue" | "autodj",
    requestedBy = "AutoDJ",
    title = "Desconhecida"
  ) => {
    if (!isAdmin) return;

    currentVideoRef.current = videoId;
    currentModeRef.current = mode;

    playerRef.current?.loadVideoById(videoId);

    await set(ref(db, "player"), {
      videoId,
      startedAt: Date.now(),
      mode,
      requestedBy,
      title,
    });

    if (mode === "queue") {
      await addToHistory(videoId, title, requestedBy);
    }
  };

  const startAutoDJ = async () => {
    await playVideo(getNextAutoDj(), "autodj");
  };

  const skipMusic = async () => {
    if (!isAdmin) return;

    const snap = await get(ref(db, "queue"));
    if (snap.exists()) {
      const queue = snap.val();
      const firstKey = Object.keys(queue)[0];
      const next = queue[firstKey];

      await playVideo(next.videoId, "queue", next.requestedBy, next.title);
      await remove(ref(db, `queue/${firstKey}`));
    } else {
      startAutoDJ();
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    const queueRef = ref(db, "queue");

    return onValue(queueRef, async (snap) => {
      if (!snap.exists()) return;
      if (currentModeRef.current !== "autodj") return;

      const queue = snap.val();
      const firstKey = Object.keys(queue)[0];
      const next = queue[firstKey];

      await playVideo(next.videoId, "queue", next.requestedBy, next.title);
      await remove(ref(db, `queue/${firstKey}`));
    });
  }, [isAdmin]);

  useEffect(() => {
    const playerDB = ref(db, "player");

    return onValue(playerDB, (snap) => {
      const data = snap.val();
      if (!data || !playerRef.current) return;

      const elapsed = (Date.now() - data.startedAt) / 1000;
      if (Date.now() - lastSyncRef.current < 800) return;
      lastSyncRef.current = Date.now();

      if (data.videoId !== currentVideoRef.current) {
        syncingRef.current = true;
        currentVideoRef.current = data.videoId;
        currentModeRef.current = data.mode;

        playerRef.current.loadVideoById({
          videoId: data.videoId,
          startSeconds: Math.max(elapsed, 0),
        });

        if (!isAdmin) {
          playerRef.current.mute();
          playerRef.current.playVideo();
        }

        setTimeout(() => (syncingRef.current = false), 800);
      }
    });
  }, [isAdmin]);

  const handleReady = (e: any) => {
    playerRef.current = e.target;

    get(ref(db, "player")).then((snap) => {
      const data = snap.val();
      if (!data) return;

      const elapsed = (Date.now() - data.startedAt) / 1000;
      playerRef.current.loadVideoById({
        videoId: data.videoId,
        startSeconds: Math.max(elapsed, 0),
      });

      if (!isAdmin) {
        playerRef.current.mute();
        playerRef.current.playVideo();
      }
    });
  };

  const handleEnd = async () => {
    if (!isAdmin) return;

    const snap = await get(ref(db, "queue"));
    if (snap.exists()) {
      const queue = snap.val();
      const firstKey = Object.keys(queue)[0];
      const next = queue[firstKey];

      await playVideo(next.videoId, "queue", next.requestedBy, next.title);
      await remove(ref(db, `queue/${firstKey}`));
    } else {
      startAutoDJ();
    }
  };

  return (
    <div>
      <YouTube
        onReady={handleReady}
        onEnd={isAdmin ? handleEnd : undefined}
        opts={{
          width: "100%",
          height: "390",
          playerVars: {
            autoplay: 1,
            controls: isAdmin ? 1 : 0,
            mute: isAdmin ? 0 : 1,
            modestbranding: 1,
          },
        }}
      />

      {isAdmin && (
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          <button onClick={skipMusic} style={adminBtn}>⏭️ Pular música</button>
          <button onClick={startAutoDJ} style={adminBtn}>🎛️ Auto DJ</button>
        </div>
      )}
    </div>
  );
}

const adminBtn = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: "#ff1a1a",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

