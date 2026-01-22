"use client";

import { useState } from "react";
import { ref, set } from "firebase/database";
import { db } from "@/app/lib/firebase";

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

  const search = async () => {
    if (!query) return;

    setLoading(true);
    const res = await fetch(`/api/youtube/search?q=${query}`);
    const data = await res.json();
    setVideos(data);
    setLoading(false);
  };
const playNow = async (video: Video) => {
  await set(ref(db, "player"), {
    videoId: video.videoId,
    title: video.title,
    requestedBy: "Admin",
    startedAt: Date.now(),
  });
};


  return (
    <div>
      <h2>🔎 Buscar música</h2>

      <input
        placeholder="Nome da música"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={search}>Pesquisar</button>

      {loading && <p>Buscando...</p>}

      <ul>
        {videos.map((video) => (
          <li key={video.videoId} style={{ marginTop: 12 }}>
            <img src={video.thumbnail} width={160} />
            <p>{video.title}</p>
            <small>{video.channel}</small>
            <br />
            <button onClick={() => playNow(video)}>▶ Tocar agora</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
