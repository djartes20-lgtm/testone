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
  isAdmin?: boolean; // Indica se é admin
  onAddMusic?: (video: Video) => Promise<void>; // função externa de adicionar música
}

// 🔒 BLOQUEIO DE CONTEÚDO
let BLOCKED_ARTISTS = ["Artista Ruim", "Outro Artista"];
let BLOCKED_KEYWORDS = ["palavrão1", "palavrão2"];
let BLOCKED_VIDEO_IDS = ["abcd1234", "efgh5678"];

function isBlocked(videoId: string, title: string, artist?: string) {
  if (BLOCKED_VIDEO_IDS.includes(videoId)) return true;
  if (artist && BLOCKED_ARTISTS.includes(artist)) return true;
  const titleLower = title.toLowerCase();
  return BLOCKED_KEYWORDS.some(word => titleLower.includes(word.toLowerCase()));
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
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || "Erro ao buscar no YouTube");
      }

      const data = await res.json();
      const videosComGenero: Video[] = list.map((v: any) => ({
        videoId: v.videoId,
        title: v.title,
        thumbnail: v.thumbnail,
        channel: v.channel,
        genre: v.genre || "Desconhecido",
      }));

      // 🔒 FILTRAR RESULTADOS BLOQUEADOS
      const filteredVideos = videosComGenero.filter(
        (video) => !isBlocked(video.videoId, video.title, video.channel)
      );

      setVideos(filteredVideos);
    } catch {
      setError("Não foi possível buscar as músicas 😢");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (video: Video) => {
    // 🔒 Bloquear se gênero estiver na restrição
    if (video.genre && restricoes.includes(video.genre)) {
      alert(`🚫 Músicas de ${video.genre} estão restritas!`);
      return;
    }

    // 🔒 BLOQUEIO DE CONTEÚDO
    if (isBlocked(video.videoId, video.title, video.channel)) {
      alert(`🚫 Esta música está bloqueada!`);
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
      <style>{`
        .search-music-thumb {
          max-width: 100%;
          height: auto;
          flex-shrink: 0;
          border-radius: 4px;
        }
        .search-music-add-btn {
          max-width: 220px;
        }
        .search-music-card-content {
          gap: 10px;
        }
        @media (max-width: 768px) {
          .search-music-card {
            flex-direction: column;
          }
          .search-music-thumb {
            width: 100%;
            max-width: 100%;
          }
          .search-music-card-content {
            width: 100%;
            flex: 1;
          }
          .search-music-add-btn {
            width: 100%;
            max-width: none;
          }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          justifyContent: loading ? "center" : undefined,
          marginTop: 8,
          width: "100%",
          minHeight: 42,
        }}
      >
        {loading ? (
          <div className="search-music-spinner" />
        ) : (
          <>
            <input
              placeholder="Nome da música"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                border: "2px solid #ff0707",
                padding: "10px 12px",
                flex: "1 1 180px",
                minWidth: 0,
                maxWidth: "100%",
                background: "#000",
                color: "#ff0707",
                boxSizing: "border-box",
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
                flex: "0 0 auto",
              }}
            >
              Pesquisar
            </button>
          </>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          paddingTop: '20px',
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {videos.map((video) => (
          <li
            key={video.videoId}
            className="search-music-card"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "flex-start",
              padding: 12,
              borderRadius: 8,
              border: "1px solid rgba(255, 7, 7, 0.3)",
            }}
          >
            <img
              src={video.thumbnail}
              alt=""
              className="search-music-thumb"
            />
            <div
              className="search-music-card-content"
              style={{
                minWidth: 0,
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  wordBreak: "break-word",
                  lineHeight: 1.3,
                }}
              >
                {video.title}
              </p>
              <small style={{ display: "block", marginBottom: 8, opacity: 0.9 }}>
                {video.channel}
              </small>
              <button
                onClick={() => handleAdd(video)}
                className="search-music-add-btn"
                style={{
                  background: "transparent",
                  color: "#fff",
                  padding: "12px 16px",
                  border: "2px solid #ff0707",
                  cursor: "pointer",
                  boxShadow: "0 0 5px #ff0707, 0 0 10px #ff0707",
                  width: "100%",
                }}
              >
                ➕ Adicionar à fila
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}




