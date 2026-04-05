"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiBase } from "../../../../../lib/api";

interface ValidateResult {
  success?: boolean;
  message?: string;
  validation_info?: Record<string, unknown>;
  document_info?: Record<string, unknown>;
  ppat_info?: Record<string, unknown>;
  peneliti_info?: Record<string, unknown>;
  authenticity?: Record<string, unknown>;
}

interface SearchRow {
  no_validasi?: string;
  nobooking?: string;
  namawajibpajak?: string;
  namapemilikobjekpajak?: string;
  status?: string;
  trackstatus?: string;
  noppbb?: string;
  tanggal?: string;
  ppat_nama?: string;
  created_at?: string;
}

function InfoSection({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown>;
}) {
  const labels: Record<string, string> = {
    no_validasi: "Nomor Validasi",
    status: "Status",
    trackstatus: "Track Status",
    nobooking: "No. Booking",
    no_registrasi: "No. Registrasi",
    noppbb: "NOPPBB",
    tanggal: "Tanggal",
    tahunajb: "Tahun AJB",
    namawajibpajak: "Nama Wajib Pajak",
    namapemilikobjekpajak: "Nama Pemilik",
    npwpwp: "NPWP",
    nama: "Nama",
    divisi: "Divisi",
    special_field: "Special Field",
    nip: "NIP",
    verified: "Terverifikasi",
    verification_method: "Metode",
    institution: "Instansi",
  };
  return (
    <div style={{ marginBottom: "1rem" }}>
      <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>{title}</h4>
      <div
        style={{
          display: "grid",
          gap: 6,
          fontSize: "0.9rem",
        }}
      >
        {Object.entries(data).map(
          ([k, v]) =>
            v != null &&
            v !== "" && (
              <div key={k} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "var(--color_font_muted)", minWidth: 140 }}>
                  {labels[k] ?? k}:
                </span>
                <span>{String(v)}</span>
              </div>
            )
        )}
      </div>
    </div>
  );
}

