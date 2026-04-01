"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { getApiBase } from "../../../../../lib/api";

// Divisi Karyawan (5): LTB, LSB, Admin, Peneliti, Peneliti Validasi
const DIVISI_KARYAWAN: Record<string, string> = {
  LTB: "LTB",
  LSB: "LSB",
  A: "Admin",
  P: "Peneliti",
  PV: "Peneliti Validasi",
  CS: "Customer Service"
};

// Divisi PU (3): PPAT, PPATS, NOTARIS
const DIVISI_PU: Record<string, string> = {
  PAT: "PPAT",
  PATS: "PPATS",
  NOTARIS: "NOTARIS",
};

// Map lengkap untuk lookup label
const DIVISI_OPTIONS: Record<string, string> = {
  ...DIVISI_KARYAWAN,
  ...DIVISI_PU,
};

interface PendingUser {
  id: number;
  nama: string;
  email: string;
  nik: string;
  telepon: string;
  userid: string | null;
  divisi: string | null;
  ppat_khusus: string | null;
  gender?: string | null;
  verse?: string | null;
  special_field?: string | null;
  pejabat_umum?: string | null;
  npwp_badan?: string | null;
  nib?: string | null;
  nib_doc_path?: string | null;
}

const PAGE_SIZE = 10;
const PU_CODE_BY_LABEL: Record<string, string> = {
  PPAT: "PAT",
  PPATS: "PATS",
  NOTARIS: "NOTARIS",
};

