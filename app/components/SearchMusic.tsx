"use client";

import { useState } from "react";
import { ref, set, push } from "firebase/database";
import { db } from "@/app/lib/firebase";
import Card from "../components2/Card";

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
}

export default function SearchMusic() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setVideos(data);
    } catch (err) {
      setError("Não foi possível buscar as músicas 😢");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };
const addToQueue = async (video: Video) => {
  await push(ref(db, "queue"), {
    videoId: video.videoId,
    title: video.title,
    channel: video.channel,
    createdAt: Date.now(),
  });
};


  return (
    <Card title=" 🔎 Buscar música">
      <input
        placeholder="Nome da música"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={search} disabled={loading}>
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
           <button onClick={() => addToQueue(video)}>
  ➕ Adicionar à fila
</button>

          </li>
        ))}
      </ul>
    </Card>
  );
}
