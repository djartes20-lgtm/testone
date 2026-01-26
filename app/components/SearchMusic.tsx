"use client";

import { useState, useEffect } from "react";
import { ref, push, runTransaction, onValue } from "firebase/database";
import { db } from "@/app/lib/firebase";
import Card from "../components2/Card";

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
  genre?: string;
}
interface Props {
  isBlocked: boolean;
}
// 📌 Função que registra o pedido por dia da semana
function registrarPedidoSemana() {
  const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  const hoje = dias[new Date().getDay()];

  const refDia = ref(db, `estatisticas/pedidosSemana/${hoje}`);

  runTransaction(refDia, (valorAtual) => {
    return (valorAtual || 0) + 1;
  });
}

export default function SearchMusic() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restricoes, setRestricoes] = useState<string[]>([]);

  // 🔒 Puxar restrições de gênero do Firebase
  useEffect(() => {
    const restricoesRef = ref(db, "restricoesGenero");
    return onValue(restricoesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setRestricoes(Object.values(data));
    });
  }, []);

  const search = async () => {
    if (!query) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(query)}`
      );

      if (!res.ok) {
        throw new Error("Erro ao buscar no YouTube");
      }

      const data = await res.json();

      // Garante que o campo genre exista
      const videosComGenero: Video[] = data.map((v: any) => ({
        videoId: v.videoId,
        title: v.title,
        thumbnail: v.thumbnail,
        channel: v.channel,
        genre: v.genre || "Desconhecido",
      }));

      setVideos(videosComGenero);
    } catch {
      setError("Não foi possível buscar as músicas 😢");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const addToQueue = async (video: Video) => {
    // 🔒 Bloquear se gênero estiver na restrição
    if (video.genre && restricoes.includes(video.genre)) {
      alert(`🚫 Músicas de ${video.genre} estão restritas!`);
      return;
    }

    // 🎵 Adiciona na fila
    await push(ref(db, "queue"), {
      videoId: video.videoId,
      title: video.title,
      channel: video.channel,
      genre: video.genre || "Desconhecido",
      createdAt: Date.now(),
    });

    // 📊 Registra estatística
    registrarPedidoSemana();
  };

  return (
    <Card
      title="🔎 Buscar música"
      style={{
        border: "2px solid #ff0707",
        borderRadius: 10,
        padding: 20,
      }}
    >
      <input
        placeholder="Nome da música"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          border: "2px solid #ff0707",
          padding: "10px 12px",
          width: "13%",
          marginTop: 8,
          background: "#000",
          color: "#ff0707",
        }}
      />

      <button
        onClick={search}
        disabled={loading}
        style={{
          border: "2px solid red",
          background: "transparent",
          color: "red",
          padding: "10px 16px",
          marginLeft: 6,
        }}
      >
        {loading ? "Buscando..." : "Pesquisar"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {videos.map((video) => (
          <li key={video.videoId} style={{ marginTop: 12 }}>
            <img src={video.thumbnail} width={160} />
            <p>{video.title}</p>
            <small>{video.channel}</small>
            <br />

            <button
              onClick={() => addToQueue(video)}
              style={{
                background: "transparent",
                color: "#fff",
                padding: "12px 16px",
                border: "2px solid #ff0707",
                cursor: "pointer",
                boxShadow: "0 0 10px #ff0707, 0 0 20px #ff0707",
              }}
            >
              ➕ Adicionar à fila
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
