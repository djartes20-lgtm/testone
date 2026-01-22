"use client";

import { useEffect, useState } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "@/app/lib/firebase";
import Card from "./Card";

const modos = ["manha", "tarde", "noite", "gotham"] as const;
type Modo = typeof modos[number];

export default function ModeSelector() {
  const [modoAtual, setModoAtual] = useState<Modo | null>(null);

  useEffect(() => {
    const modoRef = ref(db, "configuracoes/modoAtual");
    return onValue(modoRef, snap => {
      setModoAtual(snap.val());
      if (snap.val()) {
        document.body.className = snap.val();
      }
    });
  }, []);

  function alterarModo(modo: Modo) {
    set(ref(db, "configuracoes/modoAtual"), modo);
  }

  return (
    <Card title="🎨 Modo do Sistema (Global)">
      <div className="flex flex-wrap gap-2">
        {modos.map(modo => (
          <button
            key={modo}
            onClick={() => alterarModo(modo)}
            className={`px-4 py-2 rounded border
              ${
                modoAtual === modo
                  ? "bg-red-600 text-black"
                  : "border-red-600 hover:bg-red-600 hover:text-black"
              }`}
          >
            {modo.toUpperCase()}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm">
        Modo atual:{" "}
        <span className="font-bold">
          {modoAtual?.toUpperCase() || "--"}
        </span>
      </p>
    </Card>
  );
}
