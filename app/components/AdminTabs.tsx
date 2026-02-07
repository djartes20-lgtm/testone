"use client";

import { useEffect, useState } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "@/app/lib/firebase";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Cada aba draggable
function Tab({ tab }: { tab: { id: string; label: string } }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: tab.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px 16px",
    marginBottom: 6,
    background: "#ff0707",
    color: "#000",
    borderRadius: 6,
    cursor: "grab",
    userSelect: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {tab.label} ☰
    </div>
  );
}

export default function AdminTabs() {
  const [tabs, setTabs] = useState([
    { id: "queue", label: "Fila" },
    { id: "reports", label: "Relatórios" },
    { id: "history", label: "Histórico" },
    { id: "chat", label: "Chat" },
  ]);

  const [reorderMode, setReorderMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Carrega ordem salva no Firebase
  useEffect(() => {
    const tabsRef = ref(db, "adminTabOrder");
    onValue(tabsRef, (snap) => {
      const data = snap.val();
      if (data && Array.isArray(data)) {
        const orderedTabs = data.map((id: string) => tabs.find(t => t.id === id)).filter(Boolean);
        if (orderedTabs.length) setTabs(orderedTabs as any);
      }
    });
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tabs.findIndex((t) => t.id === active.id);
      const newIndex = tabs.findIndex((t) => t.id === over.id);
      const newTabs = arrayMove(tabs, oldIndex, newIndex);
      setTabs(newTabs);
    }
  };

  const saveOrder = async () => {
    await set(ref(db, "adminTabOrder"), tabs.map(t => t.id));
    setReorderMode(false);
    alert("✅ Nova ordem de abas salva!");
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => setReorderMode(!reorderMode)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "2px solid #ff0707",
            background: reorderMode ? "#ff1a1a" : "#000",
            color: "#ff0707",
            cursor: "pointer",
          }}
        >
          {reorderMode ? "🔒 Salvar Ordem" : "🔀 Reorganizar Abas"}
        </button>
        {reorderMode && (
          <button
            onClick={saveOrder}
            style={{
              marginLeft: 10,
              padding: "6px 12px",
              borderRadius: 6,
              border: "2px solid #ff0707",
              background: "#000",
              color: "#ff0707",
              cursor: "pointer",
            }}
          >
            💾 Salvar alterações
          </button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tabs} strategy={verticalListSortingStrategy}>
          {tabs.map((tab) => (
            <Tab key={tab.id} tab={tab} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
