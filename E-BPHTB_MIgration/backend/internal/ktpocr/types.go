package ktpocr

// TTL represents tempat dan tanggal lahir.
type TTL struct {
	Tempat   string `json:"tempat"`
	Tanggal  string `json:"tanggal"`
}

// Result is the full KTP OCR extraction result (mirrors Node ktpOCR.js output).
type Result struct {
	NIK              *string `json:"nik"`
	Nama             *string `json:"nama"`
	TTL              *TTL    `json:"ttl"`
	Provinsi         *string `json:"provinsi"`
	KabupatenKota    *string `json:"kabupatenKota"`
	Alamat           *string `json:"alamat"`
	RtRw             *string `json:"rtRw"`
	Kelurahan        *string `json:"kelurahan"`
	Kecamatan        *string `json:"kecamatan"`
	JenisKelamin     *string `json:"jenisKelamin"`
	GolonganDarah    *string `json:"golonganDarah"`
	Agama            *string `json:"agama"`
	StatusPerkawinan *string `json:"statusPerkawinan"`
	Pekerjaan        *string `json:"pekerjaan"`
	Kewarganegaraan  *string `json:"kewarganegaraan"`
	BerlakuHingga    *string `json:"berlakuHingga"`
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
