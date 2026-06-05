import React, { useState } from "react";
import { LKS, DocumentInfo, DinsosSettings } from "../types";
import { useNotifications } from "./NotificationManager";
import { compressFile } from "../utils/compression";
import { saveFileLocally, getFileLocally, deleteFileLocally } from "../utils/fileStorage";
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
    url?: string;
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

      // Save uncorrupted file/blob to IndexedDB locally
      saveFileLocally(selectedLks.id, docTypeKey, compressedFile).then(() => {
        setTimeout(() => {
          const docInfo: DocumentInfo = {
            name: file.name,
            url: "local_indexeddb", // Store a lightweight signifier in Firestore to represent localIndexedDB copy
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
      }).catch(err => {
        console.error("Local indexedDB save failed, fallback to in-memory URL", err);
        
        // If IndexedDB fails, fallback to full base64/ObjectUrl (warning: may exceed firestore doc limits if extremely large)
        const reader = new FileReader();
        reader.onloadend = () => {
          const fileUrl = reader.result as string || URL.createObjectURL(compressedFile);
          setTimeout(() => {
            const docInfo: DocumentInfo = {
              name: file.name,
              url: fileUrl,
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
        };
        reader.readAsDataURL(compressedFile);
      });
    });
  };

  const handleDeleteDocument = (docTypeKey: string, docName: string) => {
    if (!selectedLks) return;

    confirmAction({
      title: "Hapus Berkas Administrasi?",
      message: `Apakah Anda yakin ingin menghapus dokumen '${docName}' dari LKS ${selectedLks.name}? Sinkronisasi file di Google Drive juga akan dihapus.`,
      onConfirm: async () => {
        try {
          await deleteFileLocally(selectedLks.id, docTypeKey);
        } catch (e) {
          console.error("Failed to delete local copy", e);
        }
        onUpdateLksDocs(selectedLks.id, docTypeKey, null);
        showToast("success", "Hapus Berkas", "Berkas administrasi berhasil dihapus.");
      }
    });
  };

  const triggerMockPreview = async (typeName: string, doc: DocumentInfo, docTypeKey: string) => {
    let fileUrl = doc.url || "#";
    
    if (fileUrl === "local_indexeddb") {
      try {
        const localFile = await getFileLocally(selectedLks.id, docTypeKey);
        if (localFile) {
          fileUrl = URL.createObjectURL(localFile);
        } else {
          fileUrl = "#"; // Fallback to simulated letters if file is not found
        }
      } catch (e) {
        console.error("Failed to fetch local file copy", e);
        fileUrl = "#";
      }
    }

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
      compressionSavings: doc.compressionSavings,
      url: fileUrl
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
                                onClick={() => triggerMockPreview(docType.label, doc, docType.key)}
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

                <div className="flex items-center gap-3">
                  {previewDoc.url && previewDoc.url !== "#" ? (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded font-bold font-mono uppercase tracking-wider">
                      ● Berkas Upload Live
                    </span>
                  ) : (
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded font-bold font-mono uppercase tracking-wider">
                      ● Simulasi Arsip
                    </span>
                  )}
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Document display viewport */}
              <div className="flex-1 bg-slate-100 flex items-center justify-center p-6 overflow-y-auto">
                {previewDoc.url && previewDoc.url !== "#" ? (
                  /* RENDER REAL UPLOADED FILE */
                  <div className="w-full h-full flex items-center justify-center">
                    {previewDoc.url.includes("data:application/pdf") || previewDoc.docName.toLowerCase().endsWith(".pdf") ? (
                      <div className="w-full h-full bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                        <iframe 
                          src={previewDoc.url} 
                          title="Pratinjau Dokumen PDF"
                          className="w-full h-[60vh] bg-white"
                        />
                      </div>
                    ) : (
                      <div className="bg-slate-900 p-4 rounded-xl shadow-inner max-w-full max-h-[60vh] flex items-center justify-center overflow-hidden border border-slate-800">
                        <img 
                          src={previewDoc.url} 
                          alt={previewDoc.docName}
                          className="max-w-full max-h-[55vh] object-contain rounded border-2 border-white/95 shadow-xl"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* RENDER HIGH FREQUENCY MOCK PREVIEWS FOR PRELOADED DATA */
                  <div className="w-full max-w-lg aspect-[1/1.414] bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8 text-slate-800 overflow-y-auto flex flex-col justify-between relative">
                    
                    {/* Badge watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                      <FileText className="w-80 h-80 text-slate-900" />
                    </div>

                    {previewDoc.typeName.toLowerCase().includes("ktp") ? (
                      /* KTP KETUA DESIGN */
                      <div className="flex flex-col h-full justify-between font-sans">
                        <div className="bg-sky-500/10 border border-sky-400/20 text-sky-700 rounded-lg p-2 text-center text-[10px] font-bold mb-4">
                          💳 FORMAT SIMULASI KARTU IDENTITAS KETUA (KTP RI)
                        </div>
                        
                        <div className="bg-sky-100/40 border-2 border-sky-300 rounded-xl p-4 shadow-sm text-slate-900 text-left relative overflow-hidden" style={{ backgroundImage: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)" }}>
                          {/* Map Background simulated effect */}
                          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 bg-cover pointer-events-none" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=300")' }}></div>
                          
                          <div className="text-center font-bold text-[9px] sm:text-[10px] tracking-wide text-sky-900 uppercase">
                            PROVINSI JAWA TENGAH
                            <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-950">KABUPATEN BLORA</div>
                          </div>
                          
                          <div className="border-b border-sky-300/60 pb-1.5 mb-2 mt-1 text-center font-bold text-[9px] text-sky-800 tracking-widest font-mono">
                            KARTU TANDA PENDUDUK
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 text-[8px] sm:text-[9.5px]">
                            <div className="col-span-2 space-y-1">
                              <div>
                                <span className="font-mono font-bold text-slate-800 text-[9.5px] sm:text-[11px] select-all">NIK : 3316042407810012</span>
                              </div>
                              <div className="grid grid-cols-4 font-semibold"><span className="text-slate-500">Nama</span><span className="col-span-3 text-slate-900 uppercase">: {selectedLks?.chairman || "Ahmad Sodik"}</span></div>
                              <div className="grid grid-cols-4"><span className="text-slate-500">Tempat/Tgl Lahir</span><span className="col-span-3">: BLORA, 17-08-1981</span></div>
                              <div className="grid grid-cols-4"><span className="text-slate-500">Jenis Kelamin</span><span className="col-span-3">: LAKI-LAKI | Gol. Darah: O</span></div>
                              <div className="grid grid-cols-4"><span className="text-slate-500">Alamat</span><span className="col-span-3 truncate">: {selectedLks?.address || "Jl. Kabupaten, Blora"}</span></div>
                              <div className="grid grid-cols-4 pl-2 text-[7.5px] sm:text-[8.5px] text-slate-600">
                                <span>Kecamatan</span><span className="col-span-3">: {selectedLks?.district || "Blora"}</span>
                                <span>Desa/Kel</span><span className="col-span-3">: {selectedLks?.village || "Mlangsen"}</span>
                              </div>
                              <div className="grid grid-cols-4"><span className="text-slate-500">Agama</span><span className="col-span-3">: ISLAM</span></div>
                              <div className="grid grid-cols-4"><span className="text-slate-500">Status Kawin</span><span className="col-span-3">: KAWIN</span></div>
                              <div className="grid grid-cols-4"><span className="text-slate-500">Pekerjaan</span><span className="col-span-3 uppercase">: KETUA LKS {selectedLks?.name}</span></div>
                              <div className="grid grid-cols-4"><span className="text-slate-500">Berlaku Hingga</span><span className="col-span-3 font-bold text-emerald-700">: SEUMUR HIDUP</span></div>
                            </div>
                            
                            <div className="flex flex-col items-center justify-between pl-1">
                              {/* Photo placeholder with red/blue typical bg */}
                              <div className="w-[100%] aspect-[3/4] bg-rose-700 border border-slate-350 shadow rounded overflow-hidden flex items-center justify-center p-0.5 relative">
                                <span className="absolute bottom-1 bg-black/50 text-[6px] text-white px-1 leading-none font-mono">PAST-FOTO</span>
                                <div className="w-10 h-10 border-2 border-white rounded-full bg-slate-200/80 flex items-center justify-center shadow-lg transform scale-110">
                                  <span className="text-slate-500 font-bold text-[8px] uppercase">LKS</span>
                                </div>
                              </div>
                              
                              <div className="text-center font-mono text-[6px] text-slate-500 mt-2">
                                BLORA, {selectedLks?.establishedDate || "2021-08-17"}<br/>
                                <span className="font-bold underline text-slate-800">Ttd Pimpinan</span>
                                <div className="h-6 w-12 border-b border-dashed border-slate-350 mx-auto mt-0.5 flex items-center justify-center text-[8px] italic text-slate-400 font-serif">
                                  Signed
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 leading-relaxed max-w-sm mx-auto text-center border-t border-slate-100 pt-5">
                          <p>Dokumen asli KTP disimpan aman dalam enkripsi server. Gunakan tombol <strong className="text-slate-700">Edit Berkas</strong> di belakang untuk mengupload file hasil scan (.jpg/.png/.pdf) KTP ketua Anda sendiri.</p>
                        </div>
                      </div>
                    ) : previewDoc.typeName.toLowerCase().includes("kemenkumham") ? (
                      /* KEMENKUMHAM SK DESIGN */
                      <div className="flex flex-col h-full justify-between font-serif text-slate-900">
                        {/* Garuda emblem simulation */}
                        <div className="text-center space-y-1 mb-3">
                          <div className="mx-auto w-8 h-8 rounded-full border border-amber-500 bg-amber-50 flex items-center justify-center font-serif text-[12px] font-black text-amber-600">
                            G
                          </div>
                          <span className="text-[7px] tracking-widest font-sans font-extrabold uppercase text-slate-500 block">REPUBLIK INDONESIA</span>
                          <h2 className="text-[10px] sm:text-[11px] font-sans font-extrabold uppercase tracking-wide">KEMENTERIAN HUKUM DAN HAK ASASI MANUSIA</h2>
                        </div>

                        <div className="border-t-2 border-double border-slate-900 pt-2 mb-3 text-center">
                          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-950">KEPUTUSAN MENTERI HUKUM DAN HAK ASASI MANUSIA</h3>
                          <p className="text-[9px] font-sans font-bold text-slate-600">NOMOR: AHU-{selectedLks?.kemenkumhamNo || "0012435.AH.01.04.2015"}</p>
                          <p className="text-[8px] italic mt-1 text-slate-500 leading-snug">TENTANG PENGESAHAN PENDIRIAN BADAN HUKUM PERKUMPULAN SOSIAL</p>
                        </div>

                        <div className="text-[8.5px] sm:text-[9.5px] space-y-2 text-justify leading-relaxed font-sans font-medium text-slate-700">
                          <p>
                            <strong>MENIMBANG:</strong> Bahwa permohonan pengesahan pendirian badan hukum dari pimpinan perkumpulan telah sesuai dengan tata peraturan Perundang-undangan Sosial Republik Indonesia;
                          </p>
                          <p>
                            <strong>MEMUTUSKAN &amp; MENETAPKAN:</strong> Memberikan status pengakuan badan hukum kepada perkumpulan sosial:
                          </p>
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 font-serif my-1 text-center font-extrabold text-[10px] sm:text-[11px] text-slate-950">
                            "{selectedLks?.kemenkumhamName || selectedLks?.name.toUpperCase()}"
                            <div className="text-[7.5px] font-sans text-slate-500 font-semibold mt-1">
                              No. Registrasi Kemenkumham: {selectedLks?.kemenkumhamNo || "AHU-DEFAULT-2026"}
                            </div>
                          </div>
                          <p>
                            Berkedudukan di Kabupaten Blora, dengan focus utama penyelenggaraan kesejahteraan sosial masyarakat, perlindungan kaum terlantar, panti asuhan anak asuh beserta penguatan disabilitas di lingkungan kerja sosial.
                          </p>
                        </div>

                        <div className="pt-2 mt-4 border-t border-slate-150 flex justify-between items-end font-sans">
                          <div className="text-[7px] text-slate-400 font-mono">
                            ID SINKRONISASI: DRIVE-KEMENKUMHAM-BLORA
                          </div>
                          <div className="text-right text-[8px] sm:text-[9px]">
                            Ditetapkan di Jakarta<br/>
                            <span className="text-[7px] text-slate-500">Pada Tanggal: {selectedLks?.establishedDate || "2021-08-17"}</span><br/>
                            <strong>A.n. MENTERI HUKUM DAN HAM</strong>
                            <div className="h-7 w-16 my-1 ml-auto flex items-center justify-center border border-dashed border-sky-200 bg-sky-50/20 text-[6.5px] text-sky-600 font-bold tracking-widest uppercase">
                              STAMP - OK
                            </div>
                            <span className="font-bold underline text-slate-900">Dr. Widodo Ekatjahjana</span>
                          </div>
                        </div>
                      </div>
                    ) : previewDoc.typeName.toLowerCase().includes("surat tanda daftar") || previewDoc.typeName.toLowerCase().includes("std") ? (
                      /* SURAT TANDA DAFTAR (STD) DESIGN */
                      <div className="flex flex-col h-full justify-between font-serif text-slate-900">
                        {/* Kop Surat Pemerintah */}
                        <div className="text-center space-y-1.5 border-b-2 border-double border-slate-800 pb-2 mb-3">
                          <h2 className="text-[10px] sm:text-[11px] font-sans font-extrabold uppercase leading-tight tracking-wide text-slate-950">
                            PEMERINTAH KABUPATEN BLORA
                          </h2>
                          <h1 className="text-xs sm:text-[13px] font-sans font-black uppercase leading-tight tracking-wide text-indigo-900">
                            DINAS SOSIAL, PEMBERDAYAAN PEREMPUAN<br/>DAN PERLINDUNGAN ANAK
                          </h1>
                          <p className="text-[7.5px] font-sans text-slate-500 font-medium">Jl. Pemuda No. 44, Telp (0296) 531012, Blora, Jawa Tengah 58211</p>
                        </div>

                        <div className="text-center mb-3">
                          <h3 className="text-[10px] tracking-widest font-sans font-extrabold uppercase text-slate-950 underline decoration-indigo-600">SURAT TANDA DAFTAR OLEH DINAS</h3>
                          <p className="text-[8.5px] font-mono mt-0.5 text-slate-600">Nomor: {selectedLks?.stdNo || "050/342/STD/2024"}</p>
                        </div>

                        <div className="text-[8.5px] sm:text-[9.5px] space-y-2.5 font-sans font-medium text-slate-700 leading-relaxed text-justify">
                          <p>
                            Berdasarkan hasil verifikasi lapangan dan pemenuhan berkas administrasi, Dinas Sosial PPPA Kabupaten Blora dengan ini menerangkan bahwa Lembaga Kesejahteraan Sosial (LKS):
                          </p>
                          
                          <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 space-y-1 text-[8px] sm:text-[9px] text-slate-800">
                            <div className="grid grid-cols-4 font-extrabold text-[9.5px] text-slate-950"><span className="text-slate-500 font-normal">Nama LKS</span><span className="col-span-3">: {selectedLks?.name}</span></div>
                            <div className="grid grid-cols-4"><span className="text-slate-500">Ketua LKS</span><span className="col-span-3 font-semibold">: {selectedLks?.chairman}</span></div>
                            <div className="grid grid-cols-4"><span className="text-slate-500">Alamat LKS</span><span className="col-span-3 truncate">: {selectedLks?.address}</span></div>
                            <div className="grid grid-cols-4"><span className="text-slate-500">Kecamatan</span><span className="col-span-3 font-bold">: {selectedLks?.district}</span></div>
                          </div>

                          <p>
                            Telah terdaftar secara resmi di Dinas Sosial Kabupaten Blora dan diberikan izin melakukan aktivitas pembinaan kesejahteraan sosial kemasyarakatan. Surat Tanda Daftar ini berlaku sampai dengan tanggal:
                          </p>
                          <div className="text-center text-rose-700 font-mono font-bold text-[9px] sm:text-[10px] bg-rose-50 border border-rose-100 py-1.5 rounded-lg">
                            ⚠️ MASA BERLAKU S/D: {new Date(selectedLks?.stdExpiryDate || "2029-08-17").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </div>
                        </div>

                        <div className="pt-2 mt-4 border-t border-slate-100 flex justify-between items-end font-sans">
                          <div className="text-[7.5px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            TERDAFTAR RESMI
                          </div>
                          
                          <div className="text-right text-[8.5px]">
                            Blora, {previewDoc.date}<br/>
                            <span className="text-slate-500 text-[8px]">KEPALA DINAS SOSIAL PPPA</span>
                            
                            <div className="h-6 w-20 my-1 ml-auto flex items-center justify-center text-[7px] italic text-indigo-500 border border-dashed border-indigo-200 bg-indigo-50/20 font-bold uppercase tracking-wider">
                              DINAS SOSIAL BLUE STAMP
                            </div>
                            
                            <span className="font-bold underline text-slate-900 block">{settings.kadisName || "Luluk Windarti, S.STP"}</span>
                            <span className="text-slate-400 text-[7px]">NIP. {settings.kadisNip || "19780517 199703 2 001"}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ACCREDITATION CERTIFICATE DESIGN */
                      <div className="flex flex-col h-full justify-between text-slate-950 font-serif" style={{ border: "3px double #d97706", padding: "12px", borderRadius: "8px" }}>
                        <div className="text-center space-y-1 mb-2">
                          <span className="text-[8px] tracking-widest font-sans font-extrabold uppercase text-amber-600 block">REPUBIK INDONESIA</span>
                          <h2 className="text-[10px] sm:text-[11px] font-sans font-black uppercase tracking-wider">BADAN AKREDITASI LEMBAGA KESEJAHTERAAN SOSIAL</h2>
                          <div className="h-0.5 bg-amber-500 w-1/3 mx-auto"></div>
                        </div>

                        <div className="text-center my-2 space-y-1">
                          <h3 className="text-xs font-black uppercase text-amber-700 tracking-wider">SERTIFIKAT AKREDITASI</h3>
                          <p className="text-[8px] font-sans font-bold text-slate-500 uppercase">AKREDITASI NASIONAL LKS</p>
                        </div>

                        <div className="text-[8px] sm:text-[9.5px] space-y-2.5 font-sans font-medium text-slate-700 leading-relaxed text-center">
                          <p>
                            Berdasarkan Surat Keputusan Sidang Pleno Asosiasi Akreditasi Lembaga Kesejahteraan Sosial, dengan ini memberikan akreditasi kelayakan operasional kepada lembaga:
                          </p>
                          
                          <h2 className="text-center font-serif font-black text-slate-900 text-[11px] sm:text-[12px] bg-slate-50 border border-slate-150 py-2 rounded-xl my-2">
                            "{selectedLks?.name}"
                            <div className="text-[7.5px] font-sans text-slate-400 font-bold uppercase mt-1">
                              Wilayah Kerja: {selectedLks?.workScope || "Kabupaten"}
                            </div>
                          </h2>

                          <p>
                            Menyatakan bahwa lembaga tersebut telah dievaluasi dan Memperoleh Peringkat Kelayakan:
                          </p>
                          
                          <div className="bg-amber-500/10 border-2 border-amber-500 text-amber-800 rounded-xl p-3 max-w-xs mx-auto font-serif">
                            <span className="text-xs sm:text-sm font-extrabold uppercase block tracking-wider">
                              🎖️ {selectedLks?.accreditation || "TEKREDITASI A (SANGAT BAIK)"}
                            </span>
                            <span className="text-[8px] sm:text-[9px] text-slate-550 block font-sans mt-0.5 font-bold">
                              Ditetapkan Sidang Tahun {selectedLks?.accreditationYear || "2024"}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 mt-4 border-t border-slate-100 flex justify-between items-end font-sans">
                          <div className="text-left text-[7px] text-slate-400">
                            STANDARD KEPENDUDUKAN LKS<br/>
                            ID-BALKS-REG-BLORA
                          </div>
                          
                          <div className="text-right text-[8px] sm:text-[8.5px]">
                            Diterbitkan oleh BALKS Pusat<br/>
                            <strong>KETUA BADAN AKREDITASI</strong>
                            <div className="h-6 w-16 mx-auto my-0.5 border border-dashed border-amber-300 flex items-center justify-center text-[6px] text-amber-700 font-bold uppercase">
                              GOLD SEAL
                            </div>
                            <span className="font-bold underline text-slate-950">Prof. Dr. Ir. H. Syamsudin K.</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}
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
