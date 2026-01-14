"use client";

import { useEffect, useState } from "react";
import { database } from "@/app/lib/firebase";
import { ref, onValue, push, set, remove } from "firebase/database";

import Splash from "@/app/students/components/Splash";
import Player from "@/app/students/components/Player";
import Fila from "@/app/students/components/Fila";

export default function StudentsPage() {
  const [splashFinished, setSplashFinished] = useState(false);
  const [musicaAtual, setMusicaAtual] = useState<string | null>(null);
  const [fila, setFila] = useState<{ id: string; titulo: string }[]>([]);
  const [pedido, setPedido] = useState("");

  // Sincroniza fila com Firebase
  useEffect(() => {
    const filaRef = ref(database, "fila");
    return onValue(filaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const novaFila = Object.keys(data).map((key) => ({
          id: data[key].id,
          titulo: data[key].titulo,
        }));
        setFila(novaFila);
      } else {
        setFila([]);
      }
    });
  }, []);

  // Sincroniza música atual
  useEffect(() => {
    const musicaRef = ref(database, "musicaAtual");
    return onValue(musicaRef, (snapshot) => {
      const id = snapshot.val();
      setMusicaAtual(id);
    });
  }, []);

  const adicionarMusica = () => {
    if (!pedido) return;
    const videoId = extrairVideoId(pedido);
    if (!videoId) return alert("Link inválido");

    const novaRef = push(ref(database, "fila"));
    set(novaRef, { id: videoId, titulo: "Carregando..." });
    setPedido("");
  };

  const extrairVideoId = (url: string) => {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : null;
  };

  if (!splashFinished) {
    return <Splash onFinish={() => setSplashFinished(true)} />;
  }

  return (
    <div style={{ padding: 20, color: "#ff0707", background: "#000" }}>
      <h1>Gotham Play</h1>
      <Player musicaAtual={musicaAtual} />

      <div style={{ margin: "20px 0" }}>
        <input
          placeholder="Link do YouTube"
          value={pedido}
          onChange={(e) => setPedido(e.target.value)}
          style={{ padding: 8, width: "300px" }}
        />
        <button onClick={adicionarMusica} style={{ marginLeft: 10 }}>
          Adicionar
        </button>
      </div>

      <Fila fila={fila} />
    </div>
  );
}
