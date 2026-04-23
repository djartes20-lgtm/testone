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
import AlunosGenerosRestritos from "@/app/components/AlunosGenerosRestritos";
import { useQueue } from "@/app/hooks/useQueue";
import UserHistory from "@/app/components/UserHistory";
import ChatGotham from "@/app/components/ChatGotham";
import MotivationalMessage from "@/app/components/MotivationalMessage";

interface GothamUser {
  nome: string;
  email: string;
  avatar: string;
}

interface Notificacao {
  title: string;
  requestedBy: string;
}

export default function AlunoPage() {
  const [user, setUser] = useState<GothamUser | null>(null);
  const [notificacao, setNotificacao] = useState<Notificacao | null>(null); // ✅ Notificação
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
      set(userRef, { ...userData, lastSeen: Date.now() });
      onDisconnect(userRef).remove();

      // 🔥 Listener de bloqueio
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

  // 🔔 Notificação: escuta alertas do admin para a música atual
  useEffect(() => {
    const alertRef = ref(db, "adminAlerts");
    return onValue(alertRef, (snap) => {
      const data = snap.val();
      if (!data) return;

      const alerts = Object.values(data) as any[];
      const latest = alerts[alerts.length - 1];
      if (latest && latest.type === "PLAY") {
        setNotificacao({ title: latest.title, requestedBy: latest.requestedBy });
        setTimeout(() => setNotificacao(null), 4000); // esconde após 4s
      }
    });
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) return null;

  const alunoNome = user.nome;

  return (
    <main className="flex flex-col gap-3 p-6 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt={user.nome} width={40} height={40} className="rounded-full" />
          <div>
            <h2 className="text-red-0707 font-bold">Olá, {user.nome}</h2>
            <span className="text-red-0707 text-sm">Boas Vindas ao Brasa Play</span>
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

      {/* 🔔 Notificação de música */}
      {notificacao && (
        <div style={{
          position: "fixed",
          top: 20,
          right: 20,
          background: "#ff0707",
          color: "#000",
          padding: "10px 16px",
          borderRadius: 8,
          boxShadow: "0 0 10px #ff0707, 0 0 20px #ff0707",
          zIndex: 1000,
        }}>
          🎵 Agora tocando: {notificacao.title} (pedido de {notificacao.requestedBy})
        </div>
      )}

      {/* GÊNEROS Liberados */}
      <AlunosGenerosRestritos />

      {/* BUSCA */}
      <SearchMusic />

      {/* FILA */}
      <QueueList queue={queueHook.queue} isAdmin={false} removeFromQueue={queueHook.removeFromQueue} />

      {/* CHAT GLOBAL */}
      <ChatGotham userName={alunoNome} />

      {/* HISTÓRICO INDIVIDUAL DO ALUNO */}
      <UserHistory userName={alunoNome} />

      {/* MENSAGEM MOTIVACIONAL */}
      <div>
      <MotivationalMessage />
      </div>

      {/* RELÓGIO */}
      <Clock />
    </main>
  );
}
