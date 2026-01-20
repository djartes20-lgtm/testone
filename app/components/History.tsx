"use client";

import { useEffect, useState } from "react";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { db } from "@/app/lib/firebase";
import Card from "./Card";

type HistoryItem = {
  titulo: string;
  data: string;
  hora: string;
};

export default function History() {
  const [historico, setHistorico] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const q = query(ref(db, "historico"), limitToLast(50));

    return onValue(q, snap => {
      const data = snap.val();
      if (!data) {
        setHistorico([]);
        return;
      }

      const lista = Object.values(data).reverse() as HistoryItem[];
      setHistorico(lista);
    });
  }, []);

  return (
    <Card title="📊 Histórico de Músicas Tocadas">
      <ul className="space-y-2 max-h-64 overflow-y-auto">
        {historico.map((m, i) => (
          <li
            key={i}
            className="text-sm border-b border-red-600/40 pb-1"
          >
            ⏰ {m.hora} | 📅 {m.data} — 🎵 {m.titulo}
          </li>
        ))}
      </ul>
    </Card>
  );
}
