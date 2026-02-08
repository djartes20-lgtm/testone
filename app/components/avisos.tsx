"use client";

import { useState, useRef } from "react";

const todosAvisos = [
  { id: "todos", texto: " Tocar todos os avisos" },

  { id: "hidratacao", texto: " Lembre-se de se hidratar, pois isso e muito importante para o seu corpo e treino.", arquivo: "/ttsmaker-file-2026-2-8-1-42-31.mp3" },
  { id: "limpeza", texto: " Mantenha os aparelhos limpos após o uso, para assim sempre termos um ambiente limpo e agradavel.", arquivo: "/ttsmaker-file-2026-2-8-1-43-15.mp3" },
  { id: "horarios", texto: " Passando para lembrar a todos que a academia está prestes a fechar!.", arquivo: "/ttsmaker-file-2026-2-8-1-44-0.mp3" },
];

export default function Avisos() {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ marcar / desmarcar avisos
  const toggleAviso = (id: string) => {
    if (id === "todos") {
      const todosIds = todosAvisos
        .filter((a) => a.id !== "todos")
        .map((a) => a.id);

      setSelecionados((prev) =>
        prev.length === todosIds.length ? [] : todosIds
      );
      return;
    }

    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // ▶️ tocar avisos
  const tocarAvisos = () => {
    if (selecionados.length === 0) {
      alert("Selecione ao menos um aviso para tocar!");
      return;
    }

    const lista = todosAvisos.filter(
      (a) => selecionados.includes(a.id) && a.id !== "todos"
    );

    tocarAtual(0, lista);
  };

  const tocarAtual = (index: number, lista: any[]) => {
    if (index >= lista.length || !audioRef.current) return;

    audioRef.current.src = lista[index].arquivo;
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
    audioRef.current.onended = () => tocarAtual(index + 1, lista);
  };

  return (
    <div className="container">
       <h2
        className="text-center font-bold text-xl mb-4"
        style={{ color: "#ff0707", textShadow: "0 0 4px #FF0707" }}
      >
        📢 Avisos da Academia 📢 
      </h2>

      <ul>
        {todosAvisos.map((aviso) => (
          <li key={aviso.id}>
            <label>
              <input
                type="checkbox"
                checked={
                  aviso.id === "todos"
                    ? selecionados.length === todosAvisos.length - 1
                    : selecionados.includes(aviso.id)
                }
                onChange={() => toggleAviso(aviso.id)}
              />
              {aviso.texto}
            </label>
          </li>
        ))}
      </ul>

      <button onClick={tocarAvisos}>
        ▶️ Tocar Avisos Selecionados ▶️
      </button>

      <audio ref={audioRef} />

      <style jsx>{`
        .container {
          color: #ff0707;
          padding: 20px;
        }

        h2 {
          text-align: center;
          margin-bottom: 10px;
        }

        ul {
          list-style: none;
          padding: 0;
          margin-bottom: 10px;
        }

        li {
          margin-bottom: 8px;
        }

        button {
          width: 100%;
          background: #000;
          color: #ff0707;
          border: 2px solid #ff0707;
          padding: 8px 0;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
