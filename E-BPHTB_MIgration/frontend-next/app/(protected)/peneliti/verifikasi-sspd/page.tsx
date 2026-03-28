"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import Link from "next/link";
import { getApiBase } from "../../../../lib/api";

interface VerifikasiItem {
  nobooking?: string;
  no_registrasi?: string;
  noppbb?: string;
  namawajibpajak?: string;
  namapemilikobjekpajak?: string;
  creator_userid?: string;
  userid?: string;
  pemilihan?: string;
  nomorstpd?: string;
  tanggalstpd?: string;
  angkapersen?: string;
  keterangandihitungsendiri?: string;
  isiketeranganlainnya?: string;
  persetujuan?: string;
  locked_by_user_id?: string;
  locked_by_nama?: string;
  locked_at?: string;
  verified_at?: string;
  verified_by?: string;
  verified_by_nama?: string;
  pemverifikasi?: string;
  pemverifikasi_nama?: string;
  pemparaf?: string;
  pemparaf_nama?: string;
  akta_tanah_path?: string;
  sertifikat_tanah_path?: string;
  pelengkap_path?: string;
  trackstatus?: string;
  status?: string;
  alamatwajibpajak?: string;
  alamatpemilikobjekpajak?: string;
  assigned_to?: string | null;
  assignment_status?: string | null;
  last_edited_by?: string | null;
  peneliti_edited_fields?: Record<string, boolean> | string;
  [key: string]: unknown;
}

interface ApiResponse {
  success: boolean;
  data?: VerifikasiItem[];
  message?: string;
}

const PAGE_SIZE = 10;

const tableScrollStyle: React.CSSProperties = {
  overflowX: "auto",
  width: "100%",
  marginTop: 20,
};
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "var(--card_bg)",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  minWidth: 800,
};
const thStyle: React.CSSProperties = {
  padding: "14px 12px",
  textAlign: "center",
  fontWeight: 600,
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: "linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)",
  color: "#fff",
  border: "none",
};
const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid var(--border_color)",
  fontSize: 14,
  color: "var(--color_font_main)",
  verticalAlign: "middle",
};

const sectionCardStyle: React.CSSProperties = {
  border: "1px solid var(--border_color)",
  borderRadius: 10,
  padding: 12,
  background: "var(--card_bg)",
};

const lightSurfaceText: React.CSSProperties = {
  color: "#111827",
};

const lightButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--border_color)",
  background: "#f3f4f6",
  color: "#111827",
  fontWeight: 600,
  cursor: "pointer",
};

const inputReadableStyle: React.CSSProperties = {
  background: "#ffffff",
  color: "#111827",
  border: "1px solid var(--border_color)",
  borderRadius: 8,
};

