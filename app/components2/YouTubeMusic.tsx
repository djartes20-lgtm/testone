"use client";
import { useState } from "react";
import { ref, push, set } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface YouTubeMusicProps {
  musicaAtual: string; // ID do vídeo atual
  userName: string | undefined; // nome do usuário
}

export default function YouTubeMusic({ musicaAtual, userName }: YouTubeMusicProps) {
  const [query, setQuery] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  function buscarMusica() {
    if (!query) return;

    const url =
      "https://www.youtube.com/embed?listType=search&list=" +
      encodeURIComponent(query);

    setVideoUrl(url);
  }

  // Função para reportar música
  const reportarMusica = async () => {
    if (!musicaAtual || !userName) return;

    const reportsRef = ref(db, "reports");
    const newReportRef = push(reportsRef);
    await set(newReportRef, {
      videoId: musicaAtual,
      reportedBy: userName,
      reportedAt: Date.now(),
    });

    alert("🚨 Música reportada com sucesso!");
  };

  return (
    <div style={{ width: "100%" }}>
      {videoUrl && (
        <iframe
          src={videoUrl}
          width="100%"
          height="500"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ marginTop: "10px" }}
        />
      )}

      <input
        type="text"
        placeholder="Buscar música ou artista..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full mb-3 px-4 py-2 border-2 border-red-600 rounded-xl shadow-[0_0_20px_#ff0707] bg-black text-red-600 outline-none"
      />

      <div className="flex gap-5">
        <button
          onClick={buscarMusica}
          className="border-2 border-red-600 rounded-xl px-4 py-2 shadow-[0_0_20px_#ff0707] bg-black text-red-600"
        >
          Buscar
        </button>

        {/* Botão de reportar */}
        <button
          onClick={reportarMusica}
          className="border-2 border-red-600 rounded-xl px-4 py-2 shadow-[0_0_20px_#ff0707] bg-black text-red-600"
        >
          🚨 Reportar música
        </button>

      </div>
    </div>
  );
}

