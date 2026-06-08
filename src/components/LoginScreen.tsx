import React, { useState } from "react";
import { 
  HardDrive, ShieldAlert, FileHeart, Users, LayoutDashboard, 
  LogIn, ArrowRight, CheckCircle2, CloudLightning, ShieldCheck
} from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onGoogleSignIn: () => void;
  onAnonymousSignIn: () => void;
  onEnterAsGuest: () => void;
  logoUrl: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoogleSignIn,
  onAnonymousSignIn,
  onEnterAsGuest,
  logoUrl
}) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await onGoogleSignIn();
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      await onAnonymousSignIn();
    } finally {
      setLoading(false);
    }
  };

  const keyFeatures = [
    {
      icon: LayoutDashboard,
      title: "Dashboard Spasial LKS",
      desc: "Monitor status keaktifan, kepengurusan, dan peta spasial LKS di Blora secara real-time.",
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      icon: HardDrive,
      title: "Google Drive Archives",
      desc: "Penyimpanan otomatis administratif (KTP, SK, STD) yang disusun teratur per folder LKS.",
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      icon: FileHeart,
      title: "e-Rekomendasi Berkas",
      desc: "Cetak dokumen KOP resmi dinas untuk legalitas pendaftaran sosial eksternal.",
      color: "bg-rose-50 text-rose-600 border-rose-100",
    },
    {
      icon: Users,
      title: "Registrasi Penerima Manfaat",
      desc: "Manajemen data PM (anak asuh, lansia terlantar) terintegrasi se-Kabupaten Blora.",
      color: "bg-amber-50 text-amber-500 border-amber-100",
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background Abstract Grids */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-50/60 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse duration-[8s]" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse duration-[12s]" />

      {/* Header Bar */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm p-1.5 flex items-center justify-center border border-slate-100">
            <img src={logoUrl} alt="Logo Dinas" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
          </div>
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-slate-900 font-display block">SiLKS BLORA</span>
            <span className="text-[9px] text-slate-400 font-mono block leading-none">Dinsos PPPA Kab. Blora</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] bg-slate-100 border border-slate-200/60 text-slate-500 px-3 py-1.5 rounded-full font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sesi Enkripsi Aktif</span>
        </div>
      </header>

      {/* Main Form Center Layout */}
      <main className="max-w-7xl mx-auto w-full px-6 flex-1 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-8 md:py-12 z-10 justify-center">
        
        {/* Left Grid: Key benefits info panel */}
        <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50/85 border border-indigo-100 rounded-full text-[10px] text-indigo-700 font-black tracking-wider uppercase font-mono shadow-sm">
            <CloudLightning className="w-3 h-3 animate-bounce" />
            <span>Sistem Informasi Lembaga Kesejahteraan Sosial</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight font-display">
            Satu Pintu Digital,<br />
            Tertata & Terpantau Maksimal.
          </h2>
          
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
            Akses dashboard pelaporan administrasi dinas untuk pemantauan validitas dan legalitas operasional organisasi sosial di Kabupaten Blora.
          </p>

          {/* Features cards layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-3">
            {keyFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div 
                  key={i} 
                  className="p-4 rounded-2xl border border-slate-150 bg-white/70 backdrop-blur-sm shadow-sm flex gap-3.5 hover:shadow-md transition-all duration-350"
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 flex items-center justify-center w-10 h-10 ${f.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 font-display">{f.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Grid: Login Panel Card */}
        <div className="w-full lg:w-[410px] shrink-0">
          <div className="bg-white rounded-3xl border border-slate-205 shadow-xl shadow-slate-200/50 p-8 relative flex flex-col justify-between">
            
            {/* Top insignia wrapper */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-indigo-50/60 rounded-2xl mx-auto flex items-center justify-center border border-indigo-100 p-2.5 mb-4">
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-base font-extrabold text-slate-950 font-display uppercase tracking-wider">Selamat Datang</h3>
              <p className="text-[11px] text-slate-400 mt-1 font-medium px-2">Masukkan akun Google Anda untuk me-sinkronisasi data profil pimpinan & LKS secara instan.</p>
            </div>

            {/* Actions Form */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>Masuk dengan Google</span>
              </button>

              <button
                type="button"
                onClick={handleAnonymousLogin}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <CloudLightning className="w-4 h-4 text-emerald-100 animate-pulse" />
                <span>Masuk ke Cloud Instan (Bebas Popup)</span>
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <span className="relative bg-white px-3.5 text-[9px] font-bold text-slate-350 uppercase tracking-widest font-mono">Atau Sesi Uji coba</span>
              </div>

              <button
                type="button"
                onClick={onEnterAsGuest}
                disabled={loading}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-700 font-extrabold text-xs rounded-2xl transition-all border border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Masuk Sebagai Tamu (Demo Offline)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Disclaimer */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[9px] text-slate-400 leading-normal flex flex-col gap-3">
              <div className="flex items-start gap-1.5 text-left bg-slate-50 p-3 rounded-xl border border-slate-150">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Dengan masuk, Anda menyetujui sinkronisasi pangkalan data <strong>Regristrasi LKS</strong> ke database cloud Firestore aman dan Google Drive milik lembaga Anda secara otomatis.
                </span>
              </div>

              <div className="flex items-start gap-1.5 text-left bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-indigo-700">
                <CloudLightning className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip Pengujian Sandbox:</strong> Jika login/popup Google terhalang oleh pemblokir iklan/popup di dalam frame preview AI Studio, silakan klik opsi <strong>"Open in New Tab"</strong> (Buka di Tab Baru) pada menu kanan atas browser. Data yang Anda buat di Sesi Tamu tersimpan aman di penyimpanan lokal (localStorage) dan akan <strong>langsung tersinkron otomatis</strong> ketika Anda login di tab baru tersebut dengan akun yang sama!
                </span>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="py-6 border-t border-slate-150 bg-white/40 text-center text-[10px] text-slate-400 font-medium z-10">
        <p>© 2026 Pemerintah Kabupaten Blora. Bidang Pemberdayaan Sosial & Dinas PPPA. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LoginScreen;
