"use client";

import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Props {
  isAdmin?: boolean;
}

interface EventData {
  [date: string]: string[];
}

export default function AdminCalendar({ isAdmin }: Props) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [events, setEvents] = useState<EventData>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState("");

  if (!isAdmin) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const pad = (n: number) => n.toString().padStart(2, "0");

  const daysArray = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const todayKey = `${year}-${pad(month + 1)}-${pad(today.getDate())}`;

  // Carrega eventos do Firebase
  useEffect(() => {
    const eventsRef = ref(db, "calendarEvents");
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setEvents(data);
    });
  }, []);

  // Funções
  function changeMonth(offset: number) {
    setCurrentDate(new Date(year, month + offset, 1));
  }

  function addEvent() {
    if (!selectedDate || !newEvent) return;

    const updatedEvents = {
      ...events,
      [selectedDate]: [...(events[selectedDate] || []), newEvent],
    };

    setEvents(updatedEvents);
    setNewEvent("");

    // Salvar no Firebase
    set(ref(db, "calendarEvents"), updatedEvents);
  }

  function deleteEvent(dateKey: string, index: number) {
    const updatedEvents = {
      ...events,
      [dateKey]: events[dateKey].filter((_, i) => i !== index),
    };
    setEvents(updatedEvents);

    // Salvar no Firebase
    set(ref(db, "calendarEvents"), updatedEvents);
  }

  const getDayColor = (dateKey: string | null) => {
    if (!dateKey) return "#222";
    if (dateKey === todayKey) return "#444"; // hoje
    const count = events[dateKey]?.length || 0;
    if (count > 2) return "#d33"; // vermelho forte
    if (count === 2) return "#f90"; // laranja
    if (count === 1) return "#ff0"; // amarelo
    return "#222"; // default
  };

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

      {/* Grade do calendário */}
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
          const dateKey = day ? `${year}-${pad(month + 1)}-${pad(day)}` : null;
          const hasEvents = dateKey && events[dateKey]?.length > 0;

          return (
            <div
              key={index}
              onClick={() => day && setSelectedDate(dateKey)}
              style={{
                height: 80,
                background: getDayColor(dateKey),
                borderRadius: 10,
                padding: 5,
                cursor: day ? "pointer" : "default",
                border: hasEvents ? "2px solid red" : "1px solid #333",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 14 }}>{day}</div>
              {/* Mini preview de eventos */}
              {hasEvents && (
                <div style={{ fontSize: 10, color: "#fff" }}>
                  {events[dateKey!].slice(0, 2).join(", ")}
                  {events[dateKey!].length > 2 && " ..."}
                </div>
              )}
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



