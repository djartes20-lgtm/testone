"use client";

import { useEffect, useState } from "react";
import { ref, onValue, push } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface HistoryItem {
  title?: string;
  titulo?: string;
  startedAt?: number;
  [key: string]: any; // outros campos
}

type HistoryByDay = {
  [day: string]: {
    [key: string]: any;
  };
};

export default function History() {
  const [history, setHistory] = useState<HistoryByDay>({});

  useEffect(() => {
    const historyRef = ref(db, "history");
    return onValue(historyRef, (snapshot) => {
      setHistory(snapshot.val() || {});
    });
  }, []);

  // 🔥 Função para pedir de novo
  const pedirDeNovo = (musica: HistoryItem) => {
    const filaRef = ref(db, "fila"); // fila global
    push(filaRef, musica)
      .then(() => alert(`🎵 Música "${musica.title || musica.titulo}" pedida de novo!`))
      .catch((err) => console.log(err));
  };

  return (
    <div className="history-container">
      {/* 🔒 HEADER FIXO */}
      <div className="history-header">
        <h2>🎵 Histórico de Músicas Tocadas</h2>
      </div>

      {/* 📜 CONTEÚDO */}
      {Object.entries(history)
        .filter(([day]) => /^\d{4}-\d{2}-\d{2}$/.test(day))
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([day, musics]) => {
          const formattedDate = day.split("-").reverse().join("/");

          // Pega todos os objetos que tenham title ou titulo
          const musicList: HistoryItem[] = Object.values(musics)
            .filter(
              (item): item is HistoryItem =>
                item && typeof item === "object" && ("title" in item || "titulo" in item)
            )
            .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));

          if (musicList.length === 0) return null;

          return (
            <div key={day} className="day-block">
              <h3 className="day-title">📅 Histórico do dia {formattedDate}</h3>
              <ul>
                {musicList.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center mb-2"
                  >
                    <strong>{item.title || item.titulo}</strong>
                    {/* ✅ BOTÃO PEDIR DE NOVO */}
                    <button
                      onClick={() => pedirDeNovo(item)}
                      className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                    >
                      Pedir de novo
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

      {/* 🔥 ESTILO NEON */}
      <style jsx>{`
        .history-container {
          border: 2px solid #ff0707;
          border-radius: 10px;
          background: #000;
          color: #ff0707;
          max-height: 420px;
          overflow-y: auto;

          box-shadow:
            0 0 6px rgba(255, 7, 7, 0.6),
            0 0 14px rgba(255, 7, 7, 0.45),
            0 0 24px rgba(255, 7, 7, 0.25),
            0 0 40px rgba(255, 7, 7, 0.15);
        }

        .history-header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #000;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 7, 7, 0.4);
        }

        .day-block {
          padding: 16px;
          margin-bottom: 18px;
          border-bottom: 1px solid rgba(255, 7, 7, 0.3);
        }

        .day-title {
          margin-bottom: 10px;
          font-size: 1.05rem;
          color: #ff0707;
        }

        ul {
          list-style: none;
          padding: 0;
        }

        li {
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* 🔥 Scrollbar neon */
        .history-container::-webkit-scrollbar {
          width: 10px;
        }

        .history-container::-webkit-scrollbar-track {
          background: #000;
          border-radius: 10px;
        }

        .history-container::-webkit-scrollbar-thumb {
          background: #ff0707;
          border-radius: 10px;
          box-shadow:
            0 0 4px #ff0707,
            0 0 8px #ff0707,
            0 0 12px #ff0707;
        }

        .history-container::-webkit-scrollbar-thumb:hover {
          background: #ff0000;
          box-shadow:
            0 0 6px #ff0707,
            0 0 12px #ff0707,
            0 0 18px #ff0707;
        }
      `}</style>
    </div>
  );
}


