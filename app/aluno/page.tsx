"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import YouTubePlayer from "@/app/components/YouTubePlayer";
import QueueList from "@/app/components/QueueList";
import { useQueue } from "@/app/hooks/useQueue";
import SearchMusic from "../components/SearchMusic";
import Clock from "@/app/components/RelogioeData";
import History from "@/app/components/AlunoHistory";
import AlunosGenerosRestritos from "@/app/components/AlunosGenerosRestritos";
import { onAuthStateChanged } from "firebase/auth";
import { ref, set, onDisconnect, get } from "firebase/database";
import { auth, db } from "@/app/lib/firebase";

interface GothamUser {
  nome: string;
  email: string; 
  avatar: string;
}



export default function AlunoPage() {
  const [user, setUser] = useState<GothamUser | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const queueHook = useQueue();
  const isAdmin = false;

useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (!user) return;

    const userRef = ref(db, `onlineUsers/${user.uid}`);

    // Salva dados do usuário logado
    set(userRef, {
      nome: user.displayName,
      email: user.email,
      avatar: user.photoURL,
      lastSeen: Date.now(),
    });

    // Remove usuário se desconectar
    onDisconnect(userRef).remove();
  });

  return () => unsub();
}, []);

useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const blockedSnap = await get(ref(db, `blockedUsers/${user.uid}`));
    if (blockedSnap.exists()) {
      alert("Você foi bloqueado do sistema!");
      auth.signOut(); // força logoff
      return;
    }

    // salva usuário online normalmente
    const userRef = ref(db, `onlineUsers/${user.uid}`);
    set(userRef, {
      nome: user.displayName,
      email: user.email,
      avatar: user.photoURL,
      lastSeen: Date.now(),
    });
    onDisconnect(userRef).remove();
  });

  return () => unsub();
}, []);


  useEffect(() => {
    setIsMounted(true);
    const data = localStorage.getItem("gotham_user");
    if (data) {
      setUser(JSON.parse(data));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("gotham_user");
    router.push("/login");
  };

  if (!isMounted || !user) return null;

  return (
    <main className="flex flex-col gap-2 min-h-screen p-6">
      {/* HEADER */}
      <div className="p-3 flex justify-between items-center">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={user.avatar}
            alt={user.nome}
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />
          <div>
            <h2 style={{ color: "#ff0707", fontWeight: "bold" }}>
              Olá, {user.nome}!
            </h2>
            <span style={{ color: "#ff0707", fontWeight: "bold" }}>
              Boas-vindas à Gotham Play
            </span>
          </div>
        </div>

        {/* Botão de logoff */}
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            borderRadius: 6,
            border: "2px solid #ff0707",
            background: "#000",
            color: "#ff0707",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          🔒 Sair
        </button>
      </div>

      {/* PLAYER */}
      <YouTubePlayer isAdmin={isAdmin} />

      {/* ABA DO ALUNO PARA VER GÊNEROS BLOQUEADOS */}
      <div>
        <AlunosGenerosRestritos />
      </div>

      {/* BUSCAR MÚSICA */}
      <SearchMusic />

      {/* FILA */}
      <QueueList
        queue={queueHook.queue}
        isAdmin={isAdmin}
        removeFromQueue={queueHook.removeFromQueue}
      />

      {/* HISTÓRICO */}
      <History />

      {/* RELÓGIO */}
      <Clock />

    </main>
  );
}
