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

  // Guarda quantidade anterior de mensagens para scroll condicional
  const prevMessagesCount = useRef(0);

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

  /* 🔽 Scroll automático SOMENTE para novas mensagens */
  useEffect(() => {
    if (messages.length > prevMessagesCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesCount.current = messages.length;
  }, [messages]);

  /* ✍️ Digitando */
  useEffect(() => {
    const typingRef = ref(db, "typing");

    const unsub = onValue(typingRef, (snap) => {
      const data = snap.val();
      if (!data) return setTypingUser(null);

      const usersTyping = Object.keys(data).filter(
        (u) => u !== userName && data[u] === true
      );

      setTypingUser(usersTyping[0] || null);
    });

    onDisconnect(ref(db, `typing/${userName}`)).remove();

    return () => unsub();
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

  /* 😀 Reações estilo WhatsApp */
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
    <div className="history-container">
      {/* HEADER */}
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
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginTop: "6px",
                  flexWrap: "wrap",
                }}
              >
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
                      className={`reaction ${reacted ? "active" : ""}`}
                    >
                      {emoji} {count}
                    </button>
                  );
                })}

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
                    className="emoji-add"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div ref={messagesEndRef} />
      </div>

      {/* DIGITANDO */}
      {typingUser && (
        <div className="typing">✍️ {typingUser} está digitando...</div>
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

      {/* 🎨 ESTILO GOTHAM + SCROLL NEON */}
      <style jsx>{`
        .history-container {
          border: 2px solid #ff0707;
          border-radius: 10px;
          background: #000;
          color: #ff0707;
          height: 420px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow:
            0 0 6px rgba(255, 7, 7, 0.6),
            0 0 14px rgba(255, 7, 7, 0.45),
            0 0 24px rgba(255, 7, 7, 0.25),
            0 0 40px rgba(255, 7, 7, 0.15);
        }

        .history-header {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 7, 7, 0.4);
        }

        .day-block {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          margin-bottom: 14px;
        }

        .typing {
          padding: 4px 16px;
          font-size: 0.75rem;
          color: rgba(255, 7, 7, 0.8);
        }

        .input-area {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid rgba(255, 7, 7, 0.3);
        }

        .search-input {
          width: 100%;
          padding: 6px 10px;
          background: #000;
          border: 1px solid #ff0707;
          color: #ff0707;
          border-radius: 6px;
        }

        .reaction {
          border: 1px solid #ff0707;
          background: transparent;
          color: #ff0707;
          border-radius: 14px;
          padding: 2px 8px;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .reaction.active {
          background: #ff0707;
          color: #000;
          box-shadow: 0 0 10px rgba(255, 7, 7, 0.8);
        }

        .emoji-add {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .input-area button {
          background: #ff0707;
          color: #000;
          border-radius: 6px;
          font-weight: bold;
          padding: 6px 14px;
        }

        /* 🔥 SCROLLBAR NEON */
        .day-block::-webkit-scrollbar {
          width: 12px;
        }

        .day-block::-webkit-scrollbar-track {
          background: #000;
          box-shadow: inset 0 0 6px rgba(255, 7, 7, 0.3);
        }

        .day-block::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ff0707, #ff3b3b, #ff0707);
          border-radius: 10px;
          box-shadow:
            0 0 6px rgba(255, 7, 7, 0.9),
            0 0 16px rgba(255, 7, 7, 0.7),
            0 0 30px rgba(255, 7, 7, 0.5);
          animation: neonScroll 2s infinite alternate;
        }

        @keyframes neonScroll {
          from {
            box-shadow:
              0 0 6px rgba(255, 7, 7, 0.6),
              0 0 14px rgba(255, 7, 7, 0.4);
          }
          to {
            box-shadow:
              0 0 14px rgba(255, 7, 7, 1),
              0 0 30px rgba(255, 7, 7, 0.8);
          }
        }
      `}</style>
    </div>
  );
}

