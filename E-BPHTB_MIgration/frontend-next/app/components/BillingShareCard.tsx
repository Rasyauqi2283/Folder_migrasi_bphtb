"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

export type BillingShareData = {
  billingId: string;
  amount: number;
  expiresAtISO?: string;
};

function formatRupiah(n: number): string {
  const v = Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
  return `Rp ${v.toLocaleString("id-ID")}`;
}

function formatExpires(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("id-ID");
}

export default function BillingShareCard({ data, onClose }: { data: BillingShareData; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const shareText = useMemo(() => {
    const lines = [
      "ID Billing Bank BJB (E-BPHTB)",
      `ID Billing: ${data.billingId}`,
      `Nominal: ${formatRupiah(data.amount)}`,
      `Batas waktu: ${formatExpires(data.expiresAtISO)}`,
      "",
      "Silakan bayar via ATM/Mobile Banking/Teller Bank BJB menggunakan ID Billing di atas.",
    ];
    return lines.join("\n");
  }, [data.amount, data.billingId, data.expiresAtISO]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.billingId);
      showToast("ID Billing disalin.");
    } catch {
      showToast("Tidak bisa menyalin otomatis. Silakan salin manual.");
    }
  };

  const handleShare = async () => {
    // Web Share API (Android/iOS/modern browsers). This will route to WA/IG/Gmail/etc via OS share sheet.
    try {
      if (typeof navigator === "undefined" || typeof (navigator as any).share !== "function") {
        await navigator.clipboard.writeText(shareText);
        showToast("Teks billing disalin (Share tidak didukung di perangkat ini).");
        return;
      }
      await (navigator as any).share({
        title: "ID Billing Bank BJB",
        text: shareText,
      });
    } catch (e: unknown) {
      const msg = typeof e === "object" && e !== null && "name" in e ? String((e as any).name) : "";
      if (msg === "AbortError") return; // user canceled share sheet
      try {
        await navigator.clipboard.writeText(shareText);
        showToast("Teks billing disalin (Share dibatalkan/gagal).");
      } catch {
        showToast("Gagal membagikan. Silakan salin manual.");
      }
    }
  };

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `ID-Billing-${data.billingId}.png`;
      a.click();
      showToast("Gambar billing tersimpan.");
    } catch {
      showToast("Gagal membuat gambar. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 300,
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 14,
          border: "1px solid rgba(15,23,42,0.12)",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ padding: "14px 18px", background: "linear-gradient(135deg, #0a3d62, #00529B)", color: "#fff" }}>
          <div style={{ fontWeight: 900, letterSpacing: "0.02em" }}>ID Billing Bank BJB</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Bisa disalin, dibagikan, atau disimpan sebagai gambar</div>
        </div>

        <div ref={cardRef} style={{ padding: 18, color: "#0f172a" }}>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: "#475569", fontWeight: 700 }}>ID BILLING</div>
              <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 18, fontWeight: 900 }}>
                {data.billingId}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#475569", fontWeight: 700 }}>NOMINAL TAGIHAN</div>
              <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 22, fontWeight: 900, color: "#0a3d62" }}>
                {formatRupiah(data.amount)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#475569", fontWeight: 700 }}>BATAS WAKTU</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{formatExpires(data.expiresAtISO)}</div>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(0,82,155,0.08)", border: "1px solid rgba(0,82,155,0.18)" }}>
              <div style={{ fontWeight: 900, color: "#0a3d62", marginBottom: 4 }}>Instruksi</div>
              <div style={{ fontSize: 13, color: "#0f172a" }}>
                Silakan bayar melalui ATM, Mobile Banking, atau Teller <strong>Bank BJB</strong> menggunakan <strong>ID Billing</strong> di atas.
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 18px 18px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => void handleCopy()}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "#00529B",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Salin ID
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(15,23,42,0.18)",
              background: "#fff",
              color: "#0f172a",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Bagikan…
          </button>
          <button
            type="button"
            onClick={() => void handleDownloadPng()}
            disabled={busy}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(15,23,42,0.18)",
              background: busy ? "rgba(15,23,42,0.06)" : "#fff",
              color: "#0f172a",
              fontWeight: 800,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Membuat gambar…" : "Simpan sebagai foto (PNG)"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              marginLeft: "auto",
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "rgba(15,23,42,0.08)",
              color: "#0f172a",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Tutup
          </button>
        </div>

        {toast && (
          <div style={{ padding: "0 18px 16px", color: "#0f172a", fontSize: 13, fontWeight: 700 }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

