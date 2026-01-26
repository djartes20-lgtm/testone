"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Props {
  uid: string; // UID do usuário logado
  onRequest?: () => void; // função de pedido de música
}

export default function RequestButtonGuard({ uid, onRequest }: Props) {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const blockedRef = ref(db, "blockedUsers");
    return onValue(blockedRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setIsBlocked(false);
      setIsBlocked(Object.keys(data).includes(uid));
    });
  }, [uid]);

  const handleClick = () => {
    if (isBlocked) {
      alert("❌ Você está bloqueado e não pode pedir músicas!");
      return;
    }
    if (onRequest) onRequest();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isBlocked}
      style={{
        background: isBlocked ? "#555" : "#ff0707",
        color: isBlocked ? "#aaa" : "#fff",
        padding: "10px 16px",
        borderRadius: 6,
        border: "none",
        cursor: isBlocked ? "not-allowed" : "pointer",
        fontWeight: "bold",
      }}
    >
      {isBlocked ? "🚫 Bloqueado" : "🎵 Pedir Música"}
    </button>
  );
}