"use client";

import { useState } from "react";

interface Props {
  isAdmin?: boolean;
}

export default function AdminCalendar({ isAdmin }: Props) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [events, setEvents] = useState<{ [key: string]: string[] }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState("");

  if (!isAdmin) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  function changeMonth(offset: number) {
    setCurrentDate(new Date(year, month + offset, 1));
  }

  function addEvent() {
    if (!selectedDate || !newEvent) return;

    setEvents((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newEvent],
    }));

    setNewEvent("");
  }

  function deleteEvent(dateKey: string, index: number) {
    setEvents((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((_, i) => i !== index),
    }));
  }

  return (
    <div style={{ background: "#111", padding: 20, borderRadius: 15 }}>
      <h2 style={{ color: "red" }}>📅 Calendário Admin</h2>

      {/* Navegação */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => changeMonth(-1)}>⬅</button>
        <span style={{ margin: "0 20px" }}>
          {currentDate.toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button onClick={() => changeMonth(1)}>➡</button>
      </div>

      {/* Grade */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 10,
        }}
      >
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
          <div key={day} style={{ fontWeight: "bold", textAlign: "center" }}>
            {day}
          </div>
        ))}

        {daysArray.map((day, index) => {
          const dateKey = `${year}-${month + 1}-${day}`;
          const hasEvents = events[dateKey]?.length > 0;

          return (
            <div
              key={index}
              onClick={() => day && setSelectedDate(dateKey)}
              style={{
                height: 80,
                background: day ? "#222" : "transparent",
                borderRadius: 10,
                padding: 5,
                cursor: day ? "pointer" : "default",
                border: hasEvents ? "2px solid red" : "1px solid #333",
              }}
            >
              <div style={{ fontSize: 14 }}>{day}</div>
            </div>
          );
        })}
      </div>

      {/* Painel de eventos */}
      {selectedDate && (
        <div style={{ marginTop: 30 }}>
          <h3>Eventos em {selectedDate}</h3>

          <input
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            placeholder="Novo evento"
            style={{ padding: 8, marginRight: 10 }}
          />

          <button onClick={addEvent}>Adicionar</button>

          <ul style={{ marginTop: 15 }}>
            {(events[selectedDate] || []).map((event, index) => (
              <li key={index}>
                {event}
                <button
                  onClick={() => deleteEvent(selectedDate, index)}
                  style={{ marginLeft: 10 }}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


