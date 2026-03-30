package ktpocr

import (
	"regexp"
	"strings"
	"unicode"
)

// TTL kept for backward-compatible helpers in this file (not used in production Result).
type TTL struct {
	Tempat  string `json:"tempat"`
	Tanggal string `json:"tanggal"`
}

// validProvinces is kode provinsi valid untuk NIK (2 digit pertama).
var validProvinces = map[string]bool{
	"11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true,
	"21": true, "31": true, "32": true, "33": true, "34": true, "35": true, "36": true,
	"51": true, "52": true, "53": true, "61": true, "62": true, "63": true, "64": true, "65": true,
	"71": true, "72": true, "73": true, "74": true, "75": true, "76": true, "81": true, "82": true,
	"91": true, "92": true, "93": true, "94": true,
}

var agamaOptions = []string{"ISLAM", "KRISTEN", "KATHOLIK", "HINDU", "BUDHA", "KONGHUCU"}

var statusOptions = []struct {
	Keys []string
	Out  string
}{
	{[]string{"BELUM", "KAWIN"}, "Belum Kawin"},
	{[]string{"CERAI", "HIDUP"}, "Cerai Hidup"},
	{[]string{"CERAI", "MATI"}, "Cerai Mati"},
	{[]string{"JANDA"}, "Janda"},
	{[]string{"DUDA"}, "Duda"},
	{[]string{"KAWIN"}, "Kawin"},
}

func normalizeText(s string) string {
	s = strings.ReplaceAll(s, "\r\n", "\n")
	s = strings.ReplaceAll(s, "\r", "\n")
	s = strings.ReplaceAll(s, "\t", " ")
	s = regexp.MustCompile(`\s+`).ReplaceAllString(s, " ")
	return strings.TrimSpace(s)
}

func validateNIK(nik string) bool {
	return ValidNIK(nik)
}

// ValidNIK mengecek apakah string adalah NIK valid (16 digit, kode provinsi benar). Dipakai handler untuk menolak upload jika NIK tidak terbaca.
func ValidNIK(nik string) bool {
	if len(nik) != 16 {
		return false
	}
	for _, r := range nik {
		if !unicode.IsDigit(r) {
			return false
		}
	}
	return validProvinces[nik[:2]]
}

func correctNIK(candidate string) *string {
	candidate = strings.ReplaceAll(candidate, " ", "")
	if len(candidate) != 16 {
		return nil
	}
	// O -> 0, l/I -> 1
	b := []byte(candidate)
	for i := range b {
		if b[i] == 'O' {
			b[i] = '0'
		} else if b[i] == 'l' || b[i] == 'I' {
			b[i] = '1'
		} else if b[i] < '0' || b[i] > '9' {
			b[i] = '0'
		}
	}
	s := string(b)
	if validateNIK(s) {
		return &s
	}
	return nil
}

func similarity(a, b string) float64 {
	a = strings.ToUpper(strings.TrimSpace(a))
	b = strings.ToUpper(strings.TrimSpace(b))
	if a == b {
		return 1
	}
	if strings.Contains(a, b) || strings.Contains(b, a) {
		return 0.9
	}
	match := 0
	minLen := len(a)
	if len(b) < minLen {
		minLen = len(b)
	}
	for i := 0; i < minLen; i++ {
		if a[i] == b[i] {
			match++
		}
	}
	maxLen := len(a)
	if len(b) > maxLen {
		maxLen = len(b)
	}
	if maxLen == 0 {
		return 0
	}
	return float64(match) / float64(maxLen)
}

func fuzzyMatch(text string, options interface{}, minSim float64) *string {
	if text == "" {
		return nil
	}
	t := strings.ToUpper(strings.ReplaceAll(text, "\n", " "))
	switch opts := options.(type) {
	case []string:
		for _, opt := range opts {
			if strings.Contains(t, opt) || similarity(t, opt) >= minSim {
				return &opt
			}
		}
	case []struct {
		Keys []string
		Out  string
	}:
		for _, opt := range opts {
			all := true
			for _, k := range opt.Keys {
				if !strings.Contains(t, k) {
					all = false
					break
				}
			}
			if all {
				return &opt.Out
			}
		}
	}
	return nil
}

