/**
 * KTP OCR - Rebuild untuk target 80%+ akurasi (reading + analysis)
 * Layanan uji sebelum produksi (DL/ML).
 * Output: JSON untuk unverified_users di admin.
 */

import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

const VALID_PROVINCES = [
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '31', '32', '33', '34', '35', '36',
  '51', '52', '53', '61', '62', '63', '64', '65', '71', '72', '73', '74', '75', '76', '81', '82',
  '91', '92', '93', '94',
];

const STATUS_OPTIONS = [
  { keys: ['BELUM', 'KAWIN'], out: 'Belum Kawin' },
  { keys: ['CERAI', 'HIDUP'], out: 'Cerai Hidup' },
  { keys: ['CERAI', 'MATI'], out: 'Cerai Mati' },
  { keys: ['JANDA'], out: 'Janda' },
  { keys: ['DUDA'], out: 'Duda' },
  { keys: ['KAWIN'], out: 'Kawin' },
];

const AGAMA_OPTIONS = ['ISLAM', 'KRISTEN', 'KATHOLIK', 'HINDU', 'BUDHA', 'KONGHUCU'];

const OCR_TIMEOUT_MS = 25000;

class KTPOCR {
  constructor() {
    this.worker = null;
    this.initialized = false;
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.bmp'];
  }

