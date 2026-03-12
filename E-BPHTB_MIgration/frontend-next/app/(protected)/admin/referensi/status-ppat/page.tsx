"use client";

import { useCallback, useEffect, useState } from "react";

interface PpatRow {
  id?: number;
  userid?: string;
  nama?: string;
  divisi?: string;
  status_ppat?: string;
  status?: string;
  special_field?: string;
  ppat_khusus?: string;
  email?: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "aktif", label: "Aktif" },
  { value: "non-aktif", label: "Nonaktif" },
  { value: "pindah-kerja", label: "Pindah Kerja" },
  { value: "meninggal", label: "Meninggal" },
  { value: "suspend", label: "Suspend" },
];

/** Gudang Notifikasi: 3 sesi — Sesi 1: PPAT→LTB, Sesi 2: LTB→PV, Sesi 3: PV→LSB */
const WAREHOUSE_TABS = [
  { id: "ppat_ltb", label: "PPAT → LTB" },
  { id: "ltb_pv", label: "LTB → PV" },
  { id: "pv_lsb", label: "PV → LSB" },
];

/** Map tab id ke path API notification-warehouse (proxy ke Node). Backend: ppat-ltb, peneliti-lsb, lsb-ppat. */
function notifApiPath(cat: string): string {
  const base = "/api/admin/notification-warehouse";
  if (cat === "ppat_ltb") return `${base}/ppat-ltb`;
  if (cat === "ltb_pv") return `${base}/peneliti-lsb`;
  if (cat === "pv_lsb") return `${base}/lsb-ppat`;
  return `${base}/ppat-ltb`;
}

interface NotifRow {
  no_registrasi?: string;
  nobooking?: string;
  userid?: string;
  special_field?: string;
  ppat_khusus?: string;
  noppbb?: string;
  jenis_wajib_pajak?: string;
  updated_at?: string;
  updated?: string;
  status_peneliti?: string;
}

