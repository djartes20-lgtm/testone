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
    <div className="history-container">
      {/* 🔒 Header fixo */}
      <div className="history-header">
        <h2>💬 Chat da Academia</h2>
      </div>

      {/* Mensagens */}
      <div className="day-block">
        <ul>
          {messages.map((msg, i) => (
            <li
              key={i}
              style={{
                color: msg.user === "ADM" ? "#ff0707" : "#fff",
                fontSize: "0.9rem",
              }}
            >
              <strong>{msg.user}:</strong> {msg.text}
            </li>
          ))}
        </ul>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,7,7,0.3)" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
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

      <style jsx>{`
        .history-container {
          border: 2px solid #ff0707;
          border-radius: 10px;
          background: #000;
          color: #ff0707;
          max-height: 420px;
          display: flex;
          flex-direction: column;
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

        .search-input {
          flex: 1;
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
          flex: 1;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          margin-bottom: 10px;
        }

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

