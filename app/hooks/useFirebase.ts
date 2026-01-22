// hooks/useFirebase.ts
import { useEffect, useState } from "react";
import { db, auth } from "@/app/lib/firebase";
import {
  ref,
  onValue,
  push,
  set,
  remove,
  runTransaction,
  update
} from "firebase/database";

export interface Musica {
  youtubeId: string;
  titulo?: string;
  key?: string;
  requestedBy?: string;
}

export function useFirebase(isAdmin = false) {
  const [fila, setFila] = useState<Musica[]>([]);
  const [musicaAtual, setMusicaAtual] = useState<string | null>(null);
  const [votos, setVotos] = useState<number>(0);

  const userId = auth.currentUser?.uid;

  /* ==========================
     FILA DE MÚSICAS
  ========================== */
  useEffect(() => {
    const filaRef = ref(db, "player/fila");

    const unsub = onValue(filaRef, (snapshot) => {
      const data = snapshot.val();
      const novaFila: Musica[] = [];

      if (data) {
        for (const key in data) {
          novaFila.push({
            ...data[key],
            key
          });
        }
      }

      setFila(novaFila);
    });

    return () => unsub();
  }, []);

  /* ==========================
     MÚSICA ATUAL
  ========================== */
  useEffect(() => {
    const musicaRef = ref(db, "player/estado/musicaAtual");

    const unsub = onValue(musicaRef, (snapshot) => {
      setMusicaAtual(snapshot.val()?.youtubeId || null);
    });

    return () => unsub();
  }, []);

  /* ==========================
     VOTOS PARA PULAR
  ========================== */
  useEffect(() => {
    const votosRef = ref(db, "player/votosPular/count");

    const unsub = onValue(votosRef, (snapshot) => {
      setVotos(snapshot.val() || 0);
    });

    return () => unsub();
  }, []);

  /* ==========================
     ADICIONAR MÚSICA (USUÁRIO)
  ========================== */
  const adicionarMusica = (youtubeId: string) => {
    if (!userId) return;

    push(ref(db, "player/fila"), {
      youtubeId,
      requestedBy: userId,
      requestedAt: Date.now()
    });
  };

  /* ==========================
     VOTAR PARA PULAR (USUÁRIO)
  ========================== */
  const votarPular = () => {
    if (!userId) return;

    const votosRef = ref(db, "player/votosPular");

    runTransaction(votosRef, (data) => {
      if (!data) {
        return {
          count: 1,
          users: { [userId]: true }
        };
      }

      if (data.users?.[userId]) {
        return data; // já votou
      }

      return {
        count: data.count + 1,
        users: {
          ...data.users,
          [userId]: true
        }
      };
    });
  };

  /* ==========================
     ADMIN → PULAR MÚSICA
  ========================== */
  const adminPularMusica = () => {
    if (!isAdmin || !userId) return;

    update(ref(db, "player/controleADM"), {
      pular: true,
      disparadoPor: userId,
      timestamp: Date.now()
    });
  };

  /* ==========================
     ADMIN → REMOVER DA FILA
  ========================== */
  const removerDaFila = (key: string) => {
    if (!isAdmin) return;

    remove(ref(db, `player/fila/${key}`));
  };

  return {
    fila,
    musicaAtual,
    votos,
    adicionarMusica,
    votarPular,
    adminPularMusica,
    removerDaFila
  };
}
