"use client";

import { useEffect, useState, useRef } from "react";
import {
  ref,
  push,
  onValue,
  query,
  limitToLast,
  set,
  remove,
  onDisconnect,
} from "firebase/database";
import { db } from "@/app/lib/firebase";

const EMOJIS = ["👍", "❤️", "😂", "🔥", "😡"];

interface Message {
  id?: string;
  user: string;
  text: string;
  createdAt: number;
  reactions?: {
    [emoji: string]: {
      [user: string]: boolean;
    };
  };
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

    onDisconnect(ref(db, `typing/${userName}`)).remove();
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
    });

    setText("");
    set(ref(db, `typing/${userName}`), false);
  };

  /* 😀 Reações */
  const toggleReaction = async (
    messageId: string,
    emoji: string,
    reacted: boolean
  ) => {
    const reactionRef = ref(
      db,
      `chat/${messageId}/reactions/${emoji}/${userName}`
    );

    reacted ? await remove(reactionRef) : await set(reactionRef, true);
  };

  return (
    <>
      <div className="history-container">
        {/* HEADER FIXO */}
        <div className="history-header">
          <h2>💬 Chat da Academia</h2>
        </div>

        {/* MENSAGENS */}
        <div className="day-block">
          <ul>
            {messages.map((msg) => (
              <li key={msg.id}>
                <div
                  style={{
                    color: msg.user === "ADM" ? "#ff0707" : "#fff",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>{msg.user}:</strong> {msg.text}
                </div>

                {/* Reações */}
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  {EMOJIS.map((emoji) => {
                    const reacted =
                      msg.reactions?.[emoji]?.[userName] === true;
                    const count = msg.reactions?.[emoji]
                      ? Object.keys(msg.reactions[emoji]).length
                      : 0;

                    if (count === 0 && !reacted) return null;

                    return (
                      <button
                        key={emoji}
                        onClick={() =>
                          toggleReaction(msg.id!, emoji, reacted)
                        }
                        style={{
                          background: reacted ? "#ff0707" : "transparent",
                          color: reacted ? "#000" : "#ff0707",
                          border: "1px solid #ff0707",
                          borderRadius: "14px",
                          padding: "2px 8px",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        {emoji} {count}
                      </button>
                    );
                  })}

                  {/* Adicionar reação */}
                  <div>
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() =>
                          toggleReaction(
                            msg.id!,
                            emoji,
                            msg.reactions?.[emoji]?.[userName] === true
                          )
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div ref={messagesEndRef} />
        </div>

        {/* DIGITANDO */}
        {typingUser && (
          <div className="typing">
            ✍️ {typingUser} está digitando...
          </div>
        )}

        {/* INPUT */}
        <div className="input-area">
          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Digite sua mensagem..."
            className="search-input"
          />
          <button onClick={sendMessage}>Enviar</button>
        </div>
      </div>

      {/* 🎨 ESTILO GOTHAM */}
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
          padding: 6px 10px;
          background: #000;
          border: 1px solid #ff0707;
          color: #ff0707;
          border-radius: 6px;
        }

        .search-input::placeholder {
          color: rgba(255, 7, 7, 0.6);
        }

        .day-block {
          padding: 16px;
        }

        ul {
          list-style: none;
          padding: 0;
        }

        li {
          margin-bottom: 14px;
        }

        .typing {
          padding: 0 16px 6px;
          font-size: 0.75rem;
          color: rgba(255, 7, 7, 0.8);
        }

        .input-area {
          padding: 12px;
          border-top: 1px solid rgba(255, 7, 7, 0.3);
          display: flex;
          gap: 8px;
        }

        .input-area button {
          background: #ff0707;
          color: #000;
          padding: 6px 14px;
          border-radius: 6px;
          font-weight: bold;
        }

        /* 🔥 Scrollbar neon */
        .history-container::-webkit-scrollbar {
          width: 10px;
        }

        .history-container::-webkit-scrollbar-thumb {
          background: #ff0707;
          border-radius: 10px;
          box-shadow: 0 0 6px #ff0707;
        }
      `}</style>
    </>
  );
}
