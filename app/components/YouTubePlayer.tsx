"use client";

import YouTube from "react-youtube";
import { useEffect, useRef, useState } from "react";
import { ref, onValue, get, remove, set, push } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Props {
  isAdmin?: boolean;
  userName?: string;
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

export default function YouTubePlayer({ isAdmin = false, userName }: Props) {
  const playerRef = useRef<any>(null);
  const currentVideoRef = useRef<string | null>(null);
  const currentModeRef = useRef<"queue" | "autodj" | null>(null);

  const [reports, setReports] = useState<string[]>([]);

  const playVideo = async (
    videoId: string,
    mode: "queue" | "autodj",
    requestedBy = "Auto DJ"
  ) => {
    if (!isAdmin) return;

    currentVideoRef.current = videoId;
    currentModeRef.current = mode;
    setReports([]);

    await remove(ref(db, "reports"));

    playerRef.current?.loadVideoById(videoId);

    await set(ref(db, "player"), {
      videoId,
      startedAt: Date.now(),
      mode,
      requestedBy,
    });
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

      await playVideo(next.videoId, "queue", next.requestedBy);
      await remove(ref(db, `queue/${firstKey}`));
    } else {
      startAutoDJ();
    }
  };

  // 🔄 Sincronização total (aluno só espelha)
  useEffect(() => {
    return onValue(ref(db, "player"), (snap) => {
      const data = snap.val();
      if (!data || !playerRef.current) return;

      if (data.videoId !== currentVideoRef.current) {
        currentVideoRef.current = data.videoId;
        currentModeRef.current = data.mode;

        const elapsed = (Date.now() - data.startedAt) / 1000;

        playerRef.current.loadVideoById({
          videoId: data.videoId,
          startSeconds: Math.max(elapsed, 0),
        });

        if (!isAdmin) {
          playerRef.current.mute();
          playerRef.current.playVideo();
        }
      }
    });
  }, [isAdmin]);

  // 🚨 ADM escuta reports
  useEffect(() => {
    if (!isAdmin) return;

    return onValue(ref(db, "reports"), (snap) => {
      if (!snap.exists()) {
        setReports([]);
        return;
      }

      const list = Object.values(snap.val())
        .filter((r: any) => r.videoId === currentVideoRef.current)
        .map((r: any) => r.reportedBy);

      setReports(list);
    });
  }, [isAdmin]);

  const handleReady = (e: any) => {
    playerRef.current = e.target;
    if (isAdmin) startAutoDJ();
  };

  const handleEnd = async () => {
    if (!isAdmin) return;
    skipMusic();
  };

  // 🚨 Report do aluno
  const reportMusic = async () => {
    if (!currentVideoRef.current || !userName) return;

    await push(ref(db, "reports"), {
      videoId: currentVideoRef.current,
      reportedBy: userName,
      reportedAt: Date.now(),
    });
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
          },
        }}
      />

      {!isAdmin && (
        <button onClick={reportMusic} style={reportBtn}>
          🚨 Reportar música
        </button>
      )}

      {isAdmin && reports.length > 0 && (
        <div style={reportBox}>
          ⚠️ Aviso de reporte: <b>{reports.join(", ")}</b> reportou esta música
        </div>
      )}

      {isAdmin && (
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={skipMusic} style={adminBtn}>⏭️ Pular</button>
          <button onClick={startAutoDJ} style={adminBtn}>🎛️ Auto DJ</button>
        </div>
      )}
    </div>
  );
}

const adminBtn = {
  padding: "10px 16px",
  borderRadius: 8,
  background: "#ff1a1a",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const reportBtn = {
  marginTop: 14,
  padding: "10px 16px",
  borderRadius: 8,
  background: "#000",
  color: "#ff0707",
  border: "2px solid #ff0707",
  cursor: "pointer",
};

const reportBox = {
  marginTop: 14,
  padding: 12,
  borderRadius: 8,
  background: "#ff0000",
  color: "#fff",
  fontWeight: 700,
};