func extractNIKSlidingWindow(text string) *string {
	d := keepDigits(text)
	if len(d) < 16 {
		return nil
	}
	for i := 0; i <= len(d)-16; i++ {
		cand := d[i : i+16]
		if validateNIK(cand) {
			c := cand
			return &c
		}
		if c := correctNIK(cand); c != nil {
			return c
		}
	}
	return nil
}

func extractNIK(text string, lines []string) *string {
	if s := extractNIKSlidingWindow(text); s != nil {
		return s
	}
	if s := extractNIKSlidingWindow(strings.Join(lines, " ")); s != nil {
		return s
	}
	patterns := []*regexp.Regexp{
		regexp.MustCompile(`\b(\d{16})\b`),
		regexp.MustCompile(`(?i)NIK\s*[:.]?\s*([\d\s]{16,24})`),
	}
	for _, p := range patterns {
		m := p.FindStringSubmatch(text)
		if len(m) > 1 {
			raw := strings.ReplaceAll(m[1], " ", "")
			if c := correctNIK(raw); c != nil {
				return c
			}
		}
	}
	for _, line := range lines {
		re := regexp.MustCompile(`(?i)NIK\s*[:.]?\s*([\d\sOIl]+)`)
		if m := re.FindStringSubmatch(line); len(m) > 1 {
			raw := strings.ReplaceAll(m[1], " ", "")
			raw = strings.ReplaceAll(raw, "O", "0")
			raw = strings.ReplaceAll(raw, "l", "1")
			raw = strings.ReplaceAll(raw, "I", "1")
			if len(raw) == 16 {
				if c := correctNIK(raw); c != nil {
					return c
				}
			}
		}
		re2 := regexp.MustCompile(`(\d{16})`)
		if m := re2.FindStringSubmatch(line); len(m) > 1 {
			if c := correctNIK(m[1]); c != nil {
				return c
			}
		}
	}
	return nil
}

func cleanName(s string) string {
	b := make([]rune, 0, len(s))
	for _, r := range s {
		if unicode.IsLetter(r) || unicode.IsSpace(r) || r == 'Q' {
			if r == 'Q' {
				b = append(b, 'O')
			} else {
				b = append(b, r)
			}
		}
	}
	return strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(string(b), " "))
}

func stripSuffix(s string) string {
	re := regexp.MustCompile(`(?i)\s+(TTL|TEMPAT|LAHIR|TGL|TANGGAL|JENIS|KELAMIN|JK|ALAMAT|RT|RW|KEL|DESA|KECAMATAN|AGAMA|STATUS|PERKAWINAN|PEKERJAAN|KEWARGANEGARAAN|BERLAKU|HINGGA).*$`)
	return strings.TrimSpace(re.ReplaceAllString(s, ""))
}

func extractNama(text string, lines []string) *string {
	patterns := []*regexp.Regexp{
		regexp.MustCompile(`(?i)NAMA\s*[:.]?\s*([A-Za-z][A-Za-z\s'.-]{3,49})`),
		regexp.MustCompile(`(?i)NM\s*[:.]?\s*([A-Za-z][A-Za-z\s'.-]{3,49})`),
		regexp.MustCompile(`Nama\s*[:.]?\s*([A-Za-z][A-Za-z\s'.-]{3,49})`),
	}
	for _, p := range patterns {
		m := p.FindStringSubmatch(text)
		if len(m) > 1 {
			n := stripSuffix(cleanName(m[1]))
			if len(n) >= 4 && len(n) <= 50 && !regexp.MustCompile(`\d`).MatchString(n) {
				wc := len(strings.Fields(n))
				if wc >= 1 {
					s := strings.ToUpper(n)
					return &s
				}
			}
		}
	}
	afterNik := false
	for _, line := range lines {
		if regexp.MustCompile(`\d{16}`).MatchString(line) {
			afterNik = true
			continue
		}
		if afterNik {
			n := stripSuffix(cleanName(line))
			if len(n) >= 4 && len(n) <= 50 && !regexp.MustCompile(`\d`).MatchString(n) &&
				!regexp.MustCompile(`(?i)PROVINSI|KOTA|KABUPATEN|KECAMATAN|KELURAHAN|RT/RW`).MatchString(n) {
				s := strings.ToUpper(n)
				return &s
			}
		}
	}
	return nil
}