export default function AdminDataUserPendingPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [activeAssignId, setActiveAssignId] = useState<number | null>(null);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedNama, setSelectedNama] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [assignTipe, setAssignTipe] = useState<"karyawan" | "pu" | "wp">("karyawan");
  const [selectedPending, setSelectedPending] = useState<PendingUser | null>(null);
  const [divisiCode, setDivisiCode] = useState("-");
  const [generatedUserid, setGeneratedUserid] = useState("");
  const [generatedDivisi, setGeneratedDivisi] = useState("");
  const [ppatKhusus, setPpatKhusus] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [ktpPreviewData, setKtpPreviewData] = useState<Record<string, unknown> | null>(null);
  const [ktpLoading, setKtpLoading] = useState(false);
  const [ktpError, setKtpError] = useState<string | null>(null);

  const [wpActionId, setWpActionId] = useState<number | null>(null);
  const [wpActionError, setWpActionError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingUser | null>(null);

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users/pending", { credentials: "include" });
      if (!res.ok) throw new Error("Gagal memuat data pengguna");
      const data = await res.json();
      setPendingUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const divisiOptions = DIVISI_KARYAWAN;

  // Filter dulu per kategori agar data WP Badan tidak "hilang" karena slicing campuran.
  const karyawanAll = pendingUsers.filter((u) => (u.verse ?? "").toLowerCase() === "karyawan");
  const puAll = pendingUsers.filter((u) => (u.verse ?? "").toUpperCase() === "PU");
  const wpBadanAll = pendingUsers.filter((u) => {
    const verse = (u.verse ?? "").toUpperCase();
    const div = (u.divisi ?? "").toLowerCase();
    return verse === "WP" && div.includes("wajib pajak b");
  });
  const totalPages = Math.max(1, Math.ceil(pendingUsers.length / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const karyawanRows = karyawanAll.slice(startIdx, startIdx + PAGE_SIZE);
  const puRows = puAll.slice(startIdx, startIdx + PAGE_SIZE);
  const wpBadanRows = wpBadanAll.slice(startIdx, startIdx + PAGE_SIZE);

  const nibDocUrl = (u: PendingUser): string | null => {
    const raw = (u.nib_doc_path ?? "").trim();
    if (!raw) return null;
    if (raw.startsWith("/api/")) return `${getApiBase()}${raw}`;
    const base = raw.split("/").filter(Boolean).slice(-1)[0];
    if (!base) return null;
    return `${getApiBase()}/api/uploads/nib/${encodeURIComponent(base)}`;
  };

  const rejectPending = async (id: number) => {
    setWpActionError(null);
    setWpActionId(id);
    try {
      const res = await fetch(`${getApiBase()}/api/users/wp-badan/${id}/reject`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "Gagal menolak data pending");
      }
      if (activeAssignId === id) setActiveAssignId(null);
      setRejectTarget(null);
      await loadPending();
    } catch (e) {
      setWpActionError(e instanceof Error ? e.message : "Gagal menolak");
    } finally {
      setWpActionId(null);
    }
  };

  const renderTable = (tipe: "karyawan" | "pu") => {
    const rows = tipe === "karyawan" ? karyawanRows : puRows;
    return (
    <div
      key={tipe}
      style={{
        flex: 1,
        minWidth: 0,
        overflowX: "auto",
        background: "#1b263b",
        borderRadius: 8,
        border: "1px solid rgba(65,90,119,0.3)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(65,90,119,0.5)" }}>
            {tipe === "karyawan" ? (
              <>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>NIK</th>
                <th style={thStyle}>Aksi</th>
              </>
            ) : (
              <>
                <th style={thStyle}>NIK</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Special Field</th>
                <th style={thStyle}>Aksi</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => {
            const expanded = activeAssignId === u.id && assignTipe === tipe;
            return (
              <Fragment key={`row-wrap-${u.id}`}>
                <tr
                  key={u.id}
                  style={{ borderBottom: expanded ? "none" : "1px solid rgba(65,90,119,0.2)" }}
                >
                  {tipe === "karyawan" ? (
                    <>
                      <td style={tdStyle}>{u.email}</td>
                      <td style={tdStyle}>{u.nik}</td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => openAssign(u, tipe)}
                          style={{
                            padding: "6px 12px",
                            background: expanded ? "#1d4ed8" : "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          {expanded ? "Tutup Assign" : "Assign ID"}
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={tdStyle}>{u.nik}</td>
                      <td style={tdStyle}>{u.email}</td>
                      <td style={tdStyle}>{u.special_field ?? "—"}</td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => openAssign(u, tipe)}
                          style={{
                            padding: "6px 12px",
                            background: expanded ? "#1d4ed8" : "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          {expanded ? "Tutup Assign" : "Assign ID"}
                        </button>
                      </td>
                    </>
                  )}
                </tr>

                {expanded && (
                  <tr key={`assign-${u.id}`} style={{ borderBottom: "1px solid rgba(65,90,119,0.2)" }}>
                    <td style={tdStyle} colSpan={tipe === "karyawan" ? 3 : 4}>
                      <div
                        style={{
                          background: "#0d1b2a",
                          border: "1px solid rgba(65,90,119,0.45)",
                          borderRadius: 8,
                          padding: 12,
                          display: "grid",
                          gap: 10,
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <strong style={{ color: "#e2e8f0" }}>{u.nama}</strong>
                          <span style={{ color: "#94a3b8" }}>{u.email}</span>
                          <button
                            type="button"
                            onClick={loadKtpPreview}
                            disabled={ktpLoading}
                            style={{
                              marginLeft: "auto",
                              padding: "6px 10px",
                              background: ktpLoading ? "#6b7280" : "#3b82f6",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              cursor: ktpLoading ? "wait" : "pointer",
                            }}
                          >
                            {ktpLoading ? "Memuat KTP..." : "Preview KTP"}
                          </button>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          {tipe === "karyawan" ? (
                            <select
                              value={divisiCode}
                              onChange={(e) => setDivisiCode(e.target.value)}
                              style={{
                                padding: "8px 10px",
                                borderRadius: 6,
                                border: "1px solid rgba(255,255,255,0.3)",
                                background: "#1b263b",
                                color: "#e2e8f0",
                                minWidth: 180,
                              }}
                            >
                              <option value="-">Pilih Divisi</option>
                              {Object.entries(divisiOptions).map(([code, name]) => (
                                <option key={code} value={code}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span style={{ color: "#cbd5e1", fontWeight: 600 }}>
                              Status: {u.pejabat_umum ?? "PU"}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !generatedUserid}
                            style={{
                              padding: "8px 14px",
                              background: saving || !generatedUserid ? "#6b7280" : "#10b981",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              cursor: saving || !generatedUserid ? "not-allowed" : "pointer",
                            }}
                          >
                            {saving ? "Menyimpan..." : "Simpan Assign"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveAssignId(null)}
                            style={{
                              padding: "8px 14px",
                              background: "rgba(255,255,255,0.1)",
                              color: "#e2e8f0",
                              border: "1px solid rgba(255,255,255,0.3)",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectTarget(u)}
                            style={{
                              padding: "8px 14px",
                              background: "#dc2626",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          >
                            Tolak
                          </button>
                        </div>

                        {generatedUserid && (
                          <p style={{ margin: 0, color: "#cbd5e1" }}>
                            UserID: <strong>{generatedUserid}</strong> | Divisi: <strong>{generatedDivisi}</strong>
                            {(divisiCode === "PAT" || divisiCode === "PATS") && ppatKhusus ? ` | PPAT Khusus: ${ppatKhusus}` : ""}
                          </p>
                        )}
                        {saveError && <p style={{ margin: 0, color: "#fca5a5" }}>{saveError}</p>}
                        {ktpError && <p style={{ margin: 0, color: "#fca5a5" }}>{ktpError}</p>}
                        {ktpPreviewData && (
                          <pre
                            style={{
                              margin: 0,
                              padding: 10,
                              borderRadius: 6,
                              background: "#111827",
                              color: "#93c5fd",
                              maxHeight: 240,
                              overflow: "auto",
                              fontSize: 12,
                            }}
                          >
                            {JSON.stringify(ktpPreviewData, null, 2)}
                          </pre>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
    );
  };

  const openAssign = (u: PendingUser, tipe: "karyawan" | "pu") => {
    const isSameRow = activeAssignId === u.id && assignTipe === tipe;
    if (isSameRow) {
      setActiveAssignId(null);
      return;
    }
    setSelectedEmail(u.email);
    setSelectedNama(u.nama);
    setSelectedId(u.id);
    setSelectedPending(u);
    setAssignTipe(tipe);
    setActiveAssignId(u.id);
    if (tipe === "pu") {
      const puLabel = (u.pejabat_umum ?? "").toUpperCase();
      setDivisiCode(PU_CODE_BY_LABEL[puLabel] ?? "NOTARIS");
    } else {
      setDivisiCode("-");
    }
    setGeneratedUserid("");
    setGeneratedDivisi("");
    setPpatKhusus("");
    setSaveError(null);
    setKtpPreviewData(null);
    setKtpError(null);
  };

  const generateUserid = useCallback(async () => {
    if (divisiCode === "-") return;
    setSaveError(null);
    try {
      const res = await fetch(`${getApiBase()}/api/users/generate-userid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ divisi: divisiCode }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Gagal generate ID");
      setGeneratedUserid(data.newUserID || "");
      setGeneratedDivisi(divisiCode === "WP" ? "Wajib Pajak B" : (data.divisi || DIVISI_OPTIONS[divisiCode] || ""));
      setPpatKhusus(data.ppat_khusus ?? "");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Gagal generate ID");
    }
  }, [divisiCode]);

  useEffect(() => {
    if (assignTipe === "wp" && selectedPending?.userid?.trim()) {
      setGeneratedUserid(selectedPending.userid.trim());
      setGeneratedDivisi("Wajib Pajak B");
      setPpatKhusus("");
      return;
    }
    if (divisiCode !== "-") generateUserid();
    else {
      setGeneratedUserid("");
      setGeneratedDivisi("");
      setPpatKhusus("");
    }
  }, [assignTipe, divisiCode, generateUserid, selectedPending]);

  const openAssignWp = (u: PendingUser) => {
    const isSameRow = activeAssignId === u.id && assignTipe === "wp";
    if (isSameRow) {
      setActiveAssignId(null);
      return;
    }
    setSelectedEmail(u.email);
    setSelectedNama(u.nama);
    setSelectedId(u.id);
    setSelectedPending(u);
    setAssignTipe("wp");
    setActiveAssignId(u.id);
    setDivisiCode("WP");
    setGeneratedUserid((u.userid ?? "").trim());
    setGeneratedDivisi("Wajib Pajak B");
    setPpatKhusus("");
    setSaveError(null);
    setKtpPreviewData(null);
    setKtpError(null);
  };

  const handleSave = async () => {
    if (!generatedUserid || !generatedDivisi) {
      setSaveError("Pilih divisi dan tunggu UserID ter-generate.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payloadDivisi = assignTipe === "wp" ? "WP" : divisiCode;
      const res = await fetch(`${getApiBase()}/api/users/assign-userid-and-divisi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedEmail,
          nama: selectedNama,
          user_email: selectedEmail,
          divisi: payloadDivisi,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan");
      if (data.status !== "success")
        throw new Error(data.message || "Respon server tidak valid");
      setActiveAssignId(null);
      setSelectedPending(null);
      loadPending();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const loadKtpPreview = useCallback(async () => {
    if (selectedId == null) return;
    setKtpLoading(true);
    setKtpError(null);
    setKtpPreviewData(null);
    try {
      const res = await fetch(
        `/api/admin/ktp-preview/${selectedId}?t=${Date.now()}`,
        { credentials: "include", headers: { Accept: "application/json" } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = data?.data?.message || data?.message || `HTTP ${res.status}`;
        throw new Error(typeof err === "string" ? err : "Gagal memuat data KTP");
      }
      if (!data.success) throw new Error("Data KTP tidak ditemukan");
      setKtpPreviewData((data.data ?? data) as Record<string, unknown>);
    } catch (e) {
      setKtpError(e instanceof Error ? e.message : "Gagal memuat data KTP");
    } finally {
      setKtpLoading(false);
    }
  }, [selectedId]);

  return (
    <div>
      <h1 style={{ color: "var(--color_font_main)", margin: "0 0 0.5rem" }}>
        Verifikasi Data User (Pending)
      </h1>
      <p style={{ color: "var(--color_font_main_muted)", margin: "0 0 1rem" }}>
        User yang menunggu tindakan admin (assign untuk Karyawan/PU, approve/reject untuk WP Badan Usaha)
      </p>

      {error && (
        <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>
      )}

      {loading ? (
        <p style={{ color: "var(--color_font_main_muted)" }}>Memuat...</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            <div>
              <h3 style={{ color: "var(--color_font_main)", margin: "0 0 8px", fontSize: 15 }}>
                WP — Badan Usaha
              </h3>
              {wpActionError && (
                <p style={{ color: "#dc2626", margin: "0 0 8px" }}>{wpActionError}</p>
              )}
              <div
                style={{
                  minWidth: 0,
                  overflowX: "auto",
                  background: "#1b263b",
                  borderRadius: 8,
                  border: "1px solid rgba(65,90,119,0.3)",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(65,90,119,0.5)" }}>
                      <th style={thStyle}>Nama</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>NIK (PJ)</th>
                      <th style={thStyle}>NPWP Badan</th>
                      <th style={thStyle}>NIB</th>
                      <th style={thStyle}>Dokumen</th>
                      <th style={thStyle}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wpBadanRows.length === 0 ? (
                      <tr>
                        <td style={tdStyle} colSpan={7}>
                          Tidak ada pending WP Badan Usaha pada halaman ini.
                        </td>
                      </tr>
                    ) : (
                      wpBadanRows.map((u) => {
                        const url = nibDocUrl(u);
                        const expanded = activeAssignId === u.id && assignTipe === "wp";
                        return (
                          <Fragment key={`wp-row-${u.id}`}>
                            <tr
                              style={{
                                borderBottom: expanded ? "none" : "1px solid rgba(65,90,119,0.2)",
                                cursor: "pointer",
                              }}
                              onClick={() => openAssignWp(u)}
                            >
                              <td style={tdStyle}>{u.nama}</td>
                              <td style={tdStyle}>{u.email}</td>
                              <td style={tdStyle}>{u.nik}</td>
                              <td style={tdStyle}>{u.npwp_badan ?? "—"}</td>
                              <td style={tdStyle}>{u.nib ?? "—"}</td>
                              <td style={tdStyle}>
                                {url ? (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: "#93c5fd", textDecoration: "underline", fontWeight: 600 }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Lihat PDF
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td style={tdStyle}>{expanded ? "Detail terbuka" : "Klik baris"}</td>
                            </tr>

                            {expanded && (
                              <tr style={{ borderBottom: "1px solid rgba(65,90,119,0.2)" }}>
                                <td style={tdStyle} colSpan={7}>
                                  <div
                                    style={{
                                      background: "#0d1b2a",
                                      border: "1px solid rgba(65,90,119,0.45)",
                                      borderRadius: 8,
                                      padding: 12,
                                      display: "grid",
                                      gap: 10,
                                    }}
                                  >
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                      <strong style={{ color: "#e2e8f0" }}>{u.nama}</strong>
                                      <span style={{ color: "#94a3b8" }}>{u.email}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          loadKtpPreview();
                                        }}
                                        disabled={ktpLoading}
                                        style={{
                                          marginLeft: "auto",
                                          padding: "6px 10px",
                                          background: ktpLoading ? "#6b7280" : "#3b82f6",
                                          color: "#fff",
                                          border: "none",
                                          borderRadius: 6,
                                          cursor: ktpLoading ? "wait" : "pointer",
                                        }}
                                      >
                                        {ktpLoading ? "Memuat KTP..." : "Preview KTP"}
                                      </button>
                                    </div>
                                    <p style={{ margin: 0, color: "#cbd5e1" }}>
                                      Divisi: <strong>Wajib Pajak B</strong> | UserID: <strong>{generatedUserid || "(otomatis saat assign)"}</strong>
                                    </p>
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                      <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving}
                                        style={{
                                          padding: "8px 14px",
                                          background: saving ? "#6b7280" : "#10b981",
                                          color: "#fff",
                                          border: "none",
                                          borderRadius: 6,
                                          cursor: saving ? "not-allowed" : "pointer",
                                        }}
                                      >
                                        {saving ? "Memproses..." : "Simpan Assign"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setActiveAssignId(null)}
                                        style={{
                                          padding: "8px 14px",
                                          background: "rgba(255,255,255,0.1)",
                                          color: "#e2e8f0",
                                          border: "1px solid rgba(255,255,255,0.3)",
                                          borderRadius: 6,
                                          cursor: "pointer",
                                        }}
                                      >
                                        Batal
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setRejectTarget(u)}
                                        style={{
                                          padding: "8px 14px",
                                          background: "#dc2626",
                                          color: "#fff",
                                          border: "none",
                                          borderRadius: 6,
                                          cursor: "pointer",
                                        }}
                                      >
                                        Tolak
                                      </button>
                                    </div>
                                    {saveError && <p style={{ margin: 0, color: "#fca5a5" }}>{saveError}</p>}
                                    {ktpError && <p style={{ margin: 0, color: "#fca5a5" }}>{ktpError}</p>}
                                    {ktpPreviewData && (
                                      <pre
                                        style={{
                                          margin: 0,
                                          padding: 10,
                                          borderRadius: 6,
                                          background: "#111827",
                                          color: "#93c5fd",
                                          maxHeight: 240,
                                          overflow: "auto",
                                          fontSize: 12,
                                        }}
                                      >
                                        {JSON.stringify(ktpPreviewData, null, 2)}
                                      </pre>
                                    )}
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
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <h3 style={{ color: "var(--color_font_main)", margin: "0 0 8px", fontSize: 15 }}>
                  Karyawan
                </h3>
                {renderTable("karyawan")}
              </div>
              <div>
                <h3 style={{ color: "var(--color_font_main)", margin: "0 0 8px", fontSize: 15 }}>
                  PU
                </h3>
                {renderTable("pu")}
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(1)}
                style={pageBtnStyle}
              >
                «
              </button>
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                style={pageBtnStyle}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    style={{
                      ...pageBtnStyle,
                      ...(p === page ? { background: "var(--accent)", color: "#fff" } : {}),
                    }}
                  >
                    {p}
                  </button>
                ))}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                style={pageBtnStyle}
              >
                »
              </button>
            </div>
          )}
        </>
      )}
      {rejectTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,0.75)",
            zIndex: 2000,
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "#0f172a",
              border: "1px solid rgba(239,68,68,0.45)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h3 style={{ color: "#fecaca", margin: "0 0 8px" }}>Yakin menghapus user secara permanen?</h3>
            <p style={{ color: "#e2e8f0", margin: "0 0 14px" }}>
              Data pending <strong>{rejectTarget.nama}</strong> ({rejectTarget.email}) akan dihapus dari database.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                style={{
                  padding: "8px 14px",
                  background: "rgba(255,255,255,0.1)",
                  color: "#e2e8f0",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => rejectPending(rejectTarget.id)}
                style={{
                  padding: "8px 14px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Ya, Hapus Permanen
              </button>
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
