import React, { useState } from "react";
import { 
  LayoutDashboard, Building2, FileCheck2, Users, 
  Search, FileHeart, Settings2, LogOut, LogIn, Menu, X, Globe, ArrowRight, RefreshCw, Layers
} from "lucide-react";
import { auth, loginWithGoogle, logoutUser } from "../firebase";
import { useNotifications } from "./NotificationManager";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: any;
  onSetUser: (user: any) => void;
  settingsLogo: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onSetUser,
  settingsLogo
}) => {
  const { showToast } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "lks", label: "Data LKS", icon: Building2 },
    { id: "administrasi", label: "Administrasi", icon: FileCheck2 },
    { id: "beneficiaries", label: "Penerima Manfaat", icon: Users },
    { id: "pencarian", label: "Pencarian PM", icon: Search },
    { id: "rekomendasi", label: "Rekomendasi", icon: FileHeart },
    { id: "profil", label: "Profil & Pengaturan", icon: Settings2 }
  ];

  const handleSignIn = async () => {
    setAuthLoading(true);
    try {
      const user = await loginWithGoogle();
      onSetUser(user);
      showToast("success", "Login Berhasil", `Selamat datang kembali, ${user.displayName}! Akun otomatis disinkronkan ke Cloud Firestore.`);
    } catch (error) {
      showToast("error", "Login Gagal", "Hubungan Google Auth dibatalkan.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      onSetUser(null);
      showToast("info", "Logout Sukses", "Sesi login diakhiri. Aplikasi berjalan dalam mode penyimpanan lokal.");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 text-slate-800 p-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 p-0.5 overflow-hidden flex items-center justify-center">
            <img src={settingsLogo} alt="Logo" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-display">SiLKS Blora</h1>
            <p className="text-[9px] text-slate-400 font-mono tracking-tight leading-none mt-0.5">Sistem Info Lembaga Sosial</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Primary Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between text-slate-600 transform transition-transform duration-300 font-sans p-6
        md:translate-x-0 md:static md:h-screen
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 p-0.5 flex-shrink-0 flex items-center justify-center">
                <img src={settingsLogo} alt="Logo" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h1 className="text-md font-bold text-slate-800 uppercase tracking-widest font-display leading-tight">SiLKS Blora</h1>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight">Sistem Informasi LKS</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>



          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all group cursor-pointer border
                    ${isActive 
                      ? "bg-indigo-50 text-indigo-700 font-bold border-indigo-100/50 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent"}
                  `}
                >
                  <div className={`p-1 rounded-lg transition-transform duration-200 group-hover:scale-110 ${isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Auth Profile Drawer at the bottom */}
        <div className="mt-8">
          {currentUser ? (
            <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3.5 shadow-sm shadow-slate-900/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs">
                      {currentUser.displayName ? currentUser.displayName[0] : "U"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate leading-snug">{currentUser.displayName || "Pengguna SiLKS"}</h4>
                  <p className="text-[9px] text-slate-400 truncate font-mono">{currentUser.email || "user@email.com"}</p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="p-4 bg-indigo-600 rounded-2xl text-white space-y-3 shadow-md shadow-indigo-600/15">
              <p className="text-[11px] text-indigo-100 font-medium leading-relaxed">
                Connect your account for database sync &amp; G-Drive file archival.
              </p>
              <button
                onClick={handleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-slate-50 text-indigo-600 font-extrabold text-xs rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
                {authLoading ? "Loading..." : "Login Google"}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Desktop overlay backdrop when menu is open in mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden animate-fade-in"
        />
      )}
    </>
  );
};
export default Sidebar;
