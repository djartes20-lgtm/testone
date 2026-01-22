"use client";

import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "@/app/lib/firebase";
import Card from "./Card";

type Music = {
  key: string; 
  titulo: string;
};

export default function Queue() {
  const [fila, setFila] = useState<Music[]>([]);

  useEffect(() => {
    const filaRef = ref(db, "fila");
    return onValue(filaRef, snap => {
      const data = snap.val();
      const arr = data
        ? Object.entries(data).map(([key, val]: any) => ({
            key,
            titulo: val.titulo,
          }))
        : [];
      setFila(arr);
    });
  }, []);

  return (
    <Card title="📜 Fila de Músicas">
      <ul className="space-y-2">
        {fila.map(m => (
          <li
            key={m.key}
            className="flex justify-between border-b border-red-600 pb-1"
          >
            {m.titulo}
            <button
              onClick={() => remove(ref(db, `fila/${m.key}`))}
              className="hover:text-white"
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
