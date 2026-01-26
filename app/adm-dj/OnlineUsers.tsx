"use client";

import { useEffect, useState } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface UserData {
  uid: string;
  nome: string;
  email: string;
  avatar: string;
}

export default function OnlineUsersADM() {
  const [online, setOnline] = useState<UserData[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);

  useEffect(() => {
    return onValue(ref(db, "onlineUsers"), (snap) => {
      if (!snap.exists()) return setOnline([]);
      const list = Object.entries(snap.val()).map(([uid, data]: any) => ({
        uid,
        ...data,
      }));
      setOnline(list);
    });
  }, []);

  useEffect(() => {
    return onValue(ref(db, "blockedUsers"), (snap) => {
      if (!snap.exists()) return setBlockedIds([]);
      setBlockedIds(Object.keys(snap.val()));
    });
  }, []);

  const blockUser = async (user: UserData) => {
    await set(ref(db, `blockedUsers/${user.uid}`), {
      nome: user.nome,
      email: user.email,
      avatar: user.avatar,
      blockedAt: Date.now(),
    });
  };

  const unblockUser = async (uid: string) => {
    await remove(ref(db, `blockedUsers/${uid}`));
  };

  return (
    <div
      className="
        bg-black p-5 rounded-2xl
        border border-red-500
        shadow-[0_0_25px_rgba(255,0,0,0.7)]
        relative
      "
    >
      {/* Glow interno */}
      <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_25px_rgba(255,0,0,0.35)] pointer-events-none" />

      <h2
        className="
          text-center text-xl font-extrabold mb-5
          text-red-500 tracking-widest
          drop-shadow-[0_0_10px_rgba(255,0,0,1)]
        "
      >
        👥 USUÁRIOS ONLINE 👥
      </h2>

      {online.length === 0 && (
        <p className="text-center text-red-400 opacity-80">
          Nenhum usuário online
        </p>
      )}

      {online.map((u) => {
        const isBlocked = blockedIds.includes(u.uid);

        return (
          <div
            key={u.uid}
            className={`
              flex justify-between items-center mb-4 p-3 rounded-xl
              border transition-all duration-300
              ${
                isBlocked
                  ? "border-red-800 opacity-60"
                  : `
                    border-red-500
                    shadow-[0_0_15px_rgba(255,0,0,0.6)]
                    hover:shadow-[0_0_30px_rgba(255,0,0,1)]
                  `
              }
              bg-black
            `}
          >
            <div className="flex items-center gap-3">
              <img
                src={u.avatar}
                alt={u.nome}
                className="
                  w-10 h-10 rounded-full
                  border border-red-500
                  shadow-[0_0_15px_rgba(255,0,0,0.9)]
                "
              />

              <span
                className={`
                  font-bold tracking-wide
                  ${
                    isBlocked
                      ? "text-red-700 line-through"
                      : "text-red-400 drop-shadow-[0_0_8px_rgba(255,0,0,1)]"
                  }
                `}
              >
                {u.nome}
                {isBlocked && " (bloqueado)"}
              </span>
            </div>

            {isBlocked ? (
              <button
                onClick={() => unblockUser(u.uid)}
                className="
                  px-4 py-1 rounded-lg font-bold
                  bg-red-500 text-black
                  shadow-[0_0_20px_rgba(255,0,0,1)]
                  hover:shadow-[0_0_35px_rgba(255,0,0,1)]
                  transition-all
                "
              >
                🔓 Desbloquear
              </button>
            ) : (
              <button
                onClick={() => blockUser(u)}
                className="
                  px-4 py-1 rounded-lg font-bold
                  bg-red-500 text-black
                  shadow-[0_0_20px_rgba(255,0,0,1)]
                  hover:shadow-[0_0_35px_rgba(255,0,0,1)]
                  transition-all
                "
              >
                🚫 Bloquear
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
