import React, { useState } from "react";
import { LKS, DinsosSettings } from "../types";
import { useNotifications } from "./NotificationManager";
import { HardDrive, UserCheck, FolderOpen, Save, Link2, ExternalLink } from "lucide-react";

interface GoogleDriveFolderConfigProps {
  lksList: LKS[];
  currentUser: any;
  onGoogleSignIn: () => void;
  settings: DinsosSettings;
  onSaveSettings: (updatedSettings: DinsosSettings) => void;
}

export const GoogleDriveFolderConfig: React.FC<GoogleDriveFolderConfigProps> = ({
  lksList,
  currentUser,
  onGoogleSignIn,
  settings,
  onSaveSettings
}) => {
  const { showToast } = useNotifications();
  const [googleDriveFolderInput, setGoogleDriveFolderInput] = useState(settings.googleDriveRoot || "SILKS");
  const [googleDriveLinkInput, setGoogleDriveLinkInput] = useState(settings.googleDriveLink || "");
  const [previewLksId, setPreviewLksId] = useState<string>(lksList[0]?.id || "");

  const extractFolderId = (url: string) => {
    if (!url) return "";
    const matches = url.match(/\/folders\/([a-zA-Z0-9_-]{20,80})/);
    if (matches && matches[1]) return matches[1];
    
    // Try ?id= query param
    try {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get("id");
      if (id) return id;
    } catch (e) {}

    // Check if it looks like just a raw ID
    if (/^[a-zA-Z0-9_-]{25,50}$/.test(url.trim())) {
      return url.trim();
    }
    
    return "";
  };

  const handleSaveFolderRoot = () => {
    let sanitizedRoot = googleDriveFolderInput.trim().replace(/[\/\\?%*:|"<>\s]/g, "_");
    if (!sanitizedRoot) {
      sanitizedRoot = "SILKS";
    }

    const trimmedLink = googleDriveLinkInput.trim();
    
    onSaveSettings({
      ...settings,
      googleDriveRoot: sanitizedRoot,
      googleDriveLink: trimmedLink || undefined
    });

    if (trimmedLink) {
      const fId = extractFolderId(trimmedLink);
      showToast(
        "success", 
        "Tautan Drive Tersimpan", 
        fId 
          ? `Alamat sinkronisasi Google Drive kustom aktif! (ID: ${fId.substring(0, 10)}...)`
          : "Alamat folder Google Drive kustom berhasil disimpan!"
      );
    } else {
      showToast("success", "Folder Tersimpan", `Lokasi sinkronisasi baru Google Drive diatur ke: /${sanitizedRoot}/`);
    }
  };

  const selectedLks = lksList.find(l => l.id === previewLksId) || lksList[0];

  return (
    <div className="space-y-6">
      {/* 1. Google Drive Connection Board */}
      <div className="p-6 rounded-3xl border border-slate-150 bg-slate-900 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${currentUser ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>
            <HardDrive className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-wide font-display">Integrasi Penyimpanan Google Drive</h3>
              {currentUser ? (
                <span className="flex items-center gap-1 text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                  Tersinkron
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                  Offline
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {currentUser 
                ? `Hubungan aktif: ${currentUser.email}`
                : "Masuk dengan Google untuk menyelaraskan folder dinas secara offline/online."}
            </p>
          </div>
        </div>

        {!currentUser ? (
          <button
            type="button"
            onClick={onGoogleSignIn}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 hover:text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
          >
            <HardDrive className="w-4 h-4 text-emerald-600" />
            Aktifkan Google Drive
          </button>
        ) : (
          <div className="text-[11px] font-mono flex flex-col gap-1 text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 w-full md:w-auto min-w-[180px]">
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Akun: {currentUser.email}</span>
            </div>
            {settings.googleDriveLink ? (
              <div className="text-[9px] text-emerald-300 truncate max-w-[200px]" title={settings.googleDriveLink}>
                🔗 Custom Folder Link Aktif
              </div>
            ) : (
              <div className="text-[9px] text-slate-400">
                📁 Folder: /{settings.googleDriveRoot || "SILKS"}/
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Folder Customizer & Structure Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: Input Customizer */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-display">Tentukan Nama Folder / Tautan Drive</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Atur folder atau hubungkan langsung folder Google Drive eksternal buatan Anda.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nama Folder Induk (Standar/Simulasi)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs font-mono">
                    /
                  </div>
                  <input
                    type="text"
                    value={googleDriveFolderInput}
                    disabled={!!googleDriveLinkInput}
                    onChange={(e) => setGoogleDriveFolderInput(e.target.value)}
                    placeholder="Contoh: SILKS_BLORA"
                    className={`w-full text-xs font-semibold rounded-xl border pl-7 pr-3 py-2.5 outline-none transition-all font-mono shadow-inner ${
                      googleDriveLinkInput 
                        ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
                        : "bg-slate-50 border-slate-200 text-slate-850 focus:border-indigo-500 hover:bg-slate-100"
                    }`}
                  />
                </div>
                <p className="text-[9.5px] text-slate-400 mt-1 font-medium leading-normal">
                  {googleDriveLinkInput ? "Dinonaktifkan karena Anda menggunakan link folder kustom di bawah." : "Nama direktori induk virtual Google Drive."}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                  Gunakan Link Folder Google Drive Anda Sendiri
                </label>
                <input
                  type="text"
                  value={googleDriveLinkInput}
                  onChange={(e) => setGoogleDriveLinkInput(e.target.value)}
                  placeholder="Tempel tautan folder Anda (https://drive.google.com/.../folders/...)"
                  className="w-full text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-850 px-3 py-2.5 outline-none focus:border-indigo-500 hover:bg-slate-100 transition-all font-mono shadow-inner"
                />
                <p className="text-[10px] text-indigo-700 mt-2 leading-relaxed bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  💡 <strong>Ingin langsung menyinkronkan berkas ke folder Google Drive milik Anda?</strong> 
                  <br />buat sebuah folder di Google Drive Anda, klik kanan folder tersebut &rarr; klik <strong>Bagikan / Share</strong> (atur ke &quot;Siapa saja dengan link&quot; / &quot;Anyone with the link&quot;), kemudian salin link foldernya dan tempelkan di atas.
                </p>
              </div>

              {googleDriveLinkInput && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-150 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-850">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-semibold text-[10px] truncate max-w-[180px]">
                      ID Terdeteksi: {extractFolderId(googleDriveLinkInput) || "Format Tautan Belum Sesuai"}
                    </span>
                  </div>
                  {extractFolderId(googleDriveLinkInput) && (
                    <a
                      href={googleDriveLinkInput}
                      target="_blank"
                      rel="referrer"
                      className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      Buka Folder <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {lksList.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Simulasi Struktur Nama LKS</label>
                  <select
                    value={previewLksId}
                    onChange={(e) => setPreviewLksId(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 outline-none hover:bg-slate-100 cursor-pointer"
                  >
                    {lksList.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSaveFolderRoot}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Konfigurasi Sinkron
            </button>
          </div>
        </div>

        {/* Right Card: Directory Hierarchy Preview Tree */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Preview Pohon Sinkronisasi Google Drive</span>
            <div className="font-mono text-[11px] text-slate-600 space-y-2 bg-white border border-slate-150 p-4 rounded-2xl shadow-inner leading-relaxed overflow-x-auto">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <span>📁</span> Google Drive Saya
              </div>
              
              {googleDriveLinkInput ? (
                <div className="pl-4 flex flex-col gap-0.5 text-emerald-700 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span>└── 🔗</span> 
                    <span className="bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-mono truncate max-w-[180px]">
                      Folder Kustom Anda (Ditautkan)
                    </span>
                  </div>
                  <span className="pl-6 text-[9px] text-slate-400 font-mono font-normal">
                    ID: {extractFolderId(googleDriveLinkInput) || "Tautan tidak terdefinisi"}
                  </span>
                </div>
              ) : (
                <div className="pl-4 flex items-center gap-1.5 font-bold text-indigo-700">
                  <span>└── 📁</span> 
                  <span className="bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-mono">
                    {googleDriveFolderInput || "SILKS"}
                  </span>
                </div>
              )}

              <div className="pl-8 flex items-center gap-1.5 text-slate-700 font-bold">
                <span>└── 📁</span> {selectedLks ? selectedLks.name : "LKS_Contoh"}
              </div>
              <div className="pl-12 text-slate-400 text-[10px] space-y-1">
                <div>├── 📄 KTP Ketua.pdf</div>
                <div>├── 📄 SK Kemenkumham.pdf</div>
                <div>├── 📄 Surat Tanda Daftar (STD).pdf</div>
                <div>└── 📄 Sertifikat Akreditasi.pdf</div>
              </div>
            </div>
          </div>
          <div className="mt-3.5 text-[10px] text-slate-500 leading-normal bg-white border border-slate-100 rounded-xl p-3">
            📌 Setiap berkas administrasi langsung disesuaikan ke subfolder nama LKS secara dinamis {googleDriveLinkInput ? "pada folder utama yang telah Anda tautkan!" : "pada folder induk virtual."}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GoogleDriveFolderConfig;
