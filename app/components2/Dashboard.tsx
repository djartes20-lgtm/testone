"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { ref, onValue, push, set, remove } from "firebase/database";
import MaisTocada from "@/app/components2/MaisTocada";

import YouTubeMusic from "@/app/components2/YouTubeMusic";

<MaisTocada />

import Splash from "@/app/components2/Splash";
import Player from "@/app/components2/Player";
import Fila from "@/app/components2/Fila";




interface GothamUser {
  nome: string;
}

export default function StudentsPage() {
  const [splashFinished, setSplashFinished] = useState(false);
 const [musicaAtual, setMusicaAtual] = useState<string | null>(null);

  const [fila, setFila] = useState<{ id: string; titulo: string }[]>([]);
  const [pedido, setPedido] = useState("");
  const [user, setUser] = useState<GothamUser | null>(null);

  
  // 🔹 Carrega usuário do localStorage
  useEffect(() => {
    const data = localStorage.getItem("gotham_user");
    if (data) {
      setUser(JSON.parse(data));
    }
  }, []);

  // 🔹 Sincroniza fila
  useEffect(() => {
    const filaRef = ref(db, "fila");
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

  // 🔹 Sincroniza música atual
  useEffect(() => {
  const musicaRef = ref(db, "musicaAtual");
  return onValue(musicaRef, (snap) => {
    setMusicaAtual(snap.val());
  });
}, []);

  // 🔹 Extrai ID do YouTube
  const extrairVideoId = (url: string) => {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : null;
  };

  // 🔹 Adiciona música na fila
  const adicionarMusica = () => {
    if (!pedido) return;

    const videoId = extrairVideoId(pedido);
    if (!videoId) {
      alert("Link inválido");
      return;
    }

    const novaRef = push(ref(db, "fila"));
    set(novaRef, {
      id: videoId,
      titulo: "Carregando...",
    });

    setPedido("");
  };


  if (!splashFinished) {
    return <Splash onFinish={() => setSplashFinished(true)} />;
  }

  return (
    <div className="p-4 border-2 border-red-600 rounded-xl shadow-[0_0_25px_#ff0707,inset_0_0_20px_#ff0707]">
      
      <div className="p-3">
        <h1>Olá {user?.nome}</h1>
        <h2>Boas-vindas à Gotham Play</h2>
      </div>


  <div className="p-3">
  <h3>Tocando agora:</h3>
 
    
<div style={{ padding: "20px" }}>
      <h2>YouTube Music</h2>
      <YouTubeMusic />
    </div>
  
</div>

{/** 
  
 
  
 
      <div className="p-2 border-2 border-red-600 rounded-xl shadow-[0_0_15px_#ff0707]">
        <input
          placeholder="Link do YouTube"
          value={pedido}
          onChange={(e) => setPedido(e.target.value)}
        />
      </div>

      <div className="flex gap-2 p-2">
        <button
          onClick={adicionarMusica}
          className="p-2 border-2 border-red-600 rounded-xl shadow-[0_0_15px_#ff0707]"
        >
          Adicionar Música
        </button>

      </div>
*/}
      <div className="border-2 border-red-600 rounded-xl shadow-[0_0_20px_#ff0707]">
        <Fila fila={fila} />
      </div>

      <div className="mt-2 border-2 border-red-600 rounded-xl shadow-[0_0_20px_#ff0707] p-3">
  <MaisTocada />
</div>
    
    </div>
  );
}
