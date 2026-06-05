import React, { useState } from "react";
import { LKS, DinsosSettings } from "../types";
import { useNotifications } from "./NotificationManager";
import { HardDrive, UserCheck, FolderOpen, Save } from "lucide-react";

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
  const [previewLksId, setPreviewLksId] = useState<string>(lksList[0]?.id || "");

  const handleSaveFolderRoot = () => {
    if (!googleDriveFolderInput.trim()) {
      showToast("error", "Simpan Gagal", "Nama folder utama tidak boleh kosong.");
      return;
    }
    const sanitized = googleDriveFolderInput.trim().replace(/[\/\\?%*:|"<>\s]/g, "_");
    onSaveSettings({
      ...settings,
      googleDriveRoot: sanitized
    });
    showToast("success", "Folder Tersimpan", `Lokasi sinkronisasi baru Google Drive diatur ke: /${sanitized}/`);
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
          <div className="text-[11px] font-mono flex items-center gap-2 text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 w-full md:w-auto">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Folder: /{settings.googleDriveRoot || "SILKS"}/</span>
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
                <h4 className="text-xs font-bold text-slate-900 font-display">Tentukan Nama Folder Utama</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Beri nama direktori induk Anda. Berkas akan dimasukkan ke subfolder nama LKS masing-masing.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nama Folder Induk</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs font-mono">
                    /
                  </div>
                  <input
                    type="text"
                    value={googleDriveFolderInput}
                    onChange={(e) => setGoogleDriveFolderInput(e.target.value)}
                    placeholder="Contoh: SILKS_BLORA"
                    className="w-full text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-850 pl-7 pr-3 py-2.5 outline-none focus:border-indigo-500 hover:bg-slate-100 transition-all font-mono shadow-inner"
                  />
                </div>
              </div>

              {lksList.length > 0 && (
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Simulasi Nama LKS Terpilih</label>
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
              Simpan Struktur Baru
            </button>
          </div>
        </div>

        {/* Right Card: Directory Hierarchy Preview Tree */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Struktur Direktori Google Drive Saya</span>
            <div className="font-mono text-[11px] text-slate-600 space-y-2 bg-white border border-slate-150 p-4 rounded-2xl shadow-inner leading-relaxed overflow-x-auto">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <span>📁</span> Google Drive Saya
              </div>
              <div className="pl-4 flex items-center gap-1.5 font-bold text-indigo-700">
                <span>└── 📁</span> <span className="bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-mono">{googleDriveFolderInput || "SILKS"}</span>
              </div>
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
          <div className="mt-3.5 text-[10px] text-slate-505 leading-normal bg-white border border-slate-100 rounded-xl p-3">
            📌 Setiap berkas administrasi langsung disesuaikan ke subfolder nama LKS secara dinamis.
          </div>
        </div>

      </div>
    </div>
  );
};

export default GoogleDriveFolderConfig;
