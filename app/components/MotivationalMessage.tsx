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
    "Treine com foco e determinação! 💥",
    "Transforme esforço em resultados! 🔑",
    "O único limite é aquele que você impõe a si mesmo! 🧠",
    "A persistência hoje é a força de amanhã! 🚀",
    "Mantenha-se firme, o progresso vem com consistência! ⏱️",
    "Hoje você se torna melhor do que ontem! 🌄",
    "Não espere motivação, crie disciplina! 🔧",
    "A jornada é longa, mas a vitória é certa! 🛤️",
    "Desafie-se todos os dias, seus resultados agradecerão! ✨",
  "Acredite no processo, grandes coisas levam tempo! ⏳",
  "Você é capaz de conquistar tudo o que deseja! 💎",
  "Treinar é investir em você mesmo! 💰",
  "A determinação é a chave do sucesso! 🗝️",
  "Faça hoje o que outros não fazem para conquistar amanhã! 🌞",
  "Não pare até se orgulhar! 🏅",
  "Supere seus limites, eles são apenas desafios! 🏔️",
  "O esforço de hoje é a força de amanhã! 💪",
  "Cada gota de suor constrói resultados! 💦",
  "Persistir é vencer! 🥇",
  "A disciplina é o que transforma sonhos em realidade! 🌠",
  "Treine duro, permaneça humilde! 🙏",
  "O caminho pode ser difícil, mas a vitória é doce! 🍯",
  "Não desanime, grandes conquistas exigem paciência! 🕰️",
  "A cada dia, você fica mais forte! 🏋️",
  "Faça do esforço um hábito! 🔄",
  "O seu corpo é reflexo da sua dedicação! 🔥",
  "Não tenha medo de se desafiar! ⚡",
  "A constância vence o talento quando o talento não se esforça! 🏆",
  "Seja a melhor versão de você hoje! 🌟",
  "Treinar é transformar o impossível em possível! 🚀",
  "Acredite, você é capaz de superar qualquer obstáculo! 🏔️",
  "Cada repetição te aproxima do objetivo! 🔁",
  "O suor de hoje é a vitória de amanhã! 💦",
  "Não espere por motivação, crie resultados! 🛠️",
  "Treinar é um ato de amor próprio! ❤️",
  "O sucesso é construído com disciplina! 🏗️",
  "Levante-se, treine e brilhe! ✨",
  "O esforço não te trai! 💯",
  "Faça do treino um estilo de vida! 🔄",
  "Não compare sua jornada com a dos outros! 🛤️",
  "O progresso é feito de pequenos passos! 🐾",
  "Hoje você planta, amanhã você colhe! 🌱",
  "Transforme a dor em força! 💥",
  "Não desista, a vitória está a um passo além! 🥇",
  "Cada dia é uma oportunidade para melhorar! 🌞",
  "Você é capaz de ir além do que imagina! 🚀"
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