func extractTTL(text string) *TTL {
	patterns := []*regexp.Regexp{
		regexp.MustCompile(`(?i)TEMPAT\s+LAHIR\s*[:.]?\s*([^,]+),\s*(\d{1,2}[-\s]\d{1,2}[-\s]\d{4})`),
		regexp.MustCompile(`(?i)TTL\s*[:.]?\s*([^,]+),\s*(\d{1,2}[-\s]\d{1,2}[-\s]\d{4})`),
		regexp.MustCompile(`([A-Za-z\s]{3,}),\s*(\d{1,2}\s*-\s*\d{1,2}\s*-\s*\d{4})`),
	}
	for _, p := range patterns {
		m := p.FindStringSubmatch(text)
		if len(m) >= 3 {
			tempat := strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(m[1], " "))
			tanggal := strings.ReplaceAll(strings.ReplaceAll(m[2], " ", ""), "/", "-")
			if regexp.MustCompile(`^\d{1,2}-\d{1,2}-\d{4}$`).MatchString(tanggal) {
				return &TTL{Tempat: tempat, Tanggal: tanggal}
			}
		}
	}
	return nil
}

func extractAlamat(text string, lines []string) *string {
	patterns := []*regexp.Regexp{
		regexp.MustCompile(`(?i)ALAMAT\s*[:.]?\s*([A-Za-z0-9\s,.\-/]{5,120}?)(?:\s*RT/?RW|\s*RT\s*\.?\s*\d|\s*KEL\.?/?DESA|\s*KELURAHAN|\s*KECAMATAN|\s*AGAMA|\s*JENIS\s+KE|GOL\.?\s*DARAH|$)`),
		regexp.MustCompile(`(?i)Alamat\s*[:.]?\s*([A-Za-z0-9\s,.\-/]{5,120}?)(?:\s*RT|KEL|KECAMATAN|AGAMA|JENIS|GOL|$)`),
	}
	for _, p := range patterns {
		m := p.FindStringSubmatch(text)
		if len(m) > 1 {
			a := regexp.MustCompile(`(?i)\s*RT/?RW.*$`).ReplaceAllString(m[1], "")
			a = regexp.MustCompile(`(?i)\s*RT\s*\.?\s*\d.*$`).ReplaceAllString(a, "")
			a = regexp.MustCompile(`(?i)\s*RTRW.*$`).ReplaceAllString(a, "")
			a = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(a, " "))
			if len(a) >= 5 && !regexp.MustCompile(`(?i)^RT/?RW`).MatchString(a) {
				s := strings.ToUpper(a)
				return &s
			}
		}
	}
	// Fallback line-based: baris setelah GOL DARAH/JK/ALAMAT dan sebelum RT/RW/KEL
	afterJK := false
	for _, line := range lines {
		l := strings.TrimSpace(line)
		if regexp.MustCompile(`(?i)GOL\.?\s*DARAH|JENIS\s+KE[LI]AMIN|ALAMAT\s*[:.]`).MatchString(l) {
			afterJK = true
			// Jika baris ini berisi ALAMAT, ambil bagian setelah label
			if regexp.MustCompile(`(?i)ALAMAT`).MatchString(l) {
				rest := regexp.MustCompile(`(?i)ALAMAT\s*[:.]?\s*`).ReplaceAllString(l, "")
				rest = regexp.MustCompile(`(?i)\s*RT/?RW.*$`).ReplaceAllString(rest, "")
				rest = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(rest, " "))
				if len(rest) >= 5 && len(rest) <= 120 {
					s := strings.ToUpper(rest)
					return &s
				}
			}
			continue
		}
		if afterJK && len(l) >= 8 && len(l) <= 120 {
			if regexp.MustCompile(`(?i)^RT|^KEL|^KECAMATAN|^AGAMA|^NIK|^\d{16}`).MatchString(l) {
				break
			}
			if !regexp.MustCompile(`(?i)^PROVINSI|^KABUPATEN|^KOTA`).MatchString(l) &&
				regexp.MustCompile(`[A-Za-z0-9]`).MatchString(l) &&
				!regexp.MustCompile(`(?i)^GOL|^JENIS|^JK\s`).MatchString(l) {
				s := strings.ToUpper(strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(l, " ")))
				return &s
			}
		}
	}
	return nil
}

