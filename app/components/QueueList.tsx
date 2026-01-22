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
      <Card title="📜 Fila de Músicas">
        <ul className="space-y-2">

          {queue.length === 0 && <p>Fila vazia</p>}

          {queue.map((item, index) => (
            <div key={item.id} 
            className="flex justify-between border-b border-red-600 pb-1">
              {index + 1}. {item.title}
              {isAdmin && (
                <button onClick={() => removeFromQueue(item.id)}
                                className="hover:text-white"
>
                  ❌
                </button>
              )}
            </div>
          ))}

        </ul>
      </Card>

    </div>
  );
}
