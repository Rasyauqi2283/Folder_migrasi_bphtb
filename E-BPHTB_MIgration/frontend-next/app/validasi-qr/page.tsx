"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";

const JSQR_URL = "https://unpkg.com/jsqr@1.4.0/dist/jsQR.js";
const PDFJS_URL = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js";
const PDFJS_WORKER = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

function getValidateQrApiBase(): string {
  if (typeof window === "undefined") return "";
  return (process.env.NEXT_PUBLIC_VALIDATE_QR_API_URL ?? "").trim() || "";
}

interface ValidationResult {
  success: boolean;
  message?: string;
  document_info?: Record<string, unknown>;
  ppat_info?: Record<string, unknown>;
  pejabat_info?: Record<string, unknown>;
  authenticity?: Record<string, unknown>;
}

const LABEL_MAP: Record<string, string> = {
  nobooking: "No Booking",
  no_registrasi: "No Registrasi",
  noppbb: "No PBB",
  tanggal: "Tanggal",
  tahunajb: "Tahun AJB",
  namawajibpajak: "Nama Wajib Pajak",
  namapemilikobjekpajak: "Nama Pemilik Objek Pajak",
  booking_trackstatus: "Status Booking",
  nama: "Nama",
  special_field: "Nama PPAT",
  divisi: "Divisi",
  special_parafv: "Nama Pejabat BAPPENDA",
  nip: "NIP",
  verified: "Terverifikasi",
  verified_by: "Diverifikasi Oleh",
  verified_at: "Waktu Verifikasi",
  verification_method: "Metode Verifikasi",
  institution: "Instansi",
};

function formatLabel(key: string): string {
  return LABEL_MAP[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" && /\d{4}-\d{2}-\d{2}T/.test(value)) {
    try {
      return new Date(value).toLocaleString("id-ID", { hour12: false });
    } catch {
      // ignore
    }
  }
  return String(value);
}

function extractNoValidasi(text: string): string | null {
  try {
    const url = new URL(text);
    const nv =
      url.searchParams.get("no_validasi") ||
      url.searchParams.get("novalidasi") ||
      url.searchParams.get("nv");
    if (nv && /^[A-Z0-9]{4,}-[A-Z0-9]{2,}$/i.test(nv)) return nv;
  } catch {
    // not a URL
  }
  try {
    const obj = JSON.parse(text) as { no_validasi?: string; noValidasi?: string };
    const nv = obj.no_validasi ?? obj.noValidasi;
    if (nv && /^[A-Z0-9]{4,}-[A-Z0-9]{2,}$/i.test(nv)) return nv;
  } catch {
    // not JSON
  }
  const m = String(text).match(/[A-Z0-9]{4,}-[A-Z0-9]{2,}/i);
  return m ? m[0] : null;
}

