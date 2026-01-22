"use client";

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
      <h3>🎶 Fila</h3>

      {queue.length === 0 && <p>Fila vazia</p>}

      {queue.map((item, index) => (
        <div key={item.id}>
          {index + 1}. {item.title}

          {isAdmin && (
            <button onClick={() => removeFromQueue(item.id)}>
              ❌
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
