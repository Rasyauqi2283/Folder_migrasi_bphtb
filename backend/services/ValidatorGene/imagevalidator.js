// Mock Data KTP untuk Simulasi E-KYC Demo TA
// Digunakan oleh endpoint /api/simulate-ktp-verification

export const mockKTPData = {
    "3201234567890001": {
        nama: "FARRAS BAPPENDA DEMO",
        nik: "3201234567890001",
        alamat: "JL. RAYA TEGAR BERIMAN NO. 1, CIBINONG, BOGOR",
        rt_rw: "005/002",
        kelurahan: "PAKANSARI",
        kecamatan: "CIBINONG",
        kota: "KABUPATEN BOGOR",
        provinsi: "JAWA BARAT",
        gender: "Laki-laki"
    },
    "3201987654321002": {
        nama: "SITI AISYAH",
        nik: "3201987654321002",
        alamat: "KAMPUNG BARU NO. 12, CIAWI, BOGOR",
        rt_rw: "001/001",
        kelurahan: "CIAWI",
        kecamatan: "CIAWI",
        kota: "KABUPATEN BOGOR",
        provinsi: "JAWA BARAT",
        gender: "Perempuan"
    }
};

// Fungsi simulasi untuk mendapatkan data acak jika NIK tidak terdaftar
export function getRandomMockData() {
    const names = ["ARAS RADITYA", "BUDI SANTOSO", "DIANA PUTRI", "EKO PRASETYO", "GITA PERMATA"];
    const randomIndex = Math.floor(Math.random() * names.length);
    const randomNIK = "3201" + Math.floor(100000000000 + Math.random() * 900000000000);
    
    return {
        nama: names[randomIndex],
        nik: randomNIK,
        status: "VERIFIED_BAPPENDA_DEMO"
    };
}
