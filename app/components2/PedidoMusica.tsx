"use client"; 
import { useState } from "react";
import { useFirebase } from "../hooks/useFirebase";

export default function PedidoMusica() {
  const [link, setLink] = useState("");
  const { adicionarMusica } = useFirebase();

  const extrairVideoId = (url: string) => {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : null;
  };

  const pedirMusica = () => {
    const videoId = extrairVideoId(link);
    if (!videoId) return alert("Link inválido do YouTube");
    adicionarMusica(videoId);
    setLink("");
  };

  return (
    <div className="card">
      <h2>Pedir Música</h2>
      <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link do YouTube" />
      <button onClick={pedirMusica}>Adicionar à fila</button>
      <style jsx>{`
        .card { border:2px solid #ff0707; padding:15px; border-radius:10px; margin-bottom:15px; }
        input { padding:10px; border-radius:8px; border:2px solid #ff0707; background:#000; color:#ff0707; width:250px; }
        button { padding:10px 20px; border-radius:8px; border:2px solid #ff0707; background:#000; color:#ff0707; cursor:pointer; margin-top:10px; }
      `}</style>
    </div>
  );
}
