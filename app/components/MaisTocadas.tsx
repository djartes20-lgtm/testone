"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { ref, onValue } from "firebase/database";

interface Musica {
  nome: string;
  artista: string;
  contagem?: number;
}

const MaisTocadas: React.FC = () => {
  const [topMusics, setTopMusics] = useState<Musica[]>([]);

  useEffect(() => {
    const musicsRef = ref(db, "maisTocadas"); // <- caminho correto do seu Firebase
    onValue(musicsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const musicsArray: Musica[] = Array.isArray(data) ? data : Object.values(data);
        setTopMusics(musicsArray);

      } else {
        setTopMusics([]);
      }
    });
  }, []);

  return (
    <div
      className="p-4 rounded-lg"
      style={{
        background: "#000",
        border: "2px solid #ff0707",
        boxShadow:
          "0 0 6px rgba(255,7,7,0.6), 0 0 14px rgba(255,7,7,0.45), 0 0 24px rgba(255,7,7,0.25), 0 0 40px rgba(255,7,7,0.15)",
      }}
    >
      <h2
        className="text-center font-bold text-xl mb-3"
        style={{ color: "#ff0707", textShadow: "0 0 4px #FF0707" }}
      >
       🏆 Mais Tocadas 🏆
      </h2>
                     
      {topMusics.length > 0 ? (

        <ul className="grid grid-cols-2 gap-2">
          {topMusics.map((musica, i) => (
            <li
              key={i}
              style={{
                color: "#ff0707",
                textShadow: "0 0 4px #FF0707",
                padding: "6px 0",
              }}
            >
              {musica.nome} - {musica.artista}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#ff0707", textShadow: "0 0 4px #FF0707" }}>
          Nenhuma música registrada ainda.
        </p>
      )}
    </div>
  );
};

export default MaisTocadas;



