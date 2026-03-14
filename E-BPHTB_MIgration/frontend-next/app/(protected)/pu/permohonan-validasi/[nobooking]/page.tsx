"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border_color)", fontSize: 14, marginTop: 4 };
const labelStyle: React.CSSProperties = { display: "block", marginBottom: 4, fontWeight: 600, fontSize: 14 };
const sectionStyle: React.CSSProperties = { marginBottom: 20 };

type FormState = {
  nama_pemohon: string;
  no_telepon: string;
  alamat_pemohon: string;
  nama_wajib_pajak: string;
  alamat_wajib_pajak: string;
  kabupaten_kota: string;
  kelurahan: string;
  kecamatan: string;
  nop: string;
  atas_nama: string;
  luas_tanah: string;
  luas_bangunan: string;
  lainnya: string;
  Alamatop: string;
  kampungop: string;
  kelurahanop: string;
  kecamatanop: string;
  nomor_validasi: string;
};

const emptyForm: FormState = {
  nama_pemohon: "",
  no_telepon: "",
  alamat_pemohon: "",
  nama_wajib_pajak: "",
  alamat_wajib_pajak: "",
  kabupaten_kota: "",
  kelurahan: "",
  kecamatan: "",
  nop: "",
  atas_nama: "",
  luas_tanah: "",
  luas_bangunan: "",
  lainnya: "",
  Alamatop: "",
  kampungop: "",
  kelurahanop: "",
  kecamatanop: "",
  nomor_validasi: "",
};

