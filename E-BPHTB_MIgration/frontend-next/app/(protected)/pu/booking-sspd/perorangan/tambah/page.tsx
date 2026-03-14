"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const today = new Date();
const defaultTanggal =
  String(today.getDate()).padStart(2, "0") +
  "-" +
  String(today.getMonth() + 1).padStart(2, "0") +
  "-" +
  today.getFullYear();

type CreatePayload = {
  noppbb: string;
  namawajibpajak: string;
  alamatwajibpajak: string;
  namapemilikobjekpajak: string;
  alamatpemilikobjekpajak: string;
  tanggal: string;
  tahunajb: string;
  kabupatenkotawp: string;
  kecamatanwp: string;
  kelurahandesawp: string;
  rtrwwp: string;
  npwpwp: string;
  kodeposwp: string;
  kabupatenkotaop: string;
  kecamatanop: string;
  kelurahandesaop: string;
  rtrwop: string;
  npwpop: string;
  kodeposop: string;
  trackstatus?: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border_color)",
  fontSize: 14,
  marginTop: 4,
};
const labelStyle: React.CSSProperties = { display: "block", marginBottom: 4, fontWeight: 600, fontSize: 14 };
const sectionStyle: React.CSSProperties = { marginBottom: 24 };
const rowStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 };

