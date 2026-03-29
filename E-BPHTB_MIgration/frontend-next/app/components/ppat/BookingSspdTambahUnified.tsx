"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { getBackendBaseUrl } from "../../../lib/api";
import BillingShareCard from "../BillingShareCard";

export type BookingSspdEntity = "badan" | "perorangan";

export type BookingSspdTambahUnifiedProps = {
  /** Default jenis wajib pajak (radio). URL `?wajib=badan|perorangan` overrides when present. */
  defaultEntity: BookingSspdEntity;
  /** Daftar booking setelah sukses / batal */
  listPath: string;
};

const today = new Date();
const pad = (n: number, len = 2) => String(n).padStart(len, "0");
const defaultTanggal = `${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`;

const NPOPTKP_MAP: Record<string, number> = {
  "03": 300_000_000,
  "04": 400_000_000,
  "05": 400_000_000,
  "24": 300_000_000,
  "30": 300_000_000,
  "28": 40_000_000,
  "29": 49_000_000,
  "34": 0,
};

/** 40 Kecamatan di Kabupaten Bogor (sumber: denah_kabupatenbogor.md) */
const KECAMATAN_OBJEK_LIST = [
  "Babakan Madang", "Bojonggede", "Caringin", "Cariu", "Ciampea", "Ciawi", "Cibinong", "Cibungbulang",
  "Cigombong", "Cigudeg", "Cijeruk", "Cileungsi", "Ciomas", "Cisarua", "Ciseeng", "Citeureup",
  "Dramaga", "Gunung Putri", "Gunung Sindur", "Jasinga", "Jonggol", "Kemang", "Klapanunggal",
  "Leuwiliang", "Leuwisadeng", "Megamendung", "Nanggung", "Pamijahan", "Parung Panjang", "Parung",
  "Ranca Bungur", "Rumpin", "Sukajaya", "Sukamakmur", "Sukaraja", "Tajur Halang", "Tamansari",
  "Tanjungsari", "Tenjo", "Tenjolaya",
];

/** Kelurahan/Desa per Kecamatan. label = tampilan di UI (Kel./Desa), value = yang disimpan ke DB (tanpa prefix) */
type KelurahanOption = { label: string; value: string };

