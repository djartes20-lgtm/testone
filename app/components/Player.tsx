"use client";

import { useEffect, useRef } from "react";
import Card from "./Card";

export default function Player() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.YT) return;

    new window.YT.Player(ref.current!, {
      height: "250",
      width: "100%",
      playerVars: { autoplay: 1, controls: 1 },
    });
  }, []);

  return (
    <Card title="🎵 Tocando Agora">
      <div ref={ref} />
      <p className="mt-2">Nenhuma música</p>
    </Card>
  );
}
