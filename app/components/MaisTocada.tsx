"use client";

import { useEffect, useState } from "react";
import { ref, onValue, get, set } from "firebase/database";
import { database } from "@/app/lib/firebase";

interface MaisTocadaType {
  titulo: string;
  vezes: number;
}

export default function MaisTocada() {
  const [maisTocada, setMaisTocada] = useState<MaisTocadaType | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const rankingRef = ref(database, "ranking/maisTocada");

    const unsubscribe = onValue(rankingRef, (snap) => {
      if (snap.exists()) {
        setMaisTocada(snap.val());
      } else {
        setMaisTocada(null);
      }
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-2 -white rounded-lg">
      <h3 className="text-lg font-bold mb-2">🏆 Música Mais Tocada</h3>

      {carregando && <p>Carregando ranking...</p>}

      {!carregando && !maisTocada && (
        <p className="text-red-600">
          Nenhuma música registrada ainda
        </p>
      )}

      {maisTocada && (
        <p className="text-red-600">
          🎵 {maisTocada.titulo} ({maisTocada.vezes}x)
        </p>
      )}
    </div>
  );
}