const KECAMATAN_KELURAHAN: Record<string, KelurahanOption[]> = {
  "Cibinong": [
    "Cibinong", "Cirimekar", "Ciriung", "Harapan Jaya", "Karadenan", "Nanggewer", "Nanggewer Mekar",
    "Pabuaran", "Pabuaran Mekar", "Pakansari", "Pondok Rajeg", "Sukahati", "Tengah",
  ].map((n) => ({ label: `Kel. ${n}`, value: n })),
  "Gunung Putri": [
    "Bojong Kulur", "Bojong Nangka", "Ciangsana", "Cicadas", "Cikeas Udik", "Gunung Putri",
    "Karanggan", "Nagrak", "Putri Tunggal", "Tlajung Udik", "Wanaherang",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Bojonggede": [
    { label: "Kel. Pabuaran", value: "Pabuaran" },
    { label: "Desa Bojong Baru", value: "Bojong Baru" },
    { label: "Desa Bojonggede", value: "Bojonggede" },
    { label: "Desa Cimanggis", value: "Cimanggis" },
    { label: "Desa Kedung Waringin", value: "Kedung Waringin" },
    { label: "Desa Ragajaya", value: "Ragajaya" },
    { label: "Desa Rawa Panjang", value: "Rawa Panjang" },
    { label: "Desa Susukan", value: "Susukan" },
    { label: "Desa Waringin Jaya", value: "Waringin Jaya" },
  ],
  "Cileungsi": [
    "Cileungsi", "Cileungsi Kidul", "Cipenjo", "Dayeuh", "Gandoang", "Jatisari", "Limus Nunggal",
    "Mampir", "Mekarsari", "Pasir Angin", "Setu Sari", "Sodong",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Babakan Madang": [
    "Babakan Madang", "Bojong Koneng", "Cijayanti", "Cipambuan", "Citaringgul", "Kadumangu",
    "Karang Tengah", "Sentul", "Sumur Batu",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Ciawi": [
    "Banjar Wangi", "Banjar Waru", "Bendungan", "Bitung Sari", "Bojong Murni", "Ciawi", "Cibedug",
    "Cileungsi", "Citapen", "Jambu Luwuk", "Pandansari", "Ratujaya", "Teluk Pinang",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Citeureup": [
    { label: "Kel. Citeureup", value: "Citeureup" },
    { label: "Kel. Puspanegara", value: "Puspanegara" },
    { label: "Desa Karang Asem Timur", value: "Karang Asem Timur" },
    { label: "Desa Gunungsari", value: "Gunungsari" },
    { label: "Desa Hambalang", value: "Hambalang" },
    { label: "Desa Leuwinutug", value: "Leuwinutug" },
    { label: "Desa Pasir Mukti", value: "Pasir Mukti" },
    { label: "Desa Puspasari", value: "Puspasari" },
    { label: "Desa Sanja", value: "Sanja" },
    { label: "Desa Sukahati", value: "Sukahati" },
    { label: "Desa Tajur", value: "Tajur" },
    { label: "Desa Tangkil", value: "Tangkil" },
    { label: "Desa Tarikolot", value: "Tarikolot" },
    { label: "Desa Lulut", value: "Lulut" },
  ],
  "Ciomas": [
    { label: "Kel. Padasuka", value: "Padasuka" },
    { label: "Desa Ciomas", value: "Ciomas" },
    { label: "Desa Ciomas Rahayu", value: "Ciomas Rahayu" },
    { label: "Desa Kota Batu", value: "Kota Batu" },
    { label: "Desa Laladon", value: "Laladon" },
    { label: "Desa Mekarjaya", value: "Mekarjaya" },
    { label: "Desa Pagelaran", value: "Pagelaran" },
    { label: "Desa Parakan", value: "Parakan" },
    { label: "Desa Sukaharja", value: "Sukaharja" },
    { label: "Desa Sukamakmur", value: "Sukamakmur" },
    { label: "Desa Sirnagalih", value: "Sirnagalih" },
  ],
  "Parung": [
    "Bojong Indah", "Bojong Sempu", "Cogreg", "Iwul", "Jabon Mekar", "Pamasari / Pemagarsari",
    "Parung", "Waru", "Warujaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Cisarua": [
    { label: "Kel. Cisarua", value: "Cisarua" },
    { label: "Desa Batulayang", value: "Batulayang" },
    { label: "Desa Cibeureum", value: "Cibeureum" },
    { label: "Desa Cilember", value: "Cilember" },
    { label: "Desa Citeko", value: "Citeko" },
    { label: "Desa Jogjogan", value: "Jogjogan" },
    { label: "Desa Kopo", value: "Kopo" },
    { label: "Desa Leuwimalang", value: "Leuwimalang" },
    { label: "Desa Tugu Selatan", value: "Tugu Selatan" },
    { label: "Desa Tugu Utara", value: "Tugu Utara" },
  ],
  // Kecamatan 11–40 (denah_kabupatenbogor.md)
  "Megamendung": [
    "Gadog", "Sukakarya", "Sukamahi", "Sukamaju", "Sukamanah", "Megamendung", "Sukagalih", "Sukaresmi",
    "Cipayung Girang", "Cipayung Datar", "Sukamulya", "Kuta",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Caringin": [
    "Caringin", "Cinagara", "Muara Jaya", "Pasir Muncang", "Ciherang Pondok", "Ciderum", "Ciengang",
    "Tangkil", "Cimande", "Cimande Hilir", "Lemah Duhur", "Pancawati",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Dramaga": [
    "Babakan", "Ciherang", "Dramaga", "Neglasari", "Petir", "Purwasari", "Sukadamai", "Sukawening", "Sinarsari",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Tamansari": [
    "Pasireurih", "Sirnagalih", "Sukajadi", "Sukajaya", "Sukaluyu", "Sukamantri", "Sukaresmi", "Tamansari",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Ciampea": [
    "Benteng", "Bojong Jengkol", "Bojong Rangkas", "Ciampea", "Ciampea Udik", "Cibadak", "Cibanteng", "Cibuntu",
    "Cicadas", "Cihideung Ilir", "Cihideung Udik", "Cinangka", "Tegal Waru",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Ciseeng": [
    "Babakan", "Cibeuteung Muara", "Cibeuteung Udik", "Cibentang", "Ciseeng", "Karihkil", "Kuripan",
    "Parigi Mekar", "Putat Nutug", "Sanja",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Gunung Sindur": [
    "Cibadung", "Cidokom", "Curug", "Gunungsindur", "Jampang", "Pabuaran", "Padurenan", "Pengasinan", "Rawakalong",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Parung Panjang": [
    "Cibunar", "Cikuda", "Dago", "Gintung Cilejet", "Gorowong", "Jagabita", "Jagabaya", "Kabasiran",
    "Lumpang", "Parungpanjang", "Pingku",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Kemang": [
    "Atang Senjaya", "Bojong", "Jampang", "Kemang", "Pabuaran", "Parakan Jaya", "Pondok Udik", "Semplak Barat", "Tegal",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Ranca Bungur": [
    "Bantarjaya", "Bantarsari", "Candali", "Mekarsari", "Pasirgaok", "Rancabungur", "Cimulang",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Leuwiliang": [
    "Barengkok", "Cibeber I", "Cibeber II", "Karacak", "Karyasari", "Leuwiliang", "Leuwimekar", "Pabuarasari", "Puraseda", "Karehkel",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Leuwisadeng": [
    "Babakan Sadeng", "Kalong I", "Kalong II", "Leuwisadeng", "Sadeng", "Sadengkolot", "Sibanteng", "Wangun Jaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Pamijahan": [
    "Ciasihan", "Ciasmara", "Cibening", "Cibitung Kulon", "Cibitung Wetan", "Cibunian", "Cimayang",
    "Gunung Bunder I", "Gunung Bunder II", "Gunung Menyan", "Pamijahan", "Pasir Badak", "Pasir Reungit", "Purwabakti", "Tukuh Jaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Tenjolaya": [
    "Cibitung Tengah", "Cinangneng", "Gunung Mulya", "Situ Daun", "Tapos I", "Tapos II", "Tenjolaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Jasinga": [
    "Bagoang", "Barengkok", "Cikopomayak", "Curug", "Jasinga", "Jugala Jaya", "Kalongsawah", "Koleang",
    "Neglasari", "Pamagersari", "Pangaur", "Pangradin", "Sipak", "Setu", "Tegal Wangi", "Wirajaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Cigudeg": [
    "Argapura", "Bangunjaya", "Batu Jajar", "Bunar", "Cigudeg", "Cintamanik", "Mekarjaya", "Rengasjajar",
    "Sukamaju", "Sukaraksa", "Sukamulya", "Tegallega", "Wargajaya", "Banyuresmi", "Banyuwangi",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Sukajaya": [
    "Cileuksa", "Cisarua", "Harkatjaya", "Kiarapandak", "Kiarasari", "Pasir Madang", "Sipayung",
    "Sukajaya", "Sukamulya", "Uranjaya", "Jaya Raharja",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Nanggung": [
    "Bantarkaret", "Batu Tulis", "Cisarua", "Curug Bitung", "Hambaro", "Kalong Liud", "Malasari",
    "Nanggung", "Pangkal Jaya", "Parakan Muncang", "Sukaluyu",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Rumpin": [
    "Cipinang", "Cibodas", "Gobang", "Kampung Sawah", "Kertajaya", "Leuwibatu", "Mekar Sari", "Rabak",
    "Rumpin", "Sukamulya", "Sukasari", "Taman Sari", "Cidokom", "Mekar Jaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Klapanunggal": [
    "Bojong", "Cikahuripan", "Klapanunggal", "Leuwikaret", "Ligarmukti", "Lulut", "Nambo", "Bantar Jati", "Kembang Kuning",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Jonggol": [
    "Balekambang", "Bendungan", "Cibodas", "Jonggol", "Singajaya", "Sirnagalih", "Sukagalih", "Sukajaya",
    "Sukamanah", "Sukamaju", "Sukasirna", "Weninggalih", "Sukamulya", "Singasari",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Cariu": [
    "Babakan Raden", "Bantar Kuning", "Cariu", "Cibatutiga", "Cikutamahi", "Karya Mekar", "Kuta Mekar", "Mekarwangi", "Sukajadi", "Tegal Panjang",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Sukamakmur": [
    "Cibadak", "Pabuaran", "Sirnajaya", "Sukadamai", "Sukaharja", "Sukamakmur", "Sukamulya", "Sukawangi", "Wargajaya", "Sirnamulya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Tanjungsari": [
    "Antajaya", "Buanajaya", "Cibadak", "Pasir Tanjung", "Selawangi", "Sirnarasa", "Sirnasari", "Sukarasa", "Tanjungrasa", "Tanjungsari",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Sukaraja": [
    "Cadas Ngampar", "Cibanon", "Cikeas", "Cilebut Barat", "Cilebut Timur", "Ciluar", "Cimandala",
    "Nagrak", "Pasir Jambu", "Pasir Laja", "Sukaraja", "Sukatani", "Gunung Geulis",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Tajur Halang": [
    "Citayam", "Kalisuren", "Sasak Panjang", "Sukmajaya", "Tajurhalang", "Tonjong", "Nanggerang",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Cigombong": [
    "Ciadeg", "Ciburayut", "Ciburuy", "Cigombong", "Cipelang", "Pasirjaya", "Srogol", "Tugujaya", "Watesjaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Tenjo": [
    "Batok", "Bojong", "Cilaku", "Ciomas", "Singabangsa", "Singasari", "Tenjo", "Babakan",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Cibungbulang": [
    "Cemplang", "Ciaruteun Ilir", "Ciaruteun Udik", "Cibatok I", "Cibatok II", "Cibungbulang",
    "Cimanggu I", "Cimanggu II", "Dukuh", "Galuga", "Girimulya", "Leuweung Kolot", "Situ Ilir", "Situ Udik", "Sukamaju",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Cijeruk": [
    "Cibalung", "Cijeruk", "Cipicung", "Palasari", "Sukaharja", "Tajur Halang", "Tanjungsari", "Warung Menteng", "Cipelang",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
};

const JENIS_PEROLEHAN = [
  { value: "", label: "-- Pilih Jenis Perolehan Hak --" },
  { value: "01", label: "01 - Jual Beli" },
  { value: "02", label: "02 - Tukar Menukar" },
  { value: "03", label: "03 - Hibah" },
  { value: "04", label: "04 - Hibah Wasiat" },
  { value: "05", label: "05 - Waris" },
  { value: "06", label: "06 - Pemasukan dalam Perseroan / Badan Hukum" },
  { value: "07", label: "07 - Pemisahan Hak yang Mengakibatkan Peralihan" },
  { value: "08", label: "08 - Penunjukan Pembeli dalam Lelang" },
  { value: "09", label: "09 - Pelaksanaan Putusan Hakim" },
  { value: "10", label: "10 - Penggabungan Usaha" },
  { value: "11", label: "11 - Peleburan Usaha" },
  { value: "12", label: "12 - Pemekaran Usaha" },
  { value: "13", label: "13 - Hadiah" },
  { value: "14", label: "14 - Perolehan Rumah Bersubsidi" },
  { value: "15", label: "15 - Perolehan Rumah Subsidi SE-26/2009" },
  { value: "21", label: "21 - Pemberian Hak Baru (Pelepasan Hak)" },
  { value: "22", label: "22 - Pemberian Hak Baru (di luar Pelepasan Hak)" },
  { value: "23", label: "23 - Jual Beli di bawah 2011" },
  { value: "24", label: "24 - Waris di bawah tahun 2011" },
  { value: "25", label: "25 - Perumahan Bersubsidi di bawah 2011" },
  { value: "26", label: "26 - Perumahan Bersubsidi 50 juta" },
  { value: "27", label: "27 - Jual Beli 1997–2001 September" },
  { value: "28", label: "28 - NPOPTKP 40 juta" },
  { value: "29", label: "29 - NPOPTKP 49 juta" },
  { value: "30", label: "30 - Hibah di bawah tahun 2011" },
  { value: "31", label: "31 - Pemenang Lelang di bawah tahun 2011" },
  { value: "32", label: "32 - Subsidi Rumah Sederhana Sehat" },
  { value: "33", label: "33 - Jual Beli 2001 Oktober s.d. 2005" },
  { value: "34", label: "34 - Bebas berdasarkan UU No. 28 Tahun 2009" },
  { value: "35", label: "35 - Perjanjian Pengikatan Jual Beli" },
];

type CreatePayload = {
  jenis_wajib_pajak: string;
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
  trackstatus: string;
  nilaiPerolehanObjekPajakTidakKenaPajak?: number;
  bphtb_yangtelah_dibayar?: number;
  hargatransaksi?: string;
  letaktanahdanbangunan?: string;
  rt_rwobjekpajak?: string;
  kecamatanlp?: string;
  kelurahandesalp?: string;
  status_kepemilikan?: string;
  jenisPerolehan?: string;
  keterangan?: string;
  nomor_sertifikat?: string;
  tanggal_perolehan?: string;
  tanggal_pembayaran?: string;
  luas_tanah?: number;
  njop_tanah?: number;
  luas_bangunan?: number;
  njop_bangunan?: number;
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
const judulStyle: React.CSSProperties = { margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--color_font_main)", borderBottom: "2px solid var(--accent)", paddingBottom: 8 };
const hintStyle: React.CSSProperties = { fontSize: 12, color: "var(--color_font_main_muted)", marginTop: 4 };

function buildNopPbb(d: string[]): string {
  return `${(d[0] ?? "").padStart(2, "0")}.${(d[1] ?? "").padStart(2, "0")}.${(d[2] ?? "").padStart(3, "0")}.${(d[3] ?? "").padStart(3, "0")}.${(d[4] ?? "").padStart(3, "0")}.${(d[5] ?? "").padStart(4, "0")}.${(d[6] ?? "").padStart(1, "0")}`;
}

function buildNpwp(d: string[]): string {
  return `${(d[0] ?? "").padStart(2, "0")}.${(d[1] ?? "").padStart(3, "0")}.${(d[2] ?? "").padStart(3, "0")}.${(d[3] ?? "")}-${(d[4] ?? "").padStart(3, "0")}.${(d[5] ?? "").padStart(3, "0")}`;
}

/** Format angka ke Rupiah Indonesia (titik sebagai pemisah ribuan) */
function formatRupiah(n: number | undefined | null): string {
  if (n == null || isNaN(n)) return "";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Parse string tampilan rupiah ke angka */
function parseRupiah(s: string): number {
  const raw = (s || "").replace(/\./g, "").replace(/\D/g, "");
  return raw === "" ? 0 : parseInt(raw, 10);
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Pecah NOP PBB terformat ke 7 segmen input */
function parseNopToDigits(raw: string): string[] {
  const d = (raw || "").replace(/\D/g, "");
  const lens = [2, 2, 3, 3, 3, 4, 1] as const;
  const out: string[] = Array(7).fill("");
  let pos = 0;
  for (let i = 0; i < lens.length; i++) {
    out[i] = d.slice(pos, pos + lens[i]);
    pos += lens[i];
  }
  return out;
}

/** Pecah NPWP terformat ke 6 segmen input */
function parseNpwpToDigits(raw: string): string[] {
  const d = (raw || "").replace(/\D/g, "");
  const lens = [2, 3, 3, 1, 3, 3] as const;
  const out: string[] = Array(6).fill("");
  let pos = 0;
  for (let i = 0; i < lens.length; i++) {
    out[i] = d.slice(pos, pos + lens[i]);
    pos += lens[i];
  }
  return out;
}

function parseDdMmYyyyParts(s: string | undefined): { d: string; m: string; y: string } {
  const t = (s || "").trim();
  if (!t) return { d: "", m: "", y: "" };
  const parts = t.split(/[-./]/).map((x) => x.trim());
  if (parts.length >= 3) {
    if (parts[0].length === 4) {
      return { d: parts[2] || "", m: parts[1] || "", y: parts[0] || "" };
    }
    return { d: parts[0] || "", m: parts[1] || "", y: parts[2] || "" };
  }
  return { d: "", m: "", y: "" };
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(month: number, year: number): number {
  if (!month || month < 1 || month > 12) return 31;
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

function partsToIsoDate(parts: { d: string; m: string; y: string }): string {
  const d = Number(parts.d);
  const m = Number(parts.m);
  const y = Number(parts.y);
  if (!d || !m || !y) return "";
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function isoDateToParts(iso: string): { d: string; m: string; y: string } {
  const parts = (iso || "").split("-");
  if (parts.length !== 3) return { d: "", m: "", y: "" };
  return {
    d: String(Number(parts[2]) || ""),
    m: String(Number(parts[1]) || ""),
    y: String(Number(parts[0]) || ""),
  };
}

function validateDateParts(parts: { d: string; m: string; y: string }, minYear: number, maxYear: number): string | null {
  const d = Number(parts.d);
  const m = Number(parts.m);
  const y = Number(parts.y);
  if (!d || !m || !y) return "Tanggal belum lengkap.";
  if (m < 1 || m > 12) return "Bulan tidak valid.";
  if (y < minYear || y > maxYear) return `Tahun harus antara ${minYear} - ${maxYear}.`;
  const maxDay = getDaysInMonth(m, y);
  if (d < 1 || d > maxDay) return `Tanggal tidak valid. Bulan ${String(m).padStart(2, "0")} tahun ${y} maksimal ${maxDay} hari.`;
  return null;
}

function formatTanggalIndonesia(parts: { d: string; m: string; y: string }): string {
  const d = Number(parts.d);
  const m = Number(parts.m);
  const y = Number(parts.y);
  if (!d || !m || !y) return "-";
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${d} ${monthNames[m - 1]} ${y}`;
}

function formatRupiahCompact(value: number): string {
  if (!value || value <= 0 || Number.isNaN(value)) return "0";
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} Triliun`;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} Miliar`;
  return value.toLocaleString("id-ID");
}

/** Nilai status_kepemilikan di DB → value `<select>` form */
function statusDbToForm(s: string | undefined): string {
  const v = (s || "").trim();
  if (v === "Milik Pribadi" || v === "milik_pribadi") return "milik_pribadi";
  if (v === "Milik Bersama" || v === "milik_bersama") return "milik_bersama";
  if (v === "Sewa" || v === "sewa") return "sewa";
  if (v === "Hak Guna Bangunan" || v === "hgb") return "hgb";
  return "milik_pribadi";
}

interface CallbackHistoryRow {
  id: string;
  nobooking: string;
  noppbb: string;
  namawajibpajak: string;
  label: string;
}

function normalizeEntityFromQuery(raw: string | null | undefined): BookingSspdEntity | null {
  const t = (raw || "").trim().toLowerCase();
  if (t === "badan" || t === "badan_usaha" || t === "bu") return "badan";
  if (t === "perorangan" || t === "per" || t === "pribadi") return "perorangan";
  return null;
}

/** Dynamic validation (tanpa Zod — dependency tidak ada di project). */
function validateIdentityForEntity(
  entity: BookingSspdEntity,
  npwpwpFromDigits: string,
  npwpopFromDigits: string,
  nikWp: string,
  nikOp: string
): string | null {
  if (entity === "badan") {
    const a = npwpwpFromDigits.replace(/\D/g, "");
    const b = npwpopFromDigits.replace(/\D/g, "");
    if (a.length < 15) return "NPWP Wajib Pajak wajib diisi lengkap (minimal 15 digit).";
    if (b.length < 15) return "NPWP Pemilik Objek wajib diisi lengkap (minimal 15 digit).";
    return null;
  }
  const wp = (nikWp || "").replace(/\D/g, "");
  const op = (nikOp || "").replace(/\D/g, "");
  if (wp.length !== 16) return "NIK Wajib Pajak wajib 16 digit.";
  if (op.length !== 16) return "NIK Pemilik Objek wajib 16 digit.";
  return null;
}

export default function BookingSspdTambahUnified({ defaultEntity, listPath }: BookingSspdTambahUnifiedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openObjek, setOpenObjek] = useState(true);
  const [openPerhitungan, setOpenPerhitungan] = useState(true);

  const [tanggal, setTanggal] = useState(defaultTanggal);
  const [nobookingValue, setNobookingValue] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [nopDigits, setNopDigits] = useState<string[]>(Array(7).fill(""));
  const [npwpWpDigits, setNpwpWpDigits] = useState<string[]>(Array(6).fill(""));
  const [npwpOpDigits, setNpwpOpDigits] = useState<string[]>(Array(6).fill(""));
  const [jenisPerolehan, setJenisPerolehan] = useState("");
  const [npoptkp, setNpoptkp] = useState<number>(80_000_000);
  const [tanggalOleh, setTanggalOleh] = useState({ d: "", m: "", y: "" });
  const [tanggalBayar, setTanggalBayar] = useState({ d: "", m: "", y: "" });
  const [tanggalOlehError, setTanggalOlehError] = useState<string | null>(null);
  const [tanggalBayarError, setTanggalBayarError] = useState<string | null>(null);
  const [calculatedTanah, setCalculatedTanah] = useState(0);
  const [calculatedBangunan, setCalculatedBangunan] = useState(0);

  const nopRefs = useRef<(HTMLInputElement | null)[]>([]);
  const npwpWpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const npwpOpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const tanggalOlehPickerRef = useRef<HTMLInputElement | null>(null);
  const tanggalBayarPickerRef = useRef<HTMLInputElement | null>(null);
  const [kecamatanSearch, setKecamatanSearch] = useState("");
  const [kecamatanDropdownOpen, setKecamatanDropdownOpen] = useState(false);
  const [kelurahanDropdownOpen, setKelurahanDropdownOpen] = useState(false);
  const kecamatanDropdownRef = useRef<HTMLDivElement>(null);
  const kelurahanDropdownRef = useRef<HTMLDivElement>(null);
  const callbackDropdownRef = useRef<HTMLDivElement>(null);
  /** Setelah lookup NIK/NPWP sukses, NOP tidak menimpa nama WP (subjek). */
  const wpSubjekAutofillDoneRef = useRef(false);
  const nopLookupAbortRef = useRef<AbortController | null>(null);
  const wpLookupAbortRef = useRef<AbortController | null>(null);

  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackSearch, setCallbackSearch] = useState("");
  const debouncedCallbackSearch = useDebouncedValue(callbackSearch, 350);
  const [callbackItems, setCallbackItems] = useState<CallbackHistoryRow[]>([]);
  const [callbackListLoading, setCallbackListLoading] = useState(false);
  const [callbackApplyLoading, setCallbackApplyLoading] = useState(false);
  const [callbackNotice, setCallbackNotice] = useState<string | null>(null);
  const [nopLookupLoading, setNopLookupLoading] = useState(false);
  const [nopLookupNotice, setNopLookupNotice] = useState<string | null>(null);
  const [entityKind, setEntityKind] = useState<BookingSspdEntity>(defaultEntity);
  const [wpIdentityInput, setWpIdentityInput] = useState("");
  const [wpLookupLoading, setWpLookupLoading] = useState(false);
  const [wpToast, setWpToast] = useState<string | null>(null);
  const [wpTeleponHint, setWpTeleponHint] = useState<string | null>(null);
  const minYear = 1900;
  const maxYear = today.getFullYear() + 1;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(minYear + i));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));

  const [form, setForm] = useState<Record<string, string | number | undefined>>({
    namawajibpajak: "",
    alamatwajibpajak: "",
    namapemilikobjekpajak: "",
    alamatpemilikobjekpajak: "",
    tahunajb: String(today.getFullYear()),
    kabupatenkotawp: "",
    kecamatanwp: "",
    kelurahandesawp: "",
    rtrwwp: "",
    kodeposwp: "",
    kabupatenkotaop: "Kabupaten Bogor",
    kecamatanop: "",
    kelurahandesaop: "",
    rtrwop: "",
    kodeposop: "",
    hargatransaksi: "",
    letaktanahdanbangunan: "",
    rt_rwobjekpajak: "",
    kecamatanlp: "",
    kelurahandesalp: "",
    status_kepemilikan: "milik_pribadi",
    jenisPerolehan: "",
    keterangan: "",
    nomor_sertifikat: "",
    luas_tanah: undefined,
    njop_tanah: undefined,
    luas_bangunan: undefined,
    njop_bangunan: undefined,
    bphtb_yangtelah_dibayar: undefined,
    npwpwp: "",
    npwpop: "",
  });

  const [billingModal, setBillingModal] = useState<null | { billing_id: string; amount: number; expires_at: string }>(null);

  const updateForm = useCallback((key: string, value: string | number | undefined) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "kecamatanop") next.kelurahandesaop = "";
      return next;
    });
    setError(null);
  }, []);

  const fetchLookupNop = useCallback(async () => {
    wpLookupAbortRef.current?.abort();
    const noppbb = buildNopPbb(nopDigits);
    const clean = noppbb.replace(/\D/g, "");
    if (!clean || clean.length < 10 || /^0+$/.test(clean)) {
      setNopLookupNotice(null);
      return;
    }
    nopLookupAbortRef.current?.abort();
    const ac = new AbortController();
    nopLookupAbortRef.current = ac;
    setNopLookupLoading(true);
    setNopLookupNotice(null);
    setError(null);
    try {
      const base = getBackendBaseUrl();
      const url = `${base ? base : ""}/api/ppat/pbb/lookup-nop?nop=${encodeURIComponent(noppbb)}`;
      const res = await fetch(url, { credentials: "include", signal: ac.signal });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success || !json?.data) {
        const msg = typeof json?.message === "string" ? json.message : "NOP tidak ditemukan atau gagal mengambil data.";
        setNopLookupNotice(null);
        setError(msg);
        return;
      }
      const d = json.data as Record<string, unknown>;
      const str = (k: string) => (d[k] != null && String(d[k]).trim() !== "" ? String(d[k]).trim() : undefined);
      const num = (k: string): number | undefined => {
        const v = d[k];
        if (typeof v === "number" && !Number.isNaN(v)) return v;
        if (typeof v === "string" && v.trim() !== "") return parseFloat(v.replace(/\./g, "").replace(",", "."));
        return undefined;
      };
      const skipNamaWp = wpSubjekAutofillDoneRef.current;
      setForm((prev) => ({
        ...prev,
        namawajibpajak: skipNamaWp ? prev.namawajibpajak : (str("namawajibpajak") ?? prev.namawajibpajak),
        letaktanahdanbangunan: str("alamat_objek") ?? prev.letaktanahdanbangunan,
        luas_tanah: num("luas_tanah") ?? prev.luas_tanah,
        njop_tanah: num("njop_tanah") ?? prev.njop_tanah,
        luas_bangunan: num("luas_bangunan") ?? prev.luas_bangunan,
        njop_bangunan: num("njop_bangunan") ?? prev.njop_bangunan,
      }));
      const src = str("source") ?? "internal_db";
      setNopLookupNotice(
        skipNamaWp
          ? `Data objek pajak dimuat (sumber: ${src}). Nama WP tidak diubah karena sudah diisi dari NIK/NPWP.`
          : `Referensi objek pajak dimuat (sumber: ${src}). Silakan sesuaikan jika ada perbedaan dengan dokumen.`
      );
      setOpenPerhitungan(true);
      window.setTimeout(() => setNopLookupNotice(null), 8000);
    } catch (e: unknown) {
      const aborted = typeof e === "object" && e !== null && "name" in e && (e as { name: string }).name === "AbortError";
      if (aborted) return;
      setError("Gagal menghubungi layanan pencarian NOP.");
    } finally {
      if (nopLookupAbortRef.current === ac) {
        setNopLookupLoading(false);
      }
    }
  }, [nopDigits]);

  const fetchWPData = useCallback(async () => {
    const raw = wpIdentityInput.trim();
    const digits = raw.replace(/\D/g, "");
    if (!raw) {
      setWpToast(null);
      return;
    }
    if (entityKind === "perorangan" && digits.length !== 16) {
      setWpToast("NIK harus 16 digit.");
      window.setTimeout(() => setWpToast(null), 5000);
      return;
    }
    if (entityKind === "badan" && digits.length < 15) {
      setWpToast("NPWP minimal 15 digit.");
      window.setTimeout(() => setWpToast(null), 5000);
      return;
    }

    nopLookupAbortRef.current?.abort();
    wpLookupAbortRef.current?.abort();
    const ac = new AbortController();
    wpLookupAbortRef.current = ac;

    setWpLookupLoading(true);
    setWpToast(null);
    setWpTeleponHint(null);
    setError(null);
    try {
      const base = getBackendBaseUrl();
      const kind = entityKind === "perorangan" ? "nik" : "npwp";
      const q = new URLSearchParams({
        identity_number: raw,
        identity_kind: kind,
      });
      const url = `${base ? base : ""}/api/user/lookup?${q.toString()}`;
      const res = await fetch(url, { credentials: "include", signal: ac.signal });
      const json = await res.json().catch(() => ({}));
      if (!json?.success || !json?.data) {
        const msg = typeof json?.message === "string" ? json.message : "Data belum terdaftar, silakan isi manual";
        setWpToast(msg);
        window.setTimeout(() => setWpToast(null), 6000);
        return;
      }
      const d = json.data as Record<string, unknown>;
      const str = (k: string) => (d[k] != null && String(d[k]).trim() !== "" ? String(d[k]).trim() : undefined);
      wpSubjekAutofillDoneRef.current = true;

      const alamatL = str("alamat_lengkap");
      const alamatParts = [str("kelurahan"), str("kecamatan"), str("kabupaten_kota")].filter(Boolean).join(", ");
      const npwpRaw = str("npwp_badan");
      if (npwpRaw && entityKind === "badan") {
        setNpwpWpDigits(parseNpwpToDigits(npwpRaw));
      }

      setForm((prev) => ({
        ...prev,
        namawajibpajak: str("nama") ?? prev.namawajibpajak,
        alamatwajibpajak: alamatL || (alamatParts ? alamatParts : prev.alamatwajibpajak),
        kabupatenkotawp: str("kabupaten_kota") ?? prev.kabupatenkotawp,
        kecamatanwp: str("kecamatan") ?? prev.kecamatanwp,
        kelurahandesawp: str("kelurahan") ?? prev.kelurahandesawp,
        rtrwwp: str("rtrw") ?? prev.rtrwwp,
        ...(entityKind === "perorangan" ? { npwpwp: digits.slice(0, 16) } : {}),
      }));

      const tel = str("telepon");
      setWpTeleponHint(tel ? `Telepon terdaftar: ${tel} (salin ke keterangan jika diperlukan)` : null);
    } catch (e: unknown) {
      const aborted = typeof e === "object" && e !== null && "name" in e && (e as { name: string }).name === "AbortError";
      if (aborted) return;
      setWpToast("Gagal menghubungi layanan pencarian data WP.");
      window.setTimeout(() => setWpToast(null), 6000);
    } finally {
      if (wpLookupAbortRef.current === ac) {
        setWpLookupLoading(false);
      }
    }
  }, [wpIdentityInput, entityKind]);

  const filteredKecamatan = KECAMATAN_OBJEK_LIST.filter((k) =>
    k.toLowerCase().includes((kecamatanSearch || "").toLowerCase().trim())
  );
  const kelurahanOptions: KelurahanOption[] = (form.kecamatanop && KECAMATAN_KELURAHAN[form.kecamatanop]) || [];
  const hasKelurahanData = kelurahanOptions.length > 0;
  const selectedKelurahanLabel = hasKelurahanData && form.kelurahandesaop
    ? (kelurahanOptions.find((o) => o.value === form.kelurahandesaop)?.label ?? form.kelurahandesaop)
    : "";

  useEffect(() => {
    const editFlag = (searchParams?.get("edit") || "").trim();
    if (editFlag === "1" || editFlag.toLowerCase() === "true") return;
    const q = normalizeEntityFromQuery(searchParams?.get("wajib"));
    if (q) setEntityKind(q);
  }, [searchParams]);

  const handleEntityKindChange = useCallback((next: BookingSspdEntity) => {
    if (next === entityKind) return;
    setEntityKind(next);
    setWpIdentityInput("");
    setWpTeleponHint(null);
    setWpToast(null);
    setNpwpWpDigits(Array(6).fill(""));
    setNpwpOpDigits(Array(6).fill(""));
    setForm((prev) => ({ ...prev, npwpwp: "", npwpop: "" }));
    setError(null);
  }, [entityKind]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (kecamatanDropdownRef.current && !kecamatanDropdownRef.current.contains(target)) setKecamatanDropdownOpen(false);
      if (kelurahanDropdownRef.current && !kelurahanDropdownRef.current.contains(target)) setKelurahanDropdownOpen(false);
      if (callbackDropdownRef.current && !callbackDropdownRef.current.contains(target)) setCallbackOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Edit mode: prefill by nobooking from URL (?edit=1&nobooking=XXX)
  useEffect(() => {
    const editFlag = (searchParams?.get("edit") || "").trim();
    const nb = (searchParams?.get("nobooking") || "").trim();
    if (!nb || (editFlag !== "1" && editFlag.toLowerCase() !== "true")) return;
    let cancelled = false;
    (async () => {
      setIsEditMode(true);
      setEditLoading(true);
      setError(null);
      try {
        const base = getBackendBaseUrl();
        const url = `${base ? base : ""}/api/ppat/booking/${encodeURIComponent(nb)}`;
        const res = await fetch(url, { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.success || !json?.data) {
          setError(typeof json?.message === "string" ? json.message : "Gagal memuat detail booking.");
          return;
        }
        const d = json.data as Record<string, unknown>;

        const str = (k: string) => (d[k] != null ? String(d[k]) : "");
        const num = (k: string) => {
          const v = d[k];
          if (typeof v === "number" && !Number.isNaN(v)) return v;
          if (typeof v === "string" && v.trim() !== "") return parseFloat(v.replace(/\./g, "").replace(",", "."));
          return undefined;
        };

        // Best-effort: backend GetBookingByNobooking currently returns limited fields.
        const jwpRaw = str("jenis_wajib_pajak");
        const isPerorangan = jwpRaw.toLowerCase().includes("perorangan");
        setEntityKind(isPerorangan ? "perorangan" : "badan");

        setNobookingValue(nb);
        setNopDigits(parseNopToDigits(str("nop")));
        if (isPerorangan) {
          setNpwpWpDigits(Array(6).fill(""));
          setNpwpOpDigits(Array(6).fill(""));
        } else {
          setNpwpWpDigits(parseNpwpToDigits(str("npwpwp")));
          setNpwpOpDigits(parseNpwpToDigits(str("npwpop")));
        }

        // Fill what we have, leave others editable for user to complete.
        setForm((prev) => ({
          ...prev,
          namawajibpajak: str("nama_wajib_pajak") || prev.namawajibpajak,
          alamatwajibpajak: str("alamat_wajib_pajak") || prev.alamatwajibpajak,
          namapemilikobjekpajak: str("atas_nama") || prev.namapemilikobjekpajak,
          // NOTE: backend doesn't return alamat pemilik in this query; keep previous.
          npwpwp: isPerorangan ? (str("npwpwp") || prev.npwpwp) : prev.npwpwp,
          npwpop: isPerorangan ? (str("npwpop") || prev.npwpop) : prev.npwpop,
          tahunajb: str("tahunajb") || prev.tahunajb,
          kabupatenkotawp: str("kabupaten_kota") || prev.kabupatenkotawp,
          kecamatanwp: str("kecamatan") || prev.kecamatanwp,
          kelurahandesawp: str("kelurahan") || prev.kelurahandesawp,
          kodeposwp: str("kodeposwp") || prev.kodeposwp,
          kabupatenkotaop: str("kabupatenkotaop") || prev.kabupatenkotaop,
          kecamatanop: str("kecamatanopj") || prev.kecamatanop,
          kelurahandesaop: str("kelurahanop") || prev.kelurahandesaop,
          letaktanahdanbangunan: str("Alamatop") || prev.letaktanahdanbangunan,
          keterangan: str("keterangan") || prev.keterangan,
          luas_tanah: num("luas_tanah") ?? prev.luas_tanah,
          luas_bangunan: num("luas_bangunan") ?? prev.luas_bangunan,
          bphtb_yangtelah_dibayar: num("bphtb_yangtelah_dibayar") ?? prev.bphtb_yangtelah_dibayar,
        }));
      } catch {
        if (!cancelled) setError("Gagal memuat detail booking.");
      } finally {
        if (!cancelled) setEditLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!callbackOpen) return;
    let cancelled = false;
    (async () => {
      setCallbackListLoading(true);
      try {
        const base = getBackendBaseUrl();
        const url = `${base ? base : ""}/api/ppat/booking/history?limit=30&q=${encodeURIComponent(debouncedCallbackSearch)}`;
        const res = await fetch(url, { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (json?.success && Array.isArray(json.data)) {
          setCallbackItems(json.data as CallbackHistoryRow[]);
        } else {
          setCallbackItems([]);
        }
      } catch {
        if (!cancelled) setCallbackItems([]);
      } finally {
        if (!cancelled) setCallbackListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [callbackOpen, debouncedCallbackSearch]);

  const applyCallbackFromData = useCallback((d: Record<string, unknown>) => {
    const str = (k: string) => (d[k] != null ? String(d[k]) : "");
    const num = (k: string) => {
      const v = d[k];
      if (typeof v === "number" && !Number.isNaN(v)) return v;
      if (typeof v === "string" && v.trim() !== "") return parseFloat(v.replace(/\./g, "").replace(",", "."));
      return undefined;
    };

    const jwpCb = str("jenis_wajib_pajak");
    const isPerCb = jwpCb.toLowerCase().includes("perorangan");
    setEntityKind(isPerCb ? "perorangan" : "badan");

    setNopDigits(parseNopToDigits(str("noppbb")));
    if (isPerCb) {
      setNpwpWpDigits(Array(6).fill(""));
      setNpwpOpDigits(Array(6).fill(""));
    } else {
      setNpwpWpDigits(parseNpwpToDigits(str("npwpwp")));
      setNpwpOpDigits(parseNpwpToDigits(str("npwpop")));
    }

    const jp = str("jenisPerolehan");
    setJenisPerolehan(jp);
    setNpoptkp(NPOPTKP_MAP[jp] ?? 80_000_000);
    const npopt = d.nilaiPerolehanObjekPajakTidakKenaPajak;
    if (typeof npopt === "number" && !Number.isNaN(npopt)) setNpoptkp(npopt);

    setTanggalOleh(parseDdMmYyyyParts(str("tanggal_perolehan")));
    setTanggalBayar(parseDdMmYyyyParts(str("tanggal_pembayaran")));

    const hargaRaw = d.hargatransaksi;
    let hargaStr = "";
    if (hargaRaw != null && String(hargaRaw).trim() !== "") {
      const n = typeof hargaRaw === "number" ? hargaRaw : parseRupiah(String(hargaRaw));
      hargaStr = n > 0 ? String(n) : "";
    }

    const bphtb = d.bphtb_yangtelah_dibayar;
    const bphtbVal =
      typeof bphtb === "number" && !Number.isNaN(bphtb)
        ? bphtb
        : typeof bphtb === "string" && bphtb.trim() !== ""
          ? parseRupiah(bphtb)
          : undefined;

    setKecamatanSearch("");
    setForm({
      namawajibpajak: str("namawajibpajak"),
      alamatwajibpajak: str("alamatwajibpajak"),
      namapemilikobjekpajak: str("namapemilikobjekpajak"),
      alamatpemilikobjekpajak: str("alamatpemilikobjekpajak"),
      tahunajb: str("tahunajb") || String(today.getFullYear()),
      kabupatenkotawp: str("kabupatenkotawp"),
      kecamatanwp: str("kecamatanwp"),
      kelurahandesawp: str("kelurahandesawp"),
      rtrwwp: str("rtrwwp"),
      kodeposwp: str("kodeposwp"),
      kabupatenkotaop: str("kabupatenkotaop") || "Kabupaten Bogor",
      kecamatanop: str("kecamatanop"),
      kelurahandesaop: str("kelurahandesaop"),
      rtrwop: str("rtrwop"),
      kodeposop: str("kodeposop"),
      hargatransaksi: hargaStr,
      letaktanahdanbangunan: str("letaktanahdanbangunan"),
      rt_rwobjekpajak: str("rt_rwobjekpajak"),
      kecamatanlp: str("kecamatanlp"),
      kelurahandesalp: str("kelurahandesalp"),
      status_kepemilikan: statusDbToForm(str("status_kepemilikan")),
      jenisPerolehan: jp,
      keterangan: str("keterangan"),
      nomor_sertifikat: str("nomor_sertifikat"),
      luas_tanah: num("luas_tanah"),
      njop_tanah: num("njop_tanah"),
      luas_bangunan: num("luas_bangunan"),
      njop_bangunan: num("njop_bangunan"),
      bphtb_yangtelah_dibayar: bphtbVal,
      npwpwp: isPerCb ? str("npwpwp") : "",
      npwpop: isPerCb ? str("npwpop") : "",
    });
    setOpenObjek(true);
    setOpenPerhitungan(true);
    setError(null);
  }, []);

  const handleCallbackSelect = async (nobooking: string) => {
    setCallbackOpen(false);
    setCallbackApplyLoading(true);
    setCallbackNotice(null);
    try {
      const base = getBackendBaseUrl();
      const url = `${base ? base : ""}/api/ppat/booking/${encodeURIComponent(nobooking)}/callback`;
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success || !json?.data) {
        setError(typeof json?.message === "string" ? json.message : "Gagal memuat data riwayat.");
        return;
      }
      applyCallbackFromData(json.data as Record<string, unknown>);
      const nopShow = String((json.data as Record<string, unknown>).noppbb ?? "").trim();
      setCallbackNotice(`Data berhasil dimuat dari riwayat NOP ${nopShow || nobooking}`);
      window.setTimeout(() => setCallbackNotice(null), 6000);
    } catch {
      setError("Gagal memuat data riwayat.");
    } finally {
      setCallbackApplyLoading(false);
    }
  };

  const handleJenisPerolehanChange = useCallback((val: string) => {
    setJenisPerolehan(val);
    setNpoptkp(NPOPTKP_MAP[val] ?? 80_000_000);
    updateForm("jenisPerolehan", val);
  }, [updateForm]);

  useEffect(() => {
    const lt = Number(form.luas_tanah) || 0;
    const nt = Number(form.njop_tanah) || 0;
    const lb = Number(form.luas_bangunan) || 0;
    const nb = Number(form.njop_bangunan) || 0;
    setCalculatedTanah(lt * nt);
    setCalculatedBangunan(lb * nb);
  }, [form.luas_tanah, form.njop_tanah, form.luas_bangunan, form.njop_bangunan]);

  useEffect(() => {
    setTanggalOlehError(validateDateParts(tanggalOleh, minYear, maxYear));
  }, [tanggalOleh, minYear, maxYear]);

  useEffect(() => {
    setTanggalBayarError(validateDateParts(tanggalBayar, minYear, maxYear));
  }, [tanggalBayar, minYear, maxYear]);

  const openNativeDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (!ref.current) return;
    if (typeof ref.current.showPicker === "function") {
      ref.current.showPicker();
      return;
    }
    ref.current.focus();
    ref.current.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const noppbb = buildNopPbb(nopDigits);
    const npwpwpBadan = buildNpwp(npwpWpDigits);
    const npwpopBadan = buildNpwp(npwpOpDigits);
    const npwpwp =
      entityKind === "badan"
        ? npwpwpBadan
        : String(form.npwpwp ?? "").replace(/\D/g, "").slice(0, 16);
    const npwpop =
      entityKind === "badan"
        ? npwpopBadan
        : String(form.npwpop ?? "").replace(/\D/g, "").slice(0, 16);

    const noppbbClean = noppbb.replace(/\./g, "").replace(/-/g, "");
    if (!noppbbClean || /^0+$/.test(noppbbClean)) {
      setError("NOP PBB wajib diisi dengan lengkap.");
      return;
    }
    if (!form.namawajibpajak?.toString().trim()) {
      setError("Nama Wajib Pajak wajib diisi.");
      return;
    }
    if (!form.namapemilikobjekpajak?.toString().trim()) {
      setError("Nama Pemilik Objek Pajak wajib diisi.");
      return;
    }

    const idErr = validateIdentityForEntity(
      entityKind,
      npwpwpBadan.replace(/\D/g, ""),
      npwpopBadan.replace(/\D/g, ""),
      String(form.npwpwp ?? ""),
      String(form.npwpop ?? "")
    );
    if (idErr) {
      setError(idErr);
      return;
    }

    const tanggalOlehErr = validateDateParts(tanggalOleh, minYear, maxYear);
    const tanggalBayarErr = validateDateParts(tanggalBayar, minYear, maxYear);
    if (tanggalOlehErr || tanggalBayarErr) {
      setError(tanggalOlehErr || tanggalBayarErr || "Tanggal tidak valid.");
      return;
    }

    const tanggalOlehStr = partsToIsoDate(tanggalOleh);
    const tanggalBayarStr = partsToIsoDate(tanggalBayar);

    const payload: CreatePayload = {
      jenis_wajib_pajak: entityKind === "badan" ? "Badan Usaha" : "Perorangan",
      noppbb,
      namawajibpajak: String(form.namawajibpajak ?? ""),
      alamatwajibpajak: String(form.alamatwajibpajak ?? ""),
      namapemilikobjekpajak: String(form.namapemilikobjekpajak ?? ""),
      alamatpemilikobjekpajak: String(form.alamatpemilikobjekpajak ?? ""),
      tanggal,
      tahunajb: String(form.tahunajb ?? ""),
      kabupatenkotawp: String(form.kabupatenkotawp ?? ""),
      kecamatanwp: String(form.kecamatanwp ?? ""),
      kelurahandesawp: String(form.kelurahandesawp ?? ""),
      rtrwwp: String(form.rtrwwp ?? ""),
      npwpwp,
      kodeposwp: String(form.kodeposwp ?? ""),
      kabupatenkotaop: String(form.kabupatenkotaop ?? ""),
      kecamatanop: String(form.kecamatanop ?? ""),
      kelurahandesaop: String(form.kelurahandesaop ?? ""),
      rtrwop: String(form.rtrwop ?? ""),
      npwpop,
      kodeposop: String(form.kodeposop ?? ""),
      trackstatus: "Terbuat",
      nilaiPerolehanObjekPajakTidakKenaPajak: npoptkp,
      bphtb_yangtelah_dibayar: form.bphtb_yangtelah_dibayar != null ? Number(form.bphtb_yangtelah_dibayar) : undefined,
      hargatransaksi: form.hargatransaksi?.toString(),
      letaktanahdanbangunan: form.letaktanahdanbangunan?.toString(),
      rt_rwobjekpajak: form.rt_rwobjekpajak?.toString(),
      kecamatanlp: form.kecamatanlp?.toString(),
      kelurahandesalp: form.kelurahandesalp?.toString(),
      status_kepemilikan: form.status_kepemilikan?.toString(),
      jenisPerolehan: form.jenisPerolehan?.toString(),
      keterangan: form.keterangan?.toString(),
      nomor_sertifikat: form.nomor_sertifikat?.toString(),
      tanggal_perolehan: tanggalOlehStr,
      tanggal_pembayaran: tanggalBayarStr,
      luas_tanah: form.luas_tanah != null ? Number(form.luas_tanah) : undefined,
      njop_tanah: form.njop_tanah != null ? Number(form.njop_tanah) : undefined,
      luas_bangunan: form.luas_bangunan != null ? Number(form.luas_bangunan) : undefined,
      njop_bangunan: form.njop_bangunan != null ? Number(form.njop_bangunan) : undefined,
    };

    setLoading(true);
    try {
      const base = getBackendBaseUrl();
      const url = isEditMode && nobookingValue
        ? (base ? `${base}/api/ppat/update-booking/${encodeURIComponent(nobookingValue)}` : `/api/ppat/update-booking/${encodeURIComponent(nobookingValue)}`)
        : (base
          ? `${base}${entityKind === "badan" ? "/api/ppat_create-booking-and-bphtb" : "/api/ppat_create-booking-and-bphtb-perorangan"}`
          : (entityKind === "badan" ? "/api/ppat_create-booking-and-bphtb" : "/api/ppat_create-booking-and-bphtb-perorangan"));
      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Gagal menyimpan booking.");
        return;
      }
      if (isEditMode) {
        if (data?.success) {
          setSuccess("Data Booking berhasil diperbarui!");
          setTimeout(() => router.push(listPath), 1200);
          return;
        }
        setError(data?.message || "Gagal memperbarui booking.");
        return;
      }
      if (data?.success && data?.nobooking) {
        setSuccess(`Booking berhasil dibuat. No. Booking: ${data.nobooking} (status: Terbuat)`);
        setNobookingValue(String(data.nobooking));
        setTimeout(() => router.push(listPath), 1500);
        return;
      }
      setError(data?.message || "Gagal menyimpan booking.");
    } catch {
      setError("Network error. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 0.5rem", color: "var(--color_font_main)" }}>
        Tambah Booking SSPD — {entityKind === "badan" ? "Badan Usaha" : "Perorangan"}
      </h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 24 }}>
        Satu form untuk badan &amp; perorangan. Pilih jenis wajib pajak di bawah; submit mengikuti{" "}
        <code>{entityKind === "badan" ? "/api/ppat_create-booking-and-bphtb" : "/api/ppat_create-booking-and-bphtb-perorangan"}</code>.
      </p>

      {isEditMode && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fff7ed", color: "#9a3412", borderRadius: 8, border: "1px solid #fed7aa" }}>
          Anda sedang dalam mode edit. Nomor booking tetap dan tidak dapat diubah.
        </div>
      )}

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fef2f2", color: "#b91c1c", borderRadius: 8 }}>{error}</div>
      )}
      {success && (
        <div style={{ padding: 12, marginBottom: 16, background: "#f0fdf4", color: "#166534", borderRadius: 8 }}>{success}</div>
      )}
      {callbackNotice && (
        <div style={{ padding: 10, marginBottom: 16, background: "#ecfdf5", color: "#047857", borderRadius: 8, fontSize: 14 }}>
          {callbackNotice}
        </div>
      )}

      <div
        ref={callbackDropdownRef}
        style={{
          marginBottom: 20,
          padding: 16,
          background: "var(--card_bg)",
          border: "1px solid var(--border_color)",
          borderRadius: 12,
          position: "relative",
        }}
      >
        <label style={{ ...labelStyle, marginBottom: 8 }}>Callback dari riwayat booking (NOP PBB — Nama Wajib Pajak)</label>
        <p style={{ ...hintStyle, marginBottom: 10 }}>
          Pilih booking lama untuk mengisi form otomatis. Tanggal pengajuan hari ini dan nomor bukti pembayaran dikosongkan agar Anda mengisi yang baru.
        </p>
        <div style={{ position: "relative" }}>
          <input
            style={{ ...inputStyle, marginTop: 0 }}
            placeholder="Ketik NOP, nama WP, atau no. booking — tunggu sebentar saat mengetik"
            value={callbackSearch}
            onChange={(e) => {
              setCallbackSearch(e.target.value);
              if (!callbackOpen) setCallbackOpen(true);
            }}
            onFocus={() => setCallbackOpen(true)}
            disabled={callbackApplyLoading}
          />
          {callbackOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: 4,
                maxHeight: 260,
                overflowY: "auto",
                background: "var(--card_bg)",
                border: "1px solid var(--border_color)",
                borderRadius: 8,
                boxShadow: "var(--card_shadow)",
                zIndex: 60,
              }}
            >
              {callbackListLoading ? (
                <div style={{ padding: 12, color: "var(--color_font_main_muted)", fontSize: 14 }}>Mencari...</div>
              ) : callbackItems.length === 0 ? (
                <div style={{ padding: 12, color: "var(--color_font_main_muted)", fontSize: 14 }}>Tidak ada data</div>
              ) : (
                callbackItems.map((row) => (
                  <button
                    key={row.nobooking}
                    type="button"
                    disabled={callbackApplyLoading}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 12px",
                      textAlign: "left",
                      border: "none",
                      background: "transparent",
                      color: "var(--color_font_main)",
                      cursor: callbackApplyLoading ? "not-allowed" : "pointer",
                      fontSize: 14,
                    }}
                    onClick={() => handleCallbackSelect(row.nobooking)}
                  >
                    {row.label || `${row.noppbb} — ${row.namawajibpajak}`}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {callbackApplyLoading && (
          <p style={{ ...hintStyle, marginTop: 8, marginBottom: 0 }}>Memuat data ke form...</p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ background: "var(--card_bg)", border: "1px solid var(--border_color)", borderRadius: 12, padding: 24 }}
      >
        {/* Tanggal & No Booking */}
        <div style={sectionStyle}>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Tanggal (DD-MM-YYYY)</label>
              <input
                style={inputStyle}
                type="text"
                value={tanggal}
                readOnly
                placeholder="Auto"
              />
            </div>
            <div>
              <label style={labelStyle}>No Booking</label>
              <input
                style={{ ...inputStyle, background: "var(--card_bg_grey)" }}
                type="text"
                placeholder="Akan tergenerate otomatis"
                value={nobookingValue}
                readOnly
                disabled
              />
            </div>
          </div>
        </div>

        {/* Jenis wajib pajak — satu jalur form */}
        <div
          style={{
            ...sectionStyle,
            padding: 16,
            background: "var(--card_bg_grey)",
            borderRadius: 8,
            border: "1px solid var(--border_color)",
          }}
        >
          <label style={labelStyle}>Jenis wajib pajak</label>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: editLoading ? "not-allowed" : "pointer", fontWeight: 600 }}>
              <input
                type="radio"
                name="jenisWajibPajakForm"
                checked={entityKind === "badan"}
                onChange={() => handleEntityKindChange("badan")}
                disabled={editLoading}
              />
              Badan Usaha
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: editLoading ? "not-allowed" : "pointer", fontWeight: 600 }}>
              <input
                type="radio"
                name="jenisWajibPajakForm"
                checked={entityKind === "perorangan"}
                onChange={() => handleEntityKindChange("perorangan")}
                disabled={editLoading}
              />
              Perorangan
            </label>
          </div>
          <p style={hintStyle}>Memilih badan atau perorangan mengubah format identitas (NPWP vs NIK) tanpa mengubah endpoint backend — payload mengikuti pilihan ini.</p>
        </div>

        {/* Pembayar Pajak BPHTB */}
        <h3 style={judulStyle}>Pembayar Pajak BPHTB</h3>
        <div style={{ ...sectionStyle, padding: 16, background: "var(--card_bg_grey)", borderRadius: 8, border: "1px solid var(--border_color)" }}>
          <p style={{ ...hintStyle, marginTop: 0, marginBottom: 12, fontWeight: 600, color: "var(--color_font_main)" }}>
            Langkah 1 — Data subjek (wajib pajak): isi {entityKind === "badan" ? "NPWP" : "NIK"} untuk pencarian, lalu Langkah 2 — NOP PBB untuk data objek.
          </p>
          <label style={labelStyle}>{entityKind === "badan" ? "NPWP Wajib Pajak" : "NIK Wajib Pajak"} (pencarian)</label>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 400 }}>
              {wpLookupLoading && (
                <span
                  title="Mencari data…"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-40%)",
                    fontSize: 14,
                    lineHeight: 1,
                    pointerEvents: "none",
                  }}
                >
                  ⏳
                </span>
              )}
              <input
                style={{ ...inputStyle, marginTop: 0, paddingRight: 40, paddingLeft: wpLookupLoading ? 36 : 12 }}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={entityKind === "badan" ? "15 digit NPWP (boleh dengan tanda pemisah)" : "16 digit NIK"}
                value={wpIdentityInput}
                onChange={(e) => setWpIdentityInput(e.target.value)}
                onBlur={() => {
                  if (wpIdentityInput.trim()) void fetchWPData();
                }}
                disabled={wpLookupLoading || editLoading}
              />
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-30%)",
                  fontSize: 18,
                  opacity: 0.55,
                  pointerEvents: "none",
                }}
                aria-hidden
              >
                🔍
              </span>
            </div>
            <button
              type="button"
              disabled={wpLookupLoading || editLoading}
              onClick={() => void fetchWPData()}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid var(--border_color)",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 600,
                cursor: wpLookupLoading ? "not-allowed" : "pointer",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {wpLookupLoading ? "Mengecek…" : "Cek Data WP"}
            </button>
          </div>
          <p style={hintStyle}>
            Data diambil dari pengguna terdaftar E-BPHTB. Setelah ini, gunakan NOP PBB untuk objek pajak (luas/NJOP).
          </p>
          {wpTeleponHint && (
            <p style={{ ...hintStyle, color: "#0369a1", fontWeight: 600 }}>{wpTeleponHint}</p>
          )}
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>NOP PBB</label>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
            {([2, 2, 3, 3, 3, 4, 1] as const).map((len, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  ref={(el) => { nopRefs.current[i] = el; }}
                  style={{ ...inputStyle, width: len === 1 ? 36 : len <= 2 ? 44 : 56, marginTop: 0, textAlign: "center" }}
                  type="text"
                  inputMode="numeric"
                  maxLength={len}
                  value={nopDigits[i] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, len);
                    setNopDigits((prev) => {
                      const n = [...prev];
                      n[i] = v;
                      return n;
                    });
                    if (v.length === len && i < 6) {
                      nopRefs.current[i + 1]?.focus();
                    }
                  }}
                  onBlur={() => {
                    if (i === 6) void fetchLookupNop();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !nopDigits[i] && i > 0) {
                      nopRefs.current[i - 1]?.focus();
                    }
                  }}
                  placeholder={"x".repeat(len)}
                />
                {i < 6 && <span style={{ color: "var(--color_font_main_muted)" }}>.</span>}
              </span>
            ))}
            </div>
            <button
              type="button"
              disabled={nopLookupLoading || editLoading}
              onClick={() => void fetchLookupNop()}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid var(--border_color)",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 600,
                cursor: nopLookupLoading ? "not-allowed" : "pointer",
                fontSize: 14,
                whiteSpace: "nowrap",
              }}
            >
              {nopLookupLoading ? "Mencari…" : "Cek NOP"}
            </button>
          </div>
          <p style={hintStyle}>Format: 32.01.001.001.001.0001.1 — isi lengkap lalu klik &quot;Cek NOP&quot; atau tab keluar dari kolom terakhir untuk tarik data referensi PBB.</p>
          {nopLookupNotice && (
            <p style={{ ...hintStyle, color: "#047857", fontWeight: 600 }}>{nopLookupNotice}</p>
          )}
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Nama Wajib Pajak</label>
          <input
            style={inputStyle}
            value={form.namawajibpajak ?? ""}
            onChange={(e) => updateForm("namawajibpajak", e.target.value)}
            placeholder="Nama wajib pajak"
            required
          />
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>Alamat Wajib Pajak</label>
          <textarea
            style={{ ...inputStyle, minHeight: 60 }}
            value={form.alamatwajibpajak ?? ""}
            onChange={(e) => updateForm("alamatwajibpajak", e.target.value)}
            placeholder="Jl. Contoh No. 123"
            required
          />
        </div>
        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>Kabupaten/Kota WP</label>
            <input style={inputStyle} value={form.kabupatenkotawp ?? ""} onChange={(e) => updateForm("kabupatenkotawp", e.target.value)} placeholder="Kabupaten Bogor" required />
          </div>
          <div>
            <label style={labelStyle}>Kecamatan WP</label>
            <input style={inputStyle} value={form.kecamatanwp ?? ""} onChange={(e) => updateForm("kecamatanwp", e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Kelurahan/Desa WP</label>
            <input style={inputStyle} value={form.kelurahandesawp ?? ""} onChange={(e) => updateForm("kelurahandesawp", e.target.value)} required />
          </div>
        </div>
        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>RT/RW WP</label>
            <input style={inputStyle} value={form.rtrwwp ?? ""} onChange={(e) => updateForm("rtrwwp", e.target.value)} placeholder="001/001" required />
          </div>
          <div>
            <label style={labelStyle}>Tahun AJB</label>
            <input
              style={inputStyle}
              type="number"
              value={form.tahunajb ?? ""}
              onChange={(e) => updateForm("tahunajb", e.target.value)}
              placeholder="2025"
              maxLength={4}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Kode Pos WP</label>
            <input style={inputStyle} value={form.kodeposwp ?? ""} onChange={(e) => updateForm("kodeposwp", e.target.value)} placeholder="16100" required />
          </div>
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>{entityKind === "badan" ? "NPWP Wajib Pajak (tersimpan)" : "NIK Wajib Pajak (tersimpan)"}</label>
          {entityKind === "badan" ? (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
                {([2, 3, 3, 1, 3, 3] as const).map((len, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                    <input
                      ref={(el) => { npwpWpRefs.current[i] = el; }}
                      style={{ ...inputStyle, width: len === 1 ? 36 : 48, marginTop: 0, textAlign: "center" }}
                      type="text"
                      inputMode="numeric"
                      maxLength={len}
                      value={npwpWpDigits[i] ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, len);
                        setNpwpWpDigits((prev) => {
                          const n = [...prev];
                          n[i] = v;
                          return n;
                        });
                        if (v.length === len && i < 5) npwpWpRefs.current[i + 1]?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !npwpWpDigits[i] && i > 0) npwpWpRefs.current[i - 1]?.focus();
                      }}
                      placeholder={"x".repeat(len)}
                    />
                    {i < 3 && <span style={{ color: "var(--color_font_main_muted)" }}>.</span>}
                    {i === 3 && <span style={{ color: "var(--color_font_main_muted)" }}>-</span>}
                    {i === 4 && <span style={{ color: "var(--color_font_main_muted)" }}>.</span>}
                  </span>
                ))}
              </div>
              <p style={hintStyle}>Format: 00.000.000.0-000.000</p>
            </>
          ) : (
            <>
              <input
                style={inputStyle}
                type="text"
                inputMode="numeric"
                maxLength={16}
                value={form.npwpwp ?? ""}
                onChange={(e) => updateForm("npwpwp", e.target.value.replace(/\D/g, "").slice(0, 16))}
                placeholder="NIK 16 digit"
                required
              />
              <p style={hintStyle}>Untuk perorangan, isi NIK (tanpa format NPWP)</p>
            </>
          )}
        </div>

        {/* Pemilik Objek Pajak BPHTB */}
        <h3 style={judulStyle}>Pemilik Objek Pajak BPHTB</h3>
        <div style={sectionStyle}>
          <label style={labelStyle}>Nama Pemilik Objek Pajak</label>
          <input
            style={inputStyle}
            value={form.namapemilikobjekpajak ?? ""}
            onChange={(e) => updateForm("namapemilikobjekpajak", e.target.value)}
            placeholder="Nama pemilik objek"
            required
          />
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>Alamat Pemilik Objek Pajak</label>
          <textarea
            style={{ ...inputStyle, minHeight: 60 }}
            value={form.alamatpemilikobjekpajak ?? ""}
            onChange={(e) => updateForm("alamatpemilikobjekpajak", e.target.value)}
            placeholder="Jl. Contoh No. 456"
            required
          />
        </div>
        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>Kabupaten/Kota Objek</label>
            <input
              style={{ ...inputStyle, background: "var(--card_bg_grey)", cursor: "default" }}
              value="Kabupaten Bogor"
              readOnly
            />
          </div>
          <div ref={kecamatanDropdownRef} style={{ position: "relative" }}>
            <label style={labelStyle}>Kecamatan Objek</label>
            <input
              style={inputStyle}
              value={kecamatanDropdownOpen ? kecamatanSearch : (form.kecamatanop ?? "")}
              onChange={(e) => {
                setKecamatanSearch(e.target.value);
                if (!kecamatanDropdownOpen) setKecamatanDropdownOpen(true);
              }}
              onFocus={() => setKecamatanDropdownOpen(true)}
              placeholder="Ketik untuk cari (40 kecamatan)"
              required
            />
            {kecamatanDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  maxHeight: 220,
                  overflowY: "auto",
                  background: "var(--card_bg)",
                  border: "1px solid var(--border_color)",
                  borderRadius: 8,
                  boxShadow: "var(--card_shadow)",
                  zIndex: 50,
                }}
              >
                {filteredKecamatan.length === 0 ? (
                  <div style={{ padding: 12, color: "var(--color_font_main_muted)", fontSize: 14 }}>Tidak ada kecamatan</div>
                ) : (
                  filteredKecamatan.map((k) => (
                    <button
                      key={k}
                      type="button"
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 12px",
                        textAlign: "left",
                        border: "none",
                        background: form.kecamatanop === k ? "var(--accent)" : "transparent",
                        color: form.kecamatanop === k ? "#fff" : "var(--color_font_main)",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                      onClick={() => {
                        updateForm("kecamatanop", k);
                        setKecamatanSearch("");
                        setKecamatanDropdownOpen(false);
                      }}
                    >
                      {k}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div ref={kelurahanDropdownRef} style={{ position: "relative" }}>
            <label style={labelStyle}>Kelurahan/Desa Objek</label>
            {hasKelurahanData ? (
              <>
                <input
                  style={inputStyle}
                  value={selectedKelurahanLabel}
                  onFocus={() => setKelurahanDropdownOpen(true)}
                  readOnly
                  placeholder="Pilih kecamatan dulu, lalu pilih kelurahan/desa"
                  required
                />
                {kelurahanDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      maxHeight: 220,
                      overflowY: "auto",
                      background: "var(--card_bg)",
                      border: "1px solid var(--border_color)",
                      borderRadius: 8,
                      boxShadow: "var(--card_shadow)",
                      zIndex: 50,
                    }}
                  >
                    {kelurahanOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "10px 12px",
                          textAlign: "left",
                          border: "none",
                          background: form.kelurahandesaop === opt.value ? "var(--accent)" : "transparent",
                          color: form.kelurahandesaop === opt.value ? "#fff" : "var(--color_font_main)",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                        onClick={() => {
                          updateForm("kelurahandesaop", opt.value);
                          setKelurahanDropdownOpen(false);
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <input
                style={inputStyle}
                value={form.kelurahandesaop ?? ""}
                onChange={(e) => updateForm("kelurahandesaop", e.target.value)}
                placeholder={form.kecamatanop ? "Isi kelurahan/desa (data denah belum tersedia)" : "Pilih kecamatan dulu"}
                required
              />
            )}
          </div>
        </div>
        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>{entityKind === "badan" ? "NPWP Objek" : "NIK Pemilik Objek Pajak"}</label>
            {entityKind === "badan" ? (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
                  {([2, 3, 3, 1, 3, 3] as const).map((len, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                      <input
                        ref={(el) => { npwpOpRefs.current[i] = el; }}
                        style={{ ...inputStyle, width: len === 1 ? 36 : 48, marginTop: 0, textAlign: "center" }}
                        type="text"
                        inputMode="numeric"
                        maxLength={len}
                        value={npwpOpDigits[i] ?? ""}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, len);
                          setNpwpOpDigits((prev) => {
                            const n = [...prev];
                            n[i] = v;
                            return n;
                          });
                          if (v.length === len && i < 5) npwpOpRefs.current[i + 1]?.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !npwpOpDigits[i] && i > 0) npwpOpRefs.current[i - 1]?.focus();
                        }}
                        placeholder={"x".repeat(len)}
                      />
                      {i < 3 && <span style={{ color: "var(--color_font_main_muted)" }}>.</span>}
                      {i === 3 && <span style={{ color: "var(--color_font_main_muted)" }}>-</span>}
                      {i === 4 && <span style={{ color: "var(--color_font_main_muted)" }}>.</span>}
                    </span>
                  ))}
                </div>
                <p style={hintStyle}>Otomatis pindah ke kolom berikutnya</p>
              </>
            ) : (
              <>
                <input
                  style={inputStyle}
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={form.npwpop ?? ""}
                  onChange={(e) => updateForm("npwpop", e.target.value.replace(/\D/g, "").slice(0, 16))}
                  placeholder="NIK 16 digit"
                  required
                />
                <p style={hintStyle}>Untuk perorangan, isi dengan NIK</p>
              </>
            )}
          </div>
          <div>
            <label style={labelStyle}>RT/RW Objek</label>
            <input style={inputStyle} value={form.rtrwop ?? ""} onChange={(e) => updateForm("rtrwop", e.target.value)} placeholder="001/001" required />
          </div>
          <div>
            <label style={labelStyle}>Kode Pos Objek</label>
            <input style={inputStyle} value={form.kodeposop ?? ""} onChange={(e) => updateForm("kodeposop", e.target.value)} required />
          </div>
        </div>

        {/* Objek Pajak BPHTB - Collapsible */}
        <div style={{ marginBottom: 24, border: "1px solid var(--border_color)", borderRadius: 8, overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => setOpenObjek(!openObjek)}
            style={{
              width: "100%",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--card_bg_grey)",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            <span>Objek Pajak BPHTB</span>
            <span>{openObjek ? "−" : "+"}</span>
          </button>
          {openObjek && (
            <div style={{ padding: 16, borderTop: "1px solid var(--border_color)" }}>
              <div style={sectionStyle}>
                <label style={labelStyle}>Harga Transaksi/Nilai Pasar</label>
                <input
                  style={inputStyle}
                  type="text"
                  inputMode="numeric"
                  value={form.hargatransaksi ? formatRupiah(parseRupiah(String(form.hargatransaksi))) : ""}
                  onChange={(e) => {
                    const num = parseRupiah(e.target.value);
                    updateForm("hargatransaksi", num ? String(num) : "");
                  }}
                  placeholder="contoh: 100.000.000"
                  required
                />
                <p style={hintStyle}>otomatis format ribuan (titik)</p>
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Letak Tanah dan/atau Bangunan</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60 }}
                  value={form.letaktanahdanbangunan ?? ""}
                  onChange={(e) => updateForm("letaktanahdanbangunan", e.target.value)}
                  placeholder="Masukkan Alamat Lengkap"
                  required
                />
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Jenis Perolehan Hak</label>
                <select
                  style={inputStyle}
                  value={form.jenisPerolehan ?? ""}
                  onChange={(e) => handleJenisPerolehanChange(e.target.value)}
                  required
                >
                  {JENIS_PEROLEHAN.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Status Kepemilikan</label>
                  <select
                    style={inputStyle}
                    value={form.status_kepemilikan ?? "milik_pribadi"}
                    onChange={(e) => updateForm("status_kepemilikan", e.target.value)}
                  >
                    <option value="milik_pribadi">Milik Pribadi</option>
                    <option value="milik_bersama">Milik Bersama</option>
                    <option value="sewa">Sewa</option>
                    <option value="hgb">Hak Guna Bangunan (HGB)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>RT/RW Objek Pajak</label>
                  <input
                    style={inputStyle}
                    value={form.rt_rwobjekpajak ?? ""}
                    onChange={(e) => updateForm("rt_rwobjekpajak", e.target.value)}
                    placeholder="001/001"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nomor Sertifikat Tanah</label>
                  <input
                    style={inputStyle}
                    value={form.nomor_sertifikat ?? ""}
                    onChange={(e) => updateForm("nomor_sertifikat", e.target.value)}
                    placeholder="Nomor sertifikat"
                    required
                  />
                </div>
              </div>
              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Kelurahan/Desa</label>
                  <input
                    style={inputStyle}
                    value={form.kelurahandesalp ?? ""}
                    onChange={(e) => updateForm("kelurahandesalp", e.target.value)}
                    placeholder="Kelurahan/Desa"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Kecamatan</label>
                  <input
                    style={inputStyle}
                    value={form.kecamatanlp ?? ""}
                    onChange={(e) => updateForm("kecamatanlp", e.target.value)}
                    placeholder="Kecamatan"
                    required
                  />
                </div>
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Keterangan (opsional)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 50 }}
                  value={form.keterangan ?? ""}
                  onChange={(e) => updateForm("keterangan", e.target.value)}
                  placeholder="Keterangan tambahan"
                />
              </div>
            </div>
          )}
        </div>

        {/* Perhitungan NJOP & Pajak BPHTB — satu alur vertikal */}
        <div style={{ marginBottom: 24, border: "1px solid var(--border_color)", borderRadius: 8, overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => setOpenPerhitungan(!openPerhitungan)}
            style={{
              width: "100%",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--card_bg_grey)",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            <span>Perhitungan NJOP &amp; Pajak BPHTB</span>
            <span>{openPerhitungan ? "−" : "+"}</span>
          </button>
          {openPerhitungan && (
            <div style={{ padding: 16, borderTop: "1px solid var(--border_color)" }}>
              <p style={{ ...hintStyle, marginTop: 0, marginBottom: 16, fontWeight: 700, color: "var(--color_font_main)" }}>
                Alur vertikal: luas/NJOP → tanggal pajak → NPOPTKP &amp; bea (setelah jenis perolehan diisi di blok Objek Pajak).
              </p>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--color_font_main)" }}>
                Tanah ({formatRupiahCompact(calculatedTanah)})
              </h4>
              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Luas Tanah (m²)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.luas_tanah ?? ""}
                    onChange={(e) => updateForm("luas_tanah", e.target.value ? Number(e.target.value) : undefined)}
                    required
                  />
                  <p style={hintStyle}>contoh: 289.2 (gunakan titik untuk desimal)</p>
                </div>
                <div>
                  <label style={labelStyle}>NJOP Tanah (Rp)</label>
                  <input
                    style={inputStyle}
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(form.njop_tanah as number | undefined)}
                    onChange={(e) => {
                      const num = parseRupiah(e.target.value);
                      updateForm("njop_tanah", num || undefined);
                    }}
                    placeholder="0"
                    required
                  />
                  <p style={hintStyle}>contoh: 1.500.000.000 — otomatis format ribuan</p>
                </div>
              </div>
              <h4 style={{ margin: "16px 0 12px", fontSize: 14, color: "var(--color_font_main)" }}>
                Bagian Bangunan ({formatRupiahCompact(calculatedBangunan)})
              </h4>
              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Luas Bangunan (m²)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.luas_bangunan ?? ""}
                    onChange={(e) => updateForm("luas_bangunan", e.target.value ? Number(e.target.value) : undefined)}
                    required
                  />
                  <p style={hintStyle}>contoh: 289.2</p>
                </div>
                <div>
                  <label style={labelStyle}>NJOP Bangunan (Rp)</label>
                  <input
                    style={inputStyle}
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(form.njop_bangunan as number | undefined)}
                    onChange={(e) => {
                      const num = parseRupiah(e.target.value);
                      updateForm("njop_bangunan", num || undefined);
                    }}
                    placeholder="0"
                    required
                  />
                  <p style={hintStyle}>contoh: 1.500.000.000 — otomatis format ribuan</p>
                </div>
              </div>

              <div style={{ margin: "20px 0 12px", paddingTop: 16, borderTop: "1px dashed var(--border_color)" }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--color_font_main)" }}>Tanggal perolehan &amp; pembayaran</h4>
              </div>
              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Tanggal Perolehan (DD/MM/YYYY)</label>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <select
                      style={{ ...inputStyle, width: 72, marginTop: 0 }}
                      value={tanggalOleh.d}
                      onChange={(e) => setTanggalOleh((p) => ({ ...p, d: e.target.value }))}
                      required
                    >
                      <option value="">DD</option>
                      {days.map((d) => (
                        <option key={d} value={d}>{String(d).padStart(2, "0")}</option>
                      ))}
                    </select>
                    <span>/</span>
                    <select
                      style={{ ...inputStyle, width: 80, marginTop: 0 }}
                      value={tanggalOleh.m}
                      onChange={(e) => setTanggalOleh((p) => ({ ...p, m: e.target.value }))}
                      required
                    >
                      <option value="">MM</option>
                      {months.map((m) => (
                        <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                      ))}
                    </select>
                    <span>/</span>
                    <select
                      style={{ ...inputStyle, width: 95, marginTop: 0 }}
                      value={tanggalOleh.y}
                      onChange={(e) => setTanggalOleh((p) => ({ ...p, y: e.target.value }))}
                      required
                    >
                      <option value="">YYYY</option>
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openNativeDatePicker(tanggalOlehPickerRef)}
                      style={{ ...inputStyle, width: 44, marginTop: 0, padding: "8px 0", cursor: "pointer" }}
                      title="Pilih dari kalender"
                    >
                      📅
                    </button>
                    <input
                      ref={tanggalOlehPickerRef}
                      type="date"
                      value={partsToIsoDate(tanggalOleh)}
                      onChange={(e) => setTanggalOleh(isoDateToParts(e.target.value))}
                      style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>
                  <p style={hintStyle}>Tanggal: {formatTanggalIndonesia(tanggalOleh)}</p>
                  {tanggalOlehError ? <p style={{ ...hintStyle, color: "#b91c1c" }}>{tanggalOlehError}</p> : null}
                </div>
                <div>
                  <label style={labelStyle}>Tanggal Pembayaran (DD/MM/YYYY)</label>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <select
                      style={{ ...inputStyle, width: 72, marginTop: 0 }}
                      value={tanggalBayar.d}
                      onChange={(e) => setTanggalBayar((p) => ({ ...p, d: e.target.value }))}
                      required
                    >
                      <option value="">DD</option>
                      {days.map((d) => (
                        <option key={d} value={d}>{String(d).padStart(2, "0")}</option>
                      ))}
                    </select>
                    <span>/</span>
                    <select
                      style={{ ...inputStyle, width: 80, marginTop: 0 }}
                      value={tanggalBayar.m}
                      onChange={(e) => setTanggalBayar((p) => ({ ...p, m: e.target.value }))}
                      required
                    >
                      <option value="">MM</option>
                      {months.map((m) => (
                        <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                      ))}
                    </select>
                    <span>/</span>
                    <select
                      style={{ ...inputStyle, width: 95, marginTop: 0 }}
                      value={tanggalBayar.y}
                      onChange={(e) => setTanggalBayar((p) => ({ ...p, y: e.target.value }))}
                      required
                    >
                      <option value="">YYYY</option>
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openNativeDatePicker(tanggalBayarPickerRef)}
                      style={{ ...inputStyle, width: 44, marginTop: 0, padding: "8px 0", cursor: "pointer" }}
                      title="Pilih dari kalender"
                    >
                      📅
                    </button>
                    <input
                      ref={tanggalBayarPickerRef}
                      type="date"
                      value={partsToIsoDate(tanggalBayar)}
                      onChange={(e) => setTanggalBayar(isoDateToParts(e.target.value))}
                      style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>
                  <p style={hintStyle}>Tanggal: {formatTanggalIndonesia(tanggalBayar)}</p>
                  {tanggalBayarError ? <p style={{ ...hintStyle, color: "#b91c1c" }}>{tanggalBayarError}</p> : null}
                </div>
              </div>

              <div style={{ ...sectionStyle, marginTop: 16, padding: 12, background: "rgba(0,82,155,0.06)", borderRadius: 8 }}>
                <label style={labelStyle}>ID Billing Bank (otomatis)</label>
                <div style={{ ...hintStyle, color: "var(--color_font_muted)", fontSize: 13, fontWeight: 600, marginTop: 0 }}>
                  ID Billing akan dibuat setelah simpan/proses. Tidak perlu input manual — berbeda dari No. Registrasi berkas Bappenda.
                </div>
              </div>

              <div style={{ margin: "20px 0 12px", paddingTop: 16, borderTop: "1px dashed var(--border_color)" }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--color_font_main)" }}>Pajak BPHTB</h4>
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>NPOPTKP (auto dari Jenis Perolehan)</label>
                <input
                  style={{ ...inputStyle, background: "var(--card_bg_grey)" }}
                  type="text"
                  value={npoptkp.toLocaleString("id-ID")}
                  readOnly
                />
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Bea Perolehan Hak Atas Tanah yang telah dibayar</label>
                <input
                  style={inputStyle}
                  type="text"
                  inputMode="numeric"
                  value={formatRupiah(form.bphtb_yangtelah_dibayar as number | undefined)}
                  onChange={(e) => {
                    const num = parseRupiah(e.target.value);
                    updateForm("bphtb_yangtelah_dibayar", num || undefined);
                  }}
                  placeholder="0"
                  required
                />
                <p style={hintStyle}>otomatis format ribuan (titik)</p>
              </div>
            </div>
          )}
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>ID Billing Bank (otomatis)</label>
          <div style={{ ...hintStyle, color: "var(--color_font_muted)", fontSize: 13, fontWeight: 600 }}>
            Billing diminta dari dropdown setelah data sudah benar. Field ini tidak perlu diisi manual.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            type="submit"
            disabled={loading || editLoading}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 600,
              cursor: loading || editLoading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan" : "Simpan (Terbuat)")}
          </button>
          <Link
            href={listPath}
            prefetch={false}
            style={{ padding: "12px 24px", borderRadius: 8, border: "1px solid var(--border_color)", color: "var(--color_font_main)", fontWeight: 600, textDecoration: "none" }}
          >
            Batal
          </Link>
        </div>
      </form>

      <p style={{ marginTop: 16 }}>
        <Link href={listPath} prefetch={false} style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke daftar booking
        </Link>
      </p>

      {wpToast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "min(420px, calc(100vw - 32px))",
            padding: "12px 18px",
            borderRadius: 10,
            background: "#1e293b",
            color: "#f8fafc",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            zIndex: 100,
            textAlign: "center",
          }}
        >
          {wpToast}
        </div>
      )}

      {/* Billing modal dipindahkan ke dropdown dashboard (flow baru). Tetap disediakan untuk reuse. */}
      {billingModal && (
        <BillingShareCard
          data={{ billingId: billingModal.billing_id, amount: billingModal.amount, expiresAtISO: billingModal.expires_at }}
          onClose={() => setBillingModal(null)}
        />
      )}
    </div>
  );
}
