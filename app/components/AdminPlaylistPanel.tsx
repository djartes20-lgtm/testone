"use client";

import { useState, useEffect } from "react";
import { ref, get, set } from "firebase/database";
import { db } from "@/app/lib/firebase";

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function AdminPlaylistPanel() {
  const [selectedDay, setSelectedDay] = useState("monday");
  const [playlistText, setPlaylistText] = useState("");

  useEffect(() => {
    loadPlaylist(selectedDay);
  }, [selectedDay]);

  const loadPlaylist = async (day: string) => {
    const snap = await get(ref(db, `autodjPlaylists/${day}`));
    if (snap.exists()) {
      setPlaylistText(snap.val().join("\n"));
    } else {
      setPlaylistText("");
    }
  };

  const savePlaylist = async () => {
    const ids = playlistText
      .split("\n")
      .map(id => id.trim())
      .filter(id => id.length > 0);

    await set(ref(db, `autodjPlaylists/${selectedDay}`), ids);

    alert("Playlist salva com sucesso!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Painel AutoDJ</h2>

      <select
        value={selectedDay}
        onChange={(e) => setSelectedDay(e.target.value)}
      >
        {days.map(day => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>

      <textarea
        value={playlistText}
        onChange={(e) => setPlaylistText(e.target.value)}
        rows={15}
        style={{ width: "100%", marginTop: 10 }}
        placeholder="Cole um ID por linha"
      />

      <button onClick={savePlaylist} style={{ marginTop: 10 }}>
        Salvar Playlist
      </button>
    </div>
  );
}
