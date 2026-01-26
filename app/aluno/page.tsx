"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, set, onDisconnect, onValue } from "firebase/database";
import { auth, db } from "@/app/lib/firebase";

import YouTubePlayer from "@/app/components/YouTubePlayer";
import QueueList from "@/app/components/QueueList";
import SearchMusic from "@/app/components/SearchMusic";
import Clock from "@/app/components/RelogioeData";
import History from "@/app/components/AlunoHistory";
import AlunosGenerosRestritos from "@/app/components/AlunosGenerosRestritos";
import { useQueue } from "@/app/hooks/useQueue";

interface GothamUser {
  nome: string;
  email: string;
  avatar: string;
}

export default function AlunoPage() {
  const [user, setUser] = useState<GothamUser | null>(null);
  const router = useRouter();
  const queueHook = useQueue();

  useEffect(() => {
    let unsubscribeBlocked: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login");
        return;
      }

      const userData: GothamUser = {
        nome: firebaseUser.displayName || "Aluno",
        email: firebaseUser.email || "",
        avatar: firebaseUser.photoURL || "",
      };

      setUser(userData);

      // 🔹 Marca usuário como online
      const userRef = ref(db, `onlineUsers/${firebaseUser.uid}`);
      set(userRef, {
        ...userData,
        lastSeen: Date.now(),
      });
      onDisconnect(userRef).remove();

      // 🔥 LISTENER EM TEMPO REAL DE BLOQUEIO
      const blockedRef = ref(db, `blockedUsers/${firebaseUser.uid}`);
      unsubscribeBlocked = onValue(blockedRef, async (snap) => {
        if (snap.exists()) {
          alert("🚫 Você foi bloqueado pelo administrador!");
          await signOut(auth);
          router.push("/login");
        }
      });
    });

    return () => {
      unsubAuth();
      if (unsubscribeBlocked) unsubscribeBlocked();
    };
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) return null;

  return (
    <main className="flex flex-col gap-3 p-6 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.nome}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h2 className="text-red-500 font-bold">
              Olá, {user.nome}
            </h2>
            <span className="text-red-500 text-sm">
              Gotham Play
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="border border-red-500 text-red-500 px-4 py-1 rounded hover:bg-red-500 hover:text-black transition"
        >
          🔒 Sair
        </button>
      </div>

      {/* PLAYER */}
      <YouTubePlayer isAdmin={false} />

      {/* GÊNEROS BLOQUEADOS */}
      <AlunosGenerosRestritos />

      {/* BUSCA */}
      <SearchMusic />

      {/* FILA */}
      <QueueList
        queue={queueHook.queue}
        isAdmin={false}
        removeFromQueue={queueHook.removeFromQueue}
      />

      {/* HISTÓRICO */}
      <History />

      {/* RELÓGIO */}
      <Clock />
    </main>
  );
}
