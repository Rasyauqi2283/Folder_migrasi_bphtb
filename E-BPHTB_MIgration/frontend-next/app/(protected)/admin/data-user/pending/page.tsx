"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
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
type CategoryFilter = "all" | "wp" | "karyawan" | "pu";
const GENDER_OPTIONS = ["Laki-laki", "Perempuan"] as const;
const PU_SPECIAL_FIELD_OPTIONS = ["PPAT", "PPATS", "NOTARIS", "LAINNYA"] as const;

function normalizeGenderValue(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (!v) return "";
  if (["l", "lk", "laki", "laki-laki", "laki laki", "pria"].includes(v)) return "Laki-laki";
  if (["p", "pr", "perempuan", "wanita"].includes(v)) return "Perempuan";
  return "";
}

export default function AdminDataUserPendingPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [wpPage, setWpPage] = useState(1);
  const [karyawanPage, setKaryawanPage] = useState(1);
  const [puPage, setPuPage] = useState(1);
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
  const [genderDraft, setGenderDraft] = useState("");
  const [puSpecialFieldDraft, setPuSpecialFieldDraft] = useState("");
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

  const divisiOptions = DIVISI_KARYAWAN;

  const searchLower = searchInput.trim().toLowerCase();
  const searchedUsers = hasSearched
    ? pendingUsers.filter((u) => {
      if (!searchLower) return true;
      const pool = [
        u.nama,
        u.email,
        u.nik,
        u.telepon,
        u.userid ?? "",
        u.divisi ?? "",
        u.special_field ?? "",
        u.pejabat_umum ?? "",
        u.npwp_badan ?? "",
        u.nib ?? "",
      ].join(" ").toLowerCase();
      return pool.includes(searchLower);
    })
    : [];

  const karyawanAll = searchedUsers.filter((u) => (u.verse ?? "").toLowerCase() === "karyawan");
  const puAll = searchedUsers.filter((u) => (u.verse ?? "").toUpperCase() === "PU");
  const wpBadanAll = searchedUsers.filter((u) => {
    const verse = (u.verse ?? "").toUpperCase();
    const div = (u.divisi ?? "").toLowerCase();
    return verse === "WP" && div.includes("wajib pajak b");
  });
  const wpTotalPages = Math.max(1, Math.ceil(wpBadanAll.length / PAGE_SIZE));
  const karyawanTotalPages = Math.max(1, Math.ceil(karyawanAll.length / PAGE_SIZE));
  const puTotalPages = Math.max(1, Math.ceil(puAll.length / PAGE_SIZE));
  const wpStartIdx = (wpPage - 1) * PAGE_SIZE;
  const karyawanStartIdx = (karyawanPage - 1) * PAGE_SIZE;
  const puStartIdx = (puPage - 1) * PAGE_SIZE;
  const wpBadanRows = wpBadanAll.slice(wpStartIdx, wpStartIdx + PAGE_SIZE);
  const karyawanRows = karyawanAll.slice(karyawanStartIdx, karyawanStartIdx + PAGE_SIZE);
  const puRows = puAll.slice(puStartIdx, puStartIdx + PAGE_SIZE);
  const showWp = activeCategory === "all" || activeCategory === "wp";
  const showKaryawan = activeCategory === "all" || activeCategory === "karyawan";
  const showPu = activeCategory === "all" || activeCategory === "pu";

  useEffect(() => {
    setWpPage((p) => Math.min(p, wpTotalPages));
  }, [wpTotalPages]);

  useEffect(() => {
    setKaryawanPage((p) => Math.min(p, karyawanTotalPages));
  }, [karyawanTotalPages]);

  useEffect(() => {
    setPuPage((p) => Math.min(p, puTotalPages));
  }, [puTotalPages]);

  const handleSearch = async () => {
    setHasSearched(true);
    setActiveAssignId(null);
    setWpPage(1);
    setKaryawanPage(1);
    setPuPage(1);
    await loadPending();
  };

  const nibDocUrl = (u: PendingUser): string | null => {
    const raw = (u.nib_doc_path ?? "").trim();
    if (!raw) return null;
    if (raw.startsWith("/api/")) return `${getApiBase()}${raw}`;
    const base = raw.split("/").filter(Boolean).slice(-1)[0];
    if (!base) return null;
    return `${getApiBase()}/api/uploads/nib/${encodeURIComponent(base)}`;
  };

  const genderLabel = (u: PendingUser): string => {
    const gRaw = (u.gender ?? "").trim();
    const gNorm = normalizeGenderValue(gRaw);
    if (gNorm) return gNorm;
    const isWpBadan =
      (u.verse ?? "").toUpperCase() === "WP" &&
      (u.divisi ?? "").toLowerCase().includes("wajib pajak b");
    return isWpBadan ? "Tidak berlaku (WP Badan)" : "Belum diisi";
  };

  const genderSelectValue = (u: PendingUser): string =>
    activeAssignId === u.id ? genderDraft : normalizeGenderValue((u.gender ?? "").trim());

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
                <th style={thStyle}>Gender</th>
                <th style={thStyle}>Aksi</th>
              </>
            ) : (
              <>
                <th style={thStyle}>NIK</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Special Field</th>
                <th style={thStyle}>Gender</th>
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
                        <select value={genderSelectValue(u)} disabled style={compactSelectStyle}>
                          <option value="">Pilih gender</option>
                          {GENDER_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </td>
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
                      <td style={tdStyle}>
                        <select value={activeAssignId === u.id ? puSpecialFieldDraft : (u.special_field ?? "")} disabled style={compactSelectStyle}>
                          <option value="">Pilih special field</option>
                          {PU_SPECIAL_FIELD_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={tdStyle}>
                        <select value={genderSelectValue(u)} disabled style={compactSelectStyle}>
                          <option value="">Pilih gender</option>
                          {GENDER_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </td>
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
                    <td style={tdStyle} colSpan={tipe === "karyawan" ? 4 : 5}>
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
                        <div style={{ background: "#111827", border: "1px solid rgba(148,163,184,0.25)", borderRadius: 8, padding: 10 }}>
                          <h4 style={{ margin: "0 0 8px", color: "#e2e8f0", fontSize: 14 }}>Detail Info</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(180px, 1fr))", gap: 6 }}>
                            <p style={{ margin: 0, color: "#cbd5e1" }}>Nama: <strong>{u.nama}</strong></p>
                            <p style={{ margin: 0, color: "#cbd5e1" }}>Email: <strong>{u.email}</strong></p>
                            <p style={{ margin: 0, color: "#cbd5e1" }}>NIK: <strong>{u.nik}</strong></p>
                            <label style={{ margin: 0, color: "#cbd5e1", display: "grid", gap: 4 }}>
                              Gender
                              <select
                                value={genderDraft}
                                onChange={(e) => setGenderDraft(e.target.value)}
                                style={detailSelectStyle}
                              >
                                <option value="">Pilih gender</option>
                                {GENDER_OPTIONS.map((g) => (
                                  <option key={g} value={g}>
                                    {g}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <strong style={{ color: "#e2e8f0" }}>Preview KTP</strong>
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

                        <div style={{ background: "#111827", border: "1px solid rgba(148,163,184,0.25)", borderRadius: 8, padding: 10, display: "grid", gap: 10 }}>
                          <h4 style={{ margin: 0, color: "#e2e8f0", fontSize: 14 }}>Assign Divisi & UserID</h4>
                          {tipe === "karyawan" ? (
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                              {Object.entries(divisiOptions).map(([code, name]) => (
                                <label
                                  key={code}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    color: "#e2e8f0",
                                    background: divisiCode === code ? "rgba(59,130,246,0.25)" : "transparent",
                                    border: "1px solid rgba(148,163,184,0.35)",
                                    borderRadius: 999,
                                    padding: "6px 10px",
                                    cursor: "pointer",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="divisi-karyawan"
                                    checked={divisiCode === code}
                                    onChange={() => setDivisiCode(code)}
                                  />
                                  {name}
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div style={{ display: "grid", gap: 8 }}>
                              <span style={{ color: "#cbd5e1", fontWeight: 600 }}>
                                Status: {u.pejabat_umum ?? "PU"}
                              </span>
                              <label style={{ margin: 0, color: "#cbd5e1", display: "grid", gap: 4, maxWidth: 280 }}>
                                Special Field
                                <select
                                  value={puSpecialFieldDraft}
                                  onChange={(e) => setPuSpecialFieldDraft(e.target.value)}
                                  style={detailSelectStyle}
                                >
                                  <option value="">Pilih special field</option>
                                  {PU_SPECIAL_FIELD_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          )}
                          <p style={{ margin: 0, color: "#cbd5e1" }}>
                            UserID: <strong>{generatedUserid || "Belum tergenerate"}</strong> | Divisi: <strong>{generatedDivisi || "Belum dipilih"}</strong>
                            {(divisiCode === "PAT" || divisiCode === "PATS") && ppatKhusus ? ` | PPAT Khusus: ${ppatKhusus}` : ""}
                          </p>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
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
    setGenderDraft(normalizeGenderValue((u.gender ?? "").trim()));
    setPuSpecialFieldDraft((u.special_field ?? "").trim());
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
    setGenderDraft(normalizeGenderValue((u.gender ?? "").trim()));
    setPuSpecialFieldDraft("");
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
          gender: genderDraft || null,
          special_field: assignTipe === "pu" ? (puSpecialFieldDraft || null) : null,
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
      <div
        style={{
          border: "1px solid rgba(65,90,119,0.35)",
          borderRadius: 10,
          background: "#0f172a",
          padding: 12,
          marginBottom: 16,
          boxShadow: "0 6px 16px rgba(2,6,23,0.25)",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 280px", minWidth: 220 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSearch();
              }}
              placeholder="Cari nama, email, NIK, NPWP, NIB, divisi..."
              style={{
                width: "100%",
                height: 38,
                borderRadius: 8,
                border: "1px solid rgba(148,163,184,0.35)",
                background: "#111827",
                color: "#e2e8f0",
                padding: "0 10px 0 34px",
              }}
            />
          </div>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as CategoryFilter)}
            style={{
              height: 38,
              borderRadius: 8,
              border: "1px solid rgba(148,163,184,0.35)",
              background: "#111827",
              color: "#e2e8f0",
              padding: "0 10px",
            }}
          >
            <option value="all">Semua Verse</option>
            <option value="wp">WP</option>
            <option value="karyawan">Karyawan</option>
            <option value="pu">PU</option>
          </select>
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={loading}
            style={{
              height: 38,
              borderRadius: 8,
              border: "none",
              background: loading ? "#64748b" : "#2563eb",
              color: "#fff",
              padding: "0 14px",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            <Search size={15} />
            {loading ? "Mencari..." : "Search"}
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--color_font_main_muted)" }}>Memuat data dari server...</p>
      ) : !hasSearched ? (
        <p style={{ color: "var(--color_font_main_muted)" }}>
          Silakan lakukan pencarian untuk menampilkan data.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {showKaryawan && (
            <UserTableContainer title="Pending - Karyawan" count={karyawanAll.length} isPriority>
              {renderTable("karyawan")}
              <PaginationFooter
                page={karyawanPage}
                totalPages={karyawanTotalPages}
                onChange={setKaryawanPage}
              />
            </UserTableContainer>
          )}

          {(showWp || showPu) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {showWp && (
                <UserTableContainer title="Pending - Wajib Pajak (Badan Usaha)" count={wpBadanAll.length}>
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
                          <th style={thStyle}>Gender</th>
                          <th style={thStyle}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wpBadanRows.length === 0 ? (
                          <tr>
                            <td style={tdStyle} colSpan={4}>
                              Tidak ada data WP Badan Usaha untuk pencarian ini.
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
                                  <td style={tdStyle}>
                                    <select value={genderSelectValue(u)} disabled style={compactSelectStyle}>
                                      <option value="">Pilih gender</option>
                                      {GENDER_OPTIONS.map((g) => (
                                        <option key={g} value={g}>
                                          {g}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td style={tdStyle}>{expanded ? "Detail terbuka" : "Klik baris"}</td>
                                </tr>

                                {expanded && (
                                  <tr style={{ borderBottom: "1px solid rgba(65,90,119,0.2)" }}>
                                    <td style={tdStyle} colSpan={4}>
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
                                          <label style={{ margin: 0, color: "#cbd5e1", display: "grid", gap: 4 }}>
                                            Gender
                                            <select
                                              value={genderDraft}
                                              onChange={(e) => setGenderDraft(e.target.value)}
                                              style={detailSelectStyle}
                                            >
                                              <option value="">Pilih gender</option>
                                              {GENDER_OPTIONS.map((g) => (
                                                <option key={g} value={g}>
                                                  {g}
                                                </option>
                                              ))}
                                            </select>
                                          </label>
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
                                        <div
                                          style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(2, minmax(180px, 1fr))",
                                            gap: 8,
                                            background: "#111827",
                                            border: "1px solid rgba(148,163,184,0.25)",
                                            borderRadius: 8,
                                            padding: 10,
                                          }}
                                        >
                                          <p style={{ margin: 0, color: "#cbd5e1" }}>
                                            NIK (PJ): <strong>{u.nik || "—"}</strong>
                                          </p>
                                          <p style={{ margin: 0, color: "#cbd5e1" }}>
                                            NPWP Badan: <strong>{u.npwp_badan ?? "—"}</strong>
                                          </p>
                                          <p style={{ margin: 0, color: "#cbd5e1" }}>
                                            NIB: <strong>{u.nib ?? "—"}</strong>
                                          </p>
                                          <p style={{ margin: 0, color: "#cbd5e1" }}>
                                            Dokumen:{" "}
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
                                          </p>
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
                  <PaginationFooter
                    page={wpPage}
                    totalPages={wpTotalPages}
                    onChange={setWpPage}
                  />
                </UserTableContainer>
              )}

              {showPu && (
                <UserTableContainer title="Pending - PU" count={puAll.length}>
                  {renderTable("pu")}
                  <PaginationFooter
                    page={puPage}
                    totalPages={puTotalPages}
                    onChange={setPuPage}
                  />
                </UserTableContainer>
              )}
            </div>
          )}
        </div>
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

function UserTableContainer({
  title,
  count,
  isPriority = false,
  children,
}: {
  title: string;
  count: number;
  isPriority?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        border: isPriority
          ? "1px solid rgba(59,130,246,0.65)"
          : "1px solid rgba(65,90,119,0.35)",
        borderRadius: 10,
        background: "#0f172a",
        boxShadow: "0 8px 22px rgba(2,6,23,0.25)",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(65,90,119,0.35)",
        }}
      >
        <h3 style={{ color: "var(--color_font_main)", margin: 0, fontSize: 15 }}>{title}</h3>
        <span
          style={{
            fontSize: 12,
            color: "#dbeafe",
            background: "rgba(37,99,235,0.25)",
            border: "1px solid rgba(147,197,253,0.4)",
            borderRadius: 999,
            padding: "2px 10px",
          }}
        >
          Total: {count}
        </span>
      </header>
      <div style={{ padding: 12 }}>{children}</div>
    </section>
  );
}

function PaginationFooter({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (totalPages <= 1) return null;
  return (
    <footer
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
        onClick={() => onChange(1)}
        style={pageBtnStyle}
      >
        «
      </button>
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange((p) => p - 1)}
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
            onClick={() => onChange(p)}
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
        onClick={() => onChange(totalPages)}
        style={pageBtnStyle}
      >
        »
      </button>
    </footer>
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
const compactSelectStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 120,
  height: 32,
  borderRadius: 6,
  border: "1px solid rgba(148,163,184,0.35)",
  background: "#111827",
  color: "#cbd5e1",
  padding: "0 8px",
};
const detailSelectStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 180,
  height: 34,
  borderRadius: 6,
  border: "1px solid rgba(148,163,184,0.35)",
  background: "#0b1220",
  color: "#e2e8f0",
  padding: "0 10px",
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
