// hooks/useFirebase.ts
import { useEffect, useState } from "react";
import { database } from "@/app/lib/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";

export interface Musica {
  id: string;
  titulo: string;
  key?: string;
}

export function useFirebase() {
  const [fila, setFila] = useState<Musica[]>([]);
  const [musicaAtual, setMusicaAtual] = useState<string | null>(null);
  const [votos, setVotos] = useState<number>(0);

  // Fila
  useEffect(() => {
    const filaRef = ref(database, "fila");
    const unsubscribe = onValue(filaRef, (snapshot) => {
      const data = snapshot.val();
      const novaFila: Musica[] = [];
      if (data) {
        for (const key in data) {
          novaFila.push({ ...data[key], key });
        }
      }
      setFila(novaFila);
    });

    return () => unsubscribe();
  }, []);

  // Música atual
  useEffect(() => {
    const musicaRef = ref(database, "musicaAtual");
    const unsubscribe = onValue(musicaRef, (snapshot) => {
      setMusicaAtual(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  // Votos de pular
  useEffect(() => {
    const votosRef = ref(database, "votosPular");
    const unsubscribe = onValue(votosRef, (snapshot) => {
      setVotos(snapshot.val() || 0);
    });
    return () => unsubscribe();
  }, []);

  // Função para adicionar música
  const adicionarMusica = (videoId: string) => {
    push(ref(database, "fila")).then((itemRef) => {
      set(itemRef, { id: videoId, titulo: "Carregando...", origem: "usuario" });
    });
  };

  // Função para votar pular
  const votarPular = () => {
    set(ref(database, "votosPular"), votos + 1);
  };

  // Função para tocar próxima música
  const tocarProxima = () => {
    if (fila.length === 0) {
      set(ref(database, "musicaAtual"), null);
      return;
    }

    const proxima = fila[0];
    set(ref(database, "musicaAtual"), proxima.id);

    // Remove da fila
    if (proxima.key) remove(ref(database, `fila/${proxima.key}`));

    // Reseta votos
    set(ref(database, "votosPular"), 0);
  };

  return {
    fila,
    musicaAtual,
    votos,
    adicionarMusica,
    votarPular,
    tocarProxima
  };
}
