export interface SupportHistory {
  id: string;
  year: number;
  source: string;
  type: string;
  amount: number;
}

export interface DocumentInfo {
  url: string;
  name: string;
  uploadedAt: string;
  size?: string;
}

export interface LksDocuments {
  ktpKetua?: DocumentInfo;
  skKemenkumham?: DocumentInfo;
  std?: DocumentInfo;
  sertifikatAccreditation?: DocumentInfo;
}

export interface LKS {
  id: string;
  name: string;
  district: string;
  village: string;
  address: string;
  whatsapp: string;
  establishedDate: string;
  isActive: boolean;
  
  // Kepengurusan
  chairman: string;
  secretary: string;
  treasurer: string;
  
  // Legalitas
  kemenkumhamNo: string;
  npwp: string;
  stdNo: string;
  stdExpiryDate: string;
  position: "Pusat" | "Cabang";
  workScope: "Kabupaten" | "Provinsi" | "Nasional";
  accreditation: "Belum terakreditasi" | "Akreditasi A" | "Akreditasi B" | "Akreditasi C" | "Akreditasi D";
  accreditationYear: string;
  
  // Riwayat Bantuan
  supportHistory: SupportHistory[];
  
  // Deskripsi Kegiatan
  activityDescription: string;
  
  // Lokasi Maps
  latitude: number;
  longitude: number;
  
  // Dokumen / Administrasi
  documents?: LksDocuments;
  
  // Audit fields
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  lksId: string;
  lksName: string;
  nik: string;
  kk: string;
  birthPlace: string;
  birthDate: string;
  gender: "L" | "P";
  district: string;
  village: string;
  category: "Dalam" | "Luar";
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DinsosSettings {
  headOfDinsos: string;
  nipOfDinsos: string;
  appLogo: string;
  managementProfile: string;
}

export interface DistrictCoord {
  name: string;
  lat: number;
  lng: number;
}

export const BLORA_DISTRICTS: DistrictCoord[] = [
  { name: "Banjarejo", lat: -7.0053, lng: 111.3734 },
  { name: "Blora", lat: -6.9697, lng: 111.4167 },
  { name: "Bogorejo", lat: -6.8927, lng: 111.4912 },
  { name: "Cepu", lat: -7.1513, lng: 111.5906 },
  { name: "Japah", lat: -6.9388, lng: 111.2723 },
  { name: "Jati", lat: -7.2882, lng: 111.2215 },
  { name: "Jepon", lat: -6.9744, lng: 111.4688 },
  { name: "Jiken", lat: -7.0267, lng: 111.5218 },
  { name: "Kedungtuban", lat: -7.1953, lng: 111.5034 },
  { name: "Kradenan", lat: -7.2711, lng: 111.4429 },
  { name: "Kunduran", lat: -7.0125, lng: 111.2386 },
  { name: "Ngawen", lat: -6.9947, lng: 111.2989 },
  { name: "Randublatung", lat: -7.2185, lng: 111.3934 },
  { name: "Sambong", lat: -7.1121, lng: 111.5513 },
  { name: "Todanan", lat: -6.8992, lng: 111.2067 },
  { name: "Tunjungan", lat: -6.9186, lng: 111.3824 }
];

export const BLORA_CENTER = { lat: -7.02, lng: 111.41 };
