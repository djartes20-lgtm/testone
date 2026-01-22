"use client";

import { useEffect, useState } from "react";
import { ref, onValue, push, remove } from "firebase/database";
import { db } from "@/app/lib/firebase";

export interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  createdAt: number;
}

export function useQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    const qRef = ref(db, "queue");

    return onValue(qRef, (snapshot) => {
      if (!snapshot.exists()) {
        setQueue([]);
        return;
      }

      const data = snapshot.val();

      const ordered = Object.entries(data)
        .map(([id, item]: any) => ({ id, ...item }))
        .sort((a, b) => a.createdAt - b.createdAt);

      setQueue(ordered);
    });
  }, []);

  const addToQueue = async (videoId: string, title: string) => {
    if (!videoId || !title) return;

    await push(ref(db, "queue"), {
      videoId,
      title,
      createdAt: Date.now(),
    });
  };

  const removeFromQueue = async (id: string) => {
    await remove(ref(db, `queue/${id}`));
  };

  return {
    queue,
    addToQueue,
    removeFromQueue,
  };
}