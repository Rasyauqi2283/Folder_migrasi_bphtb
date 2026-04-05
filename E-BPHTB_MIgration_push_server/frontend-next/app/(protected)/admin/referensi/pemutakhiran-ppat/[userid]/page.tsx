"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface DiserahkanUser {
  id?: number;
  userid?: string;
  nama?: string;
  divisi?: string;
  ppat_khusus?: string | null;
  special_field?: string | null;
  pejabat_umum?: string | null;
  fotoprofil?: string | null;
}

interface DiserahkanRow {
  nobooking?: string;
  tanggal?: string | null;
  noppbb?: string | null;
  jenis_wajib_pajak?: string | null;
  bphtb_yangtelah_dibayar?: number | null;
  namawajibpajak?: string | null;
}

const PAGE_SIZE = 10;

export default function AdminPemutakhiranPpatByUserPage() {
  const params = useParams();
  const userid =
    typeof params?.userid === "string" ? decodeURIComponent(params.userid) : "";

  const [user, setUser] = useState<DiserahkanUser | null>(null);
  const [rows, setRows] = useState<DiserahkanRow[]>([]);
  const [summary, setSummary] = useState<{
    total_booking?: number;
    total_nilai?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    if (!userid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/ppat/user/${encodeURIComponent(userid)}/diserahkan`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Gagal memuat data");
      }
      if (!data.success) {
        throw new Error(data?.message || "User tidak ditemukan");
      }

      setUser(data.user || null);
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setSummary(data.summary || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setUser(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [userid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRows = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.nobooking?.toLowerCase().includes(q)) ||
      (r.tanggal?.toLowerCase().includes(q)) ||
      (r.noppbb?.toLowerCase().includes(q)) ||
      (r.namawajibpajak?.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const pageRows = filteredRows.slice(startIdx, startIdx + PAGE_SIZE);

  if (!userid) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>UserID tidak valid.</p>
        <Link href="/admin/referensi/pemutakhiran-ppat" style={{ color: "var(--color_accent)" }}>
          ← Kembali
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Link
          href="/admin/referensi/pemutakhiran-ppat"
          style={{
            color: "var(--color_accent)",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          ← Kembali ke Pemutakhiran PPAT
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "var(--color_font_muted)" }}>Memuat...</p>
      ) : error ? (
        <p style={{ color: "var(--danger, #d9534f)" }}>{error}</p>
      ) : (
        <>
          {/* Profil PPAT — sesuai legacy: foto, Nama Panjang, Nama + Title, PPAT Khusus, Pejabat */}
          {user && (
            <section
              style={{
                background: "var(--card_bg)",
                borderRadius: 12,
                boxShadow: "var(--shadow_card)",
                overflow: "hidden",
                border: "1px solid var(--border_color)",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ margin: "0 0 1rem", color: "var(--color_accent)" }}>
                Profil PPAT
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
                <div>
                  <img
                    src={user.fotoprofil || "/default-profile.png"}
                    alt="Foto Profil"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/default-profile.png"; }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 12,
                      objectFit: "cover",
                      border: "1px solid var(--border_color)",
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, flex: 1 }}>
                  <div>
                    <span style={{ color: "var(--color_font_muted)", fontSize: "0.85rem" }}>Nama Panjang</span>
                    <div style={{ fontWeight: 600 }}>{user.nama ?? "—"}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--color_font_muted)", fontSize: "0.85rem" }}>Nama + Title</span>
                    <div style={{ fontWeight: 600 }}>{user.special_field ?? "—"}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--color_font_muted)", fontSize: "0.85rem" }}>PPAT Khusus</span>
                    <div>{user.ppat_khusus ?? "—"}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--color_font_muted)", fontSize: "0.85rem" }}>Pejabat</span>
                    <div>{user.pejabat_umum ?? "—"}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--color_font_muted)", fontSize: "0.85rem" }}>UserID</span>
                    <div>{user.userid ?? "—"}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--color_font_muted)", fontSize: "0.85rem" }}>Divisi</span>
                    <div>{user.divisi ?? "—"}</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Summary */}
          {summary && (
            <section
              style={{
                background: "var(--card_bg)",
                borderRadius: 12,
                boxShadow: "var(--shadow_card)",
                border: "1px solid var(--border_color)",
                padding: "1rem 1.5rem",
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div>
                <span style={{ color: "var(--color_font_muted)", fontSize: "0.9rem" }}>
                  Booking yang dikerjakan:
                </span>{" "}
                <strong>{summary.total_booking ?? 0}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color_font_muted)", fontSize: "0.9rem" }}>
                  Nilai Pajak Total:
                </span>{" "}
                <strong>
                  Rp {(summary.total_nilai ?? 0).toLocaleString("id-ID")}
                </strong>
              </div>
            </section>
          )}

          {/* Tabel booking */}
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
              }}
            >
              <input
                type="text"
                placeholder="Cari nobooking, tanggal, nama WP..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: "8px 12px",
                  border: "1px solid var(--border_color)",
                  borderRadius: 8,
                  minWidth: 260,
                  fontSize: "0.9rem",
                }}
              />
            </div>

            {pageRows.length === 0 ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--color_font_muted)",
                }}
              >
                Tidak ada data booking
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
                        <th style={thStyle}>NoBooking</th>
                        <th style={thStyle}>Tanggal</th>
                        <th style={thStyle}>UserId</th>
                        <th style={thStyle}>NOPPBB</th>
                        <th style={thStyle}>Jenis Pajak</th>
                        <th style={thStyle}>Nilai Pajak</th>
                        <th style={thStyle}>Nama WP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((r, i) => (
                        <tr
                          key={r.nobooking ?? i}
                          style={{ borderBottom: "1px solid var(--border_color)" }}
                        >
                          <td style={tdStyle}>{r.nobooking ?? "—"}</td>
                          <td style={tdStyle}>{r.tanggal ?? "—"}</td>
                          <td style={tdStyle}>{userid}</td>
                          <td style={tdStyle}>{r.noppbb ?? "—"}</td>
                          <td style={tdStyle}>{r.jenis_wajib_pajak ?? "—"}</td>
                          <td style={tdStyle}>
                            {r.bphtb_yangtelah_dibayar != null
                              ? `Rp ${r.bphtb_yangtelah_dibayar.toLocaleString("id-ID")}`
                              : "—"}
                          </td>
                          <td style={tdStyle}>{r.namawajibpajak ?? "—"}</td>
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
                    <span style={{ color: "var(--color_font_muted)", fontSize: "0.9rem" }}>
                      Menampilkan {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, filteredRows.length)} dari {filteredRows.length}
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
                      <span style={{ padding: "6px 12px" }}>
                        {page} / {totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
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
        </>
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
};
