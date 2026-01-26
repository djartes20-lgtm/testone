"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [hora, setHora] = useState("");
  const [data, setData] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const agora = new Date();

      // Formatar hora
      const hh = String(agora.getHours()).padStart(2, "0");
      const mm = String(agora.getMinutes()).padStart(2, "0");
      const ss = String(agora.getSeconds()).padStart(2, "0");
      setHora(`${hh}:${mm}:${ss}`);

      // Formatar data (ex.: 23/01/2026)
      const dd = String(agora.getDate()).padStart(2, "0");
      const mmData = String(agora.getMonth() + 1).padStart(2, "0");
      const yyyy = agora.getFullYear();
      setData(`${dd}/${mmData}/${yyyy}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center", marginBottom: 10, color: "#ff0707" }}>
      <h2 style={{ fontSize: 24, fontWeight: "bold" }}>{hora}</h2>
      <p style={{ fontSize: 16 }}>{data}</p>
    </div>
  );
}
