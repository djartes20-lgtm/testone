"use client";

import { useState } from "react";
import LoginButton from "../components/LoginButton";

interface User {
  nome: string;
  telefone: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const handleLogin = () => {
    if (!nome || !telefone) {
      alert("Preencha nome e telefone!");
      return;
    }

    const user = { nome, telefone };

    // 🔐 salva login
    localStorage.setItem("gotham_user", JSON.stringify(user));

    // libera acesso
    onLogin(user);
  };

  return (
    <div className="panel">
      <h2>Bem-vindo ao Gotham Play</h2>
      <LoginButton/>

      <style jsx>{`
        .panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 20px;
          color: #ff0707;
        }
        input {
          padding: 10px;
          border-radius: 8px;
          border: 2px solid #ff0707;
          background: #000;
          color: #ff0707;
          width: 250px;
        }
        button {
          padding: 10px 20px;
          border-radius: 8px;
          border: 2px solid #ff0707;
          background: #000;
          color: #ff0707;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
