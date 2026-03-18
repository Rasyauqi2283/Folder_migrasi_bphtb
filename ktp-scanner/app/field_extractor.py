"""Extract KTP fields from raw OCR text - port of ktpOCR.js regex logic."""

import re
from typing import Optional, Dict, Any

# Valid province codes for NIK (first 2 digits)
VALID_PROVINCES = [
    "11", "12", "13", "14", "15", "16", "17", "18", "19", "21", "31", "32", "33", "34", "35", "36",
    "51", "52", "53", "61", "62", "63", "64", "65", "71", "72", "73", "74", "75", "76", "81", "82",
    "91", "92", "93", "94",
]


class FieldExtractor:
    @staticmethod
    def validate_nik(nik: Optional[str]) -> bool:
        if not nik or len(nik) != 16 or not nik.isdigit():
            return False
        return nik[:2] in VALID_PROVINCES

    @staticmethod
    def extract_nik(text: str) -> Optional[str]:
        patterns = [
            r"\b\d{16}\b",
            r"NIK\s*[:.]?\s*(\d{1,3}\s*\d{1,3}\s*\d{1,4}\s*\d{1,4}\s*\d{1,4})",
            r"NIK\s*[:.]?\s*(\d{16})",
            r"NIK\s+(\d{16})",
            r"\b(\d{3}\s*\d{13})\b",
            r"\b(\d{6}\s*\d{10})\b",
        ]
        for pat in patterns:
            m = re.search(pat, text, re.I)
            if m:
                raw = (m.group(1) if m.lastindex else m.group(0)).replace(" ", "")
                if len(raw) == 16 and raw.isdigit() and FieldExtractor.validate_nik(raw):
                    return raw
        return None

    @staticmethod
    def extract_nama(text: str) -> Optional[str]:
        cleaned = re.sub(r"[^\w\s:.\-]", " ", text)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        patterns = [
            r"NAMA\s*[:.]?\s*([A-Z][A-Z\s]{4,30})",
            r"NM\s*[:.]?\s*([A-Z][A-Z\s]{4,30})",
            r"Nama\s*[:.]?\s*([A-Z][A-Z\s]{4,30})",
            r"NIK\s*[:.]?\s*[\d\s]+\s+([A-Z][A-Z\s]{4,30})",
            r"NAMA\s+([A-Z][A-Z\s]{4,30})",
        ]
        for pat in patterns:
            m = re.search(pat, cleaned, re.I)
            if m:
                nama = (m.group(1) or "").strip()
                nama = re.sub(r"[^A-Z\s]", "", nama)
                nama = re.sub(r"\s+", " ", nama).strip()
                nama = re.sub(r"^\s*N\s+(?=[A-Z])", "", nama)
                nama = re.sub(r"\s+(T\s*T\s*L|TTL|TEMPAT|LAHIR|TGL|TANGGAL).*$", "", nama, flags=re.I)
                nama = re.sub(
                    r"\s+(JENIS|KELAMIN|JK|ALAMAT|RT|RW|KEL|DESA|KECAMATAN|AGAMA|STATUS|PERKAWINAN|PEKERJAAN|KEWARGANEGARAAN|BERLAKU|HINGGA).*$",
                    "", nama, flags=re.I
                )
                nama = nama.replace("Q", "O").strip()
                words = [w for w in nama.split() if w]
                if 5 <= len(nama) <= 50 and nama.isupper() and not re.search(r"\d", nama) and len(words) >= 2:
                    return nama
        # Fallback: longest uppercase line after NIK
        lines = cleaned.split("\n")
        found_nik = False
        best = None
        longest = 0
        for line in lines:
            if re.search(r"\d{16}", line):
                found_nik = True
                continue
            if found_nik:
                t = re.sub(r"[^A-Z\s]", "", line)
                t = re.sub(r"\s+", " ", t).strip()
                t = re.sub(r"^\s*N\s+(?=[A-Z])", "", t)
                t = re.sub(r"\s+(TTL|TEMPAT|LAHIR|JENIS|KELAMIN|ALAMAT|RT|RW|KEL|KECAMATAN|AGAMA|STATUS|PERKAWINAN|PEKERJAAN|KEWARGANEGARAAN|BERLAKU|HINGGA).*$", "", t, flags=re.I).strip()
                words = [w for w in t.split() if w]
                if (
                    len(t) > longest and 5 <= len(t) <= 50 and t.isupper() and not re.search(r"\d", t)
                    and "PROVINSI" not in t and "KOTA" not in t and "KABUPATEN" not in t
                    and "KECAMATAN" not in t and "KELURAHAN" not in t and "RT/RW" not in t
                    and len(words) >= 2
                ):
                    best = t
                    longest = len(t)
        return best

    @staticmethod
    def extract_ttl(text: str) -> Optional[Dict[str, str]]:
        patterns = [
            r"TEMPAT\s+LAHIR\s*[:.]?\s*([^,]+),\s*(\d{1,2}[-\/\s]\d{1,2}[-\/\s]\d{4})",
            r"TTL\s*[:.]?\s*([^,]+),\s*(\d{1,2}[-\/\s]\d{1,2}[-\/\s]\d{4})",
            r"([A-Z\s]{3,}),\s*(\d{1,2}\s*-\s*\d{1,2}\s*-\s*\d{4})",
        ]
        for pat in patterns:
            m = re.search(pat, text, re.I)
            if m and m.group(1) and m.group(2):
                tempat = re.sub(r"\s+", " ", m.group(1).strip())
                tanggal = re.sub(r"\s+", "", m.group(2).strip()).replace("/", "-")
                if re.match(r"^\d{1,2}-\d{1,2}-\d{4}$", tanggal):
                    return {"tempat": tempat, "tanggal": tanggal}
        return None

    @staticmethod
    def extract_alamat(text: str) -> Optional[str]:
        patterns = [
            r"ALAMAT\s*[:.]?\s*([A-Z0-9\s,.-]{5,})",
            r"^A\s*[:.]?\s*([A-Z0-9\s,.-]{5,})",
            r"Alamat\s*[:.]?\s*([A-Z0-9\s,.-]{5,})",
            r"ALAMAT\s*[:.]?\s*([A-Z0-9\s,.-]{5,})\s*RT\/RW",
        ]
        for pat in patterns:
            m = re.search(pat, text, re.I | re.M)
            if m and m.group(1):
                alamat = re.sub(r"\s+", " ", m.group(1).strip())
                alamat = re.sub(r"\s*RT\/RW.*$", "", alamat, flags=re.I).strip()
                alamat = re.sub(r"\s*RTRW.*$", "", alamat, flags=re.I).strip()
                alamat = re.sub(r"\s*(KD|K|S|P|B\s*H)\s*[:.].*$", "", alamat, flags=re.I).strip()
                if len(alamat) >= 5 and (re.search(r"\d", alamat) or re.search(r"[A-Z]", alamat)):
                    return alamat
        return None

    @staticmethod
    def extract_rtrw(text: str) -> Optional[str]:
        for pat in [
            r"RT\/RW\s*[:.]?\s*(\d{3,4}/\d{3,4})",
            r"RT\/RW\s+(\d{3,4}/\d{3,4})",
            r"\b(\d{3,4}\s*[/-]\s*\d{3,4})\b",
        ]:
            m = re.search(pat, text, re.I)
            if m:
                rtrw = re.sub(r"\s+", "", (m.group(1) or m.group(0))).replace("-", "/")
                if re.match(r"^\d{3,4}/\d{3,4}$", rtrw):
                    return rtrw
        return None

    @staticmethod
    def extract_kelurahan(text: str) -> Optional[str]:
        m = re.search(r"KEL\/DESA\s*[:.]?\s*([A-Z\s]{3,})", text, re.I)
        if m and m.group(1):
            kel = re.sub(r"\s+", " ", m.group(1).strip())
            if len(kel) >= 3:
                return kel
        return None

    @staticmethod
    def extract_kecamatan(text: str) -> Optional[str]:
        m = re.search(r"KECAMATAN\s*[:.]?\s*([A-Z\s]{3,})", text, re.I)
        if m and m.group(1):
            kec = re.sub(r"\s+", " ", m.group(1).strip())
            if len(kec) >= 3:
                return kec
        return None

    @staticmethod
    def extract_jenis_kelamin(text: str) -> Optional[str]:
        m = re.search(r"JENIS\s+KE[LI]AMIN\s*[:.]?\s*(LAKI-LAKI|PEREMPUAN|LAKI|PEREMPUAN)|JK\s*[:.]?\s*(LAKI-LAKI|PEREMPUAN|L|P)|(LAKI-LAKI|PEREMPUAN)", text, re.I)
        if m:
            jk = (m.group(1) or m.group(2) or m.group(3) or "").strip().upper()
            if "LAKI" in jk or jk == "L":
                return "Laki-laki"
            if "PEREMPUAN" in jk or jk == "P":
                return "Perempuan"
        return None

    @staticmethod
    def extract_golongan_darah(text: str) -> Optional[str]:
        m = re.search(r"GOL[.]?\s*DARAH\s*[:.]?\s*(A|B|AB|O)|DARAH\s*[:.]?\s*(A|B|AB|O)", text, re.I)
        if m:
            darah = (m.group(1) or m.group(2) or "").strip().upper()
            if darah in ("A", "B", "AB", "O"):
                return darah
        return None

    @staticmethod
    def extract_agama(text: str) -> Optional[str]:
        agama_list = ["ISLAM", "KRISTEN", "KATHOLIK", "HINDU", "BUDHA", "KONGHUCU"]
        m = re.search(r"AGAMA\s*[:.]?\s*([A-Z]+)", text, re.I)
        if m and m.group(1):
            a = m.group(1).strip().upper()
            for v in agama_list:
                if v in a or a in v:
                    return v
        return None

    @staticmethod
    def extract_status_perkawinan(text: str) -> Optional[str]:
        m = re.search(
            r"STATUS\s+PERKAWINAN\s*[:.]?\s*(BELUM\s+KAWIN|KAWIN|CERAI\s+HIDUP|CERAI\s+MATI|JANDA|DUDA)|"
            r"S\s+P\s*[:.]?\s*(BELUM\s+KAWIN|KAWIN|CERAI\s+HIDUP|CERAI\s+MATI|JANDA|DUDA)|"
            r"STATUS\s*[:.]?\s*(BELUM\s+KAWIN|KAWIN|CERAI\s+HIDUP|CERAI\s+MATI|JANDA|DUDA)|"
            r"\b(BELUM\s+KAWIN|KAWIN|CERAI\s+HIDUP|CERAI\s+MATI|JANDA|DUDA)\b",
            text, re.I
        )
        if m:
            s = (m.group(1) or m.group(2) or m.group(3) or m.group(4) or "").strip().upper()
            if "BELUM" in s and "KAWIN" in s:
                return "Belum Kawin"
            if "CERAI" in s and "HIDUP" in s:
                return "Cerai Hidup"
            if "CERAI" in s and "MATI" in s:
                return "Cerai Mati"
            if "JANDA" in s:
                return "Janda"
            if "DUDA" in s:
                return "Duda"
            if "KAWIN" in s:
                return "Kawin"
        return None

    @staticmethod
    def extract_pekerjaan(text: str) -> Optional[str]:
        m = re.search(r"PEKERJAAN\s*[:.]?\s*([A-Z\s]{3,})", text, re.I)
        if m and m.group(1):
            p = re.sub(r"\s+", " ", m.group(1).strip())
            if len(p) >= 3 and "WARGA" not in p and "NEGARA" not in p and "BERLAKU" not in p:
                return p
        return None

    @staticmethod
    def extract_kewarganegaraan(text: str) -> Optional[str]:
        m = re.search(r"KEWARGANEGARAAN\s*[:.]?\s*(WNI|WNA|INDONESIA)|WARGA\s+NEGARA\s*[:.]?\s*(WNI|WNA|INDONESIA)|\b(WNI|WNA)\b", text, re.I)
        if m:
            w = (m.group(1) or m.group(2) or m.group(3) or "").strip().upper()
            if w == "WNI" or "INDONESIA" in w:
                return "WNI"
            if w == "WNA":
                return "WNA"
        return "WNI"

    @staticmethod
    def extract_berlaku_hingga(text: str) -> Optional[str]:
        if re.search(r"SEUMUR\s+HIDUP", text, re.I):
            return "SEUMUR HIDUP"
        m = re.search(r"BERLAKU\s+HINGGA\s*[:.]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})|BERLAKU\s*[:.]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})", text, re.I)
        if m and (m.group(1) or m.group(2)):
            return (m.group(1) or m.group(2)).strip()
        return None

    @classmethod
    def extract_all(cls, text: str) -> Dict[str, Any]:
        ttl = cls.extract_ttl(text)
        return {
            "nik": cls.extract_nik(text),
            "nama": cls.extract_nama(text),
            "ttl": ttl,
            "alamat": cls.extract_alamat(text),
            "rtRw": cls.extract_rtrw(text),
            "kelurahan": cls.extract_kelurahan(text),
            "kecamatan": cls.extract_kecamatan(text),
            "jenisKelamin": cls.extract_jenis_kelamin(text),
            "golonganDarah": cls.extract_golongan_darah(text),
            "agama": cls.extract_agama(text),
            "statusPerkawinan": cls.extract_status_perkawinan(text),
            "pekerjaan": cls.extract_pekerjaan(text),
            "kewarganegaraan": cls.extract_kewarganegaraan(text),
            "berlakuHingga": cls.extract_berlaku_hingga(text),
            "rawText": text,
        }
