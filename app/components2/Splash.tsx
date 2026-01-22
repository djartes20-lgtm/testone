"use client";

import { useEffect, useState } from "react";

interface SplashProps {
  onFinish: () => void;
}

export default function Splash({ onFinish }: SplashProps) {
  const [hydrated, setHydrated] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    setHydrated(true);

    const timer = setTimeout(() => {
      setShow(false);
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!hydrated || !show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      {/* Halo Neon */}
      <div
        style={{
          padding: 40,
          borderRadius: "50%",
          animation: "neonPulse 2s infinite",
        }}
      >
        <img
  src="/Logo Gotham sem funo.png"
  alt="Logo"
  style={{
    width: 300,
    animation: "logoEnter 3s ease-out forwards",
    filter: `
      drop-shadow(0 0 10px #ff0000)
      drop-shadow(0 0 25px #ff0000)
      drop-shadow(0 0 50px #ff0000)
    `,
  }}
/>
      </div>
    </div>
  );
}
