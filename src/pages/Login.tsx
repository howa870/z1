import { useState, FormEvent } from "react";
import { Redirect } from "wouter";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, Store } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Redirect to="/" />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل تسجيل الدخول";
      if (msg.includes("Invalid login")) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-cairo" dir="rtl">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-[#0d0d0d] border border-[#d4af37]/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-8 border-b border-[#d4af37]/10 text-center">
            <div className="w-14 h-14 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-7 h-7 text-[#d4af37]" />
            </div>
            <h1 className="text-white font-black text-xl mb-1">تسجيل الدخول</h1>
            <p className="text-gray-500 text-sm">لوحة إدارة المنتجات</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-400 text-xs mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  dir="ltr"
                  autoComplete="email"
                  disabled={submitting}
                  className="w-full bg-[#1a1a1a] border border-[#d4af37]/20 text-white pr-10 pl-4 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/60 transition-colors placeholder-gray-600 text-sm disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 text-xs mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-gray-600" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                  disabled={submitting}
                  className="w-full bg-[#1a1a1a] border border-[#d4af37]/20 text-white pr-10 pl-10 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/60 transition-colors placeholder-gray-600 text-sm disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute top-1/2 -translate-y-1/2 left-3.5 text-gray-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#c9a02e] disabled:opacity-60 disabled:cursor-not-allowed text-black font-black py-3.5 rounded-xl transition-all text-sm"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {submitting ? "جاري الدخول..." : "دخول"}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-5">
          قنفات ودواوين الأسدي — لوحة الإدارة
        </p>
      </motion.div>
    </div>
  );
}
