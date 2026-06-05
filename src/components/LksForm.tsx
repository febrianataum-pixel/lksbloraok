import React, { useState } from "react";
import { LKS, SupportHistory, BLORA_DISTRICTS } from "../types";
import { useNotifications } from "./NotificationManager";
import { MapPicker } from "./MapPicker";
import { 
  Building2, Users, FileText, Gift, HelpCircle, MapPin, 
  Plus, Trash2, Save, Calendar, Globe, Landmark, DollarSign, ArrowLeft
} from "lucide-react";

interface LksFormProps {
  initialData?: LKS | null;
  onSave: (data: LKS) => void;
  onCancel: () => void;
}

export const LksForm: React.FC<LksFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const { showToast } = useNotifications();
  const [activeSubTab, setActiveSubTab] = useState<"identitas" | "pengurus" | "legalitas" | "bantuan" | "deskripsi" | "maps">("identitas");

  // Core Form States
  const [name, setName] = useState(initialData?.name || "");
  const [district, setDistrict] = useState(initialData?.district || "Blora");
  const [village, setVillage] = useState(initialData?.village || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || "");
  const [establishedDate, setEstablishedDate] = useState(initialData?.establishedDate || "");
  const [isActive, setIsActive] = useState(initialData !== undefined ? (initialData?.isActive ?? true) : true);

  // Kepengurusan
  const [chairman, setChairman] = useState(initialData?.chairman || "");
  const [secretary, setSecretary] = useState(initialData?.secretary || "");
  const [treasurer, setTreasurer] = useState(initialData?.treasurer || "");

  // Legalitas
  const [kemenkumhamNo, setKemenkumhamNo] = useState(initialData?.kemenkumhamNo || "");
  const [npwp, setNpwp] = useState(initialData?.npwp || "");
  const [stdNo, setStdNo] = useState(initialData?.stdNo || "");
  const [stdExpiryDate, setStdExpiryDate] = useState(initialData?.stdExpiryDate || "");
  const [position, setPosition] = useState<"Pusat" | "Cabang">(initialData?.position || "Pusat");
  const [workScope, setWorkScope] = useState<"Kabupaten" | "Provinsi" | "Nasional">(initialData?.workScope || "Kabupaten");
  const [accreditation, setAccreditation] = useState<"Belum terakreditasi" | "Akreditasi A" | "Akreditasi B" | "Akreditasi C" | "Akreditasi D">(initialData?.accreditation || "Belum terakreditasi");
  const [accreditationYear, setAccreditationYear] = useState(initialData?.accreditationYear || "");

  // Riwayat Penerimaan Bantuan
  const [supportHistory, setSupportHistory] = useState<SupportHistory[]>(initialData?.supportHistory || []);
  const [newHelpYear, setNewHelpYear] = useState<number>(new Date().getFullYear());
  const [newHelpSource, setNewHelpSource] = useState("");
  const [newHelpType, setNewHelpType] = useState("");
  const [newHelpAmount, setNewHelpAmount] = useState<number | "">("");

  // Deskripsi Kegiatan
  const [activityDescription, setActivityDescription] = useState(initialData?.activityDescription || "");

  // Lokasi Maps Coordinates
  const getInitialCoords = () => {
    if (initialData?.latitude && initialData?.longitude) {
      return { lat: initialData.latitude, lng: initialData.longitude };
    }
    // Default Blora Center Coordinates
    return { lat: -6.9697, lng: 111.4168 };
  };
  const [coords, setCoords] = useState(getInitialCoords());

  const handleAddSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHelpSource || !newHelpType || !newHelpAmount) {
      showToast("warn", "Input Bantuan Kurang", "Harap isi semua kolom bantuan: Tahun, Sumber, Jenis, dan Nominal.");
      return;
    }

    const newItem: SupportHistory = {
      id: Math.random().toString(36).substr(2, 9),
      year: Number(newHelpYear),
      source: newHelpSource,
      type: newHelpType,
      amount: Number(newHelpAmount)
    };

    setSupportHistory(prev => [...prev, newItem]);
    setNewHelpSource("");
    setNewHelpType("");
    setNewHelpAmount("");
    showToast("success", "Bantuan Ditambahkan", "Berhasil menambah rincian bantuan ke catatan sementara.");
  };

  const handleRemoveSupport = (id: string) => {
    setSupportHistory(prev => prev.filter(item => item.id !== id));
    showToast("info", "Bantuan Dihapus", "Satu rincian bantuan telah dihapus dari rincian.");
  };

  const handleMapChange = (lat: number, lng: number) => {
    setCoords({ lat, lng });
  };

  // Adjust map viewpoint when district/kecamatan is chosen
  const handleDistrictChange = (kecName: string) => {
    setDistrict(kecName);
    const districtObj = BLORA_DISTRICTS.find(d => d.name === kecName);
    if (districtObj) {
      setCoords({ lat: districtObj.lat, lng: districtObj.lng });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("error", "Validasi Gagal", "Nama LKS tidak boleh kosong.");
      return;
    }
    if (!village.trim()) {
      showToast("error", "Validasi Gagal", "Desa / Kelurahan tidak boleh kosong.");
      return;
    }
    if (!chairman.trim()) {
      showToast("error", "Validasi Gagal", "Nama Ketua tidak boleh kosong.");
      return;
    }

    const compiledLks: LKS = {
      id: initialData?.id || `lks-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      district,
      village: village.trim(),
      address: address.trim(),
      whatsapp: whatsapp.replace(/\D/g, ""), // clean non-digits for API
      establishedDate,
      isActive,
      chairman: chairman.trim(),
      secretary: secretary.trim(),
      treasurer: treasurer.trim(),
      kemenkumhamNo: kemenkumhamNo.trim(),
      npwp: npwp.trim(),
      stdNo: stdNo.trim(),
      stdExpiryDate,
      position,
      workScope,
      accreditation,
      accreditationYear,
      supportHistory,
      activityDescription: activityDescription.trim(),
      latitude: coords.lat,
      longitude: coords.lng,
      documents: initialData?.documents || {}
    };

    onSave(compiledLks);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const menuTabs = [
    { id: "identitas", label: "Identitas & Domisili", icon: Building2 },
    { id: "pengurus", label: "Kepengurusan", icon: Users },
    { id: "legalitas", label: "Legalitas", icon: Landmark },
    { id: "bantuan", label: "Bantuan", icon: Gift },
    { id: "deskripsi", label: "Kegiatan", icon: FileText },
    { id: "maps", label: "Lokasi Map", icon: MapPin }
  ] as const;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm shadow-slate-100/50 overflow-hidden flex flex-col">
      {/* Form Header */}
      <div className="px-6 py-5 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-slate-200/80 rounded-xl text-slate-500 transition-colors cursor-pointer border border-slate-200 bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-md font-bold text-slate-900 font-display">
              {initialData ? "Edit Lembaga Sosial (LKS)" : "Tambah Lembaga Sosial Baru (LKS)"}
            </h3>
            <p className="text-xs text-slate-400 font-medium">Gunakan tab untuk melengkapi identitas, pengurus, legalitas, rincian peta, dan riwayat bantuan.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="flex lg:flex-row items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-705 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Simpan Data LKS
        </button>
      </div>

      {/* Form Subtabs */}
      <div className="flex border-b border-slate-100 overflow-x-auto text-slate-500 bg-slate-50/50 no-scrollbar">
        {menuTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-5 py-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer
                ${isActive 
                  ? "border-orange-500 text-slate-900 bg-white" 
                  : "border-transparent hover:text-slate-900 hover:bg-slate-100/50"}
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-orange-500" : "text-slate-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Context Area */}
      <form onSubmit={(e) => e.preventDefault()} className="p-6 flex-1 max-h-[65vh] overflow-y-auto space-y-4">
        
        {/* TAB 1: Identitas & Domisili */}
        {activeSubTab === "identitas" && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Nama LKS <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none font-sans"
                placeholder="cth: LKS Bhakti Mulia Blora"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Kecamatan (Kab. Blora) <span className="text-rose-500">*</span></label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 shadow-sm outline-none hover:bg-slate-100 cursor-pointer"
                >
                  {BLORA_DISTRICTS.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Desa / Kelurahan <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none"
                  placeholder="cth: Tempelan, Balun"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Alamat Lengkap</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none"
                placeholder="Tambahkan nama jalan, nomor rumah, RT/RW lengkap..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">WhatsApp Ketua (Bisa Klik Link)</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none font-mono"
                  placeholder="cth: 081234567890"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Tanggal Berdiri</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={establishedDate}
                    onChange={(e) => setEstablishedDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-2">Status keaktifan lembaga</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                >
                  AKTIF (Hijau)
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${!isActive ? "bg-rose-50 text-rose-700 border-rose-300 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                >
                  NON-AKTIF (Merah)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Kepengurusan */}
        {activeSubTab === "pengurus" && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Nama Ketua <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={chairman}
                onChange={(e) => setChairman(e.target.value)}
                className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none"
                placeholder="Nama lengkap Ketua lembaga beserta gelar..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Nama Sekretaris</label>
              <input
                type="text"
                value={secretary}
                onChange={(e) => setSecretary(e.target.value)}
                className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none"
                placeholder="Nama Sekretaris..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Nama Bendahara</label>
              <input
                type="text"
                value={treasurer}
                onChange={(e) => setTreasurer(e.target.value)}
                className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none"
                placeholder="Nama Bendahara..."
              />
            </div>
          </div>
        )}

        {/* TAB 3: Legalitas & Pekerjaan */}
        {activeSubTab === "legalitas" && (
          <div className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">No SK Kemenkumham</label>
                <input
                  type="text"
                  value={kemenkumhamNo}
                  onChange={(e) => setKemenkumhamNo(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none font-mono"
                  placeholder="AHU-00XXXX.AH.XX..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">NPWP Pajak Lembaga</label>
                <input
                  type="text"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none font-mono"
                  placeholder="12.345.678.9-514.000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">No Surat Tanda Daftar (STD)</label>
                <input
                  type="text"
                  value={stdNo}
                  onChange={(e) => setStdNo(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none font-mono"
                  placeholder="050/XXX/STD/2026"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Tanggal Berlaku s/d STD</label>
                <input
                  type="date"
                  value={stdExpiryDate}
                  onChange={(e) => setStdExpiryDate(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Posisi LKS</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input type="radio" checked={position === "Pusat"} onChange={() => setPosition("Pusat")} className="text-orange-500 focus:ring-orange-500" />
                    Pusat
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input type="radio" checked={position === "Cabang"} onChange={() => setPosition("Cabang")} className="text-orange-500 focus:ring-orange-500" />
                    Cabang
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Lingkup Kerja</label>
                <select
                  value={workScope}
                  onChange={(e) => setWorkScope(e.target.value as any)}
                  className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 outline-none hover:bg-slate-100 cursor-pointer"
                >
                  <option value="Kabupaten">Kabupaten</option>
                  <option value="Provinsi">Provinsi</option>
                  <option value="Nasional">Nasional</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Status Akreditasi</label>
                <select
                  value={accreditation}
                  onChange={(e) => setAccreditation(e.target.value as any)}
                  className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 outline-none hover:bg-slate-100 cursor-pointer"
                >
                  <option value="Belum terakreditasi">Belum terakreditasi</option>
                  <option value="Akreditasi A">Akreditasi A</option>
                  <option value="Akreditasi B">Akreditasi B</option>
                  <option value="Akreditasi C">Akreditasi C</option>
                  <option value="Akreditasi D">Akreditasi D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Tahun Akreditasi</label>
                <input
                  type="number"
                  value={accreditationYear}
                  onChange={(e) => setAccreditationYear(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none font-mono"
                  placeholder="cth: 2024"
                  disabled={accreditation === "Belum terakreditasi"}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Riwayat Penerimaan Bantuan */}
        {activeSubTab === "bantuan" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 max-w-xl">
              <h4 className="font-bold text-slate-900 text-xs font-display flex items-center gap-1.5 mb-3.5">
                <Plus className="w-4 h-4 text-orange-500" />
                Tambah Catatan Riwayat Bantuan
              </h4>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Tahun</label>
                  <input
                    type="number"
                    value={newHelpYear}
                    onChange={(e) => setNewHelpYear(Number(e.target.value))}
                    className="w-full text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 px-3 py-2 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Nominal Bantuan (Rp)</label>
                  <input
                    type="number"
                    value={newHelpAmount}
                    onChange={(e) => setNewHelpAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 px-3 py-2 outline-none font-mono"
                    placeholder="Nilai angka saja"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Sumber Bantuan</label>
                  <input
                    type="text"
                    value={newHelpSource}
                    onChange={(e) => setNewHelpSource(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 px-3 py-2 outline-none"
                    placeholder="Cth: APBD Kab / Kemensos"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Jenis Bantuan</label>
                  <input
                    type="text"
                    value={newHelpType}
                    onChange={(e) => setNewHelpType(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 px-3 py-2 outline-none"
                    placeholder="Cth: Dana Operasional"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSupport}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Berkas Bantuan
              </button>
            </div>

            {/* Render table if records are inside supportHistory */}
            <div className="max-w-2xl">
              <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-2">Riwayat Daftar Penerimaan Bantuan</h4>
              {supportHistory.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                        <th className="p-3">Tahun</th>
                        <th className="p-3">Sumber Bantuan</th>
                        <th className="p-3">Jenis Bantuan</th>
                        <th className="p-3 text-right">Nominal</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportHistory.map(item => (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-mono">{item.year}</td>
                          <td className="p-3 font-semibold text-slate-800">{item.source}</td>
                          <td className="p-3 text-slate-600">{item.type}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-950">{formatCurrency(item.amount)}</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveSupport(item.id)}
                              className="p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-center p-4">
                  <p className="text-slate-400 text-xs italic">Belum ada rincian penerimaan bantuan yang ditambahkan.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Deskripsi Kegiatan */}
        {activeSubTab === "deskripsi" && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">Deskripsi Kegiatan LKS</label>
              <textarea
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                rows={8}
                className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none leading-relaxed"
                placeholder="Tuliskan perincian deskripsi, program sosial harian, fokus masyarakat binaan, serta aktivitas kemanusiaan LKS secara lengkap..."
              />
            </div>
          </div>
        )}

        {/* TAB 6: Peta Lokasi (Maps) */}
        {activeSubTab === "maps" && (
          <div className="space-y-4 max-w-3xl">
            <div>
              <h4 className="font-bold text-slate-900 text-xs font-display">Tentukan Lokasi LKS pada Peta</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih atau drag marker pada koordinat LKS yang ditunjuk di peta wilayah Kabupaten Blora, atau gunakan koordinat GPS saat ini.
              </p>
            </div>

            <MapPicker
              latitude={coords.lat}
              longitude={coords.lng}
              onChange={handleMapChange}
            />
          </div>
        )}

      </form>
    </div>
  );
};
export default LksForm;
