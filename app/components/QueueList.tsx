"use client";

import Card from "../components2/Card";

export default function QueueList({
  queue,
  isAdmin,
  removeFromQueue,
}: {
  queue: any[];
  isAdmin: boolean;
  removeFromQueue: (id: string) => void;
}) {
  return (
    <div>
      <Card title="📜 Fila de Músicas 📜">
        
        <ul
          className="space-y-2 queue-list"
          style={{
            maxHeight: "300px", // 🔥 altura máxima antes de aparecer a scrollbar
            overflowY: "auto",
          }}
        >
          {queue.length === 0 && <p>Fila vazia</p>}

          {queue.map((item, index) => (
            <div
              key={item.id}
              className="flex justify-between border-b border-red-600 pb-1"
            >
              {index + 1}. {item.title}
              {isAdmin && (
                <button
                  onClick={() => removeFromQueue(item.id)}
                  className="hover:text-white"
                >
                  ❌
                </button>
              )}
            </div>
          ))}
        </ul>

        {/* 🔥 Estilo da scrollbar neon */}
        <style jsx>{`
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
        `}</style>
      </Card>
    </div>
  );
}
