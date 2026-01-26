import { ref, get, set } from "firebase/database";
import { db } from "@/app/lib/firebase";

export async function verificarResetSemana() {
  const hoje = new Date();

  // pega o número da semana
  const primeiroDiaAno = new Date(hoje.getFullYear(), 0, 1);
  const dias = Math.floor(
    (hoje.getTime() - primeiroDiaAno.getTime()) / (1000 * 60 * 60 * 24)
  );
  const semanaAtual = Math.ceil((dias + primeiroDiaAno.getDay() + 1) / 7);

  const refSemana = ref(db, "estatisticas/semanaAtual");
  const snapshot = await get(refSemana);

  const semanaSalva = snapshot.exists() ? snapshot.val() : null;

  // 🔥 se mudou a semana → reset
  if (semanaSalva !== semanaAtual) {
    await set(ref(db, "estatisticas/pedidosSemana"), {
      seg: 0,
      ter: 0,
      qua: 0,
      qui: 0,
      sex: 0,
      sab: 0,
      dom: 0,
    });

    await set(refSemana, semanaAtual);
    console.log("🔥 Semana resetada automaticamente");
  }
}
