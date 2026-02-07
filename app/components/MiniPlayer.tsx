"use client";

interface MiniPlayerProps {
  isAdmin?: boolean;
  skipMusic: () => void; // Recebe a função do YouTubePlayer
}

export default function MiniPlayer({ isAdmin, skipMusic }: MiniPlayerProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: "#000",
        color: "#ff0707",
        padding: "10px 16px",
        borderRadius: 8,
        boxShadow: "0 0 10px #ff0707, 0 0 20px #ff0707",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* Aqui você pode colocar mini info da música */}
      <div>
        <strong>🎵 Música atual</strong>
        <div>Pedido por: Aluno X</div>
      </div>

      {/* Botão de pular música */}
      {isAdmin && (
        <button
          onClick={skipMusic}
          style={{
            padding: "6px 12px",
            background: "#ff0707",
            color: "#000",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ⏭️ Pular música
        </button>
      )}
    </div>
  );
}