// stripAtLabel memotong teks saat menemukan salah satu label (agar tidak tercampur).
func stripAtLabel(s string, labels *regexp.Regexp) string {
	idx := labels.FindStringIndex(s)
	if idx != nil {
		s = strings.TrimSpace(s[:idx[0]])
	}
	return s
}

var stopBeforeKabOrNIK = regexp.MustCompile(`(?i)\s+(?:KABUPATEN|KOTA)\s|NIK\s|\bNIK\b|\d{16}`)
var stopBeforeKecamatanOrAgama = regexp.MustCompile(`(?i)\s+KECAMATAN\s|AGAMA\s|STATUS\s+PERKAWINAN|PEKERJAAN\s`)
var stopBeforeAgama = regexp.MustCompile(`(?i)\s+AGAMA\s|STATUS\s+PERKAWINAN|PEKERJAAN\s|KEWARGANEGARAAN|BERLAKU`)

// truncateProvinsi jika tercampur kabupaten (mis. "DKI JAKARTA JAKARTA BARAT" -> "DKI JAKARTA").
func truncateProvinsi(s string) string {
	knownProvinsi := []string{"DKI JAKARTA", "JAWA BARAT", "JAWA TENGAH", "JAWA TIMUR", "BANTEN", "BALI", "NUSA TENGGARA BARAT", "NUSA TENGGARA TIMUR", "KALIMANTAN BARAT", "KALIMANTAN TENGAH", "KALIMANTAN SELATAN", "KALIMANTAN TIMUR", "KALIMANTAN UTARA", "SULAWESI UTARA", "SULAWESI TENGAH", "SULAWESI SELATAN", "SULAWESI TENGGARA", "GORONTALO", "SULAWESI BARAT", "MALUKU", "MALUKU UTARA", "PAPUA", "PAPUA BARAT", "PAPUA SELATAN", "PAPUA TENGAH", "PAPUA PEGUNUNGAN", "PAPUA BARAT DAYA", "ACEH", "SUMATERA UTARA", "SUMATERA BARAT", "RIAU", "KEPULAUAN RIAU", "JAMBI", "SUMATERA SELATAN", "BANGKA BELITUNG", "BENGKULU", "LAMPUNG"}
	u := strings.ToUpper(strings.TrimSpace(s))
	for _, prov := range knownProvinsi {
		if u == prov || strings.HasPrefix(u, prov+" ") {
			return prov
		}
	}
	// Jika ada "JAKARTA BARAT/TIMUR/UTARA/SELATAN/PUSAT" di tengah, potong sampai sebelum kabupaten.
	re := regexp.MustCompile(`(?i)JAKARTA\s+(?:BARAT|TIMUR|UTARA|SELATAN|PUSAT|ADM\.?\s*JAKARTA)`)
	if idx := re.FindStringIndex(u); idx != nil && idx[0] > 5 {
		u = strings.TrimSpace(u[:idx[0]])
	}
	return u
}

