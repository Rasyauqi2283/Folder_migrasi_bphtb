"use client";

import { useCallback, useEffect, useState } from "react";

const PAGE_SIZE = 10;

interface CompleteUser {
  id: number;
  userid: string;
  divisi: string;
  nama: string;
  email: string;
  nik?: string;
  telepon?: string;
  username?: string | null;
  nip?: string | null;
  special_parafv?: string | null;
  special_field?: string | null;
  ppat_khusus?: string | null;
  pejabat_umum?: string | null;
  status_ppat?: string | null;
  verse?: string | null;
  verifiedstatus?: string;
  statuspengguna?: string;
}

const DIVISI_OPTIONS = [
  { value: "", label: "Semua Divisi" },
  { value: "Administrator", label: "Admin" },
  { value: "PPAT", label: "PPAT" },
  { value: "PPATS", label: "PPATS" },
  { value: "LTB", label: "LTB" },
  { value: "LSB", label: "LSB" },
  { value: "Peneliti", label: "Peneliti" },
  { value: "Peneliti Validasi", label: "Peneliti Validasi" },
  { value: "Wajib Pajak", label: "WP" },
  { value: "BANK", label: "BANK" },
];

const FIELD_OPTIONS = [
  { value: "all", label: "Semua Kolom" },
  { value: "userid", label: "User ID" },
  { value: "nama", label: "Nama" },
  { value: "email", label: "Email" },
  { value: "nik", label: "NIK" },
  { value: "username", label: "Username" },
  { value: "telepon", label: "Telepon" },
];

