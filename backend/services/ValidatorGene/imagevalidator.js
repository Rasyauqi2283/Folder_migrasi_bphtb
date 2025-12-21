// Mock Data KTP untuk Simulasi E-KYC Demo TA
// CATATAN: Mock data dihapus untuk memungkinkan testing OCR real dengan KTP Ohim
// Jika ingin test OCR real, gunakan endpoint /api/v1/auth/real-ktp-verification
// Jika ingin simulasi, gunakan endpoint /api/v1/auth/simulate-ktp-verification

// Fungsi simulasi untuk mendapatkan data generic (tanpa mock data spesifik)
export function getRandomMockData() {
    // Generate random data generic untuk simulasi
    const names = ["ARAS RADITYA", "BUDI SANTOSO", "DIANA PUTRI", "EKO PRASETYO", "GITA PERMATA"];
    const randomIndex = Math.floor(Math.random() * names.length);
    const randomNIK = "3201" + Math.floor(100000000000 + Math.random() * 900000000000);
    
    return {
        nama: names[randomIndex],
        nik: randomNIK,
        status: "VERIFIED_BAPPENDA_DEMO"
    };
}
