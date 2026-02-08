"use client";

import { useState, useEffect } from "react";
import { ref, push, runTransaction, onValue } from "firebase/database";
import { db, auth } from "@/app/lib/firebase";
import Card from "../components2/Card";
import { addToUserHistory } from "@/app/hooks/useFirebase";

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
  genre?: string;
}

interface Props {
  isAdmin?: boolean;
  onAddMusic?: (video: Video) => Promise<void>;
}

// 🔒 BLOQUEIO DE CONTEÚDO
let BLOCKED_ARTISTS = ["UCcmQ_nZrgwV8JDIDV21xjYA", "Outro Artista"];
let BLOCKED_KEYWORDS = ["palavrão1", "palavrão2"];
let BLOCKED_VIDEO_IDS = ["IwDrW0YTYWI", "efgh5678"];

function isBlocked(videoId: string, title: string, artist?: string) {
  if (BLOCKED_VIDEO_IDS.includes(videoId)) return true;
  if (artist && BLOCKED_ARTISTS.includes(artist)) return true;
  const titleLower = title.toLowerCase();
  return BLOCKED_KEYWORDS.some(word =>
    titleLower.includes(word.toLowerCase())
  );
}

// 📌 Função que registra o pedido por dia da semana
function registrarPedidoSemana() {
  const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  const hoje = dias[new Date().getDay()];
  const refDia = ref(db, `estatisticas/pedidosSemana/${hoje}`);

  runTransaction(refDia, (valorAtual) => (valorAtual || 0) + 1);
}

export default function SearchMusic({ isAdmin = false, onAddMusic }: Props) {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restricoes, setRestricoes] = useState<string[]>([]);
  const [addedVideos, setAddedVideos] = useState<string[]>([]);

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

      if (!res.ok) throw new Error();

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      setVideos(
        list.map((v: any) => ({
          videoId: v.videoId,
          title: v.title,
          thumbnail: v.thumbnail,
          channel: v.channel,
          genre: v.genre || "Desconhecido",
        }))
      );
    } catch {
      setError("Não foi possível buscar as músicas 😢");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (video: Video) => {
    if (addedVideos.includes(video.videoId)) return;

    if (video.genre && restricoes.includes(video.genre)) {
      alert(`🚫 Músicas de ${video.genre} estão restritas!`);
      return;
    }

    if (isAdmin && onAddMusic) {
      await onAddMusic(video);
    } else {
      const user = auth.currentUser;
      if (!user) return;

      const alunoNome = user.displayName || `Aluno-${user.uid}`;

      await push(ref(db, "queue"), {
        videoId: video.videoId,
        title: video.title,
        channel: video.channel,
        genre: video.genre || "Desconhecido",
        createdAt: Date.now(),
        requestedBy: alunoNome,
      });

      await addToUserHistory(alunoNome, video.videoId, video.title);
    }

    registrarPedidoSemana();
    setAddedVideos((prev) => [...prev, video.videoId]);
  };

  return (
    <Card
      title="🔎 Buscar música 🔎"
      style={{
        border: "2px solid #ff0707",
        borderRadius: 10,
        padding: 20,
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input
          placeholder="Nome da música"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            border: "2px solid #ff0707",
            padding: "10px 12px",
            flex: "1 1 200px",
            background: "#000",
            color: "#ff0707",
            boxSizing: "border-box",
          }}
        />

        {/* ✅ BOTÃO AJUSTADO PARA MOBILE */}
        <button
          onClick={search}
          disabled={loading}
          style={{
            border: "2px solid red",
            background: "transparent",
            color: "red",
            padding: "10px 16px",

            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",

            flex: "0 0 auto",
          }}
        >
          Pesquisar
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ listStyle: "none", padding: 0, marginTop: 20 }}>
        {videos.map((video) => {
          const jaAdicionado = addedVideos.includes(video.videoId);

          return (
            <li
              key={video.videoId}
              style={{
                display: "flex",
                gap: 12,
                padding: 12,
                borderRadius: 8,
                border: "1px solid rgba(255,7,7,0.3)",
                marginBottom: 16,
              }}
            >
              <img
                src={video.thumbnail}
                alt=""
                style={{ width: 120, borderRadius: 4 }}
              />

              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 4px" }}>{video.title}</p>
                <small style={{ display: "block", marginBottom: 10 }}>
                  {video.channel}
                </small>

                <button
                  onClick={() => handleAdd(video)}
                  disabled={jaAdicionado}
                  style={{
                    background: "transparent",
                    color: jaAdicionado ? "#00e676" : "#fff",
                    padding: "12px 16px",
                    border: jaAdicionado
                      ? "2px solid #00e676"
                      : "2px solid #ff0707",
                    cursor: jaAdicionado ? "default" : "pointer",
                    boxShadow: jaAdicionado
                      ? "0 0 6px #00e676, 0 0 12px #00e676"
                      : "0 0 5px #ff0707, 0 0 10px #ff0707",
                    width: "100%",
                    opacity: jaAdicionado ? 0.85 : 1,
                  }}
                >
                  {jaAdicionado
                    ? "✔️ Adicionado à fila"
                    : "➕ Adicionar à fila"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
