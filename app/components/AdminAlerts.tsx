"use client";

import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "@/app/lib/firebase";

interface Alert {
  message: string;
  at: number;
}

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<Record<string, Alert>>({});

  useEffect(() => {
    const alertsRef = ref(db, "adminAlerts");

    return onValue(alertsRef, (snapshot) => {
      setAlerts(snapshot.val() || {});
    });
  }, []);

  const clearAlert = async (key: string) => {
    await remove(ref(db, `adminAlerts/${key}`));
  };

  if (Object.keys(alerts).length === 0) return null;

  return (
    <div style={container}>
      {Object.entries(alerts).map(([key, alert]) => (
        <div key={key} style={alertBox}>
          <strong>{alert.message}</strong>
          <br />
          <small>
            {new Date(alert.at).toLocaleTimeString()}
          </small>

          <button
            onClick={() => clearAlert(key)}
            style={btn}
          >
            OK
          </button>
        </div>
      ))}
    </div>
  );
}

const container = {
  position: "fixed" as const,
  top: 20,
  right: 20,
  zIndex: 9999,
};

const alertBox = {
  background: "#ff0707",
  color: "#fff",
  padding: 14,
  borderRadius: 8,
  marginBottom: 10,
  boxShadow: "0 0 15px rgba(255,0,0,0.8)",
};

const btn = {
  marginTop: 8,
  padding: "6px 10px",
  border: "none",
  cursor: "pointer",
};