export default function AdminDataUserCompletePage() {
  const [users, setUsers] = useState<CompleteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [editOverlayOpen, setEditOverlayOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CompleteUser | null>(null);
  const [editForm, setEditForm] = useState({
    nama: "", telepon: "", username: "", nip: "",
    special_parafv: "", special_field: "", pejabat_umum: "", ppat_khusus: "", status_ppat: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ userid: string; nama: string } | null>(null);

  const loadComplete = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users/complete", { credentials: "include" });
      if (!res.ok) throw new Error("Gagal memuat data pengguna");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplete();
  }, [loadComplete]);

  const filteredUsers = users.filter((u) => {
    if (divisionFilter && u.divisi?.toLowerCase() !== divisionFilter.toLowerCase()) return false;
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const field = fieldFilter === "all" ? null : fieldFilter;
    if (field) {
      const val = (u as unknown as Record<string, unknown>)[field];
      return val != null && String(val).toLowerCase().includes(term);
    }
    return (
      (u.nama?.toLowerCase().includes(term)) ||
      (u.email?.toLowerCase().includes(term)) ||
      (u.nik?.includes(term)) ||
      (u.userid?.toLowerCase().includes(term)) ||
      (u.username?.toLowerCase().includes(term)) ||
      (u.telepon?.includes(term))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const pageUsers = filteredUsers.slice(startIdx, startIdx + PAGE_SIZE);
  const startDisplay = filteredUsers.length === 0 ? 0 : startIdx + 1;
  const endDisplay = Math.min(startIdx + PAGE_SIZE, filteredUsers.length);

  const openEdit = (u: CompleteUser) => {
    setEditingUser(u);
    setEditForm({
      nama: u.nama || "",
      telepon: u.telepon || "",
      username: u.username || "",
      nip: u.nip || "",
      special_parafv: u.special_parafv || "",
      special_field: u.special_field || "",
      pejabat_umum: u.pejabat_umum || "",
      ppat_khusus: u.ppat_khusus || "",
      status_ppat: u.status_ppat || "",
    });
    setEditOverlayOpen(true);
  };

  const closeEdit = () => {
    setEditOverlayOpen(false);
    setEditingUser(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/users/${editingUser.userid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userid: editingUser.userid,
          divisi: editingUser.divisi,
          nama: editForm.nama,
          email: editingUser.email,
          telepon: editForm.telepon,
          username: editForm.username,
          nip: editForm.nip,
          special_parafv: editForm.special_parafv,
          special_field: editForm.special_field,
          pejabat_umum: editForm.pejabat_umum,
          ppat_khusus: editForm.ppat_khusus,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      const statusRes = await fetch(`/api/users/${editingUser.userid}/status-ppat`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status_ppat: editForm.status_ppat }),
      });
      if (!statusRes.ok) console.warn("Gagal update status PPAT");
      closeEdit();
      loadComplete();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/users/${deleteConfirm.userid}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      setDeleteConfirm(null);
      loadComplete();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, divisionFilter, fieldFilter]);

  return (
    <div>
      <h1 style={{ color: "var(--color_font_main)", margin: "0 0 0.5rem" }}>
        Data User (Complete)
      </h1>
      <p style={{ color: "var(--color_font_main_muted)", margin: "0 0 1rem" }}>
        User yang sudah terverifikasi dan memiliki UserID
      </p>

      {error && (
        <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>
      )}

      {loading ? (
        <p style={{ color: "var(--color_font_main_muted)" }}>Memuat...</p>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 16,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="🔍 Cari pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--color_font_main_muted)",
                background: "var(--card_bg)",
                color: "var(--color_font_main)",
                minWidth: 220,
              }}
            />
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--color_font_main_muted)",
                background: "var(--card_bg)",
                color: "var(--color_font_main)",
              }}
            >
              {DIVISI_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--color_font_main_muted)",
                background: "var(--card_bg)",
                color: "var(--color_font_main)",
              }}
            >
              {FIELD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 8, color: "var(--color_font_main_muted)", fontSize: 14 }}>
            {filteredUsers.length === 0
              ? "Menampilkan 0 data"
              : `Menampilkan ${startDisplay}-${endDisplay} dari ${filteredUsers.length} pengguna`}
          </div>

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
                  <th style={thStyle}>User ID</th>
                  <th style={thStyle}>Divisi</th>
                  <th style={thStyle}>Nama</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pageUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: 24 }}>
                      Tidak ada data yang ditemukan
                    </td>
                  </tr>
                ) : (
                  pageUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid rgba(65,90,119,0.2)" }}>
                      <td style={tdStyle}>{u.userid}</td>
                      <td style={tdStyle}>{u.divisi}</td>
                      <td style={tdStyle}>{u.nama}</td>
                      <td style={tdStyle}>{u.email}</td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          style={{ ...btnAksi, marginRight: 8 }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ userid: u.userid, nama: u.nama })}
                          style={{ ...btnAksi, background: "#dc2626" }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12 }}>
              <button type="button" disabled={page === 1} onClick={() => setPage(1)} style={pageBtnStyle}>«</button>
              <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} style={pageBtnStyle}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    style={{ ...pageBtnStyle, ...(p === page ? { background: "var(--accent)", color: "#fff" } : {}) }}
                  >
                    {p}
                  </button>
                ))}
              <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} style={pageBtnStyle}>›</button>
              <button type="button" disabled={page === totalPages} onClick={() => setPage(totalPages)} style={pageBtnStyle}>»</button>
            </div>
          )}
        </>
      )}

      {/* Edit Overlay */}
      {editOverlayOpen && editingUser && (() => {
        const isPU = ["PPAT", "PPATS"].includes(editingUser.divisi ?? "");
        const isPenelitiValidasi = (editingUser.divisi ?? "").toLowerCase() === "peneliti validasi";
        return (
        <div
          role="dialog"
          aria-modal
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => e.target === e.currentTarget && closeEdit()}
        >
          <div
            style={{
              background: "var(--card_bg)",
              borderRadius: 12,
              padding: 24,
              width: "min(90vw, 720px)",
              maxWidth: 720,
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <h3 style={{ color: "var(--color_font_main)", margin: "0 0 4px" }}>
                Edit Pengguna: {editingUser.userid} ({isPU ? "PU" : "Karyawan"})
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Nama</label>
                <input type="text" value={editForm.nama} onChange={(e) => setEditForm((f) => ({ ...f, nama: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Telepon</label>
                <input type="text" value={editForm.telepon} onChange={(e) => setEditForm((f) => ({ ...f, telepon: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Username</label>
                <input type="text" value={editForm.username} onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))} style={inputStyle} />
              </div>
              {!isPU && (
                <div>
                  <label style={labelStyle}>NIP</label>
                  <input type="text" value={editForm.nip} onChange={(e) => setEditForm((f) => ({ ...f, nip: e.target.value }))} style={inputStyle} />
                </div>
              )}
              {!isPU && isPenelitiValidasi && (
                <div>
                  <label style={labelStyle}>Special Parafv</label>
                  <input type="text" value={editForm.special_parafv} onChange={(e) => setEditForm((f) => ({ ...f, special_parafv: e.target.value }))} style={inputStyle} />
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {isPU && (
                <>
                  <div>
                    <label style={labelStyle}>Status PPAT</label>
                    <select value={editForm.status_ppat} onChange={(e) => setEditForm((f) => ({ ...f, status_ppat: e.target.value }))} style={{ ...inputStyle, width: "100%" }}>
                      <option value="">—</option>
                      <option value="aktif">aktif</option>
                      <option value="non-aktif">non-aktif</option>
                      <option value="meninggal">meninggal</option>
                      <option value="Pindah Kerja">Pindah Kerja</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>PPAT Khusus</label>
                    <input type="text" value={editForm.ppat_khusus} onChange={(e) => setEditForm((f) => ({ ...f, ppat_khusus: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Special Field</label>
                    <input type="text" value={editForm.special_field} onChange={(e) => setEditForm((f) => ({ ...f, special_field: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Pejabat Umum</label>
                    <input type="text" value={editForm.pejabat_umum} onChange={(e) => setEditForm((f) => ({ ...f, pejabat_umum: e.target.value }))} style={inputStyle} />
                  </div>
                </>
              )}
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" onClick={closeEdit} style={btnSecondary}>Batal</button>
              <button type="button" onClick={handleSaveEdit} disabled={savingEdit} style={btnPrimary}>
                {savingEdit ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Delete Confirmation */}
      {deleteConfirm && (
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
        >
          <div
            style={{
              background: "var(--card_bg)",
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
            }}
          >
            <h3 style={{ color: "var(--color_font_main)", margin: "0 0 8px" }}>Konfirmasi Hapus</h3>
            <p style={{ color: "var(--color_font_main_muted)", margin: "0 0 16px" }}>
              Anda yakin ingin menghapus {deleteConfirm.nama} ({deleteConfirm.userid})?
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setDeleteConfirm(null)} style={btnSecondary}>Batal</button>
              <button type="button" onClick={handleDelete} style={{ ...btnPrimary, background: "#dc2626" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
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
const pageBtnStyle: React.CSSProperties = {
  minWidth: 34,
  height: 34,
  borderRadius: 8,
  border: "1px solid var(--color_font_main_muted)",
  background: "var(--card_bg)",
  color: "var(--color_font_main)",
  cursor: "pointer",
};
const btnAksi: React.CSSProperties = {
  padding: "4px 10px",
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
};
const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--color_font_main_muted)",
  background: "var(--card_bg)",
  color: "var(--color_font_main)",
  width: "100%",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 4,
  color: "var(--color_font_main)",
  fontSize: 14,
};
const btnPrimary: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  padding: "8px 16px",
  background: "transparent",
  color: "var(--color_font_main)",
  border: "1px solid var(--color_font_main_muted)",
  borderRadius: 8,
  cursor: "pointer",
};
