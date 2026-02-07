"use client";

import { useEffect, useState, useRef } from "react";
import {
  ref,
  push,
  onValue,
  query,
  limitToLast,
  update,
  set,
  onDisconnect,
} from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Message {
  id?: string;
  user: string;
  text: string;
  createdAt: number;
  likes?: number;
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
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* 🔥 Mensagens */
  useEffect(() => {
    const chatRef = query(ref(db, "chat"), limitToLast(50));
    return onValue(chatRef, (snap) => {
      const data = snap.val();
      if (!data) return setMessages([]);

      const list = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as Message),
      }));

      setMessages(list);
    });
  }, []);

  /* 🔽 Scroll automático */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ✍️ Digitando */
  useEffect(() => {
    const typingRef = ref(db, "typing");

    onValue(typingRef, (snap) => {
      const data = snap.val();
      if (!data) return setTypingUser(null);

      const usersTyping = Object.keys(data).filter(
        (u) => u !== userName && data[u] === true
      );

      setTypingUser(usersTyping[0] || null);
    });

    const myTypingRef = ref(db, `typing/${userName}`);
    onDisconnect(myTypingRef).remove();
  }, [userName]);

  const handleTyping = (value: string) => {
    setText(value);
    set(ref(db, `typing/${userName}`), value.length > 0);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    await push(ref(db, "chat"), {
      user: isAdmin ? "ADM" : userName,
      text,
      createdAt: Date.now(),
      likes: 0,
    });

    setText("");
    set(ref(db, `typing/${userName}`), false);
  };

  /* 👍 Curtir */
  const likeMessage = async (id: string, likes = 0) => {
    await update(ref(db, `chat/${id}`), {
      likes: likes + 1,
    });
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>💬 Chat da Academia</h2>
        {typingUser && (
          <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
            ✍️ {typingUser} está digitando...
          </span>
        )}
      </div>

      <div className="day-block">
        <ul>
          {messages.map((msg) => (
            <li
              key={msg.id}
              style={{
                color: msg.user === "ADM" ? "#ff0707" : "#fff",
                fontSize: "0.9rem",
                display: "flex",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <span>
                <strong>{msg.user}:</strong> {msg.text}
              </span>

              <button
                onClick={() => likeMessage(msg.id!, msg.likes)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ff0707",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                👍 {msg.likes || 0}
              </button>
            </li>
          ))}
        </ul>
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,7,7,0.3)" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Digite sua mensagem..."
            className="search-input"
          />
          <button
            onClick={sendMessage}
            style={{
              background: "#ff0707",
              color: "#000",
              padding: "6px 14px",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
