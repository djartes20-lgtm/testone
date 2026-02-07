"use client";

import { useEffect, useState, useRef } from "react";
import { ref, push, onValue, query, limitToLast } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Message {
  user: string;
  text: string;
  createdAt: number;
}

export default function ChatGotham({
  userName,
  isAdmin,
}: {
  userName: string;
  isAdmin?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const chatRef = query(ref(db, "chat"), limitToLast(50));
    return onValue(chatRef, (snap) => {
      const data = snap.val();
      if (!data) return setMessages([]);

      const list = Object.values(data) as Message[];
      setMessages(list);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    await push(ref(db, "chat"), {
      user: isAdmin ? "ADM" : userName,
      text,
      createdAt: Date.now(),
    });

    setText("");
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex flex-col h-[400px]">
      <h2 className="text-white font-bold mb-2">💬 Chat da Academia</h2>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm ${
              msg.user === "ADM" ? "text-red-400" : "text-white"
            }`}
          >
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 mt-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Digite sua mensagem..."
          className="flex-1 rounded-md px-3 py-2 text-black"
        />
        <button
          onClick={sendMessage}
          className="bg-red-600 text-white px-4 rounded-md font-bold"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