export default function TambahBookingPeroranganPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePayload>({
    noppbb: "",
    namawajibpajak: "",
    alamatwajibpajak: "",
    namapemilikobjekpajak: "",
    alamatpemilikobjekpajak: "",
    tanggal: defaultTanggal,
    tahunajb: String(today.getFullYear()),
    kabupatenkotawp: "",
    kecamatanwp: "",
    kelurahandesawp: "",
    rtrwwp: "",
    npwpwp: "",
    kodeposwp: "",
    kabupatenkotaop: "",
    kecamatanop: "",
    kelurahandesaop: "",
    rtrwop: "",
    npwpop: "",
    kodeposop: "",
    trackstatus: "Draft",
  });

  const update = (key: keyof CreatePayload, value: string | undefined) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.namawajibpajak?.trim() || !form.noppbb?.trim()) {
      setError("NOP PBB dan Nama Wajib Pajak wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ppat_create-booking-and-bphtb-perorangan", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          jenis_wajib_pajak: "Perorangan",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Gagal membuat booking.");
        return;
      }
      if (data?.success && data?.nobooking) {
        setSuccess(`Booking berhasil dibuat. No. Booking: ${data.nobooking}`);
        setForm((prev) => ({
          ...prev,
          noppbb: "",
          namawajibpajak: "",
          alamatwajibpajak: "",
          namapemilikobjekpajak: "",
          alamatpemilikobjekpajak: "",
          npwpwp: "",
          npwpop: "",
        }));
        setTimeout(() => router.push("/pu/booking-sspd/perorangan"), 2000);
      } else {
        setError(data?.message || "Gagal membuat booking.");
      }
    } catch (err) {
      setError("Network error. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 0.5rem", color: "var(--color_font_main)" }}>Tambah Booking SSPD Perorangan</h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 24 }}>
        Isi data wajib pajak perorangan (NPWP dapat diisi NIK). Submit ke API Go <code>/api/ppat_create-booking-and-bphtb-perorangan</code>.
      </p>

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fef2f2", color: "#b91c1c", borderRadius: 8 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: 12, marginBottom: 16, background: "#f0fdf4", color: "#166534", borderRadius: 8 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: "var(--card_bg)", border: "1px solid var(--border_color)", borderRadius: 12, padding: 24 }}>
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Pembayar Pajak BPHTB (Perorangan)</h3>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>NOP PBB</label>
              <input
                style={inputStyle}
                value={form.noppbb}
                onChange={(e) => update("noppbb", e.target.value)}
                placeholder="Contoh: 32.01.001.001.001.0001.1"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Tahun AJB</label>
              <input
                style={inputStyle}
                type="number"
                value={form.tahunajb}
                onChange={(e) => update("tahunajb", e.target.value)}
                placeholder="2025"
                required
              />
            </div>
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>Nama Wajib Pajak</label>
            <input
              style={inputStyle}
              value={form.namawajibpajak}
              onChange={(e) => update("namawajibpajak", e.target.value)}
              placeholder="Nama wajib pajak"
              required
            />
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>Alamat Wajib Pajak</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60 }}
              value={form.alamatwajibpajak}
              onChange={(e) => update("alamatwajibpajak", e.target.value)}
              placeholder="Jl. Contoh No. 123"
              required
            />
          </div>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Kabupaten/Kota WP</label>
              <input style={inputStyle} value={form.kabupatenkotawp} onChange={(e) => update("kabupatenkotawp", e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Kecamatan WP</label>
              <input style={inputStyle} value={form.kecamatanwp} onChange={(e) => update("kecamatanwp", e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Kelurahan/Desa WP</label>
              <input style={inputStyle} value={form.kelurahandesawp} onChange={(e) => update("kelurahandesawp", e.target.value)} required />
            </div>
          </div>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>RT/RW WP</label>
              <input style={inputStyle} value={form.rtrwwp} onChange={(e) => update("rtrwwp", e.target.value)} placeholder="001/001" required />
            </div>
            <div>
              <label style={labelStyle}>Kode Pos WP</label>
              <input style={inputStyle} value={form.kodeposwp} onChange={(e) => update("kodeposwp", e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>NIK/NPWP WP</label>
              <input style={inputStyle} value={form.npwpwp} onChange={(e) => update("npwpwp", e.target.value)} placeholder="NIK 16 digit atau NPWP" required />
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Pemilik Objek Pajak BPHTB</h3>
          <div style={sectionStyle}>
            <label style={labelStyle}>Nama Pemilik Objek Pajak</label>
            <input
              style={inputStyle}
              value={form.namapemilikobjekpajak}
              onChange={(e) => update("namapemilikobjekpajak", e.target.value)}
              placeholder="Nama pemilik objek"
              required
            />
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>Alamat Pemilik Objek Pajak</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60 }}
              value={form.alamatpemilikobjekpajak}
              onChange={(e) => update("alamatpemilikobjekpajak", e.target.value)}
              placeholder="Jl. Contoh No. 456"
              required
            />
          </div>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Kabupaten/Kota Objek</label>
              <input style={inputStyle} value={form.kabupatenkotaop} onChange={(e) => update("kabupatenkotaop", e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Kecamatan Objek</label>
              <input style={inputStyle} value={form.kecamatanop} onChange={(e) => update("kecamatanop", e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Kelurahan/Desa Objek</label>
              <input style={inputStyle} value={form.kelurahandesaop} onChange={(e) => update("kelurahandesaop", e.target.value)} required />
            </div>
          </div>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>RT/RW Objek</label>
              <input style={inputStyle} value={form.rtrwop} onChange={(e) => update("rtrwop", e.target.value)} placeholder="001/001" required />
            </div>
            <div>
              <label style={labelStyle}>Kode Pos Objek</label>
              <input style={inputStyle} value={form.kodeposop} onChange={(e) => update("kodeposop", e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>NIK/NPWP Objek</label>
              <input style={inputStyle} value={form.npwpop} onChange={(e) => update("npwpop", e.target.value)} placeholder="NIK atau NPWP" required />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button type="submit" disabled={loading} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Menyimpan..." : "Simpan Booking"}
          </button>
          <Link href="/pu/booking-sspd/perorangan" style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border_color)", color: "var(--color_font_main)", fontWeight: 600, textDecoration: "none" }}>
            Batal
          </Link>
        </div>
      </form>

      <p style={{ marginTop: 16 }}>
        <Link href="/pu/booking-sspd/perorangan" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke Booking SSPD Perorangan
        </Link>
      </p>
    </div>
  );
}
