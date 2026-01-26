"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { ref, onValue } from "firebase/database";

interface GenerosRestritosProps {
  userId?: string; // não necessário, mas mantém padrão
}

const GenerosRestritosAluno: React.FC<GenerosRestritosProps> = () => {
  const [restrictedGenres, setRestrictedGenres] = useState<string[]>([]);

  useEffect(() => {
    const genresRef = ref(db, "restrictedGenres");
    onValue(genresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setRestrictedGenres(Object.values(data));
      else setRestrictedGenres([]);
    });
  }, []);

  return (
    <div
      className="p-4 rounded-lg"
      style={{
        background: "#000",
        border: "2px solid #ff0707",
        boxShadow: "0 0 6px rgba(255,7,7,0.6), 0 0 14px rgba(255,7,7,0.45), 0 0 24px rgba(255,7,7,0.25), 0 0 40px rgba(255,7,7,0.15)",
      }}
    >
      <h2
        className="text-center font-bold text-xl mb-3"
        style={{ color: "#ff0707", textShadow: "0 0 4px #FF0707" }}
      >
        🎵 Gêneros Bloqueados
      </h2>

      {restrictedGenres.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2">
          {restrictedGenres.map((genre) => (
            <li
              key={genre}
              style={{
                color: "#ff0707",
                textShadow: "0 0 4px #FF0707",
                padding: "6px 0",
              }}
            >
              {genre}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#ff0707", textShadow: "0 0 4px #FF0707" }}>
          Nenhum gênero bloqueado.
        </p>
      )}
    </div>
  );
};

export default GenerosRestritosAluno;

