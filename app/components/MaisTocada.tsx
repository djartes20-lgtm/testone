"use client";
import { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";

interface Musica {
  titulo: string;
  vezes: number;
}

export default function MaisTocada() {
  const [musica, setMusica] = useState<Musica | null>(null);

  useEffect(() => {
    const ref = firebase.database().ref("ranking/maisTocada");
    ref.on("value", (snap) => setMusica(snap.val()));
    return () => ref.off();
  }, []);

  return (
    <div className="card">
      <h2>🏆 Música Mais Tocada</h2>
      <p>{musica ? `🎵 ${musica.titulo} (${musica.vezes}x)` : "Nenhuma música ainda"}</p>
      <style jsx>{`
        .card { border:2px solid #ff0707; padding:15px; border-radius:10px; margin-bottom:15px; }
      `}</style>
    </div>
  );
}
