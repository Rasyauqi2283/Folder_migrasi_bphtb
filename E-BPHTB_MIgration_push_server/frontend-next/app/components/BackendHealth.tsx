"use client";

import { useEffect, useState } from "react";
import { fetchBackendConfig } from "../../lib/api";

export default function BackendHealth() {
  const [status, setStatus] = useState<"checking" | "ok" | "offline">("checking");

  useEffect(() => {
    fetchBackendConfig()
      .then((res) => setStatus(res.ok ? "ok" : "offline"))
      .catch(() => setStatus("offline"));
  }, []);

  if (status === "checking") return null;
  return (
    <span
      className="backend-health"
      title={status === "ok" ? "Backend Node terhubung" : "Backend tidak terjangkau"}
      aria-hidden
    >
      {status === "ok" ? "●" : "○"}
    </span>
  );
}
