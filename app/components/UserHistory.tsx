"use client";

import { useEffect, useState } from "react";
import { ref, onValue, off, DataSnapshot } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface HistoryItem {
  videoId: string;
  title: string;
  requestedAt: number;
}

interface Props {
  userName: string; // nome do aluno logado
}

export default function UserHistory({ userName }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!userName) return;

    const historyRef = ref(db, `userHistory/${userName}`);

    const handleSnapshot = (snapshot: DataSnapshot) => {
      const data = snapshot.val() || {};
      const items: HistoryItem[] = Object.values(data).map((item: any) => ({
        videoId: item.videoId,
        title: item.title,
        requestedAt: item.requestedAt,
      }));
      items.sort((a, b) => b.requestedAt - a.requestedAt);
      setHistory(items);
    };

    onValue(historyRef, handleSnapshot);

    return () => {
      off(historyRef, "value", handleSnapshot);
    };
  }, [userName]);

  return (
    <div style={{ marginTop: 20 }}>
      <h2 className="text-red-500 font-bold mb-2 text-center">Seu Histórico</h2>

      {history.length === 0 && <p className="text-center">Nenhuma música pedida ainda.</p>}

      <div className="queue-list">
        <ul>
          {history.map((item, index) => (
            <li key={index} className="history-item">
              <div className="history-content">
                <span className="history-title">{item.title}</span>
                <span className="history-date">{new Date(item.requestedAt).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 🔥 Estilos do scroll e efeito neon */}
      <style jsx>{`
        .queue-list {
          max-height: 250px;
          overflow-y: auto;
          padding: 10px;
          background-color: #000;
          border-radius: 10px;
          border: 2px solid #ff0707;
        }

        /* Scroll personalizado */
        .queue-list::-webkit-scrollbar {
          width: 10px;
        }
        .queue-list::-webkit-scrollbar-track {
          background: #000;
          border-radius: 10px;
        }
        .queue-list::-webkit-scrollbar-thumb {
          background: #ff0707;
          border-radius: 10px;
          box-shadow:
            0 0 4px #ff0707,
            0 0 8px #ff0707,
            0 0 12px #ff0707;
        }
        .queue-list::-webkit-scrollbar-thumb:hover {
          background: #ff0000;
          box-shadow:
            0 0 6px #ff0707,
            0 0 12px #ff0707,
            0 0 18px #ff0707;
        }

        /* Cada item do histórico */
        .history-item {
          margin-bottom: 8px;
        }

        .history-content {
          display: flex;
          flex-direction: column;
          padding: 8px 12px;
          border: 1px solid #ff0707;
          border-radius: 8px;
          background: rgba(0,0,0,0.5);
          position: relative;
          color: #fff;
          box-shadow:
            0 0 5px #ff0707,
            0 0 10px #ff0707,
            0 0 20px #ff0707;
          transition: all 0.2s ease-in-out;
        }

        .history-content:hover {
          box-shadow:
            0 0 8px #ff0707,
            0 0 16px #ff0707,
            0 0 24px #ff0707;
        }

        .history-title {
          font-weight: bold;
          color: #ff0707;
        }

        .history-date {
          font-size: 0.85rem;
          color: #fff;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}

