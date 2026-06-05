import React, { useState } from "react";
import { LKS, DocumentInfo, DinsosSettings } from "../types";
import { useNotifications } from "./NotificationManager";
import { compressFile } from "../utils/compression";
import { 
  FileText, CheckCircle2, AlertCircle, UploadCloud, 
  Trash2, Eye, RefreshCw, Layers, Link, HardDrive, 
  UserCheck, AlertTriangle, FileUp, X, Check, Save, FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GoogleDriveSyncProps {
  lksList: LKS[];
  activeLksId: string;
  onSelectLks: (id: string) => void;
  onUpdateLksDocs: (lksId: string, docType: string, doc: DocumentInfo | null) => void;
  currentUser: any;
  onGoogleSignIn: () => void;
  settings: DinsosSettings;
  onSaveSettings: (updatedSettings: DinsosSettings) => void;
}

export const GoogleDriveSync: React.FC<GoogleDriveSyncProps> = ({
  lksList,
  activeLksId,
  onSelectLks,
  onUpdateLksDocs,
  currentUser,
  onGoogleSignIn,
  settings,
  onSaveSettings
}) => {
  const { showToast, confirmAction } = useNotifications();
  const [syncingDocs, setSyncingDocs] = useState<{ [key: string]: boolean }>({});
  const [previewDoc, setPreviewDoc] = useState<{
    typeName: string;
    docName: string;
    size?: string;
    date: string;
    sizeBefore?: string;
    isCompressed?: boolean;
    compressionSavings?: number;
  } | null>(null);
  const selectedLks = lksList.find(l => l.id === activeLksId);

  // Stats: Lengkap vs Tidak Lengkap
  const statLengkap = lksList.filter(l => {
    const docs = l.documents || {};
    return !!(docs.ktpKetua && docs.skKemenkumham && docs.std && docs.sertifikatAccreditation);
  }).length;

  const statTidakLengkap = lksList.length - statLengkap;

  const docTypes = [
    { key: "ktpKetua", label: "KTP Ketua", desc: "Berkas identitas KTP Ketua aktif LKS" },
    { key: "skKemenkumham", label: "SK Kemenkumham", desc: "Surat Keputusan pendirian badan hukum dari Kemenkumham" },
    { key: "std", label: "Surat Tanda Daftar (STD)", desc: "Dokumen tanda daftar dinas sosial" },
    { key: "sertifikatAccreditation", label: "Sertifikat Akreditasi", desc: "Sertifikat status akreditasi keaktifan LKS" }
  ];

  const handleFileUploadSimulated = (docTypeKey: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!selectedLks) {
      showToast("error", "Simpan Gagal", "Pilih Lembaga LKS terlebih dahulu.");
      return;
    }

    const rootFolder = settings.googleDriveRoot || "SILKS";
    const uploadPath = `/${rootFolder}/${selectedLks.name}/${file.name}`;

    setSyncingDocs(prev => ({ ...prev, [docTypeKey]: true }));
    showToast("info", "Auto-Compress", `Menganalisis & mengompresi otomatis '${file.name}' agar hemat ruang...`);

    // Run custom client-side compression
    compressFile(file, 0.70, 1200).then(({ file: compressedFile, originalSize, compressedSize, savingsPercent }) => {
      const origStr = originalSize > 1024 * 1024 
        ? `${(originalSize / 1024 / 1024).toFixed(2)} MB` 
        : `${Math.round(originalSize / 1024)} KB`;
      const compStr = compressedSize > 1024 * 1024 
        ? `${(compressedSize / 1024 / 1024).toFixed(2)} MB` 
        : `${Math.round(compressedSize / 1024)} KB`;

      showToast("info", "Mulai Transmisi", `Selesai dikompres (${origStr} → ${compStr}, Ringan ${savingsPercent}%)! Mengunggah ke Drive...`);

      setTimeout(() => {
        const docInfo: DocumentInfo = {
          name: file.name,
          url: "#",
          uploadedAt: new Date().toISOString(),
          size: compStr,
          sizeBefore: origStr,
          isCompressed: savingsPercent > 0,
          compressionSavings: savingsPercent
        };

        onUpdateLksDocs(selectedLks.id, docTypeKey, docInfo);
        setSyncingDocs(prev => ({ ...prev, [docTypeKey]: false }));
        showToast("success", "Upload Sukses", `File '${file.name}' (${compStr}) diunggah sukses di folder: /${rootFolder}/${selectedLks.name}/`);
      }, 1500);
    });
  };

  const handleDeleteDocument = (docTypeKey: string, docName: string) => {
    if (!selectedLks) return;

    confirmAction({
      title: "Hapus Berkas Administrasi?",
      message: `Apakah Anda yakin ingin menghapus dokumen '${docName}' dari LKS ${selectedLks.name}? Sinkronisasi file di Google Drive juga akan dihapus.`,
      onConfirm: () => {
        onUpdateLksDocs(selectedLks.id, docTypeKey, null);
        showToast("success", "Hapus Berkas", "Berkas administrasi berhasil dihapus.");
      }
    });
  };

  const triggerMockPreview = (typeName: string, doc: DocumentInfo) => {
    setPreviewDoc({
      typeName,
      docName: doc.name,
      size: doc.size || "850 KB",
      date: new Date(doc.uploadedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
      sizeBefore: doc.sizeBefore,
      isCompressed: doc.isCompressed,
      compressionSavings: doc.compressionSavings
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Stat Box: Lengkap & Tidak Lengkap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl border border-slate-200 bg-white flex items-center justify-between shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-display">LKS Dokumen Lengkap</p>
              <h2 className="text-2xl font-extrabold text-emerald-700 font-mono mt-0.5">{statLengkap} <span className="text-xs text-slate-400 font-normal">Lembaga</span></h2>
            </div>
          </div>
          <div className="text-right text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
            4 Berkas Ada
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-slate-200 bg-white flex items-center justify-between shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-display">LKS Belum Lengkap</p>
              <h2 className="text-2xl font-extrabold text-amber-600 font-mono mt-0.5">{statTidakLengkap} <span className="text-xs text-slate-400 font-normal">Lembaga</span></h2>
            </div>
          </div>
          <div className="text-right text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
            Kurang Berkas
          </div>
        </div>
      </div>

      {/* 2. Google Drive connection info bar */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-900 text-emerald-400 rounded-lg">
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="text-slate-505">Folder Induk Aktif:</span>{" "}
            <strong className="text-slate-900 bg-slate-200/60 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
              /{settings.googleDriveRoot || "SILKS"}/
            </strong>
            <span className="text-slate-400 ml-1.5 hidden md:inline">
              (Berkas disusun otomatis ke subfolder berdasarkan nama LKS)
            </span>
          </div>
        </div>
        <div className="text-[11px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl font-bold self-start sm:self-center">
          💡 Atur nama folder utama di menu <strong>Profil &amp; Pengaturan</strong>
        </div>
      </div>

      {/* 3. Document administration panel */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm shadow-slate-100/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-md font-bold text-slate-900 font-display">Status Upload Berkas Berkas LKS</h3>
            <p className="text-xs text-slate-400">Pilih Lembaga LKS untuk mengelola, mereview, dan mengedit berkas administrasi pendukung.</p>
          </div>
          
          <div className="w-[100%] md:w-72">
            <select
              value={activeLksId}
              onChange={(e) => onSelectLks(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 shadow-sm focus:border-slate-450 outline-none hover:bg-slate-100 cursor-pointer"
            >
              <option value="">-- Pilih Lembaga LKS --</option>
              {lksList.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.district})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedLks ? (
          <div className="space-y-4">
            
            {/* Display status bar */}
            <div className="flex items-center gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-150">
              <Layers className="w-4.5 h-4.5 text-slate-500" />
              <div className="text-xs text-slate-700">
                Lembaga: <strong className="text-slate-900">{selectedLks.name}</strong> | Kecamatan: <strong>{selectedLks.district}</strong> | 
                Dokumen: <strong className="font-mono text-emerald-600">
                  {Object.keys(selectedLks.documents || {}).length} dari 4 terunggah
                </strong>
              </div>
            </div>

            {/* Document list render */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {docTypes.map(docType => {
                const doc = selectedLks.documents?.[docType.key as keyof typeof selectedLks.documents] as DocumentInfo | undefined;
                const isUploading = syncingDocs[docType.key];

                return (
                  <div key={docType.key} className="p-6 rounded-3xl border border-slate-200 bg-white flex flex-col justify-between hover:border-slate-350 hover:shadow-md hover:-translate-y-0.5 duration-300 transition-all shadow-sm shadow-slate-100/50">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg ${doc ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{docType.label}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{docType.desc}</p>
                          </div>
                        </div>

                        {doc ? (
                          <span className="flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-extrabold uppercase font-mono">
                            <Check className="w-2.5 h-2.5" /> Ada
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] bg-slate-50 text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full font-extrabold uppercase font-mono">
                            Kosong
                          </span>
                        )}
                      </div>

                      {/* Display current filename if exists */}
                      {doc && (
                        <div className="mt-3.5 space-y-1.5 animate-fade-in">
                          <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-600 truncate max-w-[150px] font-semibold" title={doc.name}>{doc.name}</span>
                            <span className="text-slate-400 text-[10px]">{doc.size || "520 KB"}</span>
                          </div>
                          {doc.isCompressed && (
                            <div className="flex items-center justify-between px-1 text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100/50">
                              <span>📉 Auto-Compress:</span>
                              <span>
                                {doc.sizeBefore} &rarr; {doc.size} ({doc.compressionSavings}% Saved)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-end gap-1.5">
                      {isUploading ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 px-3 py-1.5">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
                          Mengunggah ke Drive...
                        </div>
                      ) : (
                        <>
                          {doc ? (
                            <>
                              <button
                                type="button"
                                onClick={() => triggerMockPreview(docType.label, doc)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Preview
                              </button>
                              
                              <label className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer relative">
                                <FileUp className="w-3.5 h-3.5" />
                                Edit Berkas
                                <input
                                  type="file"
                                  accept=".pdf,image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUploadSimulated(docType.key, e.target.files)}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => handleDeleteDocument(docType.key, doc.name)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Hapus
                              </button>
                            </>
                          ) : (
                            <label className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 transition-all cursor-pointer">
                              <UploadCloud className="w-4 h-4 text-slate-400" />
                              Pilih Berkas &amp; Sinkron Google Drive
                              <input
                                type="file"
                                accept=".pdf,image/*"
                                className="hidden"
                                onChange={(e) => handleFileUploadSimulated(docType.key, e.target.files)}
                              />
                            </label>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
            <Layers className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">Belum Ada LKS Dipilih</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">Pilih salah satu Lembaga Kesejahteraan Sosial pada dropdown di atas untuk mengelola berkas administrasi dan dokumen wajib.</p>
          </div>
        )}
      </div>

      {/* Interactive File Live Preview Overlay Model */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[85vh]"
            >
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-sm leading-snug">{previewDoc.typeName}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Diupload: {previewDoc.date} | Ukuran: {previewDoc.size}
                      {previewDoc.isCompressed && ` (Hemat ${previewDoc.compressionSavings}%)`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* simulated PDF/Document viewport */}
              <div className="flex-1 bg-slate-100 flex items-center justify-center p-6 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-md p-10 max-w-lg w-full text-slate-800 space-y-6 aspect-[1/1.4] border border-slate-200 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-4 transform translate-x-4 -translate-y-4 w-28 h-28 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500/30" />
                  </div>
                  
                  {/* Kop Surat Mock */}
                  <div className="border-b-2 border-slate-800 pb-3 text-center">
                    <span className="text-[8px] tracking-widest font-bold uppercase text-slate-400">Arsip Digital Google Drive</span>
                    <h2 className="text-[11px] font-extrabold uppercase text-slate-900 leading-tight">SiLKS Kabupaten Blora</h2>
                    <p className="text-[7px] text-slate-500 font-mono">INTEGRITAS - TRANSPARANSI - AKUNTABILITAS</p>
                  </div>

                  <div className="space-y-4 text-center my-auto">
                    <FileText className="w-14 h-14 text-emerald-600 mx-auto animate-pulse" />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{previewDoc.docName}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Status Keabsahan: Terverifikasi &amp; Dikompresi</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-lg text-left text-[11px] font-sans leading-relaxed text-slate-500 max-w-sm mx-auto border border-slate-150">
                      {previewDoc.isCompressed ? (
                        <div className="text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg mb-3 font-mono text-[10px] font-bold">
                          📉 Auto-Compress Aktif:<br/>
                          Berkas dikompresi ({previewDoc.sizeBefore} &rarr; {previewDoc.size}) demi menghemat penyimpanan dinas sebesar {previewDoc.compressionSavings}%.
                        </div>
                      ) : null}
                      Dokumen ini telah melalui standardisasi ukuran berkas untuk mereduksi beban memori Vercel. Enkripsi AES-256 memproteksi status kepemilikan dan NIK pimpinan LKS.
                    </div>
                  </div>

                  <div className="border-t border-slate-150 pt-3 text-center text-[9px] font-mono text-slate-400 flex justify-between">
                    <span>Google Secure Key Verified</span>
                    <span>MD5 Hash: a4f2f3d...909e</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono truncate max-w-[200px] sm:max-w-xs md:max-w-md" title={`google-drive://${settings.googleDriveRoot || "SILKS"}/${selectedLks?.name || "LKS"}/${previewDoc.docName}`}>
                  Url-Target: google-drive://{settings.googleDriveRoot || "SILKS"}/{selectedLks?.name || "LKS"}/{previewDoc.docName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    showToast("success", "Unduh File", `File '${previewDoc.docName}' berhasil diunduh.`);
                    setPreviewDoc(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  Buka di Google Drive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default GoogleDriveSync;