func extractProvinsi(text string, lines []string) *string {
	// Hanya ambil provinsi, berhenti sebelum Kab/Kota atau NIK.
	re := regexp.MustCompile(`(?i)PROVINSI\s+([A-Za-z\s]+?)(?:\s+(?:KABUPATEN|KOTA)\s|NIK|\d{16}|$)`)
	if m := re.FindStringSubmatch(text); len(m) > 1 {
		p := stripAtLabel(strings.TrimSpace(m[1]), stopBeforeKabOrNIK)
		p = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(p, " "))
		if len(p) >= 3 && !regexp.MustCompile(`\d{16}`).MatchString(p) {
			s := truncateProvinsi(p)
			return &s
		}
	}
	for _, line := range lines {
		l := strings.TrimSpace(line)
		if regexp.MustCompile(`(?i)^PROVINSI\s`).MatchString(l) {
			rest := regexp.MustCompile(`(?i)^PROVINSI\s+`).ReplaceAllString(l, "")
			rest = stripAtLabel(rest, stopBeforeKabOrNIK)
			rest = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(rest, " "))
			if len(rest) >= 3 {
				s := truncateProvinsi(rest)
				return &s
			}
		}
	}
	return nil
}

func extractKabupatenKota(text string, lines []string) *string {
	// Berhenti sebelum NIK atau angka 16 digit.
	re := regexp.MustCompile(`(?i)(KABUPATEN|KOTA)\s+([A-Za-z\s]+?)(?:\s+NIK|\d{16}|\s*$)`)
	if m := re.FindStringSubmatch(text); len(m) > 2 {
		v := stripAtLabel(strings.TrimSpace(m[1]+" "+m[2]), regexp.MustCompile(`(?i)NIK\s|\bNIK\b|\d{16}`))
		v = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(v, " "))
		if len(v) >= 5 && !regexp.MustCompile(`\d{16}`).MatchString(v) {
			s := strings.ToUpper(v)
			return &s
		}
	}
	for _, line := range lines {
		l := strings.TrimSpace(line)
		if regexp.MustCompile(`(?i)^(KABUPATEN|KOTA)\s+`).MatchString(l) {
			rest := stripAtLabel(l, regexp.MustCompile(`(?i)NIK\s|\bNIK\b|\d{16}`))
			rest = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(rest, " "))
			if len(rest) >= 5 && !regexp.MustCompile(`\d{16}`).MatchString(rest) {
				s := strings.ToUpper(rest)
				return &s
			}
		}
	}
	return nil
}

func extractRTRW(text string, lines []string) *string {
	patterns := []*regexp.Regexp{
		regexp.MustCompile(`(?i)RT/?RW\s*[:.]?\s*(\d{2,4}\s*[/\-]\s*\d{2,4})`),
		regexp.MustCompile(`(?i)RT\s*\.?\s*(\d{2,4})\s*[/\-]?\s*RW\s*\.?\s*(\d{2,4})`),
		regexp.MustCompile(`(?i)RT\s*[:.]?\s*(\d{2,4})\s*[/\-]\s*(\d{2,4})`),
		regexp.MustCompile(`\b(\d{2,4}\s*[/\-]\s*\d{2,4})\b`),
	}
	for _, re := range patterns {
		m := re.FindStringSubmatch(text)
		if len(m) > 1 {
			var r string
			if len(m) == 2 {
				r = strings.ReplaceAll(strings.ReplaceAll(m[1], " ", ""), "-", "/")
			} else if len(m) >= 3 {
				r = strings.TrimSpace(m[1]) + "/" + strings.TrimSpace(m[2])
			}
			r = strings.ReplaceAll(r, " ", "")
			if r != "" && regexp.MustCompile(`^\d{2,4}/\d{2,4}$`).MatchString(r) {
				return &r
			}
		}
	}
	// Line-based: baris yang berisi pola RT/RW
	for _, line := range lines {
		l := strings.TrimSpace(line)
		for _, re := range []*regexp.Regexp{
			regexp.MustCompile(`(?i)RT/?RW\s*[:.]?\s*(\d{2,4}\s*[/\-]\s*\d{2,4})`),
			regexp.MustCompile(`(\d{2,4}\s*[/\-]\s*\d{2,4})`),
		} {
			if m := re.FindStringSubmatch(l); len(m) > 1 && m[1] != "" {
				r := strings.ReplaceAll(strings.ReplaceAll(m[1], " ", ""), "-", "/")
				if regexp.MustCompile(`^\d{2,4}/\d{2,4}$`).MatchString(r) {
					return &r
				}
			}
		}
	}
	return nil
}

