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
      }}
    >
      <img
        src="/Logo Gotham sem funo.png"
        alt="Logo"
        style={{ width: 200, animation: "logoEnter 4s" }}
      />
    </div>
  );
}
