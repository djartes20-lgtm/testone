"use client";

import YouTube from "react-youtube";
import { useEffect, useRef, useState } from "react";
import { ref, onValue, get, remove, set, push } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Props {
  isAdmin?: boolean;
}

const AUTO_DJ_LIST = [
  "ZDw_x_REei0", "B45UZFdxZG4", "T-nh8gpf6ZA", "VauVTmE6ka4",
  "7fsHhApoaac","K3M0jlJfMuY","3QMTCcTgOsk","oC-GflRB0y4"
  // Adicione o resto da lista aqui
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
  const reportHandledRef = useRef(false);
  const lastSyncRef = useRef<number>(0);

  const [muted, setMuted] = useState(!isAdmin);
  const [reportsCount, setReportsCount] = useState(0);

  const getTodayKey = () => new Date().toISOString().split("T")[0];

  const addToHistory = async (videoId: string, title: string, requestedBy: string) => {
    const dayKey = getTodayKey();
    const formattedDate = dayKey.split("-").reverse().join("/");
    await set(ref(db, `history/${dayKey}/__title`), `Histórico do dia ${formattedDate}`);
    await push(ref(db, `history/${dayKey}`), {
      videoId,
      title,
      requestedBy,
      startedAt: Date.now(),
    });
  };

  // Reports (ADMIN)
  useEffect(() => {
    if (!isAdmin) return;
    const reportsRef = ref(db, "reports");
    return onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      const totalReports = data ? Object.keys(data).length : 0;
      setReportsCount(totalReports);

      if (!data || !currentVideoRef.current) return;
      const reports = Object.values(data) as any[];
      const currentReports = reports.filter(r => r.videoId === currentVideoRef.current);

      if (currentReports.length >= 10 && !reportHandledRef.current) {
        reportHandledRef.current = true;
        push(ref(db, "adminAlerts"), {
          videoId: currentVideoRef.current,
          message: "🚨 Música atingiu 10 reports!",
          at: Date.now(),
        });
        remove(ref(db, "reports"));
      }
    });
  }, [isAdmin]);

  // Play video
  const playVideo = async (videoId: string, mode: "queue" | "autodj", requestedBy = "AutoDJ", title = "Desconhecida") => {
    currentVideoRef.current = videoId;
    currentModeRef.current = mode;
    reportHandledRef.current = false;
    setReportsCount(0);

    if (playerRef.current) playerRef.current.loadVideoById(videoId);

    await set(ref(db, "player"), {
      videoId,
      startedAt: Date.now(),
      mode,
      requestedBy,
      title,
    });

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
    } else {
      startAutoDJ();
    }
  };

  // AutoDJ quando entra pedido
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

  // 🔄 Sincronização para novos usuários + reload
  useEffect(() => {
    const playerRefDB = ref(db, "player");
    return onValue(playerRefDB, (snap) => {
      const data = snap.val();
      if (!data || !playerRef.current) return;

      const { videoId, startedAt, mode } = data;
      const elapsedSeconds = (Date.now() - startedAt) / 1000;

      // Evita múltiplas execuções
      if (Date.now() - lastSyncRef.current < 1000) return;
      lastSyncRef.current = Date.now();

      if (videoId !== currentVideoRef.current) {
        currentVideoRef.current = videoId;
        currentModeRef.current = mode;
        syncingRef.current = true;

        playerRef.current.loadVideoById({
          videoId,
          startSeconds: Math.max(elapsedSeconds, 0),
        });

        if (!isAdmin) {
          playerRef.current.mute();
          playerRef.current.playVideo();
        }

        setTimeout(() => (syncingRef.current = false), 1000);
      }
    });
  }, []);

  const handleReady = (e: any) => {
    playerRef.current = e.target;
    if (!isAdmin) {
      e.target.mute();
      e.target.playVideo();
    }
  };

  const handleEnd = async () => {
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

  const toggleMute = () => {
    if (!playerRef.current) return;
    muted
      ? (playerRef.current.unMute(), playerRef.current.setVolume(40))
      : playerRef.current.mute();
    setMuted(!muted);
  };

  const reportMusic = async () => {
    if (!currentVideoRef.current) return;

    await push(ref(db, "reports"), {
      videoId: currentVideoRef.current,
      reportedAt: Date.now(),
    });

    await push(ref(db, "adminAlerts"), {
      type: "REPORT",
      videoId: currentVideoRef.current,
      message: "🚨 Música foi reportada por um aluno",
      at: Date.now(),
    });

    alert("🚨 Música reportada!");
  };

  return (
    <div>
      <YouTube
        onReady={handleReady}
        onEnd={handleEnd}
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

      {!isAdmin && (
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={toggleMute} style={btnStyle}>
            {muted ? "🔊 Ativar som" : "🔇 Silenciar"}
          </button>
          <button onClick={reportMusic} style={btnStyle}>
            🚨 Reportar música
          </button>
        </div>
      )}

      {isAdmin && (
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          <button onClick={skipMusic} style={adminBtn}>
            ⏭️ Pular música ⏭️
          </button>
          <button onClick={startAutoDJ} style={adminBtn}>
            🎛️ Iniciar AutoDJ 🎛️
          </button>
          <button style={adminBtn}>
            🚨 Números de Reporte: {reportsCount} 🚨
          </button>
        </div>
      )}
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

const adminBtn = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: "#ff1a1a",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};