func extractKelurahan(text string, lines []string) *string {
	patterns := []*regexp.Regexp{
		regexp.MustCompile(`(?i)KEL\.?/?DESA\s*[:.]?\s*([A-Za-z\s]+?)(?:\s+KECAMATAN|\s+AGAMA|\s+STATUS|$)`),
		regexp.MustCompile(`(?i)KELURAHAN\s*[:.]?\s*([A-Za-z\s]+?)(?:\s+KECAMATAN|\s+AGAMA|$)`),
		regexp.MustCompile(`(?i)KEL\s*[:.]?\s*([A-Za-z\s]{3,50}?)(?:\s+KECAMATAN|\s+AGAMA|$)`),
		regexp.MustCompile(`(?i)DESA\s*[:.]?\s*([A-Za-z\s]+?)(?:\s+KECAMATAN|\s+AGAMA|$)`),
	}
	for _, re := range patterns {
		m := re.FindStringSubmatch(text)
		if len(m) > 1 {
			k := stripAtLabel(strings.TrimSpace(m[1]), stopBeforeKecamatanOrAgama)
			k = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(k, " "))
			if len(k) >= 3 && !regexp.MustCompile(`(?i)AGAMA|KECAMATAN`).MatchString(k) &&
				!regexp.MustCompile(`^\d+$`).MatchString(k) {
				s := strings.ToUpper(k)
				return &s
			}
		}
	}
	// Line-based: baris dimulai KEL/DESA
	for _, line := range lines {
		l := strings.TrimSpace(line)
		if regexp.MustCompile(`(?i)^KEL\.?/?DESA\s|^KELURAHAN\s|^KEL\s|^DESA\s`).MatchString(l) {
			rest := regexp.MustCompile(`(?i)^(?:KEL\.?/?DESA|KELURAHAN|KEL|DESA)\s*[:.]?\s*`).ReplaceAllString(l, "")
			rest = stripAtLabel(rest, stopBeforeKecamatanOrAgama)
			rest = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(rest, " "))
			if len(rest) >= 3 && !regexp.MustCompile(`(?i)AGAMA|KECAMATAN`).MatchString(rest) {
				s := strings.ToUpper(rest)
				return &s
			}
		}
	}
	return nil
}

func extractKecamatan(text string) *string {
	// Berhenti sebelum "AGAMA" agar tidak tercampur (mis. "KALIDERES AGAMA" -> kecamatan hanya "KALIDERES").
	re := regexp.MustCompile(`(?i)KECAMATAN\s*[:.]?\s*([A-Za-z\s]+?)(?:\s+AGAMA|\s+STATUS|\s+PEKERJAAN|$)`)
	if m := re.FindStringSubmatch(text); len(m) > 1 {
		k := stripAtLabel(strings.TrimSpace(m[1]), stopBeforeAgama)
		k = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(k, " "))
		if len(k) >= 3 && !regexp.MustCompile(`(?i)AGAMA`).MatchString(k) {
			s := strings.ToUpper(k)
			return &s
		}
	}
	return nil
}

