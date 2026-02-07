"use client";

import YouTube from "react-youtube";
import { useEffect, useRef, useState } from "react";
import { ref, onValue, get, remove, set, push } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Props {
  isAdmin?: boolean;
}

const AUTO_DJ_LIST = [
  "ZDw_x_REei0","B45UZFdxZG4","T-nh8gpf6ZA","VauVTmE6ka4","7fsHhApoaac","3QMTCcTgOsk",
  "oC-GflRB0y4","MPEdIqMDY_M","cb-swqOkK-Q","MTBmJO62zps","JO_Q-baM8r4","NX05KVFhg-k",
  "ZbJ9uTJLgao","fSQd_-pTLHQ","pugItPBIs-U","YtZwtFujvd8","6z4WFqBjWe4","88_iSSp5kXM",
  "FOU2Ss90WwQ","8miTn7zqlgI","ALZHF5UqnU4","lekfZs1jJH0","Vu_JGw3Ht90","XZsXvuhLsNE",
  "mIUKGKwBRk8","Lxo7JGT-Ns8","ApXoWvfEYVU","fHI8X4OXluQ","OPf0YbXqDm0","2vMH8lITTCE",
  "STr4Da8ghh4","6sICFXjd7tY","t0AsQIBFo8k","36tRma71YUo","rdlaeq_NsC4","RG-D4bcg54s",
  "nMO7E4TywR4","tliJePo6vYs","yWKWXppp7VU","5-xhpcgBMe4","h_7qgzR1EXQ","qh6cB0aYGHo",
  "Ez-fApyAY6g","VmB9QdeY1ac","bALuHd2EVe8","K6H2wB8DHsI","_Uohu8iJrqw","KjyJW-MM7RY",
  "gEy7VIURmwM","xOIjSUEmS-c","RJao7K__jDw","AngEjsqKN0I","0OC1vmlmpd0","fpTAZmA-Ycw",
  "SZLYHWmYcPQ"
];

let autoDjIndex = 0;
const getNextAutoDj = () => {
  const id = AUTO_DJ_LIST[autoDjIndex];
  autoDjIndex = (autoDjIndex + 1) % AUTO_DJ_LIST.length;
  return id;
};

export default function YouTubePlayer({ isAdmin = false }: Props) {
  const playerRef = useRef<any>(null);
  const currentVideoRef = useRef<string | null>(null);
  const currentModeRef = useRef<"queue" | "autodj" | null>(null);
  const syncingRef = useRef(false);

  const [muted, setMuted] = useState(!isAdmin);
  const [currentTitle, setCurrentTitle] = useState(""); // ✅ Para notificação
  const [showNotification, setShowNotification] = useState(false);

  const getTodayKey = () => new Date().toISOString().split("T")[0];

  const addToHistory = async (videoId: string, title: string, requestedBy: string) => {
    const dayKey = getTodayKey();
    await set(ref(db, `history/${dayKey}/__title`), `Histórico do dia`);
    await push(ref(db, `history/${dayKey}`), { videoId, title, requestedBy, startedAt: Date.now() });
  };

  const playVideo = async (
    videoId: string,
    mode: "queue" | "autodj",
    requestedBy = "AutoDJ",
    title = "Desconhecida"
  ) => {
    currentVideoRef.current = videoId;
    currentModeRef.current = mode;

    if (playerRef.current) playerRef.current.loadVideoById(videoId);

    // 🔹 Notificação visual
    setCurrentTitle(title);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);

    await set(ref(db, "player"), { videoId, startedAt: Date.now(), mode, requestedBy, title });
    if (mode === "queue") await addToHistory(videoId, title, requestedBy);
  };

  const startAutoDJ = async () => await playVideo(getNextAutoDj(), "autodj");

  const skipMusic = async () => {
    const snap = await get(ref(db, "queue"));
    if (snap.exists()) {
      const queue = snap.val();
      const firstKey = Object.keys(queue)[0];
      const next = queue[firstKey];
      await playVideo(next.videoId, "queue", next.requestedBy, next.title);
      await remove(ref(db, `queue/${firstKey}`));
    } else startAutoDJ();
  };

  useEffect(() => {
    const queueRef = ref(db, "queue");
    return onValue(queueRef, async (snap) => {
      if (!snap.exists()) return;
      if (currentModeRef.current === "autodj") {
        const queue = snap.val();
        const firstKey = Object.keys(queue)[0];
        const next = queue[firstKey];
        await playVideo(next.videoId, "queue", next.requestedBy, next.title);
        await remove(ref(db, `queue/${firstKey}`));
      }
    });
  }, []);

  useEffect(() => {
    const playerRefDB = ref(db, "player");
    const unsub = onValue(playerRefDB, (snap) => {
      const data = snap.val();
      if (!data || !playerRef.current) return;

      if (data.videoId !== currentVideoRef.current) {
        currentVideoRef.current = data.videoId;
        currentModeRef.current = data.mode;
        syncingRef.current = true;

        playerRef.current.loadVideoById({ videoId: data.videoId });
        if (!isAdmin) playerRef.current.mute();
        setCurrentTitle(data.title || "Desconhecida"); // 🔹 Atualiza notificação
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 4000);

        setTimeout(() => (syncingRef.current = false), 1000);
      }
    });
    return () => unsub();
  }, [isAdmin]);

  const handleReady = (e: any) => {
    playerRef.current = e.target;
    get(ref(db, "player")).then((snap) => {
      const data = snap.val();
      if (!data) return;
      playerRef.current.loadVideoById({ videoId: data.videoId });
      if (!isAdmin) playerRef.current.mute();
      setCurrentTitle(data.title || "Desconhecida");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    });
  };

  const handleEnd = async () => skipMusic();

  const toggleMute = () => {
    if (!playerRef.current) return;
    muted ? (playerRef.current.unMute(), playerRef.current.setVolume(40)) : playerRef.current.mute();
    setMuted(!muted);
  };

  return (
    <div style={{ position: "relative" }}>
      <YouTube onReady={handleReady} onEnd={handleEnd} opts={{ width: "100%", height: "390", playerVars: { autoplay: 1, controls: isAdmin ? 1 : 0, modestbranding: 1 } }} />

      {!isAdmin && (
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={toggleMute} style={btnStyle}>{muted ? "🔊 Ativar som" : "🔇 Silenciar"}</button>
        </div>
      )}

      {/* 🔔 Notificação visual */}
      {showNotification && (
        <div style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#ff0707",
          color: "#000",
          padding: "12px 20px",
          borderRadius: 8,
          fontWeight: "bold",
          boxShadow: "0 0 10px #ff0707, 0 0 20px #ff0707",
          zIndex: 999,
          animation: "slideDown 0.5s ease"
        }}>
          🎵 {currentTitle}
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

const btnStyle = {
  padding: "8px 14px",
  borderRadius: 6,
  border: "2px solid #ff0707",
  background: "#000",
  color: "#ff0707",
  cursor: "pointer",
  fontSize: 14,
};
