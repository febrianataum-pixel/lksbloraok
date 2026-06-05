import { LKS, Beneficiary, DinsosSettings } from "../types";

export const INITIAL_SETTINGS: DinsosSettings = {
  headOfDinsos: "Drs. H. Lulus Suprasetyawan, M.Si",
  nipOfDinsos: "19691125 199303 1 005",
  appLogo: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  managementProfile: "Dinas Sosial, Pemberdayaan Perempuan dan Perlindungan Anak (Dinsos PPPA) Kabupaten Blora memiliki tugas membantu Bupati dalam melaksanakan urusan pemerintahan bidang sosial dan bidang pemberdayaan perempuan dan perlindungan anak yang menjadi kewenangan Daerah."
};

export const INITIAL_LKS_DATA: LKS[] = [
  {
    id: "lks-bhakti-mulia",
    name: "LKS Bhakti Mulia",
    district: "Blora",
    village: "Tempelan",
    address: "Jl. Pemuda No. 12, Tempelan, Kec. Blora, Kabupaten Blora",
    whatsapp: "081234567890",
    establishedDate: "2015-08-17",
    isActive: true,
    chairman: "H. Ahmad Sodik, S.Pd",
    secretary: "Aulia Rahman, S.E",
    treasurer: "Ningsih Wahyuni",
    kemenkumhamNo: "AHU-0012435.AH.01.04.2015",
    npwp: "72.435.122.5-514.000",
    stdNo: "050/342/STD/2024",
    stdExpiryDate: "2029-08-17",
    position: "Pusat",
    workScope: "Kabupaten",
    accreditation: "Akreditasi A",
    accreditationYear: "2022",
    activityDescription: "Fokus pada pemberdayaan anak jalanan, yatim piatu, dan rehabilitasi sosial lansia di daerah kota Blora.",
    latitude: -6.9685,
    longitude: 111.4150,
    supportHistory: [
      { id: "sh-1", year: 2023, source: "APBD Kabupaten", jenisBantuan: "Pemberdayaan Ekonomi", nominal: 15000000 } as any,
      { id: "sh-2", year: 2024, source: "Kemensos RI", jenisBantuan: "Operasional LKS", nominal: 25000000 } as any
    ],
    documents: {
      ktpKetua: {
        name: "ktp_ahmad_sodik.pdf",
        url: "#",
        uploadedAt: "2026-05-10T12:00:00Z",
        size: "450 KB"
      },
      skKemenkumham: {
        name: "sk_kemenkumham_bhakti_mulia.pdf",
        url: "#",
        uploadedAt: "2026-05-10T12:05:00Z",
        size: "1.2 MB"
      },
      std: {
        name: "std_bhakti_mulia.pdf",
        url: "#",
        uploadedAt: "2026-05-10T12:10:00Z",
        size: "820 KB"
      },
      sertifikatAccreditation: {
        name: "akreditasi_bhakti_mulia.pdf",
        url: "#",
        uploadedAt: "2026-05-10T12:12:00Z",
        size: "950 KB"
      }
    }
  },
  {
    id: "lks-manunggal-kasih",
    name: "LKS Manunggal Kasih",
    district: "Cepu",
    village: "Balun",
    address: "Jl. Ngareng No. 45, Balun, Kec. Cepu, Kabupaten Blora",
    whatsapp: "089876543210",
    establishedDate: "2018-05-10",
    isActive: true,
    chairman: "Siti Rahayu, S.Sos",
    secretary: "Eko Prasetyo",
    treasurer: "Hutami Dewi",
    kemenkumhamNo: "AHU-0044562.AH.01.04.2018",
    npwp: "81.223.456.2-514.000",
    stdNo: "050/118/STD/2025",
    stdExpiryDate: "2030-05-10",
    position: "Cabang",
    workScope: "Provinsi",
    accreditation: "Akreditasi B",
    accreditationYear: "2023",
    activityDescription: "Pelayanan kesejahteraan bagi penyandang disabilitas fisik, mental, serta pemberian pelatihan keterampilan kerja produktif.",
    latitude: -7.1520,
    longitude: 111.5890,
    supportHistory: [
      { id: "sh-3", year: 2024, source: "Dinsos Provinsi Jateng", jenisBantuan: "Pelatihan Keterampilan", nominal: 20000000 } as any
    ],
    documents: {
      ktpKetua: {
        name: "ktp_siti_rahayu.pdf",
        url: "#",
        uploadedAt: "2026-04-12T09:00:00Z",
        size: "420 KB"
      },
      skKemenkumham: {
        name: "sk_kemenkumham_manunggal_kasih.pdf",
        url: "#",
        uploadedAt: "2026-04-12T09:03:00Z",
        size: "1.1 MB"
      }
    }
  },
  {
    id: "lks-melati-suci",
    name: "LKS Melati Suci",
    district: "Kunduran",
    village: "Kunduran",
    address: "Jl. Raya Blora-Purwodadi Km 25, Kec. Kunduran, Kabupaten Blora",
    whatsapp: "082133445566",
    establishedDate: "2020-01-05",
    isActive: false,
    chairman: "Bambang Wijaya",
    secretary: "Dwi Astuti",
    treasurer: "Fajar Nugroho",
    kemenkumhamNo: "AHU-0099851.AH.01.04.2020",
    npwp: "92.311.642.1-514.000",
    stdNo: "050/094/STD/2025",
    stdExpiryDate: "2025-01-05",
    position: "Pusat",
    workScope: "Kabupaten",
    accreditation: "Belum terakreditasi",
    accreditationYear: "",
    activityDescription: "Pemberian bantuan pangan rutin bagi fakir miskin, bantuan darurat bencana daerah, dan pelayanan posyandu lansia.",
    latitude: -7.0110,
    longitude: 111.2370,
    supportHistory: [],
    documents: {}
  }
];

