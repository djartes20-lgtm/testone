"use client";

import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface QueueItem {
  videoId: string;
  title: string;
  requestedBy: string;
}

export default function QueueList() {
  const [queue, setQueue] = useState<[string, QueueItem][]>([]);

  useEffect(() => {
    const queueRef = ref(db, "queue");

    onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setQueue([]);
        return;
      }

      setQueue(Object.entries(data));
    });
  }, []);

  const removeItem = async (id: string) => {
    await remove(ref(db, `queue/${id}`));
  };

  return (
    <div>
      <h2>📃 Fila de Músicas</h2>

      {queue.length === 0 && <p>Fila vazia</p>}

      <ul>
        {queue.map(([id, item], index) => (
          <li key={id}>
            <strong>{index + 1}.</strong> {item.title}
            <small> ({item.requestedBy})</small>
            <button onClick={() => removeItem(id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
