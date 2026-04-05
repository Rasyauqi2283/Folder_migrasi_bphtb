"use client";

import { useState } from "react";

/**
 * Group Privilege — ruang grup seperti WA untuk BPHTB (case penting).
 * Admin bisa membuat grup, memasukkan user ke ruang chat/group.
 */
export default function AdminGroupPrivilegePage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  // Placeholder: daftar grup privilege (ruang chat/case penting)
  const privilegeGroups = [
    {
      id: "bphtb-prioritas",
      name: "BPHTB Case Prioritas",
      description: "Ruang koordinasi untuk case BPHTB prioritas tinggi (semacam grup WA resmi)",
      memberCount: 6,
      created: "2024-01-15",
    },
    {
      id: "eskalasi-ppat",
      name: "Eskalasi PPAT",
      description: "Grup untuk eskalasi dan diskusi kasus PPAT yang butuh perhatian khusus",
      memberCount: 4,
      created: "2024-02-01",
    },
    {
      id: "validasi-urgent",
      name: "Validasi Urgent",
      description: "Tim validasi untuk berkas yang perlu diselesaikan segera",
      memberCount: 5,
      created: "2024-02-10",
    },
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

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      // TODO: panggil API buat grup privilege
      setModalOpen(false);
      setNewGroupName("");
      setNewGroupDesc("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ margin: "0 0 0.25rem", color: "var(--color_font_main)" }}>
          Group Privilege
        </h1>
        <p style={{ margin: 0, color: "var(--color_font_muted)", fontSize: "0.9rem" }}>
          Ruang grup untuk case BPHTB penting — seperti grup WA resmi. Admin dapat membuat grup dan memasukkan user ke dalam ruang chat/koordinasi.
        </p>
      </div>

      <section
        style={{
          ...cardStyle,
          padding: "1rem 1.25rem",
          background: "linear-gradient(135deg, rgba(0,77,154,0.08) 0%, rgba(0,77,154,0.02) 100%)",
          borderColor: "rgba(74,144,226,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: "1.5rem" }}>💬</span>
          <div>
            <div style={{ fontWeight: 600, color: "var(--color_font_main)", marginBottom: 4 }}>
              Apa itu Group Privilege?
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--color_font_muted)", lineHeight: 1.5 }}>
              Grup privilege adalah ruang koordinasi (mirip grup WhatsApp) untuk case BPHTB yang membutuhkan perhatian khusus.
              Admin dapat membuat grup baru dan menambahkan user (PPAT, peneliti, loket, dll.) ke dalam grup tersebut agar komunikasi dan penanganan case tetap terpusat.
            </div>
          </div>
        </div>
      </section>

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
            Daftar Grup Privilege (Ruang Chat)
          </span>
          <input
            type="text"
            placeholder="Cari nama atau deskripsi grup..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              minWidth: 260,
              fontSize: "0.9rem",
            }}
          />
          <button
            type="button"
            onClick={() => setModalOpen(true)}
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
            + Buat Grup Baru
          </button>
        </div>
        <div style={{ padding: "1rem 1.25rem" }}>
          {privilegeGroups.length === 0 ? (
            <p style={{ margin: 0, color: "var(--color_font_muted)", textAlign: "center", padding: "2rem" }}>
              Tidak ada grup privilege atau tidak cocok dengan pencarian.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {privilegeGroups.map((g) => (
                <div
                  key={g.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                    background: "var(--surface_light)",
                    borderRadius: 8,
                    border: "1px solid var(--border_color)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: "var(--color_accent)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.25rem",
                      }}
                    >
                      💬
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--color_font_main)" }}>{g.name}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--color_font_muted)", marginTop: 4 }}>
                        {g.description}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color_font_dim)", marginTop: 4 }}>
                        {g.memberCount} anggota · Dibuat {g.created}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      style={{
                        padding: "6px 14px",
                        background: "var(--color_accent)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    >
                      Kelola Anggota
                    </button>
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

      {/* Modal buat grup baru */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalOpen(false)}
          role="presentation"
        >
          <div
            style={{
              background: "var(--card_bg)",
              borderRadius: 12,
              padding: "1.5rem 2rem",
              minWidth: 360,
              maxWidth: "90vw",
              boxShadow: "var(--shadow_card)",
              border: "1px solid var(--border_color)",
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <h2 id="modal-title" style={{ margin: "0 0 1rem", fontSize: "1.1rem" }}>
              Buat Grup Privilege Baru
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                Nama grup <span style={{ color: "var(--danger, #d9534f)" }}>*</span>
              </label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Contoh: BPHTB Case Prioritas"
                style={{
                  padding: "8px 12px",
                  border: "1px solid var(--border_color)",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                }}
              />
              <label style={{ fontSize: "0.9rem", fontWeight: 500 }}>Deskripsi (opsional)</label>
              <textarea
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                placeholder="Deskripsi singkat ruang grup..."
                rows={3}
                style={{
                  padding: "8px 12px",
                  border: "1px solid var(--border_color)",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  resize: "vertical",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  border: "1px solid var(--border_color)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                style={{
                  padding: "8px 16px",
                  background: newGroupName.trim() ? "var(--color_accent)" : "var(--color_font_dim)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: newGroupName.trim() ? "pointer" : "not-allowed",
                  fontSize: "0.9rem",
                }}
              >
                Buat Grup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
