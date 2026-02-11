"use client";

import YouTube from "react-youtube";
import { useEffect, useRef } from "react";
import { ref, onValue, get, remove, set, push } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Props {
  isAdmin?: boolean;
}

// 🔥 Playlists por dia da semana
// 0 = Domingo, 1 = Segunda, 2 = Terça...
const AUTO_DJ_PLAYLISTS: Record<number, string[]> = {
  1: [ // Segunda
    "GVLMhpzYic0",
    "HP5XR0LiCYI",
    "ToHf7SZfceE",
    "WrJEqTJr9k8",
    "QChwm0w9nxc",
    "D6voxRbuecs",
    "TCLGN6m6AMI",
  ],

  2: [ // Terça
    "_lj5BGCwsf8",
    "rQ2bIzanCEU",
    "lYBUbBu4W08",
    "J3H--06Xw6g",
    "CA0OQwuepPo",
    "HzdD8kbDzZA",
  ],

  3: [ // Quarta
    "STr4Da8ghh4",
    "Xz3g4HblpE4",
    "MPGXj3q2Oqc",
    "_oNeLdw7T2o",
    "LjtvF_UuRIU",
    "oFRIda79u_E",
  ],

  4: [ // Quinta
    "36tRma71YUo",
    "VauVTmE6ka4",
    "DgGsAJPrMus",
    "t0AsQIBFo8k",
    "2UfIXzKXic0",
    "wF_Rn3US6hs",
  ],

  5: [ // Sexta
    "9bibdQXOqyM",
    "TjUnDOoyU_w",
    "50hgKo8FocY",
    "6xzN8Nt0Pok",
    "XzNWRmqibNE",
    "ikFFVfObwss",
  ],

  6: [ // Sábado
    "GVLMhpzYic0",
    "HP5XR0LiCYI",
    "ToHf7SZfceE",
    "WrJEqTJr9k8",
    "QChwm0w9nxc",
    "D6voxRbuecs",
  ],
};

// 🔥 Estado interno do Auto DJ
let autoDjIndex = 0;
let currentDay = new Date().getDay();
let shuffledList: string[] = [];

// 🔀 Função de embaralhar (Fisher-Yates)
const shuffle = (array: string[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// 🎧 Pega próxima música do dia
const getNextAutoDj = () => {
  const today = new Date().getDay();

  // Se mudou o dia, reseta tudo
  if (today !== currentDay) {
    currentDay = today;
    autoDjIndex = 0;
    shuffledList = [];
  }

  const todayList =
    AUTO_DJ_PLAYLISTS[today] || AUTO_DJ_PLAYLISTS[1];

  // Se ainda não embaralhou hoje
  if (shuffledList.length === 0) {
    shuffledList = shuffle(todayList);
  }

  if (!shuffledList.length) return null;

  const id = shuffledList[autoDjIndex];
  autoDjIndex = (autoDjIndex + 1) % shuffledList.length;

  return id;
};


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