export default function PenelitiVerifikasiSspdPage() {
  const showVal = (v: unknown) => {
    const s = String(v ?? "").trim();
    return s === "" ? "-" : s;
  };
  const toWibText = (v: unknown) => {
    const raw = String(v ?? "").trim();
    if (!raw) return "-";
    if (raw.includes("WIB")) return raw;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d).replace(/\./g, ":") + " WIB";
  };

  const resolveFileUrl = (rawPath?: string) => {
    const p = String(rawPath ?? "").trim();
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    const normalized = p.startsWith("/") ? p : `/${p}`;
    return `${getApiBase()}${normalized}`;
  };
  const [data, setData] = useState<VerifikasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayData, setOverlayData] = useState<Record<string, unknown> | null>(null);
  const [myUserid, setMyUserid] = useState<string>("");
  const [hasSignature, setHasSignature] = useState<boolean>(true);
  const [verificationForms, setVerificationForms] = useState<Record<string, {
    pemilihan: string;
    nomorstpd: string;
    tanggalstpd: string;
    angkapersen: string;
    keterangandihitungSendiri: string;
    isiketeranganlainnya: string;
    catatan_peneliti: string;
    persetujuanVerif: boolean;
  }>>({});

  type BookingDraft = {
    namawajibpajak: string;
    alamatwajibpajak: string;
    namapemilikobjekpajak: string;
    alamatpemilikobjekpajak: string;
    noppbb: string;
  };
  const [bookingDrafts, setBookingDrafts] = useState<Record<string, BookingDraft>>({});

  const parseEditedFields = (r: VerifikasiItem): Record<string, boolean> => {
    const raw = r.peneliti_edited_fields;
    if (!raw) return {};
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as Record<string, boolean>;
      } catch {
        return {};
      }
    }
    return raw as Record<string, boolean>;
  };

  const isBookingEditable = (r: VerifikasiItem) =>
    String(r.trackstatus ?? "") === "Dilanjutkan" && String(r.status ?? "") === "Diajukan";

  const needsClaim = (r: VerifikasiItem) => {
    const a = String(r.assigned_to ?? "").trim();
    return !a;
  };

  const canEditBooking = (r: VerifikasiItem) =>
    isBookingEditable(r) && !needsClaim(r) && String(r.assigned_to ?? "").trim() === myUserid.trim();

  const rowKey = (r: VerifikasiItem) => `${String(r.nobooking ?? "")}::${String(r.no_registrasi ?? "")}`;
  const mergeIncremental = (existing: VerifikasiItem[], incoming: VerifikasiItem[]) => {
    const byKey = new Map(existing.map((r) => [rowKey(r), r]));
    for (const r of incoming) byKey.set(rowKey(r), { ...(byKey.get(rowKey(r)) ?? {}), ...r });
    return Array.from(byKey.values());
  };

  const load = useCallback(async (options?: { silent?: boolean; appendOnly?: boolean }) => {
    const silent = !!options?.silent;
    const appendOnly = !!options?.appendOnly;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await fetch(`${getApiBase()}/api/peneliti_get-berkas-fromltb`, { credentials: "include" });
      const json: ApiResponse = await res.json().catch(() => ({ success: false }));
      if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
      if (!json.success) throw new Error(json.message || "Gagal memuat data");
      const incoming = Array.isArray(json.data) ? json.data : [];
      if (appendOnly) setData((prev) => mergeIncremental(prev, incoming));
      else setData(incoming);
    } catch (e) {
      if (!silent) {
        setError(e instanceof Error ? e.message : "Gagal memuat data");
        setData([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch(`${getApiBase()}/api/v1/auth/profile`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        const uid = String(j?.user?.userid ?? "");
        const signPath = String(j?.user?.tanda_tangan_path ?? "");
        const signMime = String(j?.user?.tanda_tangan_mime ?? "");
        setMyUserid(uid);
        setHasSignature(!!signPath.trim() && !!signMime.trim());
      })
      .catch(() => {
        setHasSignature(false);
      });
  }, []);

  useEffect(() => {
    if (!realTimeEnabled) return;
    const t = setInterval(() => load({ silent: true, appendOnly: true }), 10000);
    return () => clearInterval(t);
  }, [realTimeEnabled, load]);

  const filtered = search.trim()
    ? data.filter(
        (r) =>
          String(r.nobooking ?? "").toLowerCase().includes(search.toLowerCase()) ||
          String(r.no_registrasi ?? "").toLowerCase().includes(search.toLowerCase()) ||
          String(r.namawajibpajak ?? "").toLowerCase().includes(search.toLowerCase()) ||
          String(r.noppbb ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : data;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  const sendToParaf = async (nobooking: string) => {
    if (!hasSignature) {
      alert("Anda belum mendaftarkan tanda tangan/paraf di profil. Akses ditolak.");
      return;
    }
    setActionLoading(nobooking);
    try {
      const res = await fetch(`${getApiBase()}/api/peneliti_send-to-paraf`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nobooking }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as ApiResponse).message || "Gagal kirim");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal kirim ke paraf");
    } finally {
      setActionLoading(null);
    }
  };

  const openVerificationForm = (item: VerifikasiItem) => {
    const key = item.nobooking || "";
    if (!key) return;
    setExpandedBooking((prev) => (prev === key ? null : key));
    setVerificationForms((prev) => ({
      ...prev,
      [key]: prev[key] ?? {
        pemilihan: String(item.pemilihan ?? ""),
        nomorstpd: String(item.nomorstpd ?? ""),
        tanggalstpd: String(item.tanggalstpd ?? ""),
        angkapersen: String(item.angkapersen ?? ""),
        keterangandihitungSendiri: String(item.keterangandihitungsendiri ?? ""),
        isiketeranganlainnya: String(item.isiketeranganlainnya ?? ""),
        catatan_peneliti: String((item as any).catatan_peneliti ?? ""),
        persetujuanVerif: String(item.persetujuan ?? "").toLowerCase() === "true",
      },
    }));
  };

  const patchForm = (nobooking: string, patch: Partial<{
    pemilihan: string;
    nomorstpd: string;
    tanggalstpd: string;
    angkapersen: string;
    keterangandihitungSendiri: string;
    isiketeranganlainnya: string;
    catatan_peneliti: string;
    persetujuanVerif: boolean;
  }>) => {
    setVerificationForms((prev) => ({
      ...prev,
      [nobooking]: {
        ...(prev[nobooking] ?? {
          pemilihan: "",
          nomorstpd: "",
          tanggalstpd: "",
          angkapersen: "",
          keterangandihitungSendiri: "",
          isiketeranganlainnya: "",
          catatan_peneliti: "",
          persetujuanVerif: false,
        }),
        ...patch,
      }
    }));
  };

  const saveVerification = async (nobooking: string) => {
    if (!hasSignature) {
      alert("Anda belum mendaftarkan tanda tangan/paraf di profil. Akses ditolak.");
      return;
    }
    const f = verificationForms[nobooking];
    if (!f || !f.pemilihan) {
      alert("Pilih jenis kelengkapan/pemilihan terlebih dahulu.");
      return;
    }
    if (f.pemilihan === "KURANG_BAYAR" && !f.catatan_peneliti.trim()) {
      alert("Catatan Peneliti wajib diisi untuk STPD Kurang Bayar.");
      return;
    }
    setActionLoading(nobooking);
    try {
      const res = await fetch(`${getApiBase()}/api/peneliti_update-berdasarkan-pemilihan`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            nobooking,
            pemilihan: f.pemilihan,
            nomorstpd: f.nomorstpd || null,
            tanggalstpd: f.tanggalstpd || null,
            angkapersen: f.angkapersen || null,
            keterangandihitungSendiri: f.keterangandihitungSendiri || null,
            isiketeranganlainnya: f.isiketeranganlainnya || null,
            catatan_peneliti: f.catatan_peneliti || null,
            persetujuanVerif: f.persetujuanVerif,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as ApiResponse).message || "Gagal simpan verifikasi");
      await load();
      alert("Data verifikasi berhasil disimpan.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal simpan verifikasi");
    } finally {
      setActionLoading(null);
    }
  };

  const lockDocument = async (nobooking: string) => {
    if (!hasSignature) {
      alert("Anda belum mendaftarkan tanda tangan/paraf di profil. Akses ditolak.");
      return;
    }
    const previous = data;
    setData((prev) =>
      prev.map((r) =>
        String(r.nobooking ?? "") === nobooking
          ? { ...r, locked_by_user_id: myUserid, locked_by_nama: myUserid, locked_at: new Date().toISOString() }
          : r
      )
    );
    setActionLoading(nobooking);
    try {
      const res = await fetch(`${getApiBase()}/api/peneliti/lock-document`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nobooking }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as ApiResponse).message || "Gagal mengambil dokumen");
      alert("Dokumen berhasil diambil untuk diperiksa.");
    } catch (e) {
      setData(previous);
      alert(e instanceof Error ? e.message : "Gagal mengambil dokumen");
    } finally {
      setActionLoading(null);
    }
  };

  const openViewDocument = (nobooking: string) => {
    if (!nobooking) return;
    window.open(`${getApiBase()}/api/ppat_generate-pdf-badan/${encodeURIComponent(nobooking)}`, "_blank", "noopener,noreferrer");
  };

  const openCheckDataOverlay = async (item: VerifikasiItem) => {
    const nobooking = String(item.nobooking ?? "").trim();
    if (!nobooking) return;
    const baseData: Record<string, unknown> = {
      nobooking: showVal(item.nobooking),
      no_registrasi: showVal(item.no_registrasi),
      noppbb: showVal(item.noppbb),
      namawajibpajak: showVal(item.namawajibpajak),
      namapemilikobjekpajak: showVal(item.namapemilikobjekpajak),
      creator_userid: showVal(item.creator_userid ?? item.userid),
      pemilihan: showVal(item.pemilihan),
      persetujuan: showVal(item.persetujuan),
      pemverifikasi: showVal(item.pemverifikasi_nama || item.pemverifikasi),
      pemparaf: showVal(item.pemparaf_nama || item.pemparaf),
      riwayat_terakhir_diperiksa:
        item.verified_at
          ? `Terakhir diperiksa oleh ${String(item.verified_by_nama || item.verified_by || "-")} pada ${toWibText(item.verified_at)}`
          : "-",
    };
    setOverlayData(baseData);
    setOverlayOpen(true);
    try {
      const res = await fetch(`${getApiBase()}/api/ppat/booking/${encodeURIComponent(nobooking)}`, { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success && json?.data) {
        const merged = { ...baseData, ...json.data } as Record<string, unknown>;
        delete merged.akta_tanah_path;
        delete merged.sertifikat_tanah_path;
        delete merged.pelengkap_path;
        setOverlayData(merged);
      }
    } catch {
      // Keep fallback data already shown in overlay.
    }
  };

  const claimAssignment = async (nobooking: string) => {
    setActionLoading(nobooking);
    try {
      const res = await fetch(`${getApiBase()}/api/peneliti/claim-assignment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nobooking }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as ApiResponse).message || "Gagal klaim penugasan");
      await load();
      alert("Penugasan berhasil diklaim.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal klaim");
    } finally {
      setActionLoading(null);
    }
  };

  const saveBookingPatch = async (nobooking: string) => {
    const d = bookingDrafts[nobooking];
    if (!d) return;
    setActionLoading(nobooking);
    try {
      const res = await fetch(`${getApiBase()}/api/peneliti/update-booking-fields`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nobooking,
          namawajibpajak: d.namawajibpajak,
          alamatwajibpajak: d.alamatwajibpajak,
          namapemilikobjekpajak: d.namapemilikobjekpajak,
          alamatpemilikobjekpajak: d.alamatpemilikobjekpajak,
          noppbb: d.noppbb,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as ApiResponse).message || "Gagal menyimpan koreksi");
      await load();
      alert("Koreksi data tersimpan.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal simpan");
    } finally {
      setActionLoading(null);
    }
  };

  const pemilihanToCanonical = (raw: string) => {
    const u = String(raw ?? "").trim().toLowerCase();
    if (u === "penghitung_wajib_pajak") return "SESUAI";
    if (u === "stpd_kurangbayar") return "KURANG_BAYAR";
    if (u === "dihitungsendiri") return "DIHITUNG_SENDIRI";
    if (u === "lainnyapenghitungwp") return "LAINNYA";
    return String(raw ?? "").trim();
  };

  useEffect(() => {
    if (!expandedBooking) return;
    const r = data.find((x) => x.nobooking === expandedBooking);
    if (!r) return;
    const nb = String(r.nobooking ?? "");
    setBookingDrafts((prev) => ({
      ...prev,
      [nb]: {
        namawajibpajak: String(r.namawajibpajak ?? ""),
        alamatwajibpajak: String(r.alamatwajibpajak ?? ""),
        namapemilikobjekpajak: String(r.namapemilikobjekpajak ?? ""),
        alamatpemilikobjekpajak: String(r.alamatpemilikobjekpajak ?? ""),
        noppbb: String(r.noppbb ?? ""),
      },
    }));
    setVerificationForms((prev) => {
      if (prev[nb]?.pemilihan) return prev;
      const pem = pemilihanToCanonical(String(r.pemilihan ?? ""));
      return {
        ...prev,
        [nb]: {
          pemilihan: pem,
          nomorstpd: String(r.nomorstpd ?? ""),
          tanggalstpd: String(r.tanggalstpd ?? ""),
          angkapersen: String(r.angkapersen ?? ""),
          keterangandihitungSendiri: String(r.keterangandihitungsendiri ?? ""),
          isiketeranganlainnya: String(r.isiketeranganlainnya ?? ""),
          catatan_peneliti: String((r as { catatan_peneliti?: string }).catatan_peneliti ?? ""),
          persetujuanVerif: String(r.persetujuan ?? "").toLowerCase() === "true",
        },
      };
    });
  }, [expandedBooking, data]);

  const reject = async (nobooking: string) => {
    const confirmReject = window.confirm("Apakah Anda yakin menolak dokumen ini?");
    if (!confirmReject) return;
    const reason = prompt("Masukkan alasan penolakan (singkat):");
    if (!reason?.trim()) return;
    setActionLoading(nobooking);
    try {
      const res = await fetch(`${getApiBase()}/api/peneliti_reject-with-reason`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nobooking, alasan: reason.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as ApiResponse).message || "Gagal tolak");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal tolak");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Verifikasi SSPD</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Cari No. Registrasi, No. Booking, Nama WP, NOP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setPage(1)}
            style={{
              padding: "8px 12px",
              ...inputReadableStyle,
              minWidth: 220,
            }}
          />
          <button
            type="button"
            onClick={() => load()}
            style={{
              padding: "8px 16px",
              ...lightButtonStyle,
            }}
          >
            Muat ulang
          </button>
          <button
            type="button"
            onClick={() => setRealTimeEnabled((v) => !v)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: realTimeEnabled ? "#f59e0b" : "#10b981",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {realTimeEnabled ? "⏸ Pause Real-time" : "▶ Start Real-time"}
          </button>
          <span style={{ fontSize: 12, color: "var(--color_font_muted)", display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: realTimeEnabled ? "#28a745" : "#6c757d",
              }}
            />
            Real-time
          </span>
        </div>
      </div>

      <div
        style={{
          marginBottom: 16,
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid rgba(37, 99, 235, 0.45)",
          background: "rgba(37, 99, 235, 0.08)",
          color: "var(--color_font_main)",
          fontSize: 13,
          lineHeight: 1.55,
        }}
      >
        <strong>Mode: Verifikasi &amp; Edit</strong> — Koreksi data booking (No. Booking tidak diubah) diizinkan hingga{" "}
        <strong>Kirim ke Paraf</strong>. Setelah itu field mengikuti status read-only. Penugasan dari LTB memakai kuota{" "}
        maks. 10 berkas aktif per Peneliti; baris <strong>UNASSIGNED</strong> dapat diklaim.
      </div>

      <div style={tableScrollStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>No</th>
              <th style={thStyle}>No. Registrasi</th>
              <th style={thStyle}>No. Booking</th>
              <th style={thStyle}>NOP PBB</th>
              <th style={thStyle}>Nama WP</th>
              <th style={thStyle}>Pembuat Booking</th>
              <th style={thStyle}>Penugasan</th>
              <th style={thStyle}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "var(--color_font_muted)" }}>
                  Memuat data...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "#ef4444" }}>
                  {error}
                </td>
              </tr>
            ) : slice.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "var(--color_font_muted)" }}>
                  Tidak ada data berkas dari LTB.
                </td>
              </tr>
            ) : (
              slice.map((r, idx) => {
                const lockedBy = String(r.locked_by_user_id ?? "");
                const isLockedByOther = !!lockedBy && !!myUserid && lockedBy !== myUserid;
                const unassigned = needsClaim(r);
                return (
                <Fragment key={r.nobooking ?? String(idx)}>
                  <tr
                    key={`${r.nobooking ?? idx}-main`}
                    style={{ borderBottom: "1px solid var(--border_color)", cursor: "pointer", opacity: isLockedByOther ? 0.65 : 1 }}
                    onClick={() => setExpandedBooking((prev) => (prev === r.nobooking ? null : String(r.nobooking ?? "")))}
                  >
                    <td style={{ ...tdStyle, textAlign: "center" }}>{start + idx + 1}</td>
                    <td style={tdStyle}>{r.no_registrasi ?? "-"}</td>
                    <td style={tdStyle}>{r.nobooking ?? "-"}</td>
                    <td style={tdStyle}>{r.noppbb ?? "-"}</td>
                    <td style={tdStyle}>{r.namawajibpajak ?? "-"}</td>
                    <td style={tdStyle}>{r.creator_userid ?? r.userid ?? "-"}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontSize: 12 }}>
                      {unassigned ? (
                        <span style={{ padding: "4px 8px", borderRadius: 6, background: "#fef3c7", color: "#92400e", fontWeight: 700 }}>UNASSIGNED</span>
                      ) : String(r.assigned_to ?? "").trim() === myUserid.trim() ? (
                        <span style={{ padding: "4px 8px", borderRadius: 6, background: "#d1fae5", color: "#065f46", fontWeight: 700 }}>Saya</span>
                      ) : (
                        <span style={{ padding: "4px 8px", borderRadius: 6, background: "#e5e7eb", color: "#374151" }}>Peneliti lain</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          disabled={!!actionLoading || isLockedByOther || unassigned}
                          onClick={(e) => {
                            e.stopPropagation();
                            sendToParaf(r.nobooking!);
                          }}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "none",
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            color: "white",
                            fontWeight: 600,
                            cursor: actionLoading ? "not-allowed" : "pointer",
                            fontSize: 13,
                          }}
                        >
                          {actionLoading === r.nobooking ? "..." : "Kirim ke Paraf"}
                        </button>
                        {isLockedByOther && (
                          <span style={{ fontSize: 12, color: "#b45309", fontWeight: 600 }}>
                            🔒 Sedang diperiksa oleh {String(r.locked_by_nama || r.locked_by_user_id || "-")}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedBooking === r.nobooking && (
                    <tr key={`${r.nobooking ?? idx}-detail`}>
                      <td colSpan={8} style={{ ...tdStyle, background: "var(--card_bg_grey)" }}>
                        <div style={{ display: "grid", gap: 10 }}>
                          <div style={sectionCardStyle}>
                            <strong style={{ display: "block", marginBottom: 8 }}>Penugasan &amp; koreksi data PU</strong>
                            <p style={{ margin: "0 0 10px", color: "var(--color_font_muted)", fontSize: 13 }}>
                              {needsClaim(r) ? (
                                <>
                                  Baris ini belum ditugaskan ke peneliti tertentu. Klaim untuk mengunci kuota Anda dan mengedit data.
                                </>
                              ) : (
                                <>
                                  Ditugaskan ke: <strong>{String(r.assigned_to ?? "—")}</strong>
                                  {r.last_edited_by ? (
                                    <> — terakhir koreksi: <strong>{r.last_edited_by}</strong></>
                                  ) : null}
                                </>
                              )}
                            </p>
                            {needsClaim(r) && (
                              <button
                                type="button"
                                disabled={!!actionLoading}
                                onClick={() => claimAssignment(String(r.nobooking ?? ""))}
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: 8,
                                  border: "none",
                                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                  color: "white",
                                  fontWeight: 600,
                                  cursor: actionLoading ? "not-allowed" : "pointer",
                                  marginBottom: 10,
                                }}
                              >
                                Klaim penugasan
                              </button>
                            )}
                            {canEditBooking(r) && (
                              <div style={{ display: "grid", gap: 8, maxWidth: 720 }}>
                                {(() => {
                                  const ef = parseEditedFields(r);
                                  const efStyle = (k: string) =>
                                    ef[k]
                                      ? { ...inputReadableStyle, border: "2px solid #f59e0b", boxShadow: "0 0 0 1px rgba(245,158,11,0.35)" }
                                      : inputReadableStyle;
                                  const d = bookingDrafts[String(r.nobooking)] ?? {
                                    namawajibpajak: String(r.namawajibpajak ?? ""),
                                    alamatwajibpajak: String(r.alamatwajibpajak ?? ""),
                                    namapemilikobjekpajak: String(r.namapemilikobjekpajak ?? ""),
                                    alamatpemilikobjekpajak: String(r.alamatpemilikobjekpajak ?? ""),
                                    noppbb: String(r.noppbb ?? ""),
                                  };
                                  const patch = (k: keyof BookingDraft, v: string) => {
                                    const nb = String(r.nobooking ?? "");
                                    setBookingDrafts((prev) => ({
                                      ...prev,
                                      [nb]: { ...d, [k]: v },
                                    }));
                                  };
                                  return (
                                    <>
                                      <label style={{ fontSize: 12, fontWeight: 700 }}>Nama WP (dari PU)</label>
                                      <input
                                        value={d.namawajibpajak}
                                        onChange={(e) => patch("namawajibpajak", e.target.value)}
                                        style={{ padding: "8px 10px", ...efStyle("namawajibpajak") }}
                                      />
                                      <label style={{ fontSize: 12, fontWeight: 700 }}>Alamat WP</label>
                                      <input
                                        value={d.alamatwajibpajak}
                                        onChange={(e) => patch("alamatwajibpajak", e.target.value)}
                                        style={{ padding: "8px 10px", ...efStyle("alamatwajibpajak") }}
                                      />
                                      <label style={{ fontSize: 12, fontWeight: 700 }}>Nama pemilik objek pajak</label>
                                      <input
                                        value={d.namapemilikobjekpajak}
                                        onChange={(e) => patch("namapemilikobjekpajak", e.target.value)}
                                        style={{ padding: "8px 10px", ...efStyle("namapemilikobjekpajak") }}
                                      />
                                      <label style={{ fontSize: 12, fontWeight: 700 }}>Alamat OP</label>
                                      <input
                                        value={d.alamatpemilikobjekpajak}
                                        onChange={(e) => patch("alamatpemilikobjekpajak", e.target.value)}
                                        style={{ padding: "8px 10px", ...efStyle("alamatpemilikobjekpajak") }}
                                      />
                                      <label style={{ fontSize: 12, fontWeight: 700 }}>NOP PBB</label>
                                      <input
                                        value={d.noppbb}
                                        onChange={(e) => patch("noppbb", e.target.value)}
                                        style={{ padding: "8px 10px", ...efStyle("noppbb") }}
                                      />
                                      <button
                                        type="button"
                                        disabled={!!actionLoading || !isBookingEditable(r)}
                                        onClick={() => saveBookingPatch(String(r.nobooking ?? ""))}
                                        style={{
                                          padding: "8px 14px",
                                          borderRadius: 8,
                                          border: "none",
                                          background: "linear-gradient(135deg, #10b981, #059669)",
                                          color: "white",
                                          fontWeight: 600,
                                          cursor: actionLoading ? "not-allowed" : "pointer",
                                          justifySelf: "start",
                                        }}
                                      >
                                        Simpan koreksi data
                                      </button>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                            {!isBookingEditable(r) && (
                              <p style={{ margin: 0, fontSize: 12, color: "#b45309" }}>
                                Koreksi data dinonaktifkan (sudah lewat tahap Verifikasi &amp; Edit / sudah dikirim ke paraf).
                              </p>
                            )}
                          </div>
                          <div style={sectionCardStyle}>
                            <strong style={{ display: "block", marginBottom: 8 }}>Aksi Dokumen</strong>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button
                                type="button"
                                disabled={!!actionLoading || isLockedByOther}
                                onClick={() => lockDocument(String(r.nobooking ?? ""))}
                                style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #4f46e5, #4338ca)", color: "white", fontWeight: 600, cursor: (actionLoading || isLockedByOther) ? "not-allowed" : "pointer" }}
                              >
                                Ambil Dokumen Ini / Mulai Periksa
                              </button>
                              <button
                                type="button"
                                onClick={() => openViewDocument(String(r.nobooking ?? ""))}
                                style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontWeight: 600, cursor: "pointer" }}
                              >
                                View Document
                              </button>
                              <button
                                type="button"
                                onClick={() => openCheckDataOverlay(r)}
                                style={lightButtonStyle}
                              >
                                Check Data Ini
                              </button>
                              <button
                                type="button"
                                disabled={!!actionLoading || isLockedByOther}
                                onClick={() => reject(r.nobooking!)}
                                style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white", fontWeight: 600, cursor: actionLoading ? "not-allowed" : "pointer" }}
                              >
                                Tolak
                              </button>
                            </div>
                          </div>

                          <div style={sectionCardStyle}>
                            <strong style={{ display: "block", marginBottom: 8 }}>Dokumen Pendukung</strong>
                            <div style={{ display: "grid", gap: 8 }}>
                              {[
                                { label: "Akta Tanah", value: String(r.akta_tanah_path ?? "") },
                                { label: "Sertifikat Tanah", value: String(r.sertifikat_tanah_path ?? "") },
                                { label: "Pelengkap", value: String(r.pelengkap_path ?? "") },
                              ].map((doc) => {
                                const url = resolveFileUrl(doc.value);
                                const hasFile = !!String(doc.value).trim();
                                return (
                                  <div key={doc.label} style={{ display: "grid", gridTemplateColumns: "180px 1fr auto", alignItems: "center", gap: 8 }}>
                                    <strong>{doc.label}</strong>
                                    <span style={{ color: "#374151" }}>{showVal(doc.value)}</span>
                                    <button
                                      type="button"
                                      disabled={!hasFile}
                                      onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
                                      style={{
                                        ...lightButtonStyle,
                                        padding: "6px 10px",
                                        opacity: hasFile ? 1 : 0.65,
                                        cursor: hasFile ? "pointer" : "not-allowed",
                                      }}
                                    >
                                      Lihat
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div style={sectionCardStyle}>
                            <strong style={{ display: "block", marginBottom: 8 }}>Card Verifikasi Kelengkapan Data</strong>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                              <select
                                value={verificationForms[r.nobooking || ""]?.pemilihan || ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  patchForm(r.nobooking || "", {
                                    pemilihan: v,
                                    // STPD kurang bayar: nomor/tanggal di-generate backend (kita kosongkan agar tidak membingungkan)
                                    nomorstpd: v === "KURANG_BAYAR" ? "" : (verificationForms[r.nobooking || ""]?.nomorstpd || ""),
                                    tanggalstpd: v === "KURANG_BAYAR" ? "" : (verificationForms[r.nobooking || ""]?.tanggalstpd || ""),
                                  });
                                }}
                                style={{ padding: "8px 10px", ...inputReadableStyle, minWidth: 260 }}
                              >
                                <option value="">Pilih kelengkapan/pemilihan</option>
                                <option value="SESUAI">Sesuai (Penghitungan Wajib Pajak)</option>
                                <option value="KURANG_BAYAR">Tidak Sesuai (STPD Kurang Bayar)</option>
                                <option value="DIHITUNG_SENDIRI">Ada (Pengurangan dihitung sendiri)</option>
                                <option value="LAINNYA">Tidak Ada (Lainnya)</option>
                              </select>
                              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input
                                  type="checkbox"
                                  checked={verificationForms[r.nobooking || ""]?.persetujuanVerif || false}
                                  onChange={(e) => patchForm(r.nobooking || "", { persetujuanVerif: e.target.checked })}
                                />
                                Setujui Paraf
                              </label>
                            </div>
                            {(verificationForms[r.nobooking || ""]?.pemilihan === "KURANG_BAYAR") && (
                              <div style={{ marginTop: 10 }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: "#b45309", marginBottom: 6 }}>
                                  STPD Kurang Bayar terdeteksi — sistem akan membuat kode STPD otomatis (status: PENDING_CORRECTION).
                                </div>
                                <textarea
                                  placeholder="Catatan untuk PU: jelaskan bagian mana yang kurang bayar / yang harus diperbaiki..."
                                  value={verificationForms[r.nobooking || ""]?.catatan_peneliti || ""}
                                  onChange={(e) => patchForm(r.nobooking || "", { catatan_peneliti: e.target.value })}
                                  style={{ width: "100%", minHeight: 80, padding: "10px 12px", ...inputReadableStyle }}
                                />
                              </div>
                            )}
                            {(verificationForms[r.nobooking || ""]?.pemilihan === "DIHITUNG_SENDIRI") && (
                              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                                <input type="number" min={0} max={100} step={0.01} placeholder="Persentase (0-100)" value={verificationForms[r.nobooking || ""]?.angkapersen || ""} onChange={(e) => patchForm(r.nobooking || "", { angkapersen: e.target.value })} style={{ padding: "8px 10px", ...inputReadableStyle }} />
                                <input type="text" placeholder="Keterangan dihitung sendiri" value={verificationForms[r.nobooking || ""]?.keterangandihitungSendiri || ""} onChange={(e) => patchForm(r.nobooking || "", { keterangandihitungSendiri: e.target.value })} style={{ padding: "8px 10px", ...inputReadableStyle, minWidth: 320 }} />
                              </div>
                            )}
                            {(verificationForms[r.nobooking || ""]?.pemilihan === "LAINNYA") && (
                              <input type="text" placeholder="Isi keterangan lainnya..." value={verificationForms[r.nobooking || ""]?.isiketeranganlainnya || ""} onChange={(e) => patchForm(r.nobooking || "", { isiketeranganlainnya: e.target.value })} style={{ padding: "8px 10px", ...inputReadableStyle, minWidth: 320, marginTop: 8 }} />
                            )}
                            <div style={{ marginTop: 10 }}>
                              <button
                                type="button"
                                onClick={() => saveVerification(r.nobooking || "")}
                                disabled={!!actionLoading || isLockedByOther}
                                style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "white", fontWeight: 600, cursor: actionLoading ? "not-allowed" : "pointer" }}
                              >
                                {actionLoading === r.nobooking ? "..." : "Simpan Verifikasi"}
                              </button>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && !loading && (
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
            style={{
              ...lightButtonStyle,
              cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              opacity: currentPage <= 1 ? 0.65 : 1,
            }}
          >
            Prev
          </button>
          <span style={{ color: "var(--color_font_muted)" }}>
            Halaman {currentPage} dari {totalPages} ({filtered.length} data)
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{
              ...lightButtonStyle,
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              opacity: currentPage >= totalPages ? 0.65 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/peneliti" style={{ color: "var(--accent)" }}>
          ← Kembali ke Dashboard Peneliti
        </Link>
      </p>

      {overlayOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70 }}
          onClick={() => setOverlayOpen(false)}
        >
          <div
            style={{ background: "var(--card_bg)", width: "92%", maxWidth: 720, maxHeight: "86vh", overflow: "auto", borderRadius: 12, border: "1px solid var(--border_color)", padding: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Check Data Ini</h3>
            {!overlayData ? (
              <p>Memuat data...</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {Object.entries(overlayData).map(([k, v]) => (
                  <div key={k} style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 8, fontSize: 14 }}>
                    <strong>{k}</strong>
                    <span>{v == null || String(v) === "" ? "-" : String(v)}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setOverlayOpen(false)}
                style={lightButtonStyle}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
