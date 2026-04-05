"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

/** User per Group — pilih grup lalu lihat/kelola daftar user di grup tersebut */
export default function AdminGroupUsersPage() {
  const searchParams = useSearchParams();
  const groupIdFromUrl = searchParams.get("group") || "";
  const [selectedGroupId, setSelectedGroupId] = useState(groupIdFromUrl || "1");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (groupIdFromUrl) setSelectedGroupId(groupIdFromUrl);
  }, [groupIdFromUrl]);

  // Placeholder: daftar grup dan user per grup (nanti dari API)
  const groups = [
    { id: "1", name: "PPAT Aktif" },
    { id: "2", name: "Peneliti Validasi" },
    { id: "3", name: "Loket LTB/LSB" },
    { id: "4", name: "Administrator" },
  ];

  const membersByGroup: Record<string, { userid: string; nama: string; email: string; divisi: string }[]> = {
    "1": [
      { userid: "ppat001", nama: "Budi Santoso", email: "budi@example.com", divisi: "PPAT" },
      { userid: "ppat002", nama: "Siti Rahayu", email: "siti@example.com", divisi: "PPATS" },
    ],
    "2": [
      { userid: "pv001", nama: "Ahmad Fauzi", email: "ahmad@example.com", divisi: "Peneliti" },
    ],
    "3": [
      { userid: "ltb001", nama: "Dewi Lestari", email: "dewi@example.com", divisi: "LTB" },
    ],
    "4": [
      { userid: "admin01", nama: "Admin Sistem", email: "admin@bphtb.go.id", divisi: "Administrator" },
    ],
  };

  const members = membersByGroup[selectedGroupId] || [];
  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          !search.trim() ||
          m.nama.toLowerCase().includes(search.toLowerCase()) ||
          m.userid.toLowerCase().includes(search.toLowerCase()) ||
          (m.email && m.email.toLowerCase().includes(search.toLowerCase()))
      ),
    [members, search]
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
          Group Users
        </h1>
        <p style={{ margin: 0, color: "var(--color_font_muted)", fontSize: "0.9rem" }}>
          Lihat dan kelola user dalam tiap grup. Pilih grup lalu tambah atau hapus anggota.
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
            Pilih Grup
          </span>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              minWidth: 200,
              fontSize: "0.9rem",
            }}
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Cari user dalam grup..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              minWidth: 220,
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
            + Tambah Anggota
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface_light)", borderBottom: "1px solid var(--border_color)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>User ID</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Nama</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Email</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Divisi</th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color_font_muted)" }}>
                    Tidak ada anggota dalam grup ini atau tidak cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.userid} style={{ borderBottom: "1px solid var(--border_color)" }}>
                    <td style={{ padding: "12px 16px" }}>{m.userid}</td>
                    <td style={{ padding: "12px 16px" }}>{m.nama}</td>
                    <td style={{ padding: "12px 16px" }}>{m.email}</td>
                    <td style={{ padding: "12px 16px" }}>{m.divisi}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        type="button"
                        style={{
                          padding: "4px 10px",
                          border: "1px solid var(--danger, #d9534f)",
                          color: "var(--danger, #d9534f)",
                          background: "transparent",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        Keluarkan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