export default function AdminValidasiQrPage() {
  const [noValidasi, setNoValidasi] = useState("");
  const [result, setResult] = useState<ValidateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchList, setSearchList] = useState<SearchRow[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchLimit] = useState(20);

  const handleCek = async () => {
    const v = noValidasi.trim();
    if (!v) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/admin/validate-qr/${encodeURIComponent(v)}`,
        { credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      setResult(data);
    } catch {
      setResult({ success: false, message: "Gagal koneksi" });
    } finally {
      setLoading(false);
    }
  };

  const loadSearch = useCallback(async (overridePage?: number) => {
    setSearchLoading(true);
    const p = overridePage ?? searchPage;
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(searchLimit));
      if (searchQ.trim()) params.set("q", searchQ.trim());
      if (searchStatus) params.set("status", searchStatus);

      const res = await fetch(
        `${getApiBase()}/api/admin/validate-qr-search?${params}`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (data?.success && Array.isArray(data?.data)) {
        setSearchList(data.data);
        const pag = data.pagination || {};
        setSearchTotal(pag.total ?? 0);
        setSearchTotalPages(pag.total_pages ?? 1);
      } else {
        setSearchList([]);
      }
    } catch {
      setSearchList([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchPage, searchLimit, searchQ, searchStatus]);

  useEffect(() => {
    loadSearch();
  }, [loadSearch]);

  const onSearch = () => {
    setSearchPage(1);
    loadSearch(1);
  };

  const startIdx = (searchPage - 1) * searchLimit + 1;
  const endIdx = Math.min(searchPage * searchLimit, searchTotal);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ margin: "0 0 0.25rem", color: "var(--color_font_main)" }}>
          Validasi QR
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--color_font_muted)",
            fontSize: "0.9rem",
          }}
        >
          Cek nomor validasi dan pencarian data validasi
        </p>
      </div>

      {/* Cek single */}
      <section
        style={{
          background: "var(--card_bg_grey)",
          borderRadius: 12,
          boxShadow: "var(--shadow_card)",
          border: "1px solid var(--border_color)",
          padding: "1.5rem",
        }}
      >
        <h3 style={{ margin: "0 0 1rem", color: "var(--color_accent)" }}>
          🔍 Validasi Dokumen QR Code
        </h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            value={noValidasi}
            onChange={(e) => setNoValidasi(e.target.value)}
            placeholder="Nomor validasi"
            onKeyDown={(e) => e.key === "Enter" && handleCek()}
            style={{
              padding: "10px 14px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              minWidth: 220,
              fontSize: "1rem",
            }}
          />
          <button
            type="button"
            onClick={handleCek}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "var(--color_accent)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Memeriksa..." : "Cek"}
          </button>
        </div>

        {result && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              borderRadius: 8,
              border: result.success
                ? "1px solid #28a745"
                : "1px solid var(--danger, #d9534f)",
              background: result.success ? "rgba(40,167,69,0.08)" : "rgba(217,83,79,0.08)",
            }}
          >
            {result.success ? (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1.25rem" }}>✅</span>{" "}
                  <strong>Dokumen Asli Terverifikasi</strong>
                </div>
                <p style={{ margin: "0 0 1rem", color: "var(--color_font_main)" }}>
                  {result.message}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {result.validation_info && (
                    <InfoSection title="Informasi Validasi" data={result.validation_info} />
                  )}
                  {result.document_info && (
                    <InfoSection title="Informasi Dokumen" data={result.document_info} />
                  )}
                  {result.ppat_info && (
                    <InfoSection title="Informasi PPAT" data={result.ppat_info} />
                  )}
                  {result.peneliti_info && (
                    <InfoSection
                      title="Informasi Peneliti Validasi"
                      data={result.peneliti_info}
                    />
                  )}
                  {result.authenticity && (
                    <InfoSection title="Keaslian" data={result.authenticity} />
                  )}
                </div>
              </>
            ) : (
              <p style={{ margin: 0, color: "var(--danger, #d9534f)" }}>
                {result.message || "Nomor validasi tidak ditemukan"}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Scan QR Code — sesuai legacy */}
      <section
        style={{
          background: "var(--card_bg_grey)",
          borderRadius: 12,
          boxShadow: "var(--shadow_card)",
          border: "1px solid var(--border_color)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "linear-gradient(135deg, #4a6cf7 0%, #3b5bdb 100%)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1.1rem",
          }}
        >
          📷 Scan QR Code
        </div>
        <div style={{ padding: "1.5rem" }}>
          <p style={{ margin: "0 0 1rem", color: "var(--color_font_muted)", fontSize: "0.95rem" }}>
            Arahkan kamera ke QR pada dokumen. Fitur scan kamera memerlukan izin akses dan dukungan browser.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              style={{
                padding: "10px 18px",
                background: "var(--color_accent)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              Mulai Scan
            </button>
            <button
              type="button"
              style={{
                padding: "10px 18px",
                background: "var(--danger, #d9534f)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              Hentikan
            </button>
          </div>
        </div>
      </section>

      {/* Upload Dokumen untuk Scan QR — sesuai legacy */}
      <section
        style={{
          background: "var(--card_bg)",
          borderRadius: 12,
          boxShadow: "var(--shadow_card)",
          border: "1px solid var(--border_color)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "linear-gradient(135deg, #4a6cf7 0%, #3b5bdb 100%)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1.1rem",
          }}
        >
          📄 Upload Dokumen untuk Scan QR
        </div>
        <div style={{ padding: "1.5rem" }}>
          <p style={{ margin: "0 0 0.5rem", fontWeight: 600, fontSize: "0.9rem" }}>
            Pilih file gambar atau PDF yang memuat QR
          </p>
          <input
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            style={{
              padding: "8px 0",
              fontSize: "0.9rem",
            }}
          />
          <p style={{ margin: "0.5rem 0 0", color: "var(--color_font_muted)", fontSize: "0.85rem" }}>
            Format: PNG, JPEG, atau PDF. QR akan diekstrak untuk validasi.
          </p>
        </div>
      </section>

      {/* Pencarian */}
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
          <span style={{ fontWeight: 600, color: "var(--color_accent)" }}>
            Pencarian Data Validasi
          </span>
          <input
            type="text"
            placeholder="Cari nomor validasi, nobooking, nama..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              minWidth: 220,
            }}
          />
          <select
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
            }}
          >
            <option value="">Semua Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
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

        {searchLoading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Memuat...</div>
        ) : searchList.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--color_font_muted)",
            }}
          >
            Tidak ada data
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
                    <th style={thStyle}>No. Validasi</th>
                    <th style={thStyle}>No. Booking</th>
                    <th style={thStyle}>Nama WP</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>NOPPBB</th>
                    <th style={thStyle}>PPAT</th>
                  </tr>
                </thead>
                <tbody>
                  {searchList.map((r, i) => (
                    <tr
                      key={r.no_validasi ?? i}
                      style={{ borderBottom: "1px solid var(--border_color)" }}
                    >
                      <td style={tdStyle}>{r.no_validasi ?? "—"}</td>
                      <td style={tdStyle}>{r.nobooking ?? "—"}</td>
                      <td style={tdStyle}>{r.namawajibpajak ?? "—"}</td>
                      <td style={tdStyle}>{r.status ?? "—"}</td>
                      <td style={tdStyle}>{r.noppbb ?? "—"}</td>
                      <td style={tdStyle}>{r.ppat_nama ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {searchTotalPages > 1 && (
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
                  Menampilkan {startIdx}–{endIdx} dari {searchTotal}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    disabled={searchPage <= 1}
                    onClick={() => setSearchPage((p) => Math.max(1, p - 1))}
                    style={pageBtnStyle}
                  >
                    Prev
                  </button>
                  <span style={{ padding: "6px 12px" }}>
                    {searchPage} / {searchTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={searchPage >= searchTotalPages}
                    onClick={() =>
                      setSearchPage((p) => Math.min(searchTotalPages, p + 1))
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
