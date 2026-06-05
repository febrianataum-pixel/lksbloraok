import React, { createContext, useContext, useState, useEffect } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  setDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  writeBatch
} from "firebase/firestore";

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
  addNewPeerNotification: (user: string, action: string, avatarColor?: string) => void;
  clearAllNotifications: () => Promise<void>;
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
    // Popup toast notifications are handled of interest by UI/App itself
  };

  const addNewPeerNotification = async (user: string, action: string, avatarColor?: string) => {
    const defaultColor = avatarColor || "bg-indigo-500";
    const curUser = auth.currentUser;
    if (curUser) {
      const id = "notif-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
      try {
        await setDoc(doc(db, "notifications", id), {
          id,
          user,
          action,
          time: "Baru saja",
          avatarColor: defaultColor,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Failed to write live notification: ", e);
      }
    } else {
      // Local addition for guest session or offline access
      const id = "notif-" + Date.now();
      setPeerNotifications(prev => [
        {
          id,
          user,
          action,
          time: "Baru saja",
          avatarColor: defaultColor
        },
        ...prev.slice(0, 7)
      ]);
    }
  };

  const clearAllNotifications = async () => {
    const curUser = auth.currentUser;
    if (curUser) {
      try {
        const q = query(
          collection(db, "notifications"),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      } catch (e) {
        console.error("Failed to clear notifications in Firebase: ", e);
      }
    }
    // Set locally to clear instantly across guest sessions or sync responses
    setPeerNotifications([]);
  };

  // Synchronize Firebase Notifications collection in Real-time whenever user is logged in
  useEffect(() => {
    let unsubscribe = () => {};

    const setupRealTimeNotifications = () => {
      const q = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: PeerNotificationItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // Format time string from createdAt timestamp
            let formattedTime = "Baru saja";
            if (data.createdAt) {
              const seconds = data.createdAt.seconds || (data.createdAt.toDate ? data.createdAt.toDate().getTime() / 1000 : null);
              if (seconds) {
                const date = new Date(seconds * 1000);
                const diffMs = Date.now() - date.getTime();
                const diffSec = Math.floor(diffMs / 1000);
                const diffMin = Math.floor(diffSec / 60);
                const diffHour = Math.floor(diffMin / 60);

                if (diffSec < 60) {
                  formattedTime = "Baru saja";
                } else if (diffMin < 60) {
                  formattedTime = `${diffMin} menit yang lalu`;
                } else if (diffHour < 24) {
                  formattedTime = `${diffHour} jam yang lalu`;
                } else {
                  formattedTime = date.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                }
              }
            } else if (data.time) {
              formattedTime = data.time;
            }

            list.push({
              id: docSnap.id,
              user: data.user || "Anonim",
              action: data.action || "",
              time: formattedTime,
              avatarColor: data.avatarColor || "bg-indigo-500"
            });
          });

          // Use the fetched notifications if we received any real entries to override default mock data
          if (list.length > 0) {
            setPeerNotifications(list);
          }
        },
        (error) => {
          console.error("Firestore real-time notifications listen error: ", error);
        }
      );
    };

    // Listen to Firebase auth changes to bind notifications query
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      // Clean up previous registration
      unsubscribe();
      
      if (user) {
        setupRealTimeNotifications();
      } else {
        // Fallback preset mock data for guest sessions
        setPeerNotifications([
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
      }
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  // Simulate updates from other users in Blora ONLY for offline/guest sessions every 55 seconds
  useEffect(() => {
    const peerUsers = [
      { name: "Eko Prasetyo (LKS Cepu)", action: "memperbarui deskripsi kegiatan LKS", color: "bg-blue-500" },
      { name: "Bambang Wijaya (LKS Kunduran)", action: "mengubah status akreditasi ke Akreditasi C", color: "bg-pink-500" },
      { name: "Dwi Astuti (LKS Kunduran)", action: "menambahkan Riwayat Penerimaan Bantuan", color: "bg-amber-500" },
      { name: "Ningsih Wahyuni (LKS Blora)", action: "memperbarui nomor HP Whatsapp Ketua", color: "bg-teal-500" },
    ];

    const interval = setInterval(() => {
      // Only trigger if no real-time auth user is active to prevent anomaly notifications write
      if (!auth.currentUser) {
        const idx = Math.floor(Math.random() * peerUsers.length);
        const userObj = peerUsers[idx];
        // Add to local state list
        const id = "pn-sim-" + Date.now();
        setPeerNotifications(prev => [
          {
            id,
            user: userObj.name,
            action: userObj.action,
            time: "Baru saja",
            avatarColor: userObj.color
          },
          ...prev.slice(0, 5)
        ]);
      }
    }, 55000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        peerNotifications,
        addNewPeerNotification,
        clearAllNotifications,
        confirmAction: setConfirmation
      }}
    >
      {children}

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
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    confirmation.onConfirm();
                    setConfirmation(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm shadow-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
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