export default function AdminStatusPpatPage() {
  const [list, setList] = useState<PpatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [warehouseTab, setWarehouseTab] = useState("ppat_ltb");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<PpatRow | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const [notifList, setNotifList] = useState<NotifRow[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifPage, setNotifPage] = useState(1);
  const [notifTotal, setNotifTotal] = useState(0);
  const [notifTotalPages, setNotifTotalPages] = useState(1);
  const [notifSearch, setNotifSearch] = useState("");
  const [notifSearchTrigger, setNotifSearchTrigger] = useState(0);
  const notifLimit = 16;

  const loadPpatUsers = useCallback(async (overridePage?: number) => {
    setLoading(true);
    setError(null);
    const p = overridePage ?? page;
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);

      const url = `/api/admin/notification-warehouse/ppat-users?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Gagal memuat data");
      }
      if (data?.success && Array.isArray(data?.data)) {
        setList(data.data);
        const pag = data.pagination || {};
        setTotalPages(pag.totalPages ?? 1);
        setTotal(pag.total ?? data.data.length);
      } else {
        setList([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(notifPage));
      params.set("limit", String(notifLimit));
      if (notifSearch.trim()) params.set("search", notifSearch.trim());
      const url = `${notifApiPath(warehouseTab)}?${params}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data?.success && Array.isArray(data?.data)) {
        setNotifList(data.data);
        const pag = data.pagination || {};
        setNotifTotal(pag.total ?? 0);
        setNotifTotalPages(pag.totalPages ?? 1);
      } else {
        setNotifList([]);
        setNotifTotal(0);
        setNotifTotalPages(1);
      }
    } catch {
      setNotifList([]);
      setNotifTotal(0);
      setNotifTotalPages(1);
    } finally {
      setNotifLoading(false);
    }
  }, [warehouseTab, notifPage, notifSearch, notifSearchTrigger]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    loadPpatUsers();
  }, [page, statusFilter]);

  const onSearch = () => {
    setPage(1);
    loadPpatUsers(1);
  };

  const openEdit = async (u: PpatRow) => {
    setEditUser(u);
    setEditStatus(u.status_ppat || "aktif");
    setModalOpen(true);
  };

  const closeEdit = () => {
    setModalOpen(false);
    setEditUser(null);
  };

  const handleSaveStatus = async () => {
    if (!editUser?.userid) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${editUser.userid}/status-ppat`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status_ppat: editStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Gagal menyimpan");
      }
      closeEdit();
      loadPpatUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ margin: "0 0 0.25rem", color: "var(--color_font_main)" }}>
          Status PPAT
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--color_font_main_muted)",
            fontSize: "0.9rem",
          }}
        >
          Gudang notifikasi dan status PPAT/PPATS/Notaris
        </p>
      </div>

      {/* Gudang Notifikasi - card abu-abu agar kontras dengan tab & teks */}
      <section
        style={{
          background: "var(--card_bg_grey)",
          borderRadius: 12,
          boxShadow: "var(--shadow_card)",
          overflow: "hidden",
          border: "1px solid var(--border_color)",
        }}
      >
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
          <span
            style={{
              fontWeight: 600,
              color: "var(--color_font_main)",
              fontSize: "1rem",
            }}
          >
            Gudang Notifikasi
          </span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {WAREHOUSE_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setWarehouseTab(t.id);
                  setNotifPage(1);
                }}
                style={{
                  padding: "6px 14px",
                  border:
                    warehouseTab === t.id
                      ? "2px solid var(--color_accent)"
                      : "1px solid var(--border_color)",
                  background:
                    warehouseTab === t.id ? "var(--color_accent)" : "#fff",
                  color: warehouseTab === t.id ? "#fff" : "var(--color_font_main)",
                  borderRadius: 999,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {t.label}
              </button>
            ))}
            <input
              type="text"
              placeholder="Cari NoBooking / UserID / WP..."
              value={notifSearch}
              onChange={(e) => setNotifSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setNotifPage(1), setNotifSearchTrigger((t) => t + 1))}
              style={{
                padding: "8px 12px",
                border: "1px solid var(--border_color)",
                borderRadius: 999,
                minWidth: 220,
                fontSize: "0.9rem",
                background: "#fff",
                color: "var(--color_font_main)",
              }}
            />
            <button
              type="button"
              onClick={() => { setNotifPage(1); setNotifSearchTrigger((t) => t + 1); }}
              style={{
                padding: "6px 12px",
                background: "var(--color_accent)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Cari
            </button>
          </div>
        </div>
        <div style={{ overflowX: "auto", padding: "0 1rem 1rem" }}>
          {notifLoading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--color_font_main_muted)" }}>
              Memuat notifikasi...
            </div>
          ) : notifList.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--color_font_main_muted)" }}>
              Tidak ada notifikasi pada kategori ini.
            </div>
          ) : (
            <>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                  minWidth: 880,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border_color)" }}>
                    <th style={thStyle}>No. Registrasi</th>
                    <th style={thStyle}>NoBooking</th>
                    <th style={thStyle}>UserID</th>
                    <th style={thStyle}>Special Field</th>
                    <th style={thStyle}>PPAT Khusus</th>
                    <th style={thStyle}>NOPPBB</th>
                    <th style={thStyle}>Jenis WP</th>
                    {warehouseTab === "ltb_pv" && <th style={thStyle}>Status Peneliti</th>}
                    <th style={thStyle}>Updated</th>
                    <th style={thStyle}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {notifList.map((row, i) => (
                    <tr key={row.no_registrasi ?? row.nobooking ?? i} style={{ borderBottom: "1px solid var(--border_color)" }}>
                      <td style={tdStyle}>{row.no_registrasi ?? "—"}</td>
                      <td style={tdStyle}>{row.nobooking ?? "—"}</td>
                      <td style={tdStyle}>{row.userid ?? "—"}</td>
                      <td style={tdStyle}>{row.special_field ?? "—"}</td>
                      <td style={tdStyle}>{row.ppat_khusus ?? "—"}</td>
                      <td style={tdStyle}>{row.noppbb ?? "—"}</td>
                      <td style={tdStyle}>{row.jenis_wajib_pajak ?? "—"}</td>
                      {warehouseTab === "ltb_pv" && <td style={tdStyle}>{(row as NotifRow & { status_peneliti?: string }).status_peneliti ?? "—"}</td>}
                      <td style={tdStyle}>{row.updated ?? row.updated_at ?? "—"}</td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          style={{
                            padding: "4px 10px",
                            background: "var(--color_accent)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                        >
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {notifTotalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border_color)" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--color_font_main_muted)" }}>
                    Menampilkan {(notifPage - 1) * notifLimit + 1}–{Math.min(notifPage * notifLimit, notifTotal)} dari {notifTotal}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" disabled={notifPage <= 1} onClick={() => setNotifPage((p) => Math.max(1, p - 1))} style={pageBtnStyle}>Prev</button>
                    <span style={{ padding: "6px 12px" }}>{notifPage} / {notifTotalPages}</span>
                    <button type="button" disabled={notifPage >= notifTotalPages} onClick={() => setNotifPage((p) => Math.min(notifTotalPages, p + 1))} style={pageBtnStyle}>Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Status PPAT Panel - card off-white agar beda dari Gudang Notifikasi */}
      <section
        style={{
          background: "var(--card_bg)",
          borderRadius: 12,
          boxShadow: "var(--shadow_card)",
          overflow: "hidden",
          border: "1px solid var(--border_color)",
        }}
      >
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
          <span
            style={{
              fontWeight: 600,
              color: "var(--color_font_main)",
              fontSize: "1rem",
            }}
          >
            Status PPAT/PPATS
          </span>
          <input
            type="text"
            placeholder="Cari nama, userid, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              minWidth: 220,
              fontSize: "0.9rem",
              background: "var(--card_bg_alt)",
              color: "var(--color_font_main)",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              fontSize: "0.9rem",
              background: "var(--card_bg_alt)",
              color: "var(--color_font_main)",
            }}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onSearch}
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
            Cari
          </button>
        </div>

        {loading ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--color_font_main_muted)",
            }}
          >
            Memuat...
          </div>
        ) : error ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--danger, #d9534f)",
            }}
          >
            {error}
          </div>
        ) : list.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--color_font_main_muted)",
            }}
          >
            Tidak ada data PPAT/PPATS
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border_color)" }}>
                    <th style={thStyle}>UserID</th>
                    <th style={thStyle}>Nama</th>
                    <th style={thStyle}>Divisi</th>
                    <th style={thStyle}>Status PPAT</th>
                    <th style={thStyle}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((u, i) => (
                    <tr
                      key={u.userid ?? i}
                      style={{ borderBottom: "1px solid var(--border_color)" }}
                    >
                      <td style={tdStyle}>{u.userid ?? "—"}</td>
                      <td style={tdStyle}>{u.nama ?? "—"}</td>
                      <td style={tdStyle}>{u.divisi ?? "—"}</td>
                      <td style={tdStyle}>{u.status ?? u.status_ppat ?? "—"}</td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          style={{
                            padding: "4px 12px",
                            background: "var(--color_accent)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderTop: "1px solid var(--border_color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <span style={{ color: "var(--color_font_main_muted)", fontSize: "0.9rem" }}>
                  Menampilkan {startIdx}–{endIdx} dari {total}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={pageBtnStyle}
                  >
                    Prev
                  </button>
                  <span style={{ padding: "6px 12px", color: "var(--color_font_main)" }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    style={pageBtnStyle}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal Edit Status */}
      {modalOpen && editUser && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={(e) => e.target === e.currentTarget && closeEdit()}
        >
          <div
            style={{
              background: "var(--card_bg)",
              borderRadius: 12,
              padding: "1.5rem",
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 1rem", color: "var(--color_font_main)" }}>
              Edit Status PPAT
            </h3>
            <p style={{ margin: "0 0 0.5rem", color: "var(--color_font_main_muted)", fontSize: "0.9rem" }}>
              {editUser.nama} ({editUser.userid})
            </p>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                Status PPAT
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border_color)",
                  borderRadius: 8,
                  fontSize: "1rem",
                }}
              >
                {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={closeEdit}
                style={{
                  padding: "8px 16px",
                  border: "1px solid var(--border_color)",
                  borderRadius: 8,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={saving}
                style={{
                  padding: "8px 16px",
                  background: "var(--color_accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 14px",
  textAlign: "left",
  color: "var(--color_font_main)",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  color: "var(--color_font_main)",
};

const pageBtnStyle: React.CSSProperties = {
  padding: "6px 14px",
  border: "1px solid var(--border_color)",
  borderRadius: 6,
  background: "transparent",
  cursor: "pointer",
  color: "var(--color_font_main)",
};
