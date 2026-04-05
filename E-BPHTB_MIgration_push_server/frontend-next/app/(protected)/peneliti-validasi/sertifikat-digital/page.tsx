"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getApiBase } from "../../../../lib/api";

interface CertRow {
  serial_number?: string;
  subject_cn?: string;
  subject_email?: string;
  subject_org?: string;
  valid_from?: string;
  valid_to?: string;
  status?: string;
}

function fmtDate(dt: string | undefined): string {
  if (!dt) return "";
  try {
    return new Date(dt).toLocaleString("id-ID");
  } catch {
    return String(dt);
  }
}

export default function PenelitiValidasiSertifikatDigitalPage() {
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pubPreview, setPubPreview] = useState("");
  const [generated, setGenerated] = useState<{ pem: string } | null>(null);
  const [cn, setCn] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [days] = useState(365);
  const [issuing, setIssuing] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch(`${getApiBase()}/api/pv/cert/list`, { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((json as { message?: string }).message || "Gagal memuat daftar");
        setCerts([]);
        return;
      }
      const list = (json as { data?: CertRow[] }).data ?? (json as { list?: CertRow[] }).list ?? (json as { certs?: CertRow[] }).certs ?? [];
      setCerts(Array.isArray(list) ? list : []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
      setCerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  async function genKeypair() {
    try {
      const key = await crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["sign", "verify"]
      );
      const spki = await crypto.subtle.exportKey("spki", key.publicKey);
      const b64 = btoa(String.fromCharCode(...new Uint8Array(spki)));
      const pem = "-----BEGIN PUBLIC KEY-----\n" + b64.replace(/(.{64})/g, "$1\n") + "\n-----END PUBLIC KEY-----\n";
      setGenerated({ pem });
      setPubPreview(pem);
    } catch (e) {
      alert("Gagal membuat kunci: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  async function issue() {
    if (!generated) {
      alert("Buat kunci dulu (Buat Kunci Otomatis).");
      return;
    }
    if ((passphrase || "").trim().length < 4) {
      alert("Passphrase minimal 4 karakter.");
      return;
    }
    setIssuing(true);
    try {
      const res = await fetch(`${getApiBase()}/api/pv/cert/issue`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_key_pem: generated.pem,
          subject_cn: (cn || "").trim() || undefined,
          algorithm: "ECDSA-P256",
          valid_days: Number(days) || 365,
          passphrase: passphrase.trim(),
        }),
      });
      const js = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !js.success) {
        alert((js as { message?: string }).message || "Gagal menerbitkan");
        return;
      }
      await fetchList();
      const cert = (js as { cert?: { serial_number?: string } }).cert;
      alert("Sertifikat terbit: " + (cert?.serial_number ?? "OK"));
      setCn("");
      setPassphrase("");
      setPubPreview("");
      setGenerated(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setIssuing(false);
    }
  }

  async function revoke(serial: string) {
    if (!confirm("Revoke sertifikat ini?")) return;
    setRevoking(serial);
    try {
      const res = await fetch(`${getApiBase()}/api/pv/cert/${encodeURIComponent(serial)}/revoke`, {
        method: "POST",
        credentials: "include",
      });
      const js = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !js.success) {
        alert((js as { message?: string }).message || "Gagal revoke");
        return;
      }
      await fetchList();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="cert-content" style={{ margin: 20, maxWidth: 1200 }}>
      <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700 }}>Sertifikat Digital</h2>

      <section className="info-section" style={{
        padding: 16,
        borderLeft: "4px solid #10b981",
        background: "#ecfdf5",
        borderRadius: 8,
        marginBottom: 20,
      }}>
        <div className="info-title" style={{ fontWeight: 700, marginBottom: 8, fontSize: 16, color: "#065f46" }}>Informasi</div>
        <div className="info-content" style={{ color: "#065f46", lineHeight: 1.55 }}>
          <p style={{ marginBottom: 8 }}>
            Sertifikat digital adalah identitas elektronik Anda untuk menandatangani dokumen. Anda hanya dapat memiliki <strong>1 sertifikat aktif</strong> sekaligus. Jika membuat sertifikat baru, sertifikat lama akan dinonaktifkan (revoke).
          </p>
          <div className="info-grid" style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 12 }}>
            <div className="info-box" style={{ flex: "1 1 320px", background: "#fff", border: "1px solid #d1fae5", borderRadius: 8, padding: 12 }}>
              <div className="info-box-title" style={{ fontWeight: 600, marginBottom: 6, color: "#065f46" }}>Istilah</div>
              <ul style={{ margin: "0 0 0 18px", padding: 0, color: "#065f46" }}>
                <li><strong>Kunci (Keypair)</strong>: kunci privat di browser, kunci publik dikirim ke server.</li>
                <li><strong>CN</strong>: nama tampil di sertifikat (mis. jabatan/nama).</li>
                <li><strong>Masa berlaku</strong>: 365 hari (1 tahun).</li>
                <li><strong>Passphrase</strong>: sandi untuk mengunci penggunaan; tidak bisa di-reset.</li>
              </ul>
            </div>
            <div className="info-box" style={{ flex: "1 1 320px", background: "#fff", border: "1px solid #d1fae5", borderRadius: 8, padding: 12 }}>
              <div className="info-box-title" style={{ fontWeight: 600, marginBottom: 6, color: "#065f46" }}>Ketentuan passphrase</div>
              <ul style={{ margin: "0 0 0 18px", padding: 0, color: "#065f46" }}>
                <li>Minimal 4 karakter.</li>
                <li>Jangan gunakan passphrase yang sama dengan password login.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="cert-card" style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#1f2937", fontSize: 18, fontWeight: 700 }}>Buat Sertifikat Baru</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <button
            type="button"
            onClick={genKeypair}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Buat Kunci Otomatis
          </button>
          <span style={{ color: "#6b7280", fontSize: 13 }}>Kunci privat di browser; hanya publik yang dikirim ke server.</span>
        </div>
        {pubPreview && (
          <pre style={{
            marginTop: 10,
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            fontSize: 12,
            background: "#f9fafb",
            border: "1px dashed #ddd",
            padding: 10,
            borderRadius: 6,
          }}>
            {pubPreview}
          </pre>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, alignItems: "start", marginTop: 12 }}>
          <input
            type="text"
            placeholder="Nama tampil di sertifikat (mis. Kepala Bidang)"
            value={cn}
            onChange={(e) => setCn(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
            }}
          />
          <input type="number" min={1} value={days} readOnly style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, maxWidth: 180 }} />
          <input
            type="password"
            placeholder="Passphrase (≥4 karakter)"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="input-full"
            style={{
              gridColumn: "1 / -1",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
            }}
          />
          <button
            type="button"
            onClick={issue}
            disabled={!generated || issuing}
            style={{
              gridColumn: "1 / -1",
              padding: "10px 20px",
              background: generated && !issuing ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "#9ca3af",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: generated && !issuing ? "pointer" : "not-allowed",
              opacity: generated && !issuing ? 1 : 0.6,
            }}
          >
            {issuing ? "Memproses..." : "Daftarkan Sertifikat"}
          </button>
        </div>
      </section>

      <section className="cert-card" style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: "#1f2937", fontSize: 18, fontWeight: 700 }}>Daftar Sertifikat</h3>
          <button
            type="button"
            onClick={() => { setLoading(true); fetchList(); }}
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <p>Memuat...</p>
        ) : error ? (
          <p style={{ color: "#ef4444" }}>{error}</p>
        ) : certs.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Tidak ada sertifikat.</p>
        ) : (
          <div style={{ overflow: "auto" }}>
            <table className="cert-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f7f7f7" }}>
                  <th style={{ textAlign: "left", padding: 12, fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Serial Number</th>
                  <th style={{ textAlign: "left", padding: 12, fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Subject</th>
                  <th style={{ textAlign: "left", padding: 12, fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Valid Time</th>
                  <th style={{ textAlign: "left", padding: 12, fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Status</th>
                  <th style={{ textAlign: "left", padding: 12, fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.serial_number ?? ""} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "10px 12px", color: "#1f2937", fontFamily: "monospace" }}>{c.serial_number ?? "-"}</td>
                    <td style={{ padding: "10px 12px", color: "#1f2937" }}>
                      {[c.subject_cn, c.subject_email, c.subject_org].filter(Boolean).join(" | ") || "-"}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#1f2937" }}>{fmtDate(c.valid_from)} – {fmtDate(c.valid_to)}</td>
                    <td style={{ padding: "10px 12px", color: "#1f2937" }}>{c.status ?? "-"}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {c.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => revoke(c.serial_number!)}
                          disabled={revoking === c.serial_number}
                          style={{
                            padding: "6px 12px",
                            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: revoking === c.serial_number ? "wait" : "pointer",
                          }}
                        >
                          {revoking === c.serial_number ? "..." : "Revoke"}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p style={{ marginTop: 24 }}>
        <Link href="/peneliti-validasi" style={{ color: "var(--accent)" }}>← Kembali ke Dashboard</Link>
      </p>
    </div>
  );
}
