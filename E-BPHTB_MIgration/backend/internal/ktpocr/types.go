package ktpocr

// Result is the KTP OCR extraction result (production: focus on NIK, Nama, Alamat only).
type Result struct {
	NIK            *string `json:"nik"`
	Nama           *string `json:"nama"`
	Alamat         *string `json:"alamat"`
	IsReadable     bool    `json:"is_readable"`
	RawText        string  `json:"rawText"`
	Confidence     float64 `json:"confidence"`
	ProcessingTime int64   `json:"processingTime"`
	Stats          *Stats  `json:"stats,omitempty"`
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
