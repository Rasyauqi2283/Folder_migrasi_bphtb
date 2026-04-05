"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getApiBase } from "../../../../lib/api";
import OfflineSspdBookingForm from "./offline-form";

interface DraftRow {
  nobooking: string;
  noppbb: string;
  namawajibpajak: string;
  jenis_wajib_pajak: string;
  trackstatus: string;
}

const thStyle: React.CSSProperties = {
  padding: "12px 10px",
  textAlign: "left",
  borderBottom: "2px solid var(--border_color)",
  background: "var(--card_bg_grey)",
  fontWeight: 600,
  fontSize: 13,
  color: "var(--color_font_main)",
};
const tdStyle: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid var(--border_color)",
  fontSize: 14,
  color: "var(--color_font_main)",
};

export default function LTBPenginputanOfflinePage() {
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [selectedNobooking, setSelectedNobooking] = useState<string | null>(null);
  const [prefillTick, setPrefillTick] = useState(0);
  const [genLoading, setGenLoading] = useState(false);
  const [genMessage, setGenMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const loadDrafts = useCallback(async () => {
    setLoadingDrafts(true);
    try {
      const res = await fetch(`${getApiBase()}/api/ltb/offline/drafts`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success && Array.isArray(data.rows)) {
        setDrafts(data.rows as DraftRow[]);
      } else {
        setDrafts([]);
      }
    } catch {
      setDrafts([]);
    } finally {
      setLoadingDrafts(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const onRowClick = (nobooking: string) => {
    setSelectedNobooking(nobooking);
    setPrefillTick((t) => t + 1);
  };

  const newDraft = () => {
    setSelectedNobooking(null);
    setFormKey((k) => k + 1);
    setGenMessage(null);
  };

  const generateRegistrasi = async () => {
    const nb = (selectedNobooking || "").trim();
    if (!nb) {
      setGenMessage("Pilih satu baris draf di tabel terlebih dulu.");
      return;
    }
    setGenLoading(true);
    setGenMessage(null);
    try {
      const res = await fetch(`${getApiBase()}/api/ltb/offline/booking/${encodeURIComponent(nb)}/generate-registrasi`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setGenMessage(data?.message || "Gagal membuat nomor registrasi.");
        return;
      }
      setGenMessage(`Nomor registrasi offline: ${data.no_registrasi}. Data kini tampil di Terima Berkas SSPD.`);
      setSelectedNobooking(null);
      setFormKey((k) => k + 1);
      await loadDrafts();
    } catch {
      setGenMessage("Gagal membuat nomor registrasi.");
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 8px", color: "var(--color_font_main)" }}>Penginputan Offline</h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 20 }}>
        Form mengikuti pola Tambah Booking PU (Badan). Pilih jenis wajib pajak, simpan draf, lalu buat nomor registrasi format{" "}
        <strong>YYYYV######</strong> agar masuk antrean Terima Berkas SSPD.
      </p>

      <OfflineSspdBookingForm
        key={formKey}
        prefillNobooking={selectedNobooking}
        prefillTick={prefillTick}
        onDraftsNeedReload={loadDrafts}
      />

      <div
        style={{
          marginTop: 28,
          padding: 20,
          background: "var(--card_bg)",
          border: "1px solid var(--border_color)",
          borderRadius: 12,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 17, color: "var(--color_font_main)", flex: "1 1 auto" }}>Draf Offline</h2>
          <button
            type="button"
            onClick={newDraft}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--border_color)",
              background: "var(--card_bg_grey)",
              color: "var(--color_font_main)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Draf baru
          </button>
          <button
            type="button"
            disabled={!selectedNobooking || genLoading}
            onClick={generateRegistrasi}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: selectedNobooking && !genLoading ? "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" : "#9ca3af",
              color: "#fff",
              fontWeight: 600,
              cursor: selectedNobooking && !genLoading ? "pointer" : "not-allowed",
            }}
          >
            {genLoading ? "Memproses..." : "Buatkan No Registrasi"}
          </button>
        </div>
        {genMessage && (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "var(--card_bg_grey)",
              border: "1px solid var(--border_color)",
              color: "var(--color_font_main)",
              fontSize: 14,
            }}
          >
            {genMessage}
          </div>
        )}
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color_font_main_muted)" }}>
          Klik baris untuk memuat ulang data ke form (sama seperti perilaku klik baris di daftar PU).
        </p>
        <div style={{ overflowX: "auto", border: "1px solid var(--border_color)", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>No. Booking</th>
                <th style={thStyle}>NOP PBB</th>
                <th style={thStyle}>Nama Wajib Pajak</th>
                <th style={thStyle}>Jenis WP</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingDrafts ? (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: 28, color: "var(--color_font_main_muted)" }}>
                    Memuat draf...
                  </td>
                </tr>
              ) : drafts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: 28, color: "var(--color_font_main_muted)" }}>
                    Belum ada draf offline. Simpan form di atas sebagai draf.
                  </td>
                </tr>
              ) : (
                drafts.map((r) => (
                  <tr
                    key={r.nobooking}
                    onClick={() => onRowClick(r.nobooking)}
                    style={{
                      background: selectedNobooking === r.nobooking ? "rgba(124,58,237,0.12)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <td style={tdStyle}>{r.nobooking || "—"}</td>
                    <td style={tdStyle}>{r.noppbb || "—"}</td>
                    <td style={tdStyle}>{r.namawajibpajak || "—"}</td>
                    <td style={tdStyle}>{r.jenis_wajib_pajak || "—"}</td>
                    <td style={tdStyle}>{r.trackstatus || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/ltb" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke Dashboard LTB
        </Link>
      </p>
    </div>
  );
}
