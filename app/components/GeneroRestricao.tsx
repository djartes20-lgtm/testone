"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { ref, set, onValue } from "firebase/database";

const GenerosRestritosADM = () => {
  const [allGenres, setAllGenres] = useState<string[]>([
    "Funk", "Sertanejo", "Samba", "Pagode", "Hip Hop", "Pop", "Eletrônica",
  ]);
  const [restrictedGenres, setRestrictedGenres] = useState<string[]>([]);

  // 🔹 Pega os gêneros restritos do Firebase
  useEffect(() => {
    const genresRef = ref(db, "restrictedGenres");
    onValue(genresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setRestrictedGenres(Object.values(data));
      else setRestrictedGenres([]);
    });
  }, []);

  // 🔹 Atualiza o Firebase quando o ADM altera os gêneros restritos
  const toggleGenre = (genre: string) => {
    const updatedGenres = restrictedGenres.includes(genre)
      ? restrictedGenres.filter((g) => g !== genre)
      : [...restrictedGenres, genre];

    setRestrictedGenres(updatedGenres);
    set(ref(db, "restrictedGenres"), updatedGenres);
  };

  return (
    <div
      className="p-5 rounded-lg"
      style={{
        background: "#000",
        border: "2px solid #ff0707",
        boxShadow: "0 0 6px rgba(255,7,7,0.6), 0 0 14px rgba(255,7,7,0.45), 0 0 24px rgba(255,7,7,0.25), 0 0 40px rgba(255,7,7,0.15)",
      }}
    >
      <h2
        className="text-center font-bold text-xl mb-4"
        style={{ color: "#ff0707", textShadow: "0 0 4px #FF0707" }}
      >
        🚫 Definir Gêneros Restritos 🚫
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {allGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            style={{
              width: "100%",
              background: "transparent",
              color: "#ff0707",
              border: restrictedGenres.includes(genre)
                ? "2px solid #ffffff" // 🔹 borda branca quando ativo
                : "2px solid #ff0707", // 🔹 borda vermelha quando inativo
              padding: "8px 0",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: restrictedGenres.includes(genre)
                ? "0 0 6px rgba(255,7,7,0.6), 0 0 14px rgba(255,7,7,0.45), 0 0 24px rgba(255,7,7,0.25)"
                : "none",
              transition: "all 0.2s ease-in-out",
            }}
          >
            {genre}
          </button>
        ))}
      </div>

      {restrictedGenres.length > 0 && (
        <p
          style={{
            color: "#ff0707",
            fontWeight: "600",
            marginTop: "12px",
            textShadow: "0 0 4px #FF0707",
          }}
        >
          Gêneros restritos: {restrictedGenres.join(", ")}
        </p>
      )}
    </div>
  );
};

export default GenerosRestritosADM;








