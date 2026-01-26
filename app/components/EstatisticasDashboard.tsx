"use client";

import { useEffect, useState } from "react";
import { ref, onValue, get, set } from "firebase/database";
import { db } from "@/app/lib/firebase";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Dias da semana
const diasSemana = [
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

// Função para obter a semana atual (YYYY-Wxx)
function getWeekString(date = new Date()) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((date - onejan) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
  return `${date.getFullYear()}-W${week.toString().padStart(2, "0")}`;
}

export default function EstatisticasDashboard() {
  const [dados, setDados] = useState<{ dia: string; pedidos: number }[]>([]);

  useEffect(() => {
    const pedidosRef = ref(db, "estatisticas/pedidosSemana");
    const semanaRef = ref(db, "estatisticas/semanaAtual");

    const checkResetSemana = async () => {
      const snapshot = await get(semanaRef);
      const semanaSalva = snapshot.val();
      const semanaAtual = getWeekString();

      if (semanaSalva !== semanaAtual) {
        // Reseta todos os dias da semana para 0
        const resetDados = {
          seg: 0,
          ter: 0,
          qua: 0,
          qui: 0,
          sex: 0,
          sab: 0,
          dom: 0,
        };
        await set(pedidosRef, resetDados);
        await set(semanaRef, semanaAtual);
      }
    };

    checkResetSemana();

    const unsubscribe = onValue(pedidosRef, (snapshot) => {
      const valores = snapshot.val() || {};
      const formatado = diasSemana.map((dia) => ({
        dia: dia.label,
        pedidos: valores[dia.key] || 0,
      }));
      setDados(formatado);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      className="bg-black rounded-lg p-4 border border-red-600"
      style={{
        boxShadow: `
          0 0 10px rgba(255, 7, 7, 0.6),
          0 0 20px rgba(255, 7, 7, 0.4),
          0 0 35px rgba(255, 7, 7, 0.25)
        `,
      }}
    >
      <h2
        className="text-center font-bold text-xl mb-4"
        style={{ color: "#ff0707", textShadow: "0 0 4px #FF0707" }}
      >
        📱 Pedidos de músicas na semana 📱
      </h2>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={dados}>
          <XAxis dataKey="dia" stroke="#ff0707" tick={{ fill: "#ff0707" }} />
          <YAxis allowDecimals={false} stroke="#ff0707" tick={{ fill: "#ff0707" }} />

          <Tooltip
            contentStyle={{
              backgroundColor: "#000",
              border: "1px solid #ff0707",
              boxShadow: "0 0 12px rgba(255, 7, 7, 0.8)",
            }}
            labelStyle={{ color: "#ff0707" }}
            itemStyle={{ color: "#ff0707" }}
          />

          <Legend
            wrapperStyle={{
              color: "#ff0707",
              textShadow: "0 0 6px rgba(255,0,0,0.8)",
            }}
          />

          {/* LINHA NEON 🔥 */}
          <Line
            type="monotone"
            dataKey="pedidos"
            stroke="#ff0707"
            strokeWidth={4}
            dot={{
              r: 5,
              stroke: "#ff0707",
              strokeWidth: 2,
              fill: "#000",
            }}
            activeDot={{
              r: 9,
              fill: "#ff0707",
              stroke: "#fff",
              strokeWidth: 2,
            }}
            style={{
              filter: "drop-shadow(0 0 8px #ff0707)",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
