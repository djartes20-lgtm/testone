"use client";

import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Props {
  isAdmin?: boolean;
}

type EventType = "treino" | "reunião" | "feriado";

interface EventItem {
  title: string;
  type: EventType;
}

interface EventData {
  [date: string]: EventItem[];
}

const typeColors: Record<EventType, string> = {
  treino: "#4caf50",
  reunião: "#2196f3",
  feriado: "#f44336",
};

export default function AdminCalendar({ isAdmin }: Props) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [events, setEvents] = useState<EventData>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState<EventType>("treino");

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

  function changeMonth(offset: number) {
    setCurrentDate(new Date(year, month + offset, 1));
  }

  function addEvent() {
    if (!selectedDate || !newEventTitle) return;

    const updatedEvents = {
      ...events,
      [selectedDate]: [
        ...(events[selectedDate] || []),
        { title: newEventTitle, type: newEventType },
      ],
    };

    setEvents(updatedEvents);
    setNewEventTitle("");
    setNewEventType("treino");

    set(ref(db, "calendarEvents"), updatedEvents);
  }

  function deleteEvent(dateKey: string, index: number) {
    const updatedEvents = {
      ...events,
      [dateKey]: events[dateKey].filter((_, i) => i !== index),
    };
    setEvents(updatedEvents);
    set(ref(db, "calendarEvents"), updatedEvents);
  }

  const getDayBackground = (dateKey: string | null) => {
    if (!dateKey) return "#222";
    if (dateKey === todayKey) return "#444"; // hoje
    const count = events[dateKey]?.length || 0;
    if (count > 2) return "#d33";
    if (count === 2) return "#f90";
    if (count === 1) return "#ff0";
    return "#222";
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
          const dayEvents = dateKey ? events[dateKey] || [] : [];

          return (
            <div
              key={index}
              onClick={() => day && setSelectedDate(dateKey)}
              style={{
                height: 80,
                background: getDayBackground(dateKey),
                borderRadius: 10,
                padding: 5,
                cursor: day ? "pointer" : "default",
                border: dayEvents.length ? "2px solid red" : "1px solid #333",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 14 }}>{day}</div>
              {/* Mini preview de eventos com cores por tipo */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {dayEvents.slice(0, 2).map((e, i) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: typeColors[e.type],
                      color: "#fff",
                      fontSize: 10,
                      padding: "1px 4px",
                      borderRadius: 3,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {e.title}
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span style={{ color: "#fff", fontSize: 10 }}>...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de eventos */}
      {selectedDate && (
        <div style={{ marginTop: 30, background: "#222", padding: 20, borderRadius: 10 }}>
          <h3>Eventos em {selectedDate}</h3>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Novo evento"
              style={{ padding: 8, flex: 1 }}
            />
            <select
              value={newEventType}
              onChange={(e) => setNewEventType(e.target.value as EventType)}
              style={{ padding: 8 }}
            >
              <option value="treino">Treino</option>
              <option value="reunião">Reunião</option>
              <option value="feriado">Feriado</option>
            </select>
            <button onClick={addEvent}>Adicionar</button>
          </div>

          <ul style={{ marginTop: 15 }}>
            {(events[selectedDate] || []).map((event, index) => (
              <li key={index} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    backgroundColor: typeColors[event.type],
                    color: "#fff",
                    padding: "2px 6px",
                    borderRadius: 5,
                    fontSize: 12,
                  }}
                >
                  {event.type}
                </span>
                {event.title}
                <button
                  onClick={() => deleteEvent(selectedDate, index)}
                  style={{ marginLeft: "auto" }}
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




