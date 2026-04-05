package ktpocr

// Result is the KTP OCR extraction result.
// Wajib dipakai untuk validasi upload: NIK, Nama. Alamat + RT/RW + Kel/Desa + Kecamatan diekstrak untuk verifikasi; field lain tidak diparsing.
type Result struct {
	NIK           *string `json:"nik,omitempty"`
	Nama          *string `json:"nama,omitempty"`
	Alamat        *string `json:"alamat,omitempty"`
	Provinsi      *string `json:"provinsi,omitempty"`
	KabupatenKota *string `json:"kabupatenKota,omitempty"`
	RtRw          *string `json:"rtRw,omitempty"`
	Kelurahan     *string `json:"kelurahan,omitempty"`
	Kecamatan     *string `json:"kecamatan,omitempty"`
	IsReadable    bool    `json:"is_readable"`
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
