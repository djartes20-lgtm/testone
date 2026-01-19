import { useState } from "react";

export default function YouTubeMusic() {
  const [query, setQuery] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  function buscarMusica() {
    if (!query) return;

    const url =
      "https://www.youtube.com/embed?listType=search&list=" +
      encodeURIComponent(query);

    setVideoUrl(url);
  }

  return (
    <div style={{ width: "100%" }}>
      <input
        type="text"
        placeholder="Buscar música ou artista..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "10px",
        }}
      />

      <button onClick={buscarMusica}>Buscar</button>

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
      
    </div>
  );
}
