import React from "react";
import { LKS, Beneficiary, DinsosSettings } from "../types";
import { calculateAge } from "../utils/exporters";
import { Printer, X, Download, FileText } from "lucide-react";

interface PrintPreviewProps {
  type: "profile" | "recommendation" | "beneficiary-list" | null;
  targetLks: LKS | null;
  beneficiaries?: Beneficiary[];
  settings: DinsosSettings;
  recommendationNo?: string;
  recommendationTo?: string;
  onClose: () => void;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({
  type,
  targetLks,
  beneficiaries = [],
  settings,
  recommendationNo = "050/123/REC/2026",
  recommendationTo = "Pimpinan Lembaga Kesejahteraan Jawa Tengah",
  onClose
}) => {
  if (!type) return null;

  const handlePrint = () => {
    window.print();
  };

  const getTodayDateFormatted = () => {
    const today = new Date();
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-slate-800 text-white p-4 rounded-t-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Toolbar Controls */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-semibold text-slate-100 font-display">
                {type === "profile" && "Cetak Profil LKS (F4)"}
                {type === "recommendation" && "Cetak Surat Rekomendasi"}
                {type === "beneficiary-list" && "Cetak Daftar Penerima Manfaat"}
              </h3>
              <p className="text-xs text-slate-400">
                Gunakan pengaturan browser cetak "Simpan ke PDF" dengan ukuran halaman Folio/F4 atau Legal.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container */}
        <div className="flex-1 overflow-y-auto bg-slate-700 p-6 flex justify-center rounded-xl">
          <div className="bg-white text-slate-800 p-12 w-[100%] max-w-[215mm] border border-slate-200 shadow-xl overflow-hidden font-sans relative" style={{ minHeight: "297mm" }}>
            
            {/* 1. LKS Profile Report (F4) */}
            {type === "profile" && targetLks && (
              <div className="print-f4-page text-sm leading-relaxed" id="printable-area">
                {/* Official Header (Kop Surat) */}
                <div className="flex items-center justify-center gap-4 border-b-4 border-double border-slate-800 pb-4 mb-6 text-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src={settings.appLogo} alt="Logo" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 leading-tight">Pemerintah Kabupaten Blora</h2>
                    <h1 className="text-lg font-extrabold uppercase tracking-widest text-slate-900 leading-snug">Dinas Sosial, Pemberdayaan Perempuan<br />dan Perlindungan Anak (Dinsos PPPA)</h1>
                    <p className="text-[10px] text-slate-500 font-mono italic mt-0.5">Jl. Pemuda No.14 Blora, Jawa Tengah | Kode Pos: 58211</p>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-md font-bold uppercase tracking-wide text-slate-900 underline">Profil Lembaga Kesejahteraan Sosial (LKS)</h3>
                  <p className="text-xs text-slate-500 uppercase mt-0.5 font-semibold">Nomor Registrasi: {targetLks.id}</p>
                </div>

                {/* Section 1: Identitas */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-xs uppercase bg-slate-100 text-slate-800 px-2 py-0.5 border-l-4 border-slate-700 mb-2">I. Identitas &amp; Domisili Lembaga</h4>
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold w-1/3 text-slate-500">Nama Lembaga (LKS)</td><td className="py-1.5 text-slate-800 font-bold">{targetLks.name}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Kecamatan</td><td className="py-1.5 text-slate-800">{targetLks.district}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Desa / Kelurahan</td><td className="py-1.5 text-slate-800">{targetLks.village}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Alamat Lengkap</td><td className="py-1.5 text-slate-800">{targetLks.address}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">No. WhatsApp Ketua</td><td className="py-1.5 text-slate-800 font-mono">{targetLks.whatsapp}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Tanggal Berdiri</td><td className="py-1.5 text-slate-800 font-mono">{targetLks.establishedDate}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Status Keaktifan</td><td className="py-1.5"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${targetLks.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>{targetLks.isActive ? "AKTIF" : "NON-AKTIF"}</span></td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 2: Kepengurusan */}
                  <div>
                    <h4 className="font-bold text-xs uppercase bg-slate-100 text-slate-800 px-2 py-0.5 border-l-4 border-slate-700 mb-2">II. Susunan Kepengurusan</h4>
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold w-1/3 text-slate-500">Nama Ketua</td><td className="py-1.5 text-slate-800 font-semibold">{targetLks.chairman}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Nama Sekretaris</td><td className="py-1.5 text-slate-800">{targetLks.secretary || "-"}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Nama Bendahara</td><td className="py-1.5 text-slate-800">{targetLks.treasurer || "-"}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 3: Legalitas & Akreditasi */}
                  <div>
                    <h4 className="font-bold text-xs uppercase bg-slate-100 text-slate-800 px-2 py-0.5 border-l-4 border-slate-700 mb-2">III. Legalitas &amp; Status Akreditasi</h4>
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold w-1/3 text-slate-500">No SK Kemenkumham</td><td className="py-1.5 text-slate-800 font-mono">{targetLks.kemenkumhamNo || "-"}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Nama Sesuai SK Kemenkumham</td><td className="py-1.5 text-slate-800">{targetLks.kemenkumhamName || "-"}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">NPWP Pajak</td><td className="py-1.5 text-slate-800 font-mono">{targetLks.npwp || "-"}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">No. Surat Tanda Daftar (STD)</td><td className="py-1.5 text-slate-800 font-mono">{targetLks.stdNo || "-"}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Masa Berlaku STD s/d</td><td className="py-1.5 text-slate-800 font-mono">{targetLks.stdExpiryDate || "-"}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Posisi Lembaga</td><td className="py-1.5 text-slate-800">{targetLks.position}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Lingkup Kerja</td><td className="py-1.5 text-slate-800">{targetLks.workScope}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Status Akreditasi</td><td className="py-1.5 text-slate-800 font-bold">{targetLks.accreditation} {targetLks.accreditationYear && `(Tahun ${targetLks.accreditationYear})`}</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 font-semibold text-slate-500">Koordinat Peta</td><td className="py-1.5 text-slate-800 font-mono">LAT: {targetLks.latitude || "-"} | LNG: {targetLks.longitude || "-"}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 4: Deskripsi */}
                  <div>
                    <h4 className="font-bold text-xs uppercase bg-slate-100 text-slate-800 px-2 py-0.5 border-l-4 border-slate-700 mb-2">IV. Deskripsi Kegiatan</h4>
                    <p className="text-xs text-slate-700 leading-relaxed text-justify px-1">{targetLks.activityDescription || "Tidak ada deskripsi kegiatan yang ditambahkan."}</p>
                  </div>

                  {/* Section 5: Riwayat Bantuan */}
                  <div>
                    <h4 className="font-bold text-xs uppercase bg-slate-100 text-slate-800 px-2 py-0.5 border-l-4 border-slate-700 mb-2">V. Catatan Riwayat Penerimaan Bantuan</h4>
                    {targetLks.supportHistory && targetLks.supportHistory.length > 0 ? (
                      <table className="w-full text-left text-xs border border-slate-250 mt-1">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-1.5 font-bold">Tahun</th>
                            <th className="p-1.5 font-bold">Sumber Bantuan</th>
                            <th className="p-1.5 font-bold">Jenis Bantuan</th>
                            <th className="p-1.5 font-bold text-right">Nominal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {targetLks.supportHistory.map((item, idx) => (
                            <tr key={item.id || idx} className="border-b border-slate-150">
                              <td className="p-1.5 font-mono">{item.year}</td>
                              <td className="p-1.5">{item.source}</td>
                              <td className="p-1.5">{(item as any).jenisBantuan || item.type}</td>
                              <td className="p-1.5 text-right font-mono font-semibold">{formatCurrency(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-xs italic text-slate-400 px-1">Lembaga belum mencatatkan riwayat penerimaan bantuan.</p>
                    )}
                  </div>
                </div>

                {/* Sign Off Seals */}
                <div className="mt-12 flex justify-between items-start text-xs">
                  <div className="w-1/2">
                    <p className="font-bold">Ketua LKS {targetLks.name}</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{targetLks.chairman}</p>
                    <p className="text-[10px] text-slate-500 font-mono">ID LKS: {targetLks.id}</p>
                  </div>
                  <div className="w-1/2 text-right">
                    <p>Blora, {getTodayDateFormatted()}</p>
                    <p className="font-bold">Kepala Dinas Sosial PPPA Kab. Blora</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{settings.headOfDinsos}</p>
                    <p className="font-mono text-[10px] text-slate-500">NIP. {settings.nipOfDinsos}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Surat Rekomendasi (Formal Letter) */}
            {type === "recommendation" && targetLks && (
              <div className="text-sm leading-relaxed" id="printable-area">
                {/* Official Header (Kop Surat) */}
                <div className="flex items-center justify-center gap-4 border-b-4 border-double border-slate-800 pb-4 mb-6 text-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src={settings.appLogo} alt="Logo" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 leading-tight">Pemerintah Kabupaten Blora</h2>
                    <h1 className="text-lg font-extrabold uppercase tracking-widest text-slate-900 leading-snug">Dinas Sosial, Pemberdayaan Perempuan<br />dan Perlindungan Anak (Dinsos PPPA)</h1>
                    <p className="text-[10px] text-slate-500 font-mono italic mt-0.5 font-semibold">Jl. Pemuda No.14 Blora, Jawa Tengah | Telp/Fax: (0296) 531084</p>
                  </div>
                </div>

                <div className="text-right text-xs mb-4">
                  <p>Blora, {getTodayDateFormatted()}</p>
                </div>

                {/* Nomor / Sifat / Perihal */}
                <div className="grid grid-cols-12 gap-1 text-xs mb-6">
                  <div className="col-span-2 font-semibold">Nomor</div>
                  <div className="col-span-4">: <span className="font-mono font-bold text-slate-900">{recommendationNo}</span></div>
                  <div className="col-span-2 col-start-8 font-semibold text-right">Kepada Yth.</div>
                  
                  <div className="col-span-2 font-semibold">Sifat</div>
                  <div className="col-span-4">: Penting / Dinas</div>
                  <div className="col-span-5 col-start-8 font-bold text-slate-800 leading-snug">{recommendationTo}</div>

                  <div className="col-span-2 font-semibold">Lampiran</div>
                  <div className="col-span-4">: - (Satu Berkas)</div>
                  <div className="col-span-5 col-start-8">di -</div>

                  <div className="col-span-2 font-semibold">Perihal</div>
                  <div className="col-span-4 font-bold text-slate-800 leading-tight">: Rekomendasi Legalitas LKS</div>
                  <div className="col-span-5 col-start-9 underline font-bold uppercase text-slate-800">Tempat</div>
                </div>

                {/* Surat Pembuka */}
                <div className="space-y-4 text-xs text-justify">
                  <p>
                    Menunjuk permohonan rekomendasi legalitas dari Lembaga Kesejahteraan Sosial (LKS) <strong>{targetLks.name}</strong>, tertanggal {targetLks.establishedDate}, Kepala Dinas Sosial, Pemberdayaan Perempuan dan Perlindungan Anak Kabupaten Blora selaku pembina kelembagaan sosial dengan ini memberikan rekomendasi persetujuan keaktifan legal dan administratif kepada:
                  </p>

                  <div className="pl-6 space-y-1.5 font-bold text-slate-800 my-4 bg-slate-50 p-4 border border-slate-200 rounded-lg">
                    <div className="grid grid-cols-4"><span className="text-slate-500 font-medium">Nama LKS</span><span className="col-span-3">: {targetLks.name}</span></div>
                    <div className="grid grid-cols-4"><span className="text-slate-500 font-medium font-semibold">Nama Ketua</span><span className="col-span-3 font-semibold">: {targetLks.chairman}</span></div>
                    <div className="grid grid-cols-4"><span className="text-slate-500 font-medium">SK Kemenkumham</span><span className="col-span-3 font-mono">: {targetLks.kemenkumhamNo || "-"}</span></div>
                    {targetLks.kemenkumhamName && (
                      <div className="grid grid-cols-4"><span className="text-slate-500 font-medium">Nama Sesuai SK</span><span className="col-span-3 font-sans">{targetLks.kemenkumhamName}</span></div>
                    )}
                    <div className="grid grid-cols-4"><span className="text-slate-500 font-medium">No. STD</span><span className="col-span-3 font-mono">: {targetLks.stdNo || "-"}</span></div>
                    <div className="grid grid-cols-4"><span className="text-slate-500 font-medium">Kecamatan</span><span className="col-span-3">: {targetLks.district}</span></div>
                    <div className="grid grid-cols-4"><span className="text-slate-500 font-medium">Desa / Kelurahan</span><span className="col-span-3">: {targetLks.village}</span></div>
                    <div className="grid grid-cols-4"><span className="text-slate-500 font-medium">Alamat Lengkap</span><span className="col-span-3 font-medium font-sans text-[11px]">{targetLks.address}</span></div>
                  </div>

                  <p>
                    Berdasarkan verifikasi lapangan dan sinkronisasi portofolio pendaftaran berkas administrasi pada Sistem Informasi Lembaga Kesejahteraan Sosial (SiLKS) Blora, lembaga tersebut di atas dinyatakan <strong>AKTIF</strong> dan berdedikasi tinggi dengan fokus kegiatan:
                  </p>
                  <p className="italic text-slate-600 bg-slate-50 px-4 py-2 border-l-4 border-slate-300">
                    "{targetLks.activityDescription || "Fokus pada pelayanan kesejahteraan sosial komprehensif bagi anak panti asuhan, disabilitas, dan lanjut usia di wilayah Kabupaten Blora."}"
                  </p>
                  <p>
                    Rekomendasi ini diberikan sebagai bahan legalitas pendukung kelengkapan akreditasi lembaga, sinkronisasi bantuan program kerja dinas/ kementerian, pembaruan data di Google Drive dinas, serta perluasan kemitraan kesejahteraan sosial yang kredibel di wilayah Kabupaten Blora.
                  </p>
                  <p>
                    Demikian surat rekomendasi ini dibuat dengan penuh tanggung jawab, untuk dapat dipergunakan sebagaimana mestinya dan berlaku selama Surat Tanda Daftar (STD) LKS masih aktif sampai dengan tanggal <strong className="font-mono">{targetLks.stdExpiryDate || "-"}</strong>.
                  </p>
                </div>

                {/* Sign Board */}
                <div className="mt-14 flex justify-end text-xs">
                  <div className="w-1/2 text-right">
                    <p className="font-bold">Kepala Dinas Sosial PPPA Kab. Blora</p>
                    <div className="h-20"></div>
                    <p className="font-bold underline text-slate-900">{settings.headOfDinsos}</p>
                    <p className="font-mono text-[10px] text-slate-500 font-semibold">NIP. {settings.nipOfDinsos}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Beneficiaries List */}
            {type === "beneficiary-list" && targetLks && (
              <div className="text-sm leading-relaxed" id="printable-area">
                {/* Official Header */}
                <div className="flex items-center justify-center gap-4 border-b-4 border-double border-slate-800 pb-4 mb-6 text-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src={settings.appLogo} alt="Logo" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 leading-tight">Pemerintah Kabupaten Blora</h2>
                    <h1 className="text-lg font-extrabold uppercase tracking-widest text-slate-900 leading-snug">Dinas Sosial, Pemberdayaan Perempuan<br />dan Perlindungan Anak (Dinsos PPPA)</h1>
                    <p className="text-[10px] text-slate-500 font-mono italic mt-0.5">Jl. Pemuda No.14 Blora, Jawa Tengah | Kode Pos: 58211</p>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-md font-bold uppercase tracking-wide text-slate-900 underline">Lampiran Penerima Manfaat (PM)</h3>
                  <p className="text-xs text-slate-500 mt-1 font-semibold uppercase">Lembaga: {targetLks.name} | Kecamatan: {targetLks.district}</p>
                </div>

                {/* Table list */}
                <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="p-2 font-bold border-r border-slate-200">No.</th>
                      <th className="p-2 font-bold border-r border-slate-200">Nama Lengkap</th>
                      <th className="p-2 font-bold border-r border-slate-200">NIK (Nomor Induk)</th>
                      <th className="p-2 font-bold border-r border-slate-200">Jenis Kelamin</th>
                      <th className="p-2 font-bold border-r border-slate-200">Usia (Th)</th>
                      <th className="p-2 font-bold border-r border-slate-200">Domisili Kecamatan</th>
                      <th className="p-2 font-bold border-r border-slate-200">Kategori Wilayah</th>
                      <th className="p-2 font-bold">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaries.length > 0 ? (
                      beneficiaries.map((pm, idx) => (
                        <tr key={pm.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="p-2 font-mono border-r border-slate-200">{idx + 1}</td>
                          <td className="p-2 font-bold text-slate-800 border-r border-slate-200">{pm.name}</td>
                          <td className="p-2 font-mono border-r border-slate-200">{pm.nik}</td>
                          <td className="p-2 border-r border-slate-200 text-center">{pm.gender === "L" ? "Laki-laki" : "Perempuan"}</td>
                          <td className="p-2 font-mono text-center border-r border-slate-200">{calculateAge(pm.birthDate)}</td>
                          <td className="p-2 border-r border-slate-200">{pm.district} ({pm.village})</td>
                          <td className="p-2 border-r border-slate-200 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${pm.category === "Dalam" ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"}`}>
                              {pm.category === "Dalam" ? "PM DALAM" : "PM LUAR"}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 truncate max-w-[150px]">{pm.notes || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-4 text-center italic text-slate-400">
                          Tidak ada penerima manfaat terdaftar untuk LKS ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Sign Boxes */}
                <div className="mt-14 flex justify-between items-start text-xs border-t border-dashed border-slate-200 pt-8">
                  <div className="w-1/2">
                    <p className="font-bold">Ketua LKS {targetLks.name}</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{targetLks.chairman}</p>
                  </div>
                  <div className="w-1/2 text-right">
                    <p>Blora, {getTodayDateFormatted()}</p>
                    <p className="font-bold">Kepala Dinas Sosial PPPA Kab. Blora</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{settings.headOfDinsos}</p>
                    <p className="font-mono text-[10px] text-slate-500">NIP. {settings.nipOfDinsos}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
export default PrintPreview;
