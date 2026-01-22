"use client";

import { useEffect, useRef } from "react";
import { ref, get, set } from "firebase/database";
import { db } from "@/app/lib/firebase";

const playlistAuto = [
  "ZDw_x_REei0",
  "B45UZFdxZG4",
  "T-nh8gpf6ZA",
  "VauVTmE6ka4",
  "7fsHhApoaac",
  "3QMTCcTgOsk",
  "oC-GflRB0y4",
  "MPEdIqMDY_M",
  "cb-swqOkK-Q",
  "MTBmJO62zps",
  "JO_Q-baM8r4",
  "NX05KVFhg-k",
  "ZbJ9uTJLgao",
  "fSQd_-pTLHQ",
  "pugItPBIs-U",
  "YtZwtFujvd8",
  "6z4WFqBjWe4",
  "88_iSSp5kXM",
  "FOU2Ss90WwQ",
  "8miTn7zqlgI",
  "ALZHF5UqnU4",
  "lekfZs1jJH0",
  "Vu_JGw3Ht90",
  "XZsXvuhLsNE",
  "mIUKGKwBRk8",
  "Lxo7JGT-Ns8",
  "ApXoWvfEYVU",
  "fHI8X4OXluQ",
  "OPf0YbXqDm0",
  "2vMH8lITTCE",
  "STr4Da8ghh4",
  "6sICFXjd7tY",
  
];

export default function Player() {
  const autoIndex = useRef(0);

  function tocarAutomatico() {
    const id = playlistAuto[autoIndex.current];

    autoIndex.current =
      (autoIndex.current + 1) % playlistAuto.length;

    set(ref(db, "musicaAtual"), id);
  }

  async function verificarModo() {
    const filaSnap = await get(ref(db, "fila"));

    if (filaSnap.exists()) {
      tocarProxima(); // função do ADM
    } else {
      tocarAutomatico();
    }
  }

  function tocarProxima() {
    console.log("Fila ativa → ADM controla");
  }

  useEffect(() => {
    // aqui você liga com o player do YouTube
    // quando a música acabar → verificarModo()
  }, []);

  return (
    <div>
      <h1>🎶 Gotham Play</h1>
      <div id="player" />
    </div>
  );
}