import { ref, update, increment } from "firebase/database";
import { db } from "@/app/lib/firebase";

export async function registrarPedidoSemana() {
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const hoje = dias[new Date().getDay()];

  try {
    await update(ref(db, "stats/pedidosSemana"), {
      [hoje]: increment(1),
    });
  } catch (err) {
    console.error("Erro ao registrar pedido da semana", err);
  }
}
