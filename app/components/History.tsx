"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface HistoryItem {
  videoId: string;
  title: string;
  requestedBy: string;
  startedAt: number;
}

type HistoryByDay = {
  [day: string]: {
    [key: string]: any;
  };
};

export default function History() {
  const [history, setHistory] = useState<HistoryByDay>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const historyRef = ref(db, "history");
    return onValue(historyRef, (snapshot) => {
      setHistory(snapshot.val() || {});
    });
  }, []);

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  return (
    <div className="history-container">
      {/* 🔒 HEADER FIXO */}
      <div className="history-header">
         <h2
        className="text-center font-bold text-xl mb-4"
        style={{ color: "#ff0707", textShadow: "0 0 4px #FF0707" }}
      >
        🎧 Histórico de Músicas Tocadas 🎧
      </h2>
        

        <input
          className="search-input"
          placeholder="Pesquisar música, pessoa ou data"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📜 CONTEÚDO */}
      {Object.entries(history)
        .filter(([day]) => /^\d{4}-\d{2}-\d{2}$/.test(day))
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([day, musics]) => {
          const formattedDate = day.split("-").reverse().join("/");

          const musicList: HistoryItem[] = Object.values(musics).filter(
            (item): item is HistoryItem =>
              item &&
              typeof item === "object" &&
              "videoId" in item &&
              "title" in item &&
              "requestedBy" in item &&
              "startedAt" in item
          );

          const filtered = musicList.filter((item) => {
            if (!search) return true;
            const term = normalize(search);
            return (
              normalize(item.title).includes(term) ||
              normalize(item.requestedBy).includes(term) ||
              formattedDate.includes(search)
            );
          });

          if (filtered.length === 0) return null;

          return (
            <div key={day} className="day-block">
              <h3 className="day-title">
                📅 Histórico do dia {formattedDate}
              </h3>

              <ul>
                {filtered
                  .sort((a, b) => b.startedAt - a.startedAt)
                  .map((item, index) => (
                    <li key={index}>
                      <strong>{item.title}</strong> — Pedido por{" "}
                      {item.requestedBy}
                      <br />
                      <small>
                        {new Date(item.startedAt).toLocaleTimeString()}
                      </small>
                    </li>
                  ))}
              </ul>
            </div>
          );
        })}

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

        /* 🔒 Header fixo */
        .history-header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #000;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 7, 7, 0.4);
        }

        .search-input {
          width: 100%;
          margin-top: 6px;
          padding: 6px 10px;
          background: #000;
          border: 1px solid #ff0707;
          color: #ff0707;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .search-input::placeholder {
          color: rgba(255, 7, 7, 0.6);
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
          margin-bottom: 10px;
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
