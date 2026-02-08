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

// 🔒 BLOQUEIOS
const BLOCKED_ARTISTS = ["UCcmQ_nZrgwV8JDIDV21xjYA"];
const BLOCKED_KEYWORDS = ["palavrão1", "palavrão2"];
const BLOCKED_VIDEO_IDS = ["IwDrW0YTYWI"];

function isBlocked(videoId: string, title: string, artist?: string) {
  if (BLOCKED_VIDEO_IDS.includes(videoId)) return true;
  if (artist && BLOCKED_ARTISTS.includes(artist)) return true;

  const lower = title.toLowerCase();
  return BLOCKED_KEYWORDS.some(word => lower.includes(word.toLowerCase()));
}

// 📊 Estatística por dia
function registrarPedidoSemana() {
  const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  const hoje = dias[new Date().getDay()];
  const refDia = ref(db, `estatisticas/pedidosSemana/${hoje}`);
  runTransaction(refDia, (v) => (v || 0) + 1);
}

export default function SearchMusic({ isAdmin = false, onAddMusic }: Props) {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restricoes, setRestricoes] = useState<string[]>([]);
  const [addedVideos, setAddedVideos] = useState<string[]>([]);

  // 🔒 Puxa restrições do Firebase
  useEffect(() => {
    const r = ref(db, "restricoesGenero");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setRestricoes(Object.values(data));
    });
  }, []);

  // 🔍 BUSCA (CORRIGIDA)
  const search = async () => {
    if (!query.trim()) {
      setError("Digite algo para pesquisar");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setVideos([]);

      console.log("🔎 Buscando:", query);

      const res = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(query)}`
      );

      if (!res.ok) {
        throw new Error("Erro na API");
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Formato inválido");
      }

      const lista: Video[] = data.map((v: any) => ({
        videoId: v.videoId,
        title: v.title,
        thumbnail: v.thumbnail,
        channel: v.channel,
        genre: v.genre || "Desconhecido",
      }));

      setVideos(lista);
    } catch (err) {
      console.error("❌ ERRO REAL:", err);
      setError("Não foi possível buscar as músicas 😳");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (video: Video) => {
    if (addedVideos.includes(video.videoId)) return;

    if (video.genre && restricoes.includes(video.genre)) {
      alert(`🚫 Músicas de ${video.genre} estão restritas`);
      return;
    }

    if (isBlocked(video.videoId, video.title, video.channel)) {
      alert("🚫 Conteúdo bloqueado");
      return;
    }

    if (isAdmin && onAddMusic) {
      await onAddMusic(video);
    } else {
      const user = auth.currentUser;
      if (!user) return;

      const nome = user.displayName || `Aluno-${user.uid}`;

      await push(ref(db, "queue"), {
        videoId: video.videoId,
        title: video.title,
        channel: video.channel,
        genre: video.genre || "Desconhecido",
        createdAt: Date.now(),
        requestedBy: nome,
      });

      await addToUserHistory(nome, video.videoId, video.title);
    }

    registrarPedidoSemana();
    setAddedVideos(prev => [...prev, video.videoId]);
  };

  return (
    <Card title="🔎 Buscar música 🔎">
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Nome da música"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            border: "2px solid #ff0707",
            padding: "10px",
            background: "#000",
            color: "#ff0707",
          }}
        />

        <button
          onClick={search}
          disabled={loading}
          style={{
            padding: "10px 14px",
            border: "2px solid red",
            background: "transparent",
            color: "red",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Buscando..." : "Pesquisar"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {videos.map((video) => {
          const jaAdicionado = addedVideos.includes(video.videoId);

          return (
            <li
              key={video.videoId}
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 16,
                border: "1px solid rgba(255,7,7,.3)",
                padding: 12,
                borderRadius: 8,
              }}
            >
              <img
                src={video.thumbnail}
                alt=""
                style={{ width: 110, borderRadius: 4 }}
              />

              <div style={{ flex: 1 }}>
                <p>{video.title}</p>
                <small>{video.channel}</small>

                <button
                  onClick={() => handleAdd(video)}
                  disabled={jaAdicionado}
                  style={{
                    marginTop: 8,
                    width: "100%",
                    padding: "10px",
                    border: jaAdicionado
                      ? "2px solid #00e676"
                      : "2px solid #ff0707",
                    background: "transparent",
                    color: jaAdicionado ? "#00e676" : "#fff",
                  }}
                >
                  {jaAdicionado
                    ? "✔️ Adicionado"
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
