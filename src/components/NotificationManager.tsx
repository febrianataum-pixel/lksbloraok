import React, { createContext, useContext, useState, useEffect } from "react";
// Local ToastMessage and PeerNotificationItem types used directly index-based
import { CheckCircle2, AlertTriangle, X, Bell, Trash2, Save, Cloud, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warn";
  title: string;
  message: string;
  duration?: number;
}

interface PeerNotificationItem {
  id: string;
  user: string;
  action: string;
  time: string;
  avatarColor: string;
}

interface NotificationContextProps {
  showToast: (type: "success" | "error" | "info" | "warn", title: string, message: string) => void;
  peerNotifications: PeerNotificationItem[];
  addNewPeerNotification: (user: string, action: string) => void;
  confirmAction: (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [peerNotifications, setPeerNotifications] = useState<PeerNotificationItem[]>([
    {
      id: "pn-1",
      user: "Siti Rahayu (LKS Cepu)",
      action: "menambahkan Penerima Manfaat baru 'Rinto Wijaya'",
      time: "2 menit yang lalu",
      avatarColor: "bg-emerald-500"
    },
    {
      id: "pn-2",
      user: "H. Ahmad Sodik (LKS Blora)",
      action: "mengupload dokumen SK Kemenkumham baru",
      time: "10 menit yang lalu",
      avatarColor: "bg-blue-500"
    },
    {
      id: "pn-3",
      user: "Admin Dinsos PPPA",
      action: "memperbarui Nama Kepala Dinas Sosial",
      time: "1 jam yang lalu",
      avatarColor: "bg-purple-500"
    }
  ]);
  const [confirmation, setConfirmation] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showToast = (type: "success" | "error" | "info" | "warn", title: string, message: string) => {
    // Popup notifications are disabled by user request
  };

  const removeToast = (id: string) => {
    // disabled
  };

  const addNewPeerNotification = (user: string, action: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setPeerNotifications(prev => [
      {
        id,
        user,
        action,
        time: "Baru saja",
        avatarColor: "bg-orange-500"
      },
      ...prev.slice(0, 5) // keep last 6 items
    ]);
  };

  // Simulate updates from other users in Blora every 45-60 seconds
  useEffect(() => {
    const peerUsers = [
      { name: "Eko Prasetyo (LKS Cepu)", action: "memperbarui deskripsi kegiatan LKS" },
      { name: "Bambang Wijaya (LKS Kunduran)", action: "mengubah status akreditasi ke Akreditasi C" },
      { name: "Dwi Astuti (LKS Kunduran)", action: "menambahkan Riwayat Penerimaan Bantuan" },
      { name: "Ningsih Wahyuni (LKS Blora)", action: "memperbarui nomor HP Whatsapp Ketua" },
    ];

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * peerUsers.length);
      const userObj = peerUsers[idx];
      addNewPeerNotification(userObj.name, userObj.action);
    }, 55000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        peerNotifications,
        addNewPeerNotification,
        confirmAction: setConfirmation
      }}
    >
      {children}

      {/* Render Toast Notifications is disabled by user request */}

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {confirmation && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4 text-rose-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display">{confirmation.title}</h3>
                <p className="text-sm text-slate-500 mt-2">{confirmation.message}</p>
              </div>
              <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (confirmation.onCancel) confirmation.onCancel();
                    setConfirmation(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    confirmation.onConfirm();
                    setConfirmation(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm shadow-rose-200 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Konfirmasi Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};
