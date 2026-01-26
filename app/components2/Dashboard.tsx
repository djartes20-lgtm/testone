"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { ref, onValue, push, set } from "firebase/database";

import Avisos from "@/app/components/avisos";
import History from "@/app/components/History";
import YouTubeMusic from "@/app/components2/YouTubeMusic";
import Fila from "@/app/components2/Fila";
import Splash from "@/app/components2/Splash";

interface GothamUser {
  nome: string;
}

export default function StudentsPage() {
  const [splashFinished, setSplashFinished] = useState(false);
  const [fila, setFila] = useState<{ id: string; titulo: string }[]>([]);
  const [user, setUser] = useState<GothamUser | null>(null);

  // 🔹 Usuário
  useEffect(() => {
    const data = localStorage.getItem("gotham_user");
    if (data) setUser(JSON.parse(data));
  }, []);

  // 🔹 Fila
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

  if (!splashFinished) {
    return <Splash onFinish={() => setSplashFinished(true)} />;
  }

  return (
    <div
      className="p-4"
      style={{
        border: "2px solid #ff0707",
        borderRadius: 16,
        background: "#000",
        boxShadow: "0 0 30px #ff0707",
        color: "#ff0707",
      }}
    >
      {/* Header */}
      <div className="p-3">
        <h1>Olá {user?.nome}</h1>
        <h2>Boas-vindas à Gotham Play</h2>
      </div>

      {/* Player / YouTube */}
      <div
        style={{
          border: "2px solid #ff0707",
          borderRadius: 12,
          padding: 12,
          boxShadow: "0 0 20px #ff0707",
          marginBottom: 20,
        }}
      >
        <h2>YouTube Music</h2>
        <YouTubeMusic />
      </div>

      {/* Avisos */}
      <div
        style={{
          border: "2px solid #ff0707",
          borderRadius: 12,
          padding: 10,
          marginBottom: 20,
          boxShadow: "0 0 20px #ff0707, inset 0 0 15px rgba(255,7,7,0.4)",
        }}
      >
        <Avisos />
      </div>

      {/* Fila */}
      <div
        style={{
          border: "2px solid #ff0707",
          borderRadius: 12,
          padding: 10,
          marginBottom: 20,
          boxShadow: "0 0 20px #ff0707",
        }}
      >
        <Fila fila={fila} />
      </div>

      {/* Histórico */}
      <div
        style={{
          border: "2px solid #ff0707",
          borderRadius: 12,
          padding: 12,
          boxShadow: "0 0 20px #ff0707, inset 0 0 15px rgba(255,7,7,0.4)",
        }}
      >
        <History />
      </div>
    </div>
  );
}