func extractJenisKelaminAndGolonganDarah(text string) (jenisKelamin, golonganDarah *string) {
	jkGolRe := regexp.MustCompile(`(?is)JENIS\s+KE[LI]AMIN\s*[:.]?\s*[\s\S]+?(?:ALAMAT|AGAMA|STATUS|PEKERJAAN|$)`)
	block := jkGolRe.FindString(text)
	if block == "" {
		jkGolRe2 := regexp.MustCompile(`(?is)JK\s*[:.]?\s*[\s\S]+?(?:ALAMAT|AGAMA|STATUS|PEKERJAAN|$)`)
		block = jkGolRe2.FindString(text)
	}
	if block == "" {
		block = text
	}
	block = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(block, " "))

	golRe := regexp.MustCompile(`(?i)GOL\.?\s*DARAH\s*[:.]?\s*([ABO\-]+)`)
	if m := golRe.FindStringSubmatch(block); len(m) > 1 {
		g := strings.TrimSpace(strings.ReplaceAll(m[1], "-", ""))
		if g == "A" || g == "B" || g == "AB" || g == "O" {
			golonganDarah = &g
		}
	}
	if golonganDarah == nil {
		fallRe := regexp.MustCompile(`(?i)\b(AB|A|B|O)\b`)
		if m := fallRe.FindStringSubmatch(block); len(m) > 1 && regexp.MustCompile(`(?i)GOL|DARAH`).MatchString(block) {
			g := strings.ToUpper(m[1])
			if g == "A" || g == "B" || g == "AB" || g == "O" {
				golonganDarah = &g
			}
		}
	}

	jkRe := regexp.MustCompile(`(?i)JENIS\s+KE[LI]AMIN\s*[:.]?\s*([A-Za-z\s\-]+?)(?:\s*GOL\.?\s*DARAH|\s*DARAH\s*[:.]?|\s*[ABO]\s*$|$)`)
	if m := jkRe.FindStringSubmatch(block); len(m) > 1 {
		v := strings.TrimSpace(m[1])
		if regexp.MustCompile(`(?i)LAKI`).MatchString(v) {
			s := "Laki-laki"
			jenisKelamin = &s
		} else if regexp.MustCompile(`(?i)PEREMPUAN|^P$`).MatchString(v) {
			s := "Perempuan"
			jenisKelamin = &s
		}
	}
	if jenisKelamin == nil {
		if regexp.MustCompile(`(?i)LAKI-LAKI`).MatchString(block) {
			s := "Laki-laki"
			jenisKelamin = &s
		} else if regexp.MustCompile(`(?i)PEREMPUAN`).MatchString(block) {
			s := "Perempuan"
			jenisKelamin = &s
		} else if regexp.MustCompile(`(?i)\bLAKI\b`).MatchString(block) && !strings.Contains(strings.ToLower(block), "laki-laki") {
			s := "Laki-laki"
			jenisKelamin = &s
		}
	}
	return
}

func extractAgama(text string) *string {
	re := regexp.MustCompile(`(?i)AGAMA\s*[:.]?\s*([A-Za-z]+)`)
	if m := re.FindStringSubmatch(text); len(m) > 1 {
		if s := fuzzyMatch(m[1], agamaOptions, 0.5); s != nil {
			return s
		}
	}
	return fuzzyMatch(text, agamaOptions, 0.7)
}

func extractStatusPerkawinan(text string) *string {
	re := regexp.MustCompile(`(?i)STATUS\s+PERKAWINAN\s*[:.]?\s*(.+?)(?:\s+[A-Z]|$)`)
	if m := re.FindStringSubmatch(text); len(m) > 1 {
		if s := fuzzyMatch(strings.TrimSpace(m[1]), statusOptions, 0.5); s != nil {
			return s
		}
	}
	re2 := regexp.MustCompile(`(?i)S\.?\s*P\.?\s*[:.]?\s*(.+?)(?:\s|$)`)
	if m := re2.FindStringSubmatch(text); len(m) > 1 {
		if s := fuzzyMatch(strings.TrimSpace(m[1]), statusOptions, 0.5); s != nil {
			return s
		}
	}
	return fuzzyMatch(text, statusOptions, 0.5)
}

