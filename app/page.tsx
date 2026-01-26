"use client";

import { db } from "@/app/lib/firebase";
import { ref, onValue} from "firebase/database";
import { useEffect, useState } from "react";

import Splash from "@/app/components2/Splash";
import Login from "@/app/components2/Login";
import AlunoPage from "./aluno/page";


interface User {
  nome: string;
  telefone: string;
}

export default function Home() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 🔐 Recupera login salvo
  useEffect(() => {
    const saved = localStorage.getItem("gotham_user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoadingUser(false);
  }, []);
/** 
  // Sincroniza música atual
  useEffect(() => {
    const musicaRef = ref(db, "musicaAtual");
    return onValue(musicaRef, (snapshot) => {
      setMusicaAtual(snapshot.val());
    });
  }, []);
*/
  if (loadingUser) return null;

  return (
    <>
     
      {splashVisible && <Splash onFinish={() => setSplashVisible(false)} />}

      {!splashVisible && !user && (
        <Login onLogin={(u) => setUser(u)} />
      )}

      {user && (
  <AlunoPage />
)}

    </>
  );
}






