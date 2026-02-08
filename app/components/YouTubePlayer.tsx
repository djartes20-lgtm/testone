"use client";

import YouTube from "react-youtube";
import { useEffect, useRef, useState } from "react";
import { ref, onValue, get, remove, set, push } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Props {
  isAdmin?: boolean;
}

const AUTO_DJ_LIST = [
  "ZDw_x_REei0","FFxsTiFGWT8","B45UZFdxZG4","T-nh8gpf6ZA","VauVTmE6ka4",
  "7fsHhApoaac","3QMTCcTgOsk","oC-GflRB0y4","MPEdIqMDY_M","cb-swqOkK-Q",
  "MTBmJO62zps","JO_Q-baM8r4","NX05KVFhg-k","ZbJ9uTJLgao","fSQd_-pTLHQ",
  "pugItPBIs-U","YtZwtFujvd8","6z4WFqBjWe4","88_iSSp5kXM","FOU2Ss90WwQ",
  "8miTn7zqlgI","ALZHF5UqnU4","lekfZs1jJH0","Vu_JGw3Ht90","XZsXvuhLsNE",
  "mIUKGKwBRk8","Lxo7JGT-Ns8","ApXoWvfEYVU","fHI8X4OXluQ","OPf0YbXqDm0",
  "2vMH8lITTCE","STr4Da8ghh4","6sICFXjd7tY","t0AsQIBFo8k","36tRma71YUo",
  "rdlaeq_NsC4","RG-D4bcg54s","nMO7E4TywR4","tliJePo6vYs","yWKWXppp7VU",
  "5-xhpcgBMe4","h_7qgzR1EXQ","qh6cB0aYGHo","Ez-fApyAY6g","VmB9QdeY1ac",
  "bALuHd2EVe8","K6H2wB8DHsI","_Uohu8iJrqw","KjyJW-MM7RY","gEy7VIURmwM",
  "xOIjSUEmS-c","AngEjsqKN0I","0OC1vmlmpd0","fpTAZmA-Ycw","SZLYHWmYcPQ",
  "NGOcn_DYiAw","_PBlykN4KIY","tgIqecROs5M","ele2DMU49Jk","GtEvysh1654",
  "w-sQRS-Lc9k","oLeROuCMwj8","dfk6i41GCNo"
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
  const lastSyncRef = useRef(0);

  const [reportsCount, setReportsCount] = useState(0);

  const getTodayKey = () => new Date().toISOString().split("T")[0];

  const addToHistory = async (videoId: string, title: string, requestedBy: string) => {
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
    setReportsCount(0);

    // 🔥 limpa reports da música anterior
    await remove(ref(db, `reports/${videoId}`));

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

  // 🔥 Admin interrompe Auto DJ quando entra pedido
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

  // 🔄 Sincronização total
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

  // 📊 Admin escuta reports (CORRETO)
  useEffect(() => {
    if (!isAdmin || !currentVideoRef.current) return;

    const reportsRef = ref(db, `reports/${currentVideoRef.current}`);

    return onValue(reportsRef, (snap) => {
      setReportsCount(snap.exists() ? Object.keys(snap.val()).length : 0);
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

  // 🚨 REPORT DO ALUNO (CORRIGIDO)
  const reportMusic = async () => {
    if (!currentVideoRef.current) return;

    const userId =
      localStorage.getItem("gotham_user_id") ||
      (() => {
        const id = crypto.randomUUID();
        localStorage.setItem("gotham_user_id", id);
        return id;
      })();

    await set(
      ref(db, `reports/${currentVideoRef.current}/${userId}`),
      true
    );

    alert("🚨 Música reportada com sucesso!");
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

      {!isAdmin && (
        <div style={{ marginTop: 14 }}>
          <button onClick={reportMusic} style={reportBtn}>
            🚨 Reportar música
          </button>
        </div>
      )}

      {isAdmin && (
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          <button onClick={skipMusic} style={adminBtn}>⏭️ Pular música</button>
          <button onClick={startAutoDJ} style={adminBtn}>🎛️ Auto DJ</button>
          <button style={adminBtn}>🚨 Reports: {reportsCount}</button>
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

const reportBtn = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "2px solid #ff0707",
  background: "#000",
  color: "#ff0707",
  fontWeight: 600,
  cursor: "pointer",
};
