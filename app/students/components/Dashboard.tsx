"use client";

import { use, useEffect, useState } from "react";
import { database } from "@/app/lib/firebase";
import { ref, onValue, push, set, remove } from "firebase/database";

import Splash from "@/app/students/components/Splash";
import Player from "@/app/students/components/Player";
import Fila from "@/app/students/components/Fila";
import MaisTocada from "@/app/students/components/MaisTocada";

interface GothamUser {
  nome: string;
}


export default function StudentsPage() {
  const [splashFinished, setSplashFinished] = useState(false);
  const [musicaAtual, setMusicaAtual] = useState<string | null>(null);
  const [fila, setFila] = useState<{ id: string; titulo: string }[]>([]);
  const [pedido, setPedido] = useState("");
  
  const [user, setUser] = useState<GothamUser | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("gotham_user");

    if (data) {
      setUser(JSON.parse(data));
    }
  }, []);

  
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

    <div className="
  p-4
  border-2 border-red-600
  rounded-xl
  shadow-[0_0_25px_#ff0707,inset_0_0_20px_#ff0707]
">

      <div className="p-3">
              <h1 >Ola {user.nome} </h1>
              <h2>Boas Vindas a Gotham Play</h2>

      </div>

       <div className="p-3">
        <h3>Tocando Agora:</h3>

              <Player musicaAtual={musicaAtual} />

      </div>

      <div className=" p-2 font-sans border-2 border-red-600 rounded-xl shadow-[0_0_15px_#ff0707]">
        <input
          placeholder="Link do YouTube"
          value={pedido}
          onChange={(e) => setPedido(e.target.value)}
          className=""
        />      
        
      </div>
      <div className="flex gap-1 p-1">

        <button onClick={adicionarMusica} className="p-2 font-sans border-2 border-red-600 rounded-xl shadow-[0_0_15px_#ff0707]">
          Adicionar
        </button> 
        
         <button onClick={adicionarMusica} className="p-2 font-sans border-2 border-red-600 rounded-xl shadow-[0_0_15px_#ff0707]">
          pular
        </button>

         <button onClick={adicionarMusica} className="p-2 font-sans border-2 border-red-600 rounded-xl shadow-[0_0_15px_#ff0707]">
          reportar
        </button>
      </div>

      <div className="mb-1 border-2 border-red-600 rounded-xl p-0 shadow-[0_0_20px_#ff0707]">
  <Fila fila={fila} />
</div>


      <div className="p-3 font-sans border-2 border-red-600 rounded-xl shadow-[0_0_15px_#ff0707]">
        <h3>Musicas Mais Tocadas:</h3>
        </div></div>

);
}
