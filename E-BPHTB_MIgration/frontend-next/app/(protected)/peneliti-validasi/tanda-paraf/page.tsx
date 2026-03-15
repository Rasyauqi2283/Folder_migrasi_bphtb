"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { getApiBase } from "../../../../lib/api";

function convertToBlackWhitePNG(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.3 * r + 0.59 * g + 0.11 * b;
        const bw = gray > 200 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = bw;
      }
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(new File([blob], "signature.png", { type: "image/png" }));
          else reject(new Error("toBlob failed"));
        },
        "image/png"
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

const cardStyle: React.CSSProperties = {
  border: "1px solid var(--border_color, #e5e7eb)",
  borderRadius: 12,
  padding: 24,
  background: "var(--card_bg, #ffffff)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const sectionStyle: React.CSSProperties = {
  background: "var(--main_bg, #f9fafb)",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 20,
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  color: "white",
};

const btnSecondary: React.CSSProperties = {
  ...btnPrimary,
  background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
};

export default function PenelitiValidasiTandaParafPage() {
  const [sigPreview, setSigPreview] = useState<string>("");
  const [sigUsedPreview, setSigUsedPreview] = useState<string>("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadCurrentSignature = useCallback(async () => {
    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/profile`, { credentials: "include" });
      const json = await res.json().catch(() => null);
      const path =
        (json?.tanda_tangan_path ?? json?.data?.user?.tanda_tangan_path) || "";
      setSigUsedPreview(path ? `${path}?t=${Date.now()}` : "");
    } catch {
      setSigUsedPreview("");
    }
  }, []);

  useEffect(() => {
    loadCurrentSignature();
  }, [loadCurrentSignature]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";
    let drawing = false;
    let last: { x: number; y: number } | null = null;
    const pos = (e: MouseEvent | Touch) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (e.clientX ?? (e as Touch).clientX) - r.left,
        y: (e.clientY ?? (e as Touch).clientY) - r.top,
      };
    };
    const onDown = (e: MouseEvent) => {
      drawing = true;
      last = pos(e);
    };
    const onMove = (e: MouseEvent) => {
      if (!drawing || !last) return;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    };
    const onUp = () => {
      drawing = false;
    };
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      drawing = true;
      last = pos(e.touches[0]);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!drawing || !last) return;
      const p = pos(e.touches[0]);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    };
    const onTouchEnd = () => {
      drawing = false;
    };
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("mouseleave", onUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    return () => {
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("mouseleave", onUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const uploadFromFile = async () => {
    if (!signatureFile) {
      setError("Pilih file terlebih dahulu");
      return;
    }
    setUploading(true);
    setError("");
    try {
      let file: File = signatureFile;
      try {
        file = await convertToBlackWhitePNG(signatureFile);
      } catch {
        // keep original if conversion fails
      }
      const form = new FormData();
      form.append("signature", file);
      const res = await fetch(`${getApiBase()}/api/v1/auth/update-profile-paraf`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { message?: string }).message || `HTTP ${res.status}`);
      const path = (json as { data?: { path?: string }; path?: string; tanda_tangan_path?: string }).data?.path
        ?? (json as { path?: string }).path
        ?? (json as { tanda_tangan_path?: string }).tanda_tangan_path;
      if (path) setSigPreview(`${path}?t=${Date.now()}`);
      await loadCurrentSignature();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal upload");
    } finally {
      setUploading(false);
    }
  };

  const saveFromCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setUploading(true);
    setError("");
    try {
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      if (!blob) throw new Error("toBlob failed");
      let file: File = new File([blob], "canvas.png", { type: "image/png" });
      try {
        file = await convertToBlackWhitePNG(file);
      } catch {
        // keep original
      }
      const form = new FormData();
      form.append("signature", file);
      const res = await fetch(`${getApiBase()}/api/v1/auth/update-profile-paraf`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { message?: string }).message || `HTTP ${res.status}`);
      const path = (json as { data?: { path?: string }; path?: string; tanda_tangan_path?: string }).data?.path
        ?? (json as { path?: string }).path
        ?? (json as { tanda_tangan_path?: string }).tanda_tangan_path;
      if (path) setSigPreview(`${path}?t=${Date.now()}`);
      await loadCurrentSignature();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal simpan dari canvas");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700 }}>Tanda Paraf</h2>
      <p style={{ marginBottom: 24, color: "var(--color_font_main_muted)" }}>
        Upload atau gambar tanda tangan untuk validasi. Tanda tangan yang dipakai saat ini tampil di profil.
      </p>

      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: 20, fontWeight: 700, borderBottom: "2px solid #f3f4f6", paddingBottom: 12 }}>
          Upload / Gambar Tanda Tangan
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 24,
            marginTop: 20,
          }}
        >
          <div style={sectionStyle}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 4, height: 20, background: "linear-gradient(135deg, #3b82f6, #2563eb)", borderRadius: 2 }} />
              Upload File
            </h4>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <input
                type="file"
                accept="image/*"
                style={{ flex: 1, padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
                onChange={(e) => setSignatureFile(e.target.files?.[0] ?? null)}
              />
              <button style={btnPrimary} onClick={uploadFromFile} disabled={uploading}>
                {uploading ? "..." : "Upload"}
              </button>
            </div>
            <p style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>
              Pilih file gambar tanda tangan (PNG, JPG, atau format gambar lainnya)
            </p>

            <h4 style={{ margin: "24px 0 16px 0", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 4, height: 20, background: "linear-gradient(135deg, #3b82f6, #2563eb)", borderRadius: 2 }} />
              Gambar Manual
            </h4>
            <div
              style={{
                background: "#fff",
                border: "2px dashed #cbd5e1",
                borderRadius: 10,
                padding: 16,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <canvas
                ref={canvasRef}
                width={700}
                height={300}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  background: "#fff",
                  cursor: "crosshair",
                  maxWidth: "100%",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button style={btnPrimary} onClick={saveFromCanvas} disabled={uploading}>
                {uploading ? "..." : "Simpan dari Canvas"}
              </button>
              <button style={btnSecondary} onClick={clearCanvas}>
                Bersihkan
              </button>
            </div>
            <p style={{ color: "#6b7280", fontSize: 12, marginTop: 8 }}>
              Gambar tanda tangan Anda di area canvas di atas
            </p>
          </div>

          <div style={sectionStyle}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 4, height: 20, background: "linear-gradient(135deg, #3b82f6, #2563eb)", borderRadius: 2 }} />
              Preview Tanda Tangan
            </h4>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 16,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151", marginBottom: 12, fontSize: 14 }}>Preview Baru</div>
              {sigPreview ? (
                <img
                  src={sigPreview}
                  alt="Preview Tanda Tangan"
                  style={{ maxWidth: "100%", maxHeight: 200, border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, background: "#f9fafb" }}
                />
              ) : (
                <div style={{ color: "#9ca3af", fontStyle: "italic", padding: "40px 20px" }}>Belum ada preview</div>
              )}
              <p style={{ color: "#6b7280", fontSize: 12, marginTop: 8, fontStyle: "italic" }}>
                Tanda tangan yang baru diupload atau digambar
              </p>
            </div>
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "2px solid #e5e7eb" }}>
              <div style={{ fontWeight: 600, color: "#374151", marginBottom: 12, fontSize: 14 }}>Tanda Tangan yang Dipakai</div>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 16,
                  textAlign: "center",
                }}
              >
                {sigUsedPreview ? (
                  <img
                    src={sigUsedPreview}
                    alt="Tanda tangan yang dipakai"
                    style={{ maxWidth: "100%", maxHeight: 200, border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, background: "#f9fafb" }}
                  />
                ) : (
                  <div style={{ color: "#9ca3af", fontStyle: "italic", padding: "40px 20px" }}>Belum ada tanda tangan yang dipakai</div>
                )}
              </div>
              <p style={{ color: "#6b7280", fontSize: 12, marginTop: 8, fontStyle: "italic" }}>
                Tanda tangan yang saat ini aktif di profil Anda
              </p>
            </div>
          </div>
        </div>
        {error && <p style={{ color: "#ef4444", marginTop: 12 }}>{error}</p>}
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/profile" style={{ color: "var(--accent)" }}>
          Buka Profil (upload paraf) →
        </Link>
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/peneliti-validasi" style={{ color: "var(--accent)" }}>
          ← Kembali ke Dashboard
        </Link>
      </p>
    </div>
  );
}
