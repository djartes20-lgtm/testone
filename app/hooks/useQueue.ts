"use client";


import { ref, onValue, push, remove } from "firebase/database";
import { db } from "@/app/lib/firebase";

export interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  createdAt: number;
 
import { extractVideoId } from "@/app/lib/youtube";

const addToQueue = async (link: string, title: string) => {
  const videoId = extractVideoId(link);

  if (!videoId) {
    alert("Link do YouTube inválido ❌");
    return;
  }

  await push(ref(db, "queue"), {
    videoId,
    title,
    createdAt: Date.now(),
  });

  const removeFromQueue = async (id: string) => {
    await remove(ref(db, `queue/${id}`));
  };

  return {
    queue,
    addToQueue,
    removeFromQueue,
  };
}