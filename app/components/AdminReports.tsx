"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/app/lib/firebase";

export default function AdminReports() {
  const [reportsCount, setReportsCount] = useState(0);

  useEffect(() => {
    const reportsRef = ref(db, "reports");

    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setReportsCount(0);
      } else {
        setReportsCount(Object.keys(data).length);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <button
      style={{
        padding: "10px 16px",
        borderRadius: 8,
        border: "2px solid #ff0707",
        cursor: "pointer",
        fontSize: 14,
        background: "#000",
        color: "#ff0707",
        fontWeight: 600,
      }}
    >
      🚨 Número de Reports: {reportsCount}
    </button>
  );
}
