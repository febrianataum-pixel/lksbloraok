import React, { useState, useEffect } from "react";
import { Beneficiary, LKS, BLORA_DISTRICTS } from "../types";
import { useNotifications } from "./NotificationManager";
import { calculateAge } from "../utils/exporters";
import { Users, Building, FileText, Calendar, Search, MapPin, Save, ArrowLeft, Heart } from "lucide-react";

interface PmFormProps {
  initialData?: Beneficiary | null;
  lksList: LKS[];
  onSave: (data: Beneficiary) => void;
  onCancel: () => void;
}

export const PmForm: React.FC<PmFormProps> = ({
  initialData,
  lksList,
  onSave,
  onCancel
}) => {
  const { showToast } = useNotifications();

  // Search filter for LKS dropdown
  const [lksSearchQuery, setLksSearchQuery] = useState("");
  const [showLksDropdown, setShowLksDropdown] = useState(false);

  // Core Form States
  const [name, setName] = useState(initialData?.name || "");
  const [lksId, setLksId] = useState(initialData?.lksId || "");
  const [lksName, setLksName] = useState(initialData?.lksName || "");
  const [nik, setNik] = useState(initialData?.nik || "");
  const [kk, setKk] = useState(initialData?.kk || "");
  const [birthPlace, setBirthPlace] = useState(initialData?.birthPlace || "");
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || "");
  const [gender, setGender] = useState<"L" | "P">(initialData?.gender || "L");
  const [kabupaten, setKabupaten] = useState(initialData?.district ? "Blora" : "Blora"); // Always "Blora" or as preset
  const [district, setDistrict] = useState(initialData?.district || "Blora");
  const [village, setVillage] = useState(initialData?.village || "");
  const [category, setCategory] = useState<"Dalam" | "Luar">(initialData?.category || "Dalam");
  const [notes, setNotes] = useState(initialData?.notes || "");

  // Real-time Age tracking
  const [computedAge, setComputedAge] = useState(0);

  // Sync state if initialData is provided
  useEffect(() => {
    if (birthDate) {
      setComputedAge(calculateAge(birthDate));
    } else {
      setComputedAge(0);
    }
  }, [birthDate]);

  // Set selected LKS
  const handleSelectLks = (id: string, name: string) => {
    setLksId(id);
    setLksName(name);
    setLksSearchQuery(name);
    setShowLksDropdown(false);
  };

  const filteredLks = lksList.filter(lks => 
    lks.name.toLowerCase().includes(lksSearchQuery.toLowerCase()) ||
    lks.district.toLowerCase().includes(lksSearchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("error", "Simpan Gagal", "Nama Penerima Manfaat (PM) wajib diisi.");
      return;
    }
    if (!lksId) {
      showToast("error", "Simpan Gagal", "Lembaga LKS pembina PM wajib dipilih.");
      return;
    }
    if (nik.length !== 16 || isNaN(Number(nik))) {
      showToast("error", "Simpan Gagal", "Nomor NIK harus tepat 16 digit angka.");
      return;
    }
    if (kk.length !== 16 || isNaN(Number(kk))) {
      showToast("error", "Simpan Gagal", "Nomor Kartu Keluarga (KK) harus tepat 16 digit angka.");
      return;
    }
    if (!birthDate) {
      showToast("error", "Simpan Gagal", "Tanggal lahir PM wajib diisi.");
      return;
    }

    const compiledPm: Beneficiary = {
      id: initialData?.id || `pm-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      lksId,
      lksName,
      nik: nik.trim(),
      kk: kk.trim(),
      birthPlace: birthPlace.trim(),
      birthDate,
      gender,
      district,
      village: village.trim(),
      category,
      notes: notes.trim()
    };

    onSave(compiledPm);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm shadow-slate-100/50 overflow-hidden flex flex-col max-w-3xl">
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
              {initialData ? "Edit Penerima Manfaat (PM)" : "Registrasi Penerima Manfaat Baru (PM)"}
            </h3>
            <p className="text-xs text-slate-400 font-medium">Isi data identitas diri PM untuk dipasangkan ke LKS terkait.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Simpan Data PM
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        
        {/* Searchable LKS Selector */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
            Nama LKS Pembina <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={lksSearchQuery}
              onChange={(e) => {
                setLksSearchQuery(e.target.value);
                setShowLksDropdown(true);
              }}
              onFocus={() => setShowLksDropdown(true)}
              placeholder="Cari & pilih nama LKS pembina..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white outline-none"
            />
            {lksId && (
              <span className="absolute right-3 top-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-150">
                LKS Terpilih
              </span>
            )}
          </div>

          {/* Search Dropdown Panel */}
          {showLksDropdown && (
            <div className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl z-20">
              {filteredLks.length > 0 ? (
                filteredLks.map(lks => (
                  <button
                    key={lks.id}
                    type="button"
                    onClick={() => handleSelectLks(lks.id, lks.name)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{lks.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {lks.id} | Kecamatan: {lks.district}</p>
                    </div>
                    <span className="text-[10.5px] font-semibold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      {lks.district}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs italic text-slate-400">
                  Tidak ditemukan Lembaga LKS penyesuai kata kunci.
                </div>
              )}
            </div>
          )}
        </div>

        {/* PM Name */}
        <div>
          <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
            Nama Lengkap Penerima Manfaat <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white outline-none"
              placeholder="cth: Budi Santoso"
              required
            />
          </div>
        </div>

        {/* NIK & KK (16 digit) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
              Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              maxLength={16}
              value={nik}
              onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white outline-none font-mono"
              placeholder="16-digit KK / KTP NIK"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
              Nomor Kartu Keluarga (KK) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              maxLength={16}
              value={kk}
              onChange={(e) => setKk(e.target.value.replace(/\D/g, ""))}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white outline-none font-mono"
              placeholder="16-digit Kartu Keluarga"
              required
            />
          </div>
        </div>

        {/* Tanggal Lahir & AUTO AGE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
              Tempat Lahir
            </label>
            <input
              type="text"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white outline-none"
              placeholder="cth: Blora, Rembang"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
              Tanggal Lahir (DD-MM-YYYY) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white outline-none font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
              Usia (Otomatis Dihitung)
            </label>
            <div className="px-3.5 py-2 bg-slate-900 border border-slate-950 rounded-lg text-white font-mono flex items-center justify-between shadow-inner">
              <span className="text-[10px] font-bold text-slate-400">AGE VALUE</span>
              <span className="text-sm font-extrabold text-orange-400">{computedAge} <span className="text-[9px] font-semibold text-slate-300">Tahun</span></span>
            </div>
          </div>
        </div>

        {/* Gender, Category, & Domisili */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
              Jenis Kelamin
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "L" | "P")}
              className="w-full text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 outline-none hover:bg-slate-100 cursor-pointer"
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
              Kategori Kesejahteraan
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "Dalam" | "Luar")}
              className="w-full text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 outline-none hover:bg-slate-100 cursor-pointer"
            >
              <option value="Dalam">PM Dalam (Dalam Wilayah LKS)</option>
              <option value="Luar">PM Luar (Luar Wilayah LKS)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
              Kabupaten Domisili
            </label>
            <input
              type="text"
              value={kabupaten}
              className="w-full px-3.5 py-2.5 text-xs font-extrabold rounded-lg bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed"
              disabled
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
              Kecamatan Domisili <span className="text-rose-500">*</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 outline-none hover:bg-slate-100 cursor-pointer"
            >
              {BLORA_DISTRICTS.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
              Desa / Kelurahan Domisili <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white outline-none"
              placeholder="Desa tempat tinggal saat ini..."
              required
            />
          </div>
        </div>

        {/* Notes (Keterangan) */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-1.5">
            Rincian Kondisi / Keterangan Kebutuhan PM
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-sm focus:border-slate-400 focus:bg-white outline-none leading-relaxed"
            placeholder="Tuliskan catatan bantuan yang dibutuhkan, keadaan ekonomi keluarga, riwayat sakit disabilitas, atau program perlindungan yg tepat..."
          />
        </div>

      </form>
    </div>
  );
};
export default PmForm;
