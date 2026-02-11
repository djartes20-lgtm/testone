"use client";

import { useState } from "react";

interface Props {
  isAdmin?: boolean;
}

export default function AdminCalendar({ isAdmin }: Props) {
  const [events, setEvents] = useState<string[]>([]);
  const [newEvent, setNewEvent] = useState("");

  function addEvent() {
    if (!newEvent) return;
    setEvents([...events, newEvent]);
    setNewEvent("");
  }

  function deleteEvent(index: number) {
    const updated = events.filter((_, i) => i !== index);
    setEvents(updated);
  }

  if (!isAdmin) return null;

  return (
    <div style={{ padding: 20, background: "#111", borderRadius: 10 }}>
      <h2>📅 Calendário Admin</h2>

      <input
        value={newEvent}
        onChange={(e) => setNewEvent(e.target.value)}
        placeholder="Novo evento"
        style={{ padding: 8, marginRight: 10 }}
      />

      <button onClick={addEvent}>Adicionar</button>

      <ul style={{ marginTop: 20 }}>
        {events.map((event, index) => (
          <li key={index} style={{ marginBottom: 10 }}>
            {event}
            <button
              onClick={() => deleteEvent(index)}
              style={{ marginLeft: 10 }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

