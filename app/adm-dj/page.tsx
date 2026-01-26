"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import DashboardPage from "./DashboardPage";

interface GothamUser {
  nome: string;
  email: string;
  avatar: string; 
}
export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<GothamUser | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const data = localStorage.getItem("gotham_adm_dj");
    if (data) {
      setUser(JSON.parse(data));
    } else {
      router.push("/loginAdm");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("gotham_adm_dj");
    router.push("/loginAdm");
  };

  if (!isMounted || !user) return null;

  return (
    <div>
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

      {/* Dashboard */}
      <DashboardPage />
    </div>
  );
}
