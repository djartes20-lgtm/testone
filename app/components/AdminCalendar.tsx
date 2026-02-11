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
    if (dateKey === todayKey) return "#444";
    const count = events[dateKey]?.length || 0;
    if (count > 2) return "#d33";
    if (count === 2) return "#f90";
    if (count === 1) return "#ff0";
    return "#222";
  };

  return (
    <div className="container">
      <h2 className="title">📅 Calendário Admin</h2>

      {/* Navegação */}
      <div className="navigation">
        <button className="navButton" onClick={() => changeMonth(-1)}>⬅</button>
        <span className="monthYear">
          {currentDate.toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button className="navButton" onClick={() => changeMonth(1)}>➡</button>
      </div>

      {/* Grade do calendário */}
      <div className="calendarGrid">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
          <div key={day} className="dayHeader">{day}</div>
        ))}

        {daysArray.map((day, index) => {
          const dateKey = day ? `${year}-${pad(month + 1)}-${pad(day)}` : null;
          const dayEvents = dateKey ? events[dateKey] || [] : [];
          return (
            <div
              key={index}
              onClick={() => day && setSelectedDate(dateKey)}
              className="dayCell"
              style={{ background: getDayBackground(dateKey) }}
            >
              <div className="dayNumber">{day}</div>
              <div className="miniEvents">
                {dayEvents.slice(0, 2).map((e, i) => (
                  <span key={i} style={{ backgroundColor: typeColors[e.type] }} className="eventBadge">
                    {e.title}
                  </span>
                ))}
                {dayEvents.length > 2 && <span className="moreEvents">...</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de eventos */}
      {selectedDate && (
        <div className="eventModal">
          <h3>Eventos em {selectedDate}</h3>
          <div className="addEvent">
            <input
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Novo evento"
            />
            <select value={newEventType} onChange={(e) => setNewEventType(e.target.value as EventType)}>
              <option value="treino">Treino</option>
              <option value="reunião">Reunião</option>
              <option value="feriado">Feriado</option>
            </select>
            <button onClick={addEvent}>Adicionar</button>
          </div>
          <ul>
            {(events[selectedDate] || []).map((event, index) => (
              <li key={index}>
                <span style={{ backgroundColor: typeColors[event.type] }} className="eventType">{event.type}</span>
                {event.title}
                <button onClick={() => deleteEvent(selectedDate, index)}>❌</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .container {
          color: #ff0707;
          padding: 20px;
           width: 200%;
          border: 2px solid #ff0707; /* Quadrado vermelho em volta de tudo */
          border-radius: 12px;
        }

        .title {
          text-align: center;
          margin-bottom: 15px;
          font-size: 20px;
        }

        .navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .navButton {
          padding: 10px 10px;
          width: 30px;
          font-size: 10px;
          color: #ff0707;
          background: #000;
          border: 2px solid #ff0707;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 0 10px #ff0707;
        }

        .monthYear {
          font-size: 20px;
          color: #ff0707;
          font-weight: bold;
        }

        .calendarGrid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
        }

        .dayHeader {
          font-weight: bold;
          text-align: center;
        }

        .dayCell {
          height: 80px;
          border-radius: 10px;
          padding: 5px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid #333;
        }

        .dayNumber {
          font-size: 14px;
          color: #ff0707;
        }

        .miniEvents {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }

        .eventBadge {
          color: #fff;
          font-size: 10px;
          padding: 1px 4px;
          border-radius: 3px;
          white-space: nowrap;
        }

        .moreEvents {
          color: #fff;
          font-size: 10px;
        }

        .eventModal {
          margin-top: 30px;
          background: #222;
          padding: 20px;
          border-radius: 10px;
        }

        .addEvent {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        input, select {
          border-radius: 6px;
          border: 2px solid #ff0707;
          background: #000;
          color: #ff0707;
          padding: 6px;
          flex: 1;
        }

        ul {
          list-style: none;
          padding: 0;
          margin-bottom: 10px;
        }

        li {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .eventType {
          color: #fff;
          padding: 2px 6px;
          border-radius: 5px;
          font-size: 12px;
        }

        button {
          background: #000;
          color: #ff0707;
          border: 2px solid #ff0707;
          border-radius: 6px;
          padding: 8px 0;
          cursor: pointer;
          width: 100%;
        }
      `}</style>
    </div>
  );
}









