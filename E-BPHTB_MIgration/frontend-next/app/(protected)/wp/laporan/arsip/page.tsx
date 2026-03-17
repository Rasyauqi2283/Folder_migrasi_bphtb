"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiBase } from "../../../../lib/api";

/**
 * Arsip SSPD — daftar SSPD yang sudah disetujui, distempel, dan tervalidasi.
 * PDF siap di-download. Backup resmi jika berkas fisik rusak/hilang.
 * Sekaligus: daftar permintaan persetujuan (Libatkan WP).
 */
export default function WpLaporanArsipPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<
    { id: number; nobooking: string; pu_userid: string; status: string; updated_at?: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/api/wp/sign-requests`, { credentials: "include" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.success) {
        setRows([]);
        setError(j?.message || "Gagal memuat data.");
        return;
      }
      setRows(Array.isArray(j.data) ? j.data : []);
    } catch {
      setRows([]);
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 8px", color: "var(--color_font_main)" }}>Arsip SSPD</h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 24 }}>
        Daftar SSPD yang sudah disetujui, distempel, dan tervalidasi. PDF siap diunduh sebagai backup resmi.
      </p>

      <div
        style={{
          background: "var(--card_bg)",
          border: "1px solid var(--border_color)",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: "var(--color_font_main)" }}>Permintaan Persetujuan Dokumen</div>
          <button
            type="button"
            onClick={load}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border_color)", background: "var(--card_bg_grey)", cursor: "pointer", fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div style={{ padding: 12, background: "#fef2f2", color: "#b91c1c", borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ color: "var(--color_font_main_muted)" }}>Memuat daftar permintaan...</div>
        ) : rows.length === 0 ? (
          <div style={{ color: "var(--color_font_main_muted)" }}>Belum ada permintaan.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid var(--border_color)" }}>No. Booking</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid var(--border_color)" }}>Dari PU</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid var(--border_color)" }}>Status</th>
                  <th style={{ textAlign: "right", padding: "10px 8px", borderBottom: "1px solid var(--border_color)" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border_color)" }}>{r.nobooking}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border_color)" }}>{r.pu_userid}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border_color)" }}>{r.status}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border_color)", textAlign: "right" }}>
                      <button
                        type="button"
                        disabled={r.status !== "pending"}
                        onClick={async () => {
                          try {
                            const res = await fetch(`${getApiBase()}/api/wp/sign-requests/${r.id}/approve`, { method: "POST", credentials: "include" });
                            const j = await res.json().catch(() => ({}));
                            if (!res.ok || !j?.success) {
                              setError(j?.message || "Gagal menyetujui.");
                              return;
                            }
                            await load();
                          } catch {
                            setError("Gagal menyetujui.");
                          }
                        }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "none",
                          background: r.status === "pending" ? "var(--accent)" : "#9ca3af",
                          color: "#fff",
                          fontWeight: 700,
                          cursor: r.status === "pending" ? "pointer" : "not-allowed",
                        }}
                      >
                        Setujui
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/wp" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke Dashboard WP
        </Link>
      </p>
    </div>
  );
}
