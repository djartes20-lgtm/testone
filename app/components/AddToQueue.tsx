"use client";

import { useState } from "react";
import { push, ref } from "firebase/database";
import { db } from "@/app/lib/firebase";

export default function AddToQueue({
  addToQueue,
}: {
  addToQueue: (link: string, title: string) => void;
}) {
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");

  return (
    <div style={{ marginBottom: 20 }}>
      <h3>➕ Adicionar música</h3>

      <input
        placeholder="Link do YouTube"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />

      <input
        placeholder="Nome da música"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />

      <button onClick={() => addToQueue(link, title)}>
        Adicionar
      </button>
    </div>
  );
}

