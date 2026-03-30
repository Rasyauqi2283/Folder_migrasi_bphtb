package ktpocr

// Result is the KTP OCR extraction result (NIK/Nama/Alamat wajib untuk lolos upload; field lain heuristic).
type Result struct {
	NIK              *string `json:"nik,omitempty"`
	Nama             *string `json:"nama,omitempty"`
	Alamat           *string `json:"alamat,omitempty"`
	Provinsi         *string `json:"provinsi,omitempty"`
	KabupatenKota    *string `json:"kabupatenKota,omitempty"`
	JenisKelamin     *string `json:"jenisKelamin,omitempty"`
	GolonganDarah    *string `json:"golonganDarah,omitempty"`
	TempatLahir      *string `json:"tempatLahir,omitempty"`
	TanggalLahir     *string `json:"tanggalLahir,omitempty"`
	RtRw             *string `json:"rtRw,omitempty"`
	Kelurahan        *string `json:"kelurahan,omitempty"`
	Kecamatan        *string `json:"kecamatan,omitempty"`
	Agama            *string `json:"agama,omitempty"`
	StatusPerkawinan *string `json:"statusPerkawinan,omitempty"`
	Pekerjaan        *string `json:"pekerjaan,omitempty"`
	Kewarganegaraan  *string `json:"kewarganegaraan,omitempty"`
	BerlakuHingga    *string `json:"berlakuHingga,omitempty"`
	IsReadable       bool    `json:"is_readable"`
	RawText          string  `json:"rawText"`
	Confidence       float64 `json:"confidence"`
	ProcessingTime   int64   `json:"processingTime"`
	Stats            *Stats  `json:"stats,omitempty"`
}

// Stats mirrors Node getExtractionStats output.
type Stats struct {
	TotalFields      int     `json:"totalFields"`
	ExtractedFields  int     `json:"extractedFields"`
	Confidence       float64 `json:"confidence"`
	Accuracy         float64 `json:"accuracy"`
	ProcessingTime   int64   `json:"processingTime"`
	IsValidNIK       bool    `json:"isValidNIK"`
	Completeness     float64 `json:"completeness"`
}
