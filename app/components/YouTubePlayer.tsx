"use client";

import YouTube from "react-youtube";
import { useEffect, useRef } from "react";
import { ref, onValue, get, remove, set, push } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Props {
  isAdmin?: boolean;
}

const AUTO_DJ_LIST = [
  "GVLMhpzYic0",
"HP5XR0LiCYI",
"ToHf7SZfceE",
"WrJEqTJr9k8",
"QChwm0w9nxc",
"xhOIjSUEmS-c",
"2vMH8lITTCE",
"D6voxRbuecs",
"TCLGN6m6AMI",
"JobscnDUBHc",
"lhg9bYNLvOg",
"V1jfP1Uc91I",
"oLeROuCMwj8",
"_lj5BGCwsf8",
"rQ2bIzanCEU",
"gvLMhpzYic0",
"lYBUbBu4W08",
"ffHI8X4OXluQ",
"_sfLbzK2ugk",
"dB_c7oZWo1g",
"oMfMUfgjiLg",
"9vWNauaZAgg",
"Q_mQxKviRJM",
"ikFFVfObwss",
"XzNWRmqibNE",
"2zToEPpFEN8",
"JOBscnDUBHc",
"Ha3I908WaJo",
"rtjI1noSSBE",
"6xzN8Nt0Pok",
"50hgKo8FocY",
"c1ZCYY-4lAM",
"d9jhDwxt22Y",
"J3H--06Xw6g",
"_ovdm2yX4MA",
"CA0OQwuepPo",
"Vz_JGw3Ht90",
"VBJsaaU6hjY",
"HzdD8kbDzZA",
"STr4Da8ghh4",
"GVLMhpzYic0",
"9bibdQXOqyM",
"Xz3g4HblpE4",
"lhg9bYNLvOg",
"lxO2Yrk2IkQ",
"GVLMhpzYic0",
"rtjI1noSSBE",
"0CNPR2qNzxk",
"FfxsTiFGWT8",
"JVVt2HWY-1s",
"cCt5puvhQXc",
"YsZwtFujvd8",
"TjUnDOoyU_w",
"WrJEqTJr9k8",
"MPGXj3q2Oqc",
"0OC1vmlmpd0",
"_oNeLdw7T2o",
"LjtvF_UuRIU",
"oFRIda79u_E",
"36tRma71YUo",
"bALuHd2EVe8",
"wF_Rn3US6hs",
"lhg9bYNLvOg",
"CA0OQwuepPo",
"Ha3I908WaJo",
"DFK6i41GCNo",
"2UfIXzKXic0",
"GVLMhpzYic0",
"VauVTmE6ka4",
"0CNPR2qNzxk",
"GVLMhpzYic0",
"_PBlykN4KIY",
"lYBUbBu4W08",
"xd3Rma71YUo",
"fHI8X4OXluQ",
"9bibdQXOqyM",
"DgGsAJPrMus",
"t0AsQIBFo8k",
"GVLMhpzYic0",
"GVLMhpzYic0",
"rQ2bIzanCEU",
"GVLMhpzYic0",
"GVLMhpzYic0",
"GVLMhpzYic0",
"GVLMhpzYic0",
"GVLMhpzYic0"
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

