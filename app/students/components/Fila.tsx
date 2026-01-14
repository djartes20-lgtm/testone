"use client";

interface FilaProps {
  fila: { id: string; titulo: string }[];
}

export default function Fila({ fila }: FilaProps) {
  return (
    <div className="card p-3">
      <h2>Fila de Espera</h2>
      <ul>
        {fila.map((m) => (
          <li key={m.id}>🎵 {m.titulo}</li>
        ))}
      </ul>
    </div>
  );
}