func extractPekerjaan(text string) *string {
	re := regexp.MustCompile(`(?i)PEKERJAAN\s*[:.]?\s*([A-Za-z\s]{3,50})`)
	if m := re.FindStringSubmatch(text); len(m) > 1 {
		p := strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(m[1], " "))
		if len(p) >= 3 && !regexp.MustCompile(`(?i)WARGA|NEGARA|BERLAKU`).MatchString(p) {
			s := strings.ToUpper(p)
			return &s
		}
	}
	return nil
}

func extractKewarganegaraan(text string) *string {
	if regexp.MustCompile(`(?i)\bWNI\b|INDONESIA`).MatchString(text) {
		s := "WNI"
		return &s
	}
	if regexp.MustCompile(`(?i)\bWNA\b`).MatchString(text) {
		s := "WNA"
		return &s
	}
	s := "WNI"
	return &s
}

func extractBerlakuHingga(text string) *string {
	if regexp.MustCompile(`(?i)SEUMUR\s*HIDUP`).MatchString(text) {
		s := "SEUMUR HIDUP"
		return &s
	}
	re := regexp.MustCompile(`(?i)BERLAKU\s*(?:HINGGA)?\s*[:.]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{4})`)
	if m := re.FindStringSubmatch(text); len(m) > 1 {
		s := strings.ReplaceAll(m[1], "/", "-")
		return &s
	}
	return nil
}

func extractKewarganegaraanIfExplicit(text string) *string {
	if regexp.MustCompile(`(?i)\bWNI\b|INDONESIA`).MatchString(text) {
		s := "WNI"
		return &s
	}
	if regexp.MustCompile(`(?i)\bWNA\b`).MatchString(text) {
		s := "WNA"
		return &s
	}
	return nil
}

// EnrichExtendedFields mengisi field KTP tambahan dari teks OCR mentah (best pass).
func EnrichExtendedFields(r *Result, rawOCR string) {
	if r == nil || strings.TrimSpace(rawOCR) == "" {
		return
	}
	text := normalizeText(rawOCR)
	lines := strings.Split(text, "\n")
	trimmed := make([]string, 0, len(lines))
	for _, l := range lines {
		trimmed = append(trimmed, strings.TrimSpace(l))
	}
	r.Provinsi = extractProvinsi(text, trimmed)
	r.KabupatenKota = extractKabupatenKota(text, trimmed)
	r.RtRw = extractRTRW(text, trimmed)
	r.Kelurahan = extractKelurahan(text, trimmed)
	r.Kecamatan = extractKecamatan(text)
}

// MergeExtendedFieldsFromTesseract mengisi field ekstra di dst dari hasil Tesseract jika dst masih kosong.
func MergeExtendedFieldsFromTesseract(dst, src *Result) {
	if dst == nil || src == nil {
		return
	}
	fill := func(d **string, s *string) {
		if d == nil {
			return
		}
		if *d != nil && strings.TrimSpace(**d) != "" {
			return
		}
		if s == nil || strings.TrimSpace(*s) == "" {
			return
		}
		v := strings.TrimSpace(*s)
		*d = &v
	}
	fill(&dst.Provinsi, src.Provinsi)
	fill(&dst.KabupatenKota, src.KabupatenKota)
	fill(&dst.RtRw, src.RtRw)
	fill(&dst.Kelurahan, src.Kelurahan)
	fill(&dst.Kecamatan, src.Kecamatan)
	fill(&dst.Alamat, src.Alamat)
}
