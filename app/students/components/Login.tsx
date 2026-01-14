"use client";

interface User {
  nome: string;
  telefone: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

import { useState } from "react";

export default function Login({ onLogin }: LoginProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const handleLogin = () => {
    if (!nome || !telefone) return alert("Preencha tudo!");
    onLogin({ nome, telefone });
  };

  return (
    <div className="panel">
      <h2>Bem-vindo ao Gotham Play</h2>
      <input placeholder="Digite seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
      <input placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <style jsx>{`
        .panel { display:flex; flex-direction:column; align-items:center; gap:15px; padding:20px; color:#ff0707; }
        input { padding:10px; border-radius:8px; border:2px solid #ff0707; background:#000; color:#ff0707; width:250px; }
        button { padding:10px 20px; border-radius:8px; border:2px solid #ff0707; background:#000; color:#ff0707; cursor:pointer; }
      `}</style>
    </div>
  );
}
