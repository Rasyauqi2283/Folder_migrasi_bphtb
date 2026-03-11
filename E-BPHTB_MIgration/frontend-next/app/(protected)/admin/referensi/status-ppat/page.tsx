"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PpatRow {
  userid?: string;
  nama?: string;
  divisi?: string;
  status_ppat?: string;
}

export default function AdminStatusPpatPage() {
  const [list, setList] = useState<PpatRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/notification-warehouse/ppat-users?page=1&limit=50", {
      credentials: "include",
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          setList(data.data);
        } else if (Array.isArray(data)) {
          setList(data);
        } else {
          setList([]);
        }
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ color: "#fff", margin: "0 0 0.5rem" }}>Status PPAT</h1>
      <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 1rem" }}>
        Daftar PPAT/PPATS dan status
      </p>
      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.7)" }}>Memuat...</p>
      ) : list.length > 0 ? (
        <div
          style={{
            overflowX: "auto",
            background: "#1b263b",
            borderRadius: 8,
            border: "1px solid rgba(65,90,119,0.3)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(65,90,119,0.5)" }}>
                <th style={thStyle}>UserID</th>
                <th style={thStyle}>Nama</th>
                <th style={thStyle}>Divisi</th>
                <th style={thStyle}>Status PPAT</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u, i) => (
                <tr
                  key={u.userid ?? i}
                  style={{ borderBottom: "1px solid rgba(65,90,119,0.2)" }}
                >
                  <td style={tdStyle}>{u.userid ?? "—"}</td>
                  <td style={tdStyle}>{u.nama ?? "—"}</td>
                  <td style={tdStyle}>{u.divisi ?? "—"}</td>
                  <td style={tdStyle}>{u.status_ppat ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: "rgba(255,255,255,0.7)" }}>
          Tidak ada data atau API belum tersedia. Gunakan versi legacy untuk fitur lengkap.
        </p>
      )}
      <p style={{ marginTop: "1rem" }}>
        <Link
          href="/html_folder/Admin/referensi_user/admin-status-ppat.html"
          style={{ color: "#60a5fa", textDecoration: "none" }}
        >
          Buka versi legacy (fitur lengkap) →
        </Link>
      </p>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  color: "rgba(255,255,255,0.9)",
  fontWeight: 600,
};
const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  color: "rgba(255,255,255,0.85)",
};
