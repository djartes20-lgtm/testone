"use client";

import { useEffect, useState } from "react";
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

  /* 🧹 LIMPAR CHAT (SÓ ADM) */
  const clearChat = async () => {
    if (!isAdmin) return;

    const confirmClear = confirm(
      "⚠️ Tem certeza que deseja apagar TODAS as mensagens do chat?"
    );

    if (!confirmClear) return;

    await remove(ref(db, "chat"));
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
    <div className="history-container">
      {/* HEADER */}
      <div className="history-header">
        <h2
  style={{
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "#ff0707",
  }}
>
  💬 Chat da Academia 💬
</h2>
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

              <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                {EMOJIS.map((emoji) => {
                  const reacted = msg.reactions?.[emoji]?.[userName];
                  const count = msg.reactions?.[emoji]
                    ? Object.keys(msg.reactions[emoji]).length
                    : 0;

                  if (count === 0 && !reacted) return null;

                  return (
                    <button
                      key={emoji}
                      onClick={() =>
                        toggleReaction(msg.id!, emoji, !!reacted)
                      }
                      className={`reaction ${reacted ? "active" : ""}`}
                    >
                      {emoji} {count}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
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

        {/* 📤 ENVIAR PRIMEIRO */}
        <button onClick={sendMessage}>Enviar</button>

        {/* 🧹 LIMPAR DEPOIS (SÓ ADM) */}
        {isAdmin && (
          <button onClick={clearChat} className="clear-chat">
            Clear
          </button>
        )}
      </div>

      <style jsx>{`
        .history-container {
          border: 2px solid #ff0707;
          border-radius: 10px;
          background: #000;
          color: #ff0707;
          height: 420px;
          display: flex;
          flex-direction: column;
        }

        .day-block {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }

        .input-area {
          display: flex;
          gap: 8px;
          padding: 12px;
        }

        .search-input {
          flex: 1;
          background: #000;
          border: 1px solid #ff0707;
          color: #ff0707;
          border-radius: 6px;
          padding: 6px;
        }

        button {
          background: #ff0707;
          color: #000;
          border-radius: 6px;
          font-weight: bold;
          padding: 6px 12px;
          cursor: pointer;
        }

        .clear-chat {
          background: #ff0707;
          color: #000;
          border: 1px solid #ff0707;
        }
        
        @media (max-width: 768px) {
  .history-container {
    height: 75vh; /* ocupa bem a tela do celular */
  }

  .day-block {
    padding: 10px;
    font-size: 0.85rem;
  }

  .input-area {
    padding: 8px;
    gap: 6px;
  }

  .search-input {
    font-size: 0.9rem;
    padding: 10px;
  }

   .buttons {
    display: flex;
    gap: 8px;
  }

  .buttons button {
    flex: 1;
    font-size: 0.85rem;
    padding: 10px 0;
  }

  .reaction {
    font-size: 0.8rem;
    padding: 4px 6px;
  }

  .typing {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
}

      `}</style>
    </div>
  );
}