export const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: "pm-1",
    name: "Budi Santoso",
    lksId: "lks-bhakti-mulia",
    lksName: "LKS Bhakti Mulia",
    nik: "3316011212850001",
    kk: "3316010505120005",
    birthPlace: "Blora",
    birthDate: "1985-12-12",
    gender: "L",
    district: "Blora",
    village: "Tempelan",
    category: "Dalam",
    notes: "Penyandang disabilitas fisik paraplegia berat. Membutuhkan kursi roda adaptif dan paket sembako rutin."
  },
  {
    id: "pm-2",
    name: "Siti Aminah",
    lksId: "lks-bhakti-mulia",
    lksName: "LKS Bhakti Mulia",
    nik: "3316015508920002",
    kk: "3316010505120005",
    birthPlace: "Blora",
    birthDate: "1992-08-15",
    gender: "P",
    district: "Blora",
    village: "Mlangsen",
    category: "Dalam",
    notes: "Anak yatim piatu berprestasi. Diusulkan menerima Program Keluarga Harapan (PKH) dan Beasiswa Anak Asuh."
  },
  {
    id: "pm-3",
    name: "Rinto Wijaya",
    lksId: "lks-manunggal-kasih",
    lksName: "LKS Manunggal Kasih",
    nik: "3316022204780003",
    kk: "3316021111150009",
    birthPlace: "Cepu",
    birthDate: "1978-04-22",
    gender: "L",
    district: "Cepu",
    village: "Balun",
    category: "Dalam",
    notes: "Lansia terlantar tanpa sanak saudara. Mengikuti program panti jompo harian LKS Manunggal Kasih."
  },
  {
    id: "pm-4",
    name: "Dewi Lestari",
    lksId: "lks-manunggal-kasih",
    lksName: "LKS Manunggal Kasih",
    nik: "3316026010020004",
    kk: "3316021111150009",
    birthPlace: "Bojonegoro",
    birthDate: "2002-10-20",
    gender: "P",
    district: "Cepu",
    village: "Tambakromo",
    category: "Luar",
    notes: "Korban kekerasan rumah tangga (asal Bojonegoro, domisili perlindungan di Cepu). Mengikuti pemulihan psikologis trauma healing."
  }
];
