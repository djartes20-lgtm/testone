"use client";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";

interface GothamUser {
  nome: string;
  email: string;
  avatar: string;
}

export default function LoginButton() {
  const router = useRouter();

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Pega as informações do usuário logado
      const user = result.user;
      const loggedUser: GothamUser = {
        nome: user.displayName || "adm",
        email: user.email || "",
        avatar: user.photoURL || "",
      };

      // Salva no localStorage para usar depois no painel
      localStorage.setItem("gotham_adm_dj", JSON.stringify(loggedUser));

      // Redireciona para a página de aluno
      router.push("/adm-dj");
    } catch (error) {
      console.error("Erro ao logar:", error);
      alert("Não foi possível entrar. Tente novamente!");
    }
  };

  return (
    <button
      onClick={login}
      style={{
        padding: "8px 16px",
        borderRadius: "6px",
        border: "2px solid #ff0707",
        background: "#000",
        color: "#ff0707",
        cursor: "pointer",
        fontSize: 16,
      }}
    >
      🔐 Entrar com Google
    </button>
  );
}
