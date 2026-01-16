"use client";

import { useEffect, useRef, useState } from "react";

interface PlayerProps {
  musicaAtual: string | null;
}

export default function Player({ musicaAtual }: PlayerProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated || !divRef.current) return;

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player(divRef.current, {
        height: "200",
        width: "100%",
        videoId: musicaAtual || "",
        playerVars: { autoplay: 0, modestbranding: 1, rel: 0 },
      });
    };
  }, [hydrated]);

  useEffect(() => {
    if (playerRef.current && musicaAtual) {
      playerRef.current.loadVideoById(musicaAtual);
      playerRef.current.playVideo();
    }
  }, [musicaAtual]);

  if (!hydrated) return null;
  return <div ref={divRef}></div>;
}
