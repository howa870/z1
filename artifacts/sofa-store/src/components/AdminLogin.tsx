import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, User, Eye, EyeOff, Shield } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ADMIN_USER = "admin";
const ADMIN_PASS = "alasdi2024";

export function AdminLogin({ open, onClose, onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem("isAdmin", "true");
        setLoading(false);
        setUsername("");
        setPassword("");
        onSuccess();
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="relative bg-[#111] border border-[#d4af37]/30 rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#d4af37]/30">
                <Shield className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h2 className="text-2xl font-bold text-white">لوحة التحكم</h2>
              <p className="text-gray-400 text-sm mt-1">تسجيل دخول المدير</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">اسم المستخدم</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="أدخل اسم المستخدم"
                    className="w-full bg-[#1a1a1a] border border-[#d4af37]/20 text-white px-10 py-3 rounded-xl focus:outline-none focus:border-[#d4af37] transition-colors placeholder-gray-600"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-2">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="أدخل كلمة المرور"
                    className="w-full bg-[#1a1a1a] border border-[#d4af37]/20 text-white px-10 py-3 rounded-xl focus:outline-none focus:border-[#d4af37] transition-colors placeholder-gray-600"
                    dir="rtl"
                  />
                  <button
                    onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">
                  {error}
                </motion.p>
              )}

              <motion.button
                onClick={handleLogin}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#d4af37] hover:bg-[#c9a02e] text-black py-3 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 mt-2"
              >
                {loading ? "جاري التحقق..." : "دخول"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