export default function PermohonanValidasiPage() {
  const params = useParams();
  const nobooking = (params?.nobooking as string) ?? "";
  const decodedNobooking = decodeURIComponent(nobooking);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ kode_validasi?: string; is_duplicate?: boolean } | null>(null);

  useEffect(() => {
    if (!decodedNobooking) return;
    fetch(`/api/ppat/booking/${encodeURIComponent(decodedNobooking)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j?.data) {
          const d = j.data;
          setForm((prev) => ({
            ...prev,
            nama_wajib_pajak: d.nama_wajib_pajak ?? d.namawajibpajak ?? prev.nama_wajib_pajak,
            alamat_wajib_pajak: d.alamat_wajib_pajak ?? d.alamatwajibpajak ?? prev.alamat_wajib_pajak,
            nop: d.nop ?? d.noppbb ?? prev.nop,
            atas_nama: d.atas_nama ?? d.namapemilikobjekpajak ?? prev.atas_nama,
            nama_pemohon: d.nama_pemohon ?? prev.nama_pemohon,
            no_telepon: d.no_telepon ?? prev.no_telepon,
          }));
        }
      })
      .catch(() => {});
  }, [decodedNobooking]);

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const generateKode = () => {
    const code = `PV-${decodedNobooking}-${Date.now().toString(36).toUpperCase()}`;
    update("nomor_validasi", code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomor_validasi?.trim()) {
      setError("Klik \"Buat Kode Validasi\" terlebih dahulu.");
      return;
    }
    if (!/^[0-9]{10,13}$/.test(form.no_telepon.replace(/\s/g, ""))) {
      setError("Nomor telepon harus 10–13 digit.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/ppat/create-permohonan-validasi", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nobooking: decodedNobooking,
          ...form,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Gagal menyimpan permohonan.");
        return;
      }
      setSuccess({ kode_validasi: data.kode_validasi || form.nomor_validasi, is_duplicate: data.is_duplicate });
    } catch {
      setError("Gagal menyimpan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 0.5rem", color: "var(--color_font_main)" }}>Form Permohonan Validasi SSPD</h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 24 }}>
        No. Booking: <strong>{decodedNobooking}</strong>
      </p>

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fef2f2", color: "#b91c1c", borderRadius: 8 }}>{error}</div>
      )}
      {success && (
        <div style={{ padding: 16, marginBottom: 16, background: "#f0fdf4", color: "#166534", borderRadius: 8 }}>
          <p><strong>{success.is_duplicate ? "Permohonan sudah pernah dibuat." : "Permohonan berhasil disimpan."}</strong></p>
          <p>Kode Validasi: <strong>{success.kode_validasi}</strong></p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: "var(--card_bg)", border: "1px solid var(--border_color)", borderRadius: 12, padding: 24 }}>
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Data Pemohon</h3>
          <div style={sectionStyle}>
            <label style={labelStyle}>Nama Pemohon</label>
            <input style={inputStyle} value={form.nama_pemohon} onChange={(e) => update("nama_pemohon", e.target.value)} required />
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>No. Telepon (10–13 digit)</label>
            <input style={inputStyle} type="tel" value={form.no_telepon} onChange={(e) => update("no_telepon", e.target.value)} placeholder="08xxxxxxxxxx" required />
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>Alamat Pemohon</label>
            <textarea style={{ ...inputStyle, minHeight: 60 }} value={form.alamat_pemohon} onChange={(e) => update("alamat_pemohon", e.target.value)} />
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Data Wajib Pajak & Objek</h3>
          <div style={sectionStyle}>
            <label style={labelStyle}>Nama Wajib Pajak</label>
            <input style={inputStyle} value={form.nama_wajib_pajak} onChange={(e) => update("nama_wajib_pajak", e.target.value)} required />
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>Alamat Wajib Pajak</label>
            <textarea style={{ ...inputStyle, minHeight: 60 }} value={form.alamat_wajib_pajak} onChange={(e) => update("alamat_wajib_pajak", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Kabupaten/Kota</label><input style={inputStyle} value={form.kabupaten_kota} onChange={(e) => update("kabupaten_kota", e.target.value)} /></div>
            <div><label style={labelStyle}>Kecamatan</label><input style={inputStyle} value={form.kecamatan} onChange={(e) => update("kecamatan", e.target.value)} /></div>
            <div><label style={labelStyle}>Kelurahan</label><input style={inputStyle} value={form.kelurahan} onChange={(e) => update("kelurahan", e.target.value)} /></div>
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>NOP PBB</label>
            <input style={inputStyle} value={form.nop} onChange={(e) => update("nop", e.target.value)} />
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>Sertifikat (Atas Nama)</label>
            <input style={inputStyle} value={form.atas_nama} onChange={(e) => update("atas_nama", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Luas Tanah (m²)</label><input style={inputStyle} type="number" value={form.luas_tanah} onChange={(e) => update("luas_tanah", e.target.value)} /></div>
            <div><label style={labelStyle}>Luas Bangunan (m²)</label><input style={inputStyle} type="number" value={form.luas_bangunan} onChange={(e) => update("luas_bangunan", e.target.value)} /></div>
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>Alamat Objek Pajak</label>
            <input style={inputStyle} value={form.Alamatop} onChange={(e) => update("Alamatop", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Kampung OP</label><input style={inputStyle} value={form.kampungop} onChange={(e) => update("kampungop", e.target.value)} /></div>
            <div><label style={labelStyle}>Kelurahan OP</label><input style={inputStyle} value={form.kelurahanop} onChange={(e) => update("kelurahanop", e.target.value)} /></div>
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>Kecamatan OP</label>
            <input style={inputStyle} value={form.kecamatanop} onChange={(e) => update("kecamatanop", e.target.value)} />
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>Lainnya</label>
            <textarea style={{ ...inputStyle, minHeight: 60 }} value={form.lainnya} onChange={(e) => update("lainnya", e.target.value)} />
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Kode Validasi</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input style={{ ...inputStyle, maxWidth: 320 }} value={form.nomor_validasi} onChange={(e) => update("nomor_validasi", e.target.value)} placeholder="Klik tombol untuk generate" readOnly />
            <button type="button" onClick={generateKode} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border_color)", background: "var(--card_bg_grey)", fontWeight: 600, cursor: "pointer" }}>
              Buat Kode Validasi
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button type="submit" disabled={loading} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Menyimpan..." : "Simpan Permohonan"}
          </button>
          <Link href="/pu/booking-sspd/badan" style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border_color)", color: "var(--color_font_main)", fontWeight: 600, textDecoration: "none" }}>
            Batal
          </Link>
        </div>
      </form>

      <p style={{ marginTop: 16 }}>
        <Link href="/pu/booking-sspd/badan" style={{ color: "var(--accent)", fontWeight: 600 }}>← Kembali ke Booking SSPD Badan</Link>
      </p>
    </div>
  );
}