  async initialize() {
    if (this.initialized) return;
    try {
      this.worker = await Tesseract.createWorker('ind+eng');
      await this.worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK, // PSM 6 - block teks
        preserve_interword_spaces: '1',
      });
      this.initialized = true;
      console.log('✅ KTP OCR initialized');
    } catch (e) {
      console.error('❌ KTP OCR init failed:', e);
      throw new Error('Failed to initialize OCR engine');
    }
  }

  validateImageFile(imagePath) {
    if (!fs.existsSync(imagePath)) throw new Error('File tidak ditemukan');
    const ext = path.extname(imagePath).toLowerCase();
    if (!this.supportedFormats.includes(ext)) throw new Error(`Format tidak didukung: ${this.supportedFormats.join(', ')}`);
    const stats = fs.statSync(imagePath);
    if (stats.size === 0) throw new Error('File kosong');
    if (stats.size > 10 * 1024 * 1024) throw new Error('File terlalu besar (maks 10MB)');
    return true;
  }

  /** Normalisasi teks OCR untuk ekstraksi - perbaiki typo umum */
  normalizeForExtraction(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Sederhana: kemiripan string (0-1) */
  similarity(a, b) {
    if (!a || !b) return 0;
    a = String(a).toUpperCase().trim();
    b = String(b).toUpperCase().trim();
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.9;
    let match = 0;
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) if (a[i] === b[i]) match++;
    return match / Math.max(a.length, b.length, 1);
  }

  /** Fuzzy match untuk enum */
  fuzzyMatch(text, options, minSim = 0.6) {
    if (!text) return null;
    const t = text.toUpperCase().replace(/\s+/g, ' ');
    for (const opt of options) {
      if (typeof opt === 'string') {
        if (t.includes(opt) || this.similarity(t, opt) >= minSim) return opt;
      } else if (opt.keys) {
        const matches = opt.keys.filter((k) => t.includes(k));
        if (matches.length === opt.keys.length) return opt.out;
      }
    }
    return null;
  }

  validateNIK(nik) {
    if (!nik || nik.length !== 16) return false;
    if (!/^\d{16}$/.test(nik)) return false;
    return VALID_PROVINCES.includes(nik.substring(0, 2));
  }

  /** Koreksi NIK: O->0, l/I->1 di posisi digit */
  correctNIK(candidate) {
    if (!candidate || candidate.length !== 16) return null;
    let s = candidate.replace(/\s/g, '');
    const fix = (str) => str.replace(/O/g, '0').replace(/[lI]/g, '1').replace(/[^0-9]/g, '');
    if (/^\d{16}$/.test(s) && this.validateNIK(s)) return s;
    const corrected = fix(s);
    if (corrected.length === 16 && this.validateNIK(corrected)) return corrected;
    return null;
  }

  async preprocess(imagePath, method) {
    const meta = await sharp(imagePath).metadata();
    let pipe = sharp(imagePath);
    const w = meta.width || 0;
    if (w > 0 && w < 1000) {
      pipe = pipe.resize(1200, null, { withoutEnlargement: false, kernel: 'lanczos3' });
    } else if (w > 2400) {
      pipe = pipe.resize(2400, null, { withoutEnlargement: true, kernel: 'lanczos3' });
    }
    pipe = pipe.greyscale().normalize();
    switch (method) {
      case 'otsu':
        pipe = pipe.linear(1.4, -(128 * 0.28)).sharpen({ sigma: 1.2 }).threshold(128, { grayscale: true });
        break;
      case 'adaptive':
        pipe = pipe.linear(1.5, -(128 * 0.3)).sharpen({ sigma: 1.5 }).threshold(110, { grayscale: true });
        break;
      case 'grayscale':
        pipe = pipe.linear(1.3, -(128 * 0.25)).sharpen({ sigma: 1.0 });
        break;
      default:
        pipe = pipe.linear(1.35, -(128 * 0.26)).sharpen({ sigma: 1.2 }).threshold(130, { grayscale: true });
    }
    return pipe.png().toBuffer();
  }

  async extractKTPInfo(imagePath, options = {}) {
    const startTime = Date.now();
    try {
      this.validateImageFile(imagePath);
      if (!this.initialized) await this.initialize();

      const methods = ['otsu', 'adaptive', 'grayscale', null];
      let best = null;
      let bestScore = 0;

      for (const method of methods) {
        try {
          const buf = method ? await this.preprocess(imagePath, method) : fs.readFileSync(imagePath);
          const { data } = await Promise.race([
            this.worker.recognize(buf),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), OCR_TIMEOUT_MS)),
          ]);
          const raw = data.text || '';
          const conf = data.confidence || 0;
          const extracted = this.extractAllFields(raw);
          extracted.confidence = conf;
          extracted.method = method || 'raw';
          const score = this.calcScore(extracted, conf);
          if (score > bestScore) {
            bestScore = score;
            best = extracted;
          }
        } catch (e) {
          continue;
        }
      }

      if (!best) {
        const buf = fs.readFileSync(imagePath);
        const { data } = await this.worker.recognize(buf);
        best = this.extractAllFields(data.text || '');
        best.confidence = data.confidence || 0;
        best.method = 'fallback';
      }

      best.processingTime = Date.now() - startTime;
      best.filePath = imagePath;
      return best;
    } catch (error) {
      console.error('❌ [KTP OCR]', error.message);
      return {
        nik: null,
        nama: null,
        ttl: null,
        alamat: null,
        rtRw: null,
        kelurahan: null,
        kecamatan: null,
        jenisKelamin: null,
        golonganDarah: null,
        agama: null,
        statusPerkawinan: null,
        pekerjaan: null,
        kewarganegaraan: null,
        berlakuHingga: null,
        rawText: '',
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  calcScore(ext, conf) {
    let s = conf / 100;
    if (ext.nik) s += 0.25;
    if (ext.nama) s += 0.2;
    if (ext.ttl) s += 0.12;
    if (ext.alamat) s += 0.1;
    if (ext.jenisKelamin) s += 0.06;
    if (ext.statusPerkawinan) s += 0.08;
    if (ext.nik && !this.validateNIK(ext.nik)) s -= 0.15;
    return Math.min(s, 1);
  }

  /** Urutan field mengikuti layout KTP Indonesia: NIK → Nama → TTL → Alamat → RT/RW → Kel → Kec → JK → Gol.Darah → Agama → Status → Pekerjaan → Warga → Berlaku */
  extractAllFields(text) {
    const t = this.normalizeForExtraction(text);
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    return {
      nik: this.extractNIK(t, lines),
      nama: this.extractNama(t, lines),
      ttl: this.extractTTL(t),
      alamat: this.extractAlamat(t),
      rtRw: this.extractRTRW(t),
      kelurahan: this.extractKelurahan(t),
      kecamatan: this.extractKecamatan(t),
      jenisKelamin: this.extractJenisKelamin(t),
      golonganDarah: this.extractGolonganDarah(t),
      agama: this.extractAgama(t),
      statusPerkawinan: this.extractStatusPerkawinan(t),
      pekerjaan: this.extractPekerjaan(t),
      kewarganegaraan: this.extractKewarganegaraan(t),
      berlakuHingga: this.extractBerlakuHingga(t),
      rawText: text,
    };
  }

  extractNIK(text, lines = []) {
    const patterns = [
      /\b(\d{16})\b/,
      /NIK\s*[:.]?\s*([\d\s]{16,24})/i,
      /\b(\d{3}\s*\d{3}\s*\d{4}\s*\d{4}\s*\d{2})\b/,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) {
        const raw = (m[1] || m[0]).replace(/\s/g, '');
        const c = this.correctNIK(raw);
        if (c) return c;
      }
    }
    for (const line of lines) {
      const m = line.match(/NIK\s*[:.]?\s*([\d\sOIl]+)/i);
      if (m) {
        const raw = m[1].replace(/\s/g, '').replace(/O/g, '0').replace(/[lI]/g, '1');
        if (raw.length === 16 && /^\d+$/.test(raw) && this.validateNIK(raw)) return raw;
      }
      const m2 = line.match(/(\d{16})/);
      if (m2 && this.validateNIK(m2[1])) return m2[1];
    }
    return null;
  }

  extractNama(text, lines = []) {
    const clean = (s) =>
      s
        .replace(/[^A-Za-z\s]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/Q/g, 'O')
        .trim();
    const stripSuffix = (s) =>
      s
        .replace(/\s+(TTL|TEMPAT|LAHIR|TGL|TANGGAL|JENIS|KELAMIN|JK|ALAMAT|RT|RW|KEL|DESA|KECAMATAN|AGAMA|STATUS|PERKAWINAN|PEKERJAAN|KEWARGANEGARAAN|BERLAKU|HINGGA).*$/i, '')
        .trim();
    const patterns = [
      /NAMA\s*[:.]?\s*([A-Za-z\s]{4,50})/i,
      /NM\s*[:.]?\s*([A-Za-z\s]{4,50})/i,
      /Nama\s*[:.]?\s*([A-Za-z\s]{4,50})/i,
      /NIK\s*[:.]?\s*[\d\s]+\s+([A-Za-z\s]{4,50})/i,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) {
        let n = stripSuffix(clean(m[1]));
        if (n.length >= 4 && n.length <= 50 && !/\d/.test(n)) {
          const wc = n.split(/\s+/).filter(Boolean).length;
          if (wc >= 1) return n.toUpperCase();
        }
      }
    }
    let afterNik = false;
    for (const line of lines) {
      if (/\d{16}/.test(line)) {
        afterNik = true;
        continue;
      }
      if (afterNik) {
        let n = stripSuffix(clean(line));
        if (n.length >= 4 && n.length <= 50 && !/\d/.test(n) && !/PROVINSI|KOTA|KABUPATEN|KECAMATAN|KELURAHAN|RT\/RW/i.test(n)) {
          return n.toUpperCase();
        }
      }
    }
    return null;
  }

  extractTTL(text) {
    const patterns = [
      /TEMPAT\s+LAHIR\s*[:.]?\s*([^,]+),\s*(\d{1,2}[-\/\s]\d{1,2}[-\/\s]\d{4})/i,
      /TTL\s*[:.]?\s*([^,]+),\s*(\d{1,2}[-\/\s]\d{1,2}[-\/\s]\d{4})/i,
      /([A-Za-z\s]{3,}),\s*(\d{1,2}\s*-\s*\d{1,2}\s*-\s*\d{4})/,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m && m[1] && m[2]) {
        const tempat = m[1].replace(/\s+/g, ' ').trim();
        let tanggal = m[2].replace(/\s/g, '').replace(/\//g, '-');
        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(tanggal)) return { tempat, tanggal };
      }
    }
    return null;
  }

  extractAlamat(text) {
    const patterns = [
      /ALAMAT\s*[:.]?\s*([A-Za-z0-9\s,.-]{5,100}?)(?=\s*RT\/?RW|\s*KEL\.?\/?DESA|\s*KECAMATAN|\s*JENIS\s+KE|GOL\.?\s*DARAH|$)/i,
      /^A\s*[:.]?\s*([A-Za-z0-9\s,.-]{5,100}?)(?=\s*RT\/?RW|\s*KEL\.?\/?DESA|\s*KECAMATAN|\s*JENIS|GOL\.?\s*DARAH|$)/im,
      /Alamat\s*[:.]?\s*([A-Za-z0-9\s,.-]{5,100}?)(?=\s*RT\/?RW|\s*KEL|\s*KECAMATAN|\s*JENIS|GOL|$)/i,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m && m[1]) {
        let a = m[1]
          .replace(/\s*RT\/RW.*$/i, '')
          .replace(/\s*RTRW.*$/i, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (a.length >= 5) return a;
      }
    }
    return null;
  }

  extractRTRW(text) {
    const m = text.match(/RT\/?RW\s*[:.]?\s*(\d{3,4}\s*[\/\-]\s*\d{3,4})/i) || text.match(/\b(\d{3,4}\s*[\/\-]\s*\d{3,4})\b/);
    if (m) {
      const r = (m[1] || m[0]).replace(/\s/g, '').replace(/-/g, '/');
      if (/^\d{3,4}\/\d{3,4}$/.test(r)) return r;
    }
    return null;
  }

  extractKelurahan(text) {
    const m = text.match(/KEL\.?\/?DESA\s*[:.]?\s*([A-Za-z\s]{3,50})/i);
    if (m && m[1]) {
      const k = m[1].replace(/\s+/g, ' ').trim();
      if (k.length >= 3) return k.toUpperCase();
    }
    return null;
  }

  extractKecamatan(text) {
    const m = text.match(/KECAMATAN\s*[:.]?\s*([A-Za-z\s]{3,50})/i);
    if (m && m[1]) {
      const k = m[1].replace(/\s+/g, ' ').trim();
      if (k.length >= 3) return k.toUpperCase();
    }
    return null;
  }

  /**
   * Di KTP Indonesia, GOL. DARAH tepat di samping JENIS KELAMIN.
   * Ekstrak segment ini dulu, lalu pisah: JK (hanya LAKI-LAKI/PEREMPUAN) dan Gol.Darah (hanya A/B/AB/O setelah label).
   */
  extractJenisKelaminAndGolonganDarah(text) {
    const upper = text.toUpperCase();
    const out = { jenisKelamin: null, golonganDarah: null };

    // Cari blok yang mengandung JK dan/atau GOL DARAH (sering satu baris)
    const jkGolBlock =
      text.match(/JENIS\s+KE[LI]AMIN\s*[:.]?\s*[\s\S]+?(?=ALAMAT|AGAMA|STATUS|PEKERJAAN|$)/i)?.[0] ||
      text.match(/JK\s*[:.]?\s*[\s\S]+?(?=ALAMAT|AGAMA|STATUS|PEKERJAAN|$)/i)?.[0] ||
      '';

    const block = (jkGolBlock || text).replace(/\s+/g, ' ').trim();

    // 1) Golongan Darah: hanya ambil A/B/AB/O yang muncul SETELAH label GOL atau DARAH (bukan huruf O dari LAKI-LAKI)
    const golAfterLabel = block.match(/GOL\.?\s*DARAH\s*[:.]?\s*([ABO-]+)/i) || block.match(/DARAH\s*[:.]?\s*([ABO]+)/i);
    if (golAfterLabel && golAfterLabel[1]) {
      const g = golAfterLabel[1].replace(/-/g, '').trim();
      if (['A', 'B', 'AB', 'O'].includes(g)) out.golonganDarah = g;
    }
    if (!out.golonganDarah) {
      const fallback = block.match(/\b(AB|A|B|O)\b/);
      if (fallback && /GOL|DARAH/i.test(block)) {
        const g = fallback[1].toUpperCase();
        if (['A', 'B', 'AB', 'O'].includes(g)) out.golonganDarah = g;
      }
    }

    // 2) Jenis Kelamin: ambil hanya LAKI-LAKI atau PEREMPUAN, STOP sebelum kata GOL/DARAH atau sebelum huruf tunggal A/B/O (gol darah)
    let jkValue = null;
    const jkMatch = block.match(/JENIS\s+KE[LI]AMIN\s*[:.]?\s*([A-Za-z\s-]+?)(?=\s*GOL\.?\s*DARAH|\s*DARAH\s*[:.]?|\s*[ABO]\s*$|$)/i)
      || block.match(/JK\s*[:.]?\s*([A-Za-z\s-]+?)(?=\s*GOL\.?\s*DARAH|\s*DARAH\s*[:.]?|\s*[ABO]\s*$|$)/i);
    if (jkMatch && jkMatch[1]) {
      jkValue = jkMatch[1].replace(/\s+/g, ' ').trim();
    }
    if (!jkValue) {
      if (/\bLAKI-LAKI\b/i.test(block)) jkValue = 'LAKI-LAKI';
      else if (/\bPEREMPUAN\b/i.test(block)) jkValue = 'PEREMPUAN';
      else if (/\bLAKI\b/i.test(block) && !/LAKI-LAKI/.test(block)) jkValue = 'LAKI';
    }
    if (jkValue) {
      const v = jkValue.toUpperCase();
      if (/LAKI/.test(v)) out.jenisKelamin = 'Laki-laki';
      else if (/PEREMPUAN|^P$/.test(v)) out.jenisKelamin = 'Perempuan';
    }

    return out;
  }

  extractJenisKelamin(text) {
    const { jenisKelamin } = this.extractJenisKelaminAndGolonganDarah(text);
    if (jenisKelamin) return jenisKelamin;
    const m = text.match(/JENIS\s+KE[LI]AMIN\s*[:.]?\s*(\w+)/i) || text.match(/JK\s*[:.]?\s*(\w+)/i) || text.match(/(LAKI-LAKI|PEREMPUAN)/i);
    if (m) {
      const v = (m[1] || m[0]).toUpperCase();
      if (/LAKI|^L$/.test(v)) return 'Laki-laki';
      if (/PEREMPUAN|^P$/.test(v)) return 'Perempuan';
    }
    return null;
  }

  extractGolonganDarah(text) {
    const { golonganDarah } = this.extractJenisKelaminAndGolonganDarah(text);
    if (golonganDarah) return golonganDarah;
    const m = text.match(/GOL\.?\s*DARAH\s*[:.]?\s*([ABO-]+)/i) || text.match(/DARAH\s*[:.]?\s*([ABO]+)/i);
    if (m) {
      const v = (m[1] || '').trim().toUpperCase().replace(/-/g, '');
      if (['A', 'B', 'AB', 'O'].includes(v)) return v;
    }
    return null;
  }

  extractAgama(text) {
    const m = text.match(/AGAMA\s*[:.]?\s*([A-Za-z]+)/i);
    if (m && m[1]) return this.fuzzyMatch(m[1], AGAMA_OPTIONS, 0.5) || null;
    return this.fuzzyMatch(text, AGAMA_OPTIONS, 0.7);
  }

  extractStatusPerkawinan(text) {
    const m = text.match(/STATUS\s+PERKAWINAN\s*[:.]?\s*(.+?)(?=\s+[A-Z]|$)/i) || text.match(/S\.?\s*P\.?\s*[:.]?\s*(.+?)(?=\s|$)/i);
    const val = m ? (m[1] || m[0]).trim() : text;
    return this.fuzzyMatch(val, STATUS_OPTIONS, 0.5) || null;
  }

  extractPekerjaan(text) {
    const m = text.match(/PEKERJAAN\s*[:.]?\s*([A-Za-z\s]{3,50})/i);
    if (m && m[1]) {
      const p = m[1].replace(/\s+/g, ' ').trim();
      if (p.length >= 3 && !/WARGA|NEGARA|BERLAKU/i.test(p)) return p.toUpperCase();
    }
    return null;
  }

  extractKewarganegaraan(text) {
    if (/\bWNI\b|INDONESIA/i.test(text)) return 'WNI';
    if (/\bWNA\b/i.test(text)) return 'WNA';
    return 'WNI';
  }

  extractBerlakuHingga(text) {
    if (/SEUMUR\s*HIDUP/i.test(text)) return 'SEUMUR HIDUP';
    const m = text.match(/BERLAKU\s*(?:HINGGA)?\s*[:.]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i);
    if (m && m[1]) return m[1].replace(/\//g, '-').trim();
    return null;
  }

  getExtractionStats(result) {
    const fields = ['nik', 'nama', 'ttl', 'alamat', 'jenisKelamin', 'golonganDarah', 'agama', 'statusPerkawinan', 'pekerjaan', 'kewarganegaraan', 'berlakuHingga'];
    let count = 0;
    for (const f of fields) if (result[f]) count++;
    return {
      totalFields: 11,
      extractedFields: count,
      confidence: result.confidence || 0,
      processingTime: result.processingTime || 0,
      isValidNIK: !!(result.nik && this.validateNIK(result.nik)),
      completeness: Math.round((count / 11) * 1000) / 10,
    };
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initialized = false;
    }
  }

  static async extract(imagePath, options = {}) {
    const ocr = new KTPOCR();
    try {
      const result = await ocr.extractKTPInfo(imagePath, options);
      const stats = ocr.getExtractionStats(result);
      return { ...result, stats };
    } finally {
      await ocr.terminate();
    }
  }
}

export default KTPOCR;
