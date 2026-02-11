"use client";

import { useState, useEffect } from "react";

export default function MotivationalMessage() {
  const messages = [
    "Hoje é dia de superar seus limites! 💪",
    "Não desista, cada treino conta! 🏋️‍♂️",
    "Você está mais perto do seu objetivo! 🔥",
    "A disciplina de hoje é a vitória de amanhã! 🏆",
    "Treine com foco e determinação! ⚡",
    "Pequenos passos todos os dias levam a grandes conquistas! 🌟",
    "Por que caimos?, Pra um dia aprender a Levantar! 💪",
    "deus limpara dos seus olhos todas a suas Lagrimas! 🌟",
  ];

  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Escolhe uma mensagem aleatória ao carregar
    const randomIndex = Math.floor(Math.random() * messages.length);
    setMessage(messages[randomIndex]);
  }, []);

  return (
    <div className="motivationalMessage">
      {message}
      <style jsx>{`
        .motivationalMessage {
          background: #222;
          color: #ff0707;
          padding: 12px 20px;
          border-radius: 10px;
          text-align: center;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 15px;
          box-shadow: 0 0 10px #ff0707;
        }
      `}</style>
    </div>
  );
}
