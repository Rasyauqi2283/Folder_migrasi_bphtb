"use client";

import { useState } from "react";
import Link from "next/link";

/** Daftar "Users Group" — grup berdasarkan role/divisi yang dikelola admin */
export default function AdminUsersGroupPage() {
  const [search, setSearch] = useState("");

  // Placeholder: nanti dari API
  const groups = [
    { id: "1", name: "PPAT Aktif", description: "PPAT/PPATS dengan status aktif", memberCount: 24 },
    { id: "2", name: "Peneliti Validasi", description: "Tim peneliti dan validasi berkas", memberCount: 8 },
    { id: "3", name: "Loket LTB/LSB", description: "Loket terima dan serah berkas", memberCount: 12 },
    { id: "4", name: "Administrator", description: "Admin sistem E-BPHTB", memberCount: 3 },
  ].filter(
    (g) =>
      !search.trim() ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase())
  );

  const cardStyle: React.CSSProperties = {
    background: "var(--card_bg)",
    borderRadius: 12,
    boxShadow: "var(--shadow_card)",
    border: "1px solid var(--border_color)",
    overflow: "hidden",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ margin: "0 0 0.25rem", color: "var(--color_font_main)" }}>
          Users Group
        </h1>
        <p style={{ margin: 0, color: "var(--color_font_muted)", fontSize: "0.9rem" }}>
          Kelola kelompok user berdasarkan role atau divisi. Lihat ringkasan anggota per grup.
        </p>
      </div>

      <section style={cardStyle}>
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border_color)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--color_accent)", fontSize: "1rem" }}>
            Daftar Users Group
          </span>
          <input
            type="text"
            placeholder="Cari nama grup atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              minWidth: 240,
              fontSize: "0.9rem",
            }}
          />
          <button
            type="button"
            style={{
              padding: "8px 16px",
              background: "var(--color_accent)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Tambah Grup
          </button>
        </div>
        <div style={{ padding: "1rem 1.25rem" }}>
          {groups.length === 0 ? (
            <p style={{ margin: 0, color: "var(--color_font_muted)", textAlign: "center", padding: "2rem" }}>
              Tidak ada grup yang cocok dengan pencarian.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {groups.map((g) => (
                <div
                  key={g.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    background: "var(--surface_light)",
                    borderRadius: 8,
                    border: "1px solid var(--border_color)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--color_font_main)" }}>{g.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color_font_muted)", marginTop: 4 }}>
                      {g.description}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color_font_dim)", marginTop: 4 }}>
                      {g.memberCount} anggota
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      href={`/admin/group-user/group-users?group=${encodeURIComponent(g.id)}`}
                      style={{
                        padding: "6px 14px",
                        background: "var(--color_accent)",
                        color: "#fff",
                        borderRadius: 8,
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    >
                      Lihat Anggota
                    </Link>
                    <button
                      type="button"
                      style={{
                        padding: "6px 14px",
                        background: "transparent",
                        border: "1px solid var(--border_color)",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
