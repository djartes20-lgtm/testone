"use client";

import { useEffect, useState } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface OnlineUser {
  uid: string;
  nome: string;
  email: string;
  avatar: string;
  lastSeen: number;
}

export default function OnlineUsers() {
  const [users, setUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    const usersRef = ref(db, "onlineUsers");
    return onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setUsers([]);

      const list = Object.entries(data).map(([uid, info]: any) => ({
        uid,
        ...info,
      }));

      setUsers(list);
    });
  }, []);

  // Bloquear usuário
  const blockUser = async (uid: string) => {
    // Adiciona em blockedUsers
    await set(ref(db, `blockedUsers/${uid}`), true);
    // Remove do onlineUsers
    await remove(ref(db, `onlineUsers/${uid}`));
    alert("Usuário bloqueado!");
  };

  // Desbloquear usuário
  const unblockUser = async (uid: string) => {
    await remove(ref(db, `blockedUsers/${uid}`));
    alert("Usuário desbloqueado!");
  };

  return (
    <div style={{ background: "#000", padding: 15, borderRadius: 8, border: "2px solid #ff0707" }}>
      <h2 style={{ color: "#ff0707", marginBottom: 10, fontWeight: "bold" }}>
        👥 Usuários Online
      </h2>

      {users.length === 0 && <p style={{ color: "#ff0707" }}>Nenhum usuário online</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {users.map((user) => (
          <div
            key={user.uid}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 8,
              border: "1px solid #ff0707",
              borderRadius: 6,
              background: "#111",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={user.avatar} alt={user.nome} style={{ width: 40, height: 40, borderRadius: "50%" }} />
              <div>
                <p style={{ color: "#ff0707", fontWeight: "bold" }}>{user.nome}</p>
                <p style={{ color: "#ff0707", fontSize: 12 }}>{user.email}</p>
              </div>
            </div>

            <div>
              <button
                onClick={() => blockUser(user.uid)}
                style={{
                  background: "#ff0707",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 6,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                🚫 Bloquear
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
