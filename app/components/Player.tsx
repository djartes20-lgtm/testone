"use client";

import YouTubeMusic from "@/app/components/YouTubeMusic";

import { useEffect, useRef } from "react";

interface PlayerProps {
  musicaAtual: string | null;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function Player({ musicaAtual }: PlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Carrega API do YouTube uma única vez
  useEffect(() => {
    if (window.YT) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      if (!containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "200",
        width: "100%",
        videoId: musicaAtual || "",
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
        },
      });
    };
  }, []);

  // 🔹 Troca de música SEM recriar player
  useEffect(() => {
    if (playerRef.current && musicaAtual) {
      playerRef.current.loadVideoById(musicaAtual);
    }
  }, [musicaAtual]);

  // 🔹 ISSO É ESSENCIAL (sem isso nada aparece)
  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden border-2 border-red-600 shadow-[0_0_20px_#ff0707]"
    
    />
  );
}