export default function ValidasiQrPage() {
  const router = useRouter();
  const [noValidasi, setNoValidasi] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState<"success" | "error">("success");
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [resultData, setResultData] = useState<ValidationResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  const apiBase = getValidateQrApiBase();

  const validateQr = useCallback(
    async (noVal: string) => {
      const nv = noVal.trim() || noValidasi.trim();
      if (!nv) {
        setResultType("error");
        setResultTitle("Error");
        setResultMessage("Nomor validasi tidak ditemukan. Pastikan QR Code terlihat jelas.");
        setResultVisible(true);
        setResultData(null);
        return;
      }
      setNoValidasi(nv);
      setResultVisible(true);
      setLoading(true);
      setResultData(null);
      try {
        const url = apiBase
          ? `${apiBase}/api/public/validate-qr/${encodeURIComponent(nv)}`
          : `/api/public/validate-qr/${encodeURIComponent(nv)}`;
        const res = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
        const data = (await res.json()) as ValidationResult;
        if (data.success) {
          setResultType("success");
          setResultTitle("Dokumen Asli & Terverifikasi");
          setResultMessage(
            data.message ?? "Dokumen ini telah diverifikasi dan terdaftar dalam sistem E-BPHTB Kabupaten Bogor."
          );
          setResultData(data);
        } else {
          setResultType("error");
          setResultTitle("Validasi Gagal");
          setResultMessage(data.message ?? "Dokumen tidak ditemukan atau tidak valid");
        }
      } catch {
        setResultType("error");
        setResultTitle("Error Koneksi");
        setResultMessage("Gagal terhubung ke server. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    },
    [apiBase, noValidasi]
  );

  const loadJsQR = useCallback((): Promise<void> => {
    if (typeof window !== "undefined" && (window as unknown as { jsQR?: unknown }).jsQR) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = JSQR_URL;
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !scanning || !(window as unknown as { jsQR?: (data: Uint8ClampedArray, w: number, h: number, opts?: { inversionAttempts: string }) => { data: string } | null }).jsQR) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) {
      animationRef.current = requestAnimationFrame(tick);
      return;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      animationRef.current = requestAnimationFrame(tick);
      return;
    }
    canvas.width = vw;
    canvas.height = vh;
    ctx.drawImage(video, 0, 0, vw, vh);
    const imageData = ctx.getImageData(0, 0, vw, vh);
    const jsQR = (window as unknown as { jsQR: (data: Uint8ClampedArray, w: number, h: number, opts?: { inversionAttempts: string }) => { data: string } | null }).jsQR;
    const res = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
    if (res?.data) {
      const nv = extractNoValidasi(res.data);
      if (nv) {
        setScanning(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (video.srcObject) video.srcObject = null;
        validateQr(nv);
        return;
      }
      setResultType("error");
      setResultTitle("QR Tidak Dikenali");
      setResultMessage("QR Code tidak berisi nomor validasi yang valid.");
      setResultVisible(true);
      setScanning(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (video.srcObject) video.srcObject = null;
      return;
    }
    animationRef.current = requestAnimationFrame(tick);
  }, [scanning, validateQr]);

  useEffect(() => {
    if (!scanning) return;
    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [scanning, tick]);

  const startScan = useCallback(async () => {
    try {
      await loadJsQR();
      if (scanning) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.display = "block";
        await videoRef.current.play();
      }
      setScanning(true);
    } catch {
      setResultType("error");
      setResultTitle("Kamera Tidak Tersedia");
      setResultMessage("Pastikan browser mengizinkan akses kamera.");
      setResultVisible(true);
    }
  }, [loadJsQR, scanning]);

  const stopScan = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.style.display = "none";
    }
    setScanning(false);
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileLoading(true);
      try {
        await loadJsQR();
        const ext = (file.name.split(".").pop() ?? "").toLowerCase();
        if (ext === "pdf" || file.type === "application/pdf") {
          const pdfjsLib = (window as unknown as { pdfjsLib?: { getDocument: (opts: { data: ArrayBuffer }) => Promise<{ getPage: (n: number) => Promise<{ getViewport: (opts: { scale: number }) => unknown; render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => Promise<void> }> }>; GlobalWorkerOptions: { workerSrc: string } } }).pdfjsLib;
          if (!pdfjsLib) {
            const s = document.createElement("script");
            s.src = PDFJS_URL;
            await new Promise<void>((resolve, reject) => {
              s.onload = () => resolve();
              s.onerror = reject;
              document.head.appendChild(s);
            });
            (window as unknown as { pdfjsLib: { GlobalWorkerOptions: { workerSrc: string } } }).pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
          }
          const lib = (window as unknown as { pdfjsLib: { getDocument: (opts: { data: ArrayBuffer }) => Promise<{ getPage: (n: number) => Promise<{ getViewport: (opts: { scale: number }) => { width: number; height: number }; render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => Promise<void> }> }> } }).pdfjsLib;
          const buf = await file.arrayBuffer();
          const pdf = await lib.getDocument({ data: buf });
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = canvasRef.current;
          if (!canvas) throw new Error("No canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("No context");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport });
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const jsQR = (window as unknown as { jsQR: (data: Uint8ClampedArray, w: number, h: number, opts?: { inversionAttempts: string }) => { data: string } | null }).jsQR;
          const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
          if (result?.data) {
            const nv = extractNoValidasi(result.data);
            if (nv) {
              await validateQr(nv);
              e.target.value = "";
              return;
            }
          }
        } else if (file.type.startsWith("image/")) {
          const img = new Image();
          const url = URL.createObjectURL(file);
          try {
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = reject;
              img.src = url;
            });
            const canvas = canvasRef.current;
            if (!canvas) throw new Error("No canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("No context");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const jsQR = (window as unknown as { jsQR: (data: Uint8ClampedArray, w: number, h: number, opts?: { inversionAttempts: string }) => { data: string } | null }).jsQR;
            const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
            if (result?.data) {
              const nv = extractNoValidasi(result.data);
              if (nv) {
                await validateQr(nv);
                e.target.value = "";
                return;
              }
            }
          } finally {
            URL.revokeObjectURL(url);
          }
        } else {
          setResultType("error");
          setResultTitle("Format Tidak Didukung");
          setResultMessage("Pilih gambar (PNG/JPG) atau PDF.");
          setResultVisible(true);
          e.target.value = "";
          return;
        }
        setResultType("error");
        setResultTitle("QR Tidak Ditemukan");
        setResultMessage("Tidak ditemukan QR Code valid pada dokumen.");
        setResultVisible(true);
      } catch (err) {
        console.error(err);
        setResultType("error");
        setResultTitle("Gagal Memproses");
        setResultMessage("Pastikan QR Code terlihat jelas pada dokumen.");
        setResultVisible(true);
      } finally {
        setFileLoading(false);
        e.target.value = "";
      }
    },
    [loadJsQR, validateQr]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      const ext = (file.name.split(".").pop() ?? "").toLowerCase();
      const valid = ext === "pdf" || file.type === "application/pdf" || file.type.startsWith("image/");
      if (valid) {
        const synthetic = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(synthetic);
      } else {
        setResultType("error");
        setResultTitle("Format Tidak Didukung");
        setResultMessage("Pilih gambar (PNG/JPG) atau PDF.");
        setResultVisible(true);
      }
    },
    [handleFileChange]
  );

  const renderInfoSection = (title: string, data: Record<string, unknown>) => (
    <div className="validasi-qr-info-section" key={title}>
      <h4>{title}</h4>
      {Object.entries(data).map(
        ([key, value]) =>
          value !== null && value !== undefined && value !== "" && (
            <div className="validasi-qr-info-item" key={key}>
              <span className="validasi-qr-info-label">{formatLabel(key)}</span>
              <span className="validasi-qr-info-value">{formatValue(value)}</span>
            </div>
          )
      )}
    </div>
  );

  return (
    <div className="validasi-qr-page">
      <header className="validasi-qr-header">
        <div className="validasi-qr-logo" onClick={() => router.push("/")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && router.push("/")}>
          E-BPHTB
        </div>
        <div className="validasi-qr-nav-buttons">
          <button type="button" className="validasi-qr-btn validasi-qr-btn-back" onClick={() => router.push("/")}>
            Kembali
          </button>
          <Link href="/login" className="validasi-qr-btn validasi-qr-btn-login">
            Masuk
          </Link>
        </div>
      </header>

      <div className="validasi-qr-container">
        <div className="validasi-qr-page-title">
          <h1>🔍 Validasi Keaslian Dokumen</h1>
          <p>Pastikan dokumen BPHTB Anda asli dan terverifikasi</p>
        </div>

        {/* Card: Scan QR */}
        <div className="validasi-qr-card">
          <div className="validasi-qr-card-header">
            <h2>📷 Scan QR Code</h2>
          </div>
          <div className="validasi-qr-card-body">
            <video ref={videoRef} className="validasi-qr-video" playsInline style={{ display: scanning ? "block" : "none" }} />
            <div className="validasi-qr-scan-controls">
              <button type="button" className="validasi-qr-btn-scan" onClick={startScan} disabled={scanning}>
                Mulai Scan
              </button>
              <button type="button" className="validasi-qr-btn-scan validasi-qr-btn-stop" onClick={stopScan} disabled={!scanning}>
                Hentikan
              </button>
            </div>
            <p className="validasi-qr-hint">Arahkan kamera ke QR Code pada dokumen Anda</p>
          </div>
        </div>

        {/* Card: Hasil Validasi */}
        {resultVisible && (
          <div className="validasi-qr-card" ref={resultCardRef}>
            <div className="validasi-qr-card-header">
              <h2>📋 Hasil Validasi</h2>
            </div>
            <div className="validasi-qr-card-body">
              {loading && (
                <div className="validasi-qr-loading">
                  <div className="validasi-qr-spinner" />
                  <p>Memvalidasi dokumen...</p>
                </div>
              )}
              {!loading && (
                <div className={`validasi-qr-result ${resultType === "error" ? "validasi-qr-result-error" : "validasi-qr-result-success"}`}>
                  <div className="validasi-qr-result-header">
                    <span className="validasi-qr-result-icon">{resultType === "error" ? "❌" : "✅"}</span>
                    <h3 className="validasi-qr-result-title">{resultTitle}</h3>
                  </div>
                  <div className="validasi-qr-result-message">{resultMessage}</div>
                  {resultData && (
                    <div className="validasi-qr-info-grid">
                      {resultData.document_info && renderInfoSection("Informasi Dokumen", resultData.document_info)}
                      {resultData.ppat_info && renderInfoSection("Informasi PPAT", resultData.ppat_info)}
                      {resultData.pejabat_info && renderInfoSection("Informasi Pejabat", resultData.pejabat_info)}
                      {resultData.authenticity && renderInfoSection("Informasi Keaslian", resultData.authenticity)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card: Upload */}
        <div className="validasi-qr-card">
          <div className="validasi-qr-card-header">
            <h2>📄 Upload Dokumen</h2>
          </div>
          <div className="validasi-qr-card-body">
            <div
              className={`validasi-qr-file-upload ${dragOver ? "validasi-qr-drag-over" : ""}`}
              onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                id="validasi-qr-file"
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="validasi-qr-file">
                <div className="validasi-qr-upload-icon">📤</div>
                <div>Klik atau seret file ke sini untuk upload (PDF atau Gambar)</div>
                <div className="validasi-qr-upload-hint">PNG, JPG, atau PDF</div>
              </label>
            </div>
            {fileLoading && (
              <div className="validasi-qr-loading">
                <div className="validasi-qr-spinner" />
                <p>Memproses dokumen...</p>
              </div>
            )}
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} aria-hidden />
      </div>

      <footer className="validasi-qr-footer">© 2025 Pemerintah Kabupaten Bogor – BAPPENDA</footer>
    </div>
  );
}
