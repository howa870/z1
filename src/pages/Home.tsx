import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Award, Settings, Truck, Sofa, Wrench, Palette, Star, Facebook, Instagram, Phone, X, Plus } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { ScrollToTop } from "../components/ScrollToTop";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AdminPanel } from "../components/AdminPanel";
import { AdminLogin } from "../components/AdminLogin";
import {
  getGallery, getTestimonials, getSettings,
  addTestimonial, deleteTestimonial, updateSettings,
  addGalleryItem, deleteGalleryItem,
  isSupabaseConfigured,
  type GalleryItem, type Testimonial, type SiteSettings, DEFAULT_SETTINGS,
} from "../lib/db";

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function Home() {
  const [showPanel, setShowPanel] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem("isAdmin") === "true");

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ rating: 5, comment: "" });
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("تم الحفظ بنجاح");
  const [toastError, setToastError] = useState(false);

  const secretCount = useRef(0);
  const secretTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const whatsappLink = `https://wa.me/${settings.whatsapp}`;
  const phoneLink = `tel:${settings.phone}`;

  // ── Load data ──────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, g, t] = await Promise.all([getSettings(), getGallery(), getTestimonials()]);
        setSettings(s);
        setGalleryItems(g);
        setTestimonials(t);
      } catch (err) {
        console.error("[Home] خطأ في تحميل البيانات:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Secret admin trigger ───────────────────────────────
  const handleSecretTrigger = () => {
    secretCount.current += 1;
    if (secretTimer.current) clearTimeout(secretTimer.current);
    secretTimer.current = setTimeout(() => { secretCount.current = 0; }, 2000);
    if (secretCount.current >= 5) {
      secretCount.current = 0;
      if (sessionStorage.getItem("isAdmin") === "true") setShowPanel(true);
      else setShowLoginModal(true);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        if (sessionStorage.getItem("isAdmin") === "true") setShowPanel(true);
        else setShowLoginModal(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Toast helper ──────────────────────────────────────
  const showMsg = (msg: string, err = false) => {
    setToastMsg(msg);
    setToastError(err);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ── Save settings ─────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    const ok = await updateSettings(settings);
    setSaving(false);
    if (ok) showMsg("تم الحفظ بنجاح ✅");
    else showMsg("فشل الحفظ — تحقق من الاتصال", true);
  };

  // ── Gallery ops ───────────────────────────────────────
  const handleGalleryChange = async (items: GalleryItem[]) => {
    setGalleryItems(items);
  };

  // ── Testimonial ops ───────────────────────────────────
  const handleAddTestimonial = async () => {
    if (!newTestimonial.comment.trim()) return;
    const added = await addTestimonial({ rating: newTestimonial.rating, comment: newTestimonial.comment, image: "" });
    if (added) {
      setTestimonials(prev => [...prev, added]);
      setNewTestimonial({ rating: 5, comment: "" });
      setShowTestimonialForm(false);
      showMsg("تم إضافة التقييم ✅");
    } else {
      showMsg("فشل إضافة التقييم", true);
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    const ok = await deleteTestimonial(id);
    if (ok) setTestimonials(prev => prev.filter(t => t.id !== id));
    else showMsg("فشل حذف التقييم", true);
  };

  const closeModal = () => { setSelectedImage(null); setScale(1); };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <AdminLogin
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => { setIsAdmin(true); setShowLoginModal(false); setShowPanel(true); }}
      />

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] text-white px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2 ${toastError ? "bg-red-600" : "bg-green-600"}`}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">
        {isAdmin && (
          <motion.button
            onClick={() => setShowPanel(true)}
            whileHover={{ scale: 1.1, rotate: 45 }}
            className="fixed top-6 left-6 z-50 bg-[#d4af37] text-black p-3 rounded-full shadow-2xl"
            title="لوحة التحكم"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        )}

        {!isSupabaseConfigured && isAdmin && (
          <div className="fixed top-6 right-6 z-50 bg-yellow-600/90 text-black text-xs font-bold px-3 py-2 rounded-xl shadow-lg">
            ⚠️ Supabase غير مُوصَّل — يعمل بـ localStorage
          </div>
        )}

        <ScrollToTop />

        <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 animate-pulse">
          <MessageCircle className="w-7 h-7" />
        </a>

        {/* ── Hero ───────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1687180498602-5a1046defaa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920" alt="Luxury sofa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/95" />
          </div>
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <div className="mb-4">
                <span className="text-[#d4af37] text-lg md:text-xl font-semibold tracking-widest">{settings.subtitle}</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
                <span className="gold-shimmer">{settings.title}</span>
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a href={whatsappLink} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="bg-[#d4af37] hover:bg-[#c9a02e] text-black px-10 py-4 rounded-xl font-black text-lg shadow-2xl shadow-[#d4af37]/30 transition-all">
                  {settings.button}
                </motion.a>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/gallery" className="inline-block bg-transparent border-2 border-[#d4af37] hover:bg-[#d4af37] hover:text-black text-[#d4af37] px-10 py-4 rounded-xl font-black text-lg transition-all">
                    شاهد أعمالنا
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
        </section>

        {/* ── Features ───────────────────────────────────── */}
        <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Award, title: "جودة عالية", desc: "نستخدم أفضل المواد الخام لضمان منتجات تدوم طويلاً" },
                { icon: Settings, title: "تفصيل حسب الطلب", desc: "نصمم قنفاتك حسب رغبتك ومقاساتك الخاصة" },
                { icon: Truck, title: "توصيل سريع", desc: "نوصل إلى جميع أنحاء كركوك وضواحيها" },
              ].map(({ icon: Icon, title, desc }, i) => (
                <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.15 }}
                  className="glass-card p-8 rounded-2xl text-center hover:border-[#d4af37]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-[#d4af37]/5 group">
                  <div className="w-20 h-20 rounded-full bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d4af37]/20 transition-all">
                    <Icon className="w-10 h-10 text-[#d4af37]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#d4af37]">{title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Gallery Preview ─────────────────────────────── */}
        <section id="gallery" className="py-24 px-4 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <p className="text-[#d4af37] tracking-widest text-sm uppercase mb-3">معرض الأعمال</p>
              <h2 className="text-4xl md:text-5xl font-black mb-4">أعمالنا <span className="text-[#d4af37]">المميزة</span></h2>
              <div className="w-16 h-0.5 bg-[#d4af37] mx-auto mb-4" />
              <p className="text-gray-400 max-w-xl mx-auto">اضغط على الصورة لتكبيرها</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.slice(0, 6).map((item, i) => (
                <motion.div key={item.id} {...fadeIn} transition={{ delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/3] border border-[#d4af37]/10 hover:border-[#d4af37]/40 transition-all duration-500 cursor-pointer"
                  onClick={() => item.type === "image" && setSelectedImage(item.url)}>
                  {item.type === "video"
                    ? <video src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" muted loop playsInline />
                    : <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="bg-[#d4af37] text-black text-xs font-bold px-3 py-1.5 rounded-full">{item.title}</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-[#d4af37] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">{i + 1}</div>
                </motion.div>
              ))}
            </div>
            <motion.div {...fadeIn} className="text-center mt-12">
              <Link to="/gallery">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 border-2 border-[#d4af37] hover:bg-[#d4af37] text-[#d4af37] hover:text-black px-10 py-4 rounded-xl font-bold text-lg transition-all cursor-pointer">
                  عرض المعرض كاملاً
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Colors ─────────────────────────────────────── */}
        <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div {...fadeIn}>
              <Palette className="w-14 h-14 text-[#d4af37] mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-black mb-4">تشكيلة <span className="text-[#d4af37]">الألوان</span></h2>
              <div className="w-16 h-0.5 bg-[#d4af37] mx-auto mb-6" />
              <p className="text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed text-lg">
                أكثر من ٢٥ لون فاخر متوفر بأقمشة عالية الجودة
              </p>
              <Link to="/colors">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#d4af37] to-[#c9a02e] text-black px-12 py-5 rounded-xl font-black text-xl shadow-2xl shadow-[#d4af37]/20 cursor-pointer transition-all">
                  <Palette className="w-6 h-6" />
                  اكتشف الألوان
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Services ───────────────────────────────────── */}
        <section className="py-24 px-4 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <p className="text-[#d4af37] tracking-widest text-sm uppercase mb-3">ما نقدمه</p>
              <h2 className="text-4xl md:text-5xl font-black mb-4"><span className="text-[#d4af37]">خدماتنا</span> المميزة</h2>
              <div className="w-16 h-0.5 bg-[#d4af37] mx-auto" />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Sofa, title: "تفصيل القنفات", desc: "نفصّل قنفات فاخرة بمقاسات ومواصفات خاصة لكل عميل" },
                { icon: Award, title: "ضمان الجودة", desc: "ضمان شامل على جميع منتجاتنا لمدة سنة كاملة" },
                { icon: Wrench, title: "الصيانة والتجديد", desc: "خدمات صيانة وتجديد القنفات القديمة بأسعار منافسة" },
                { icon: Palette, title: "اختيار الألوان", desc: "أكثر من 25 لون فاخر لاختيار ما يناسب ديكورك" },
              ].map(({ icon: Icon, title, desc }, i) => (
                <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}
                  className="glass-card p-7 rounded-2xl text-center hover:border-[#d4af37]/40 transition-all duration-500 hover:-translate-y-2 group">
                  <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#d4af37] transition-all">
                    <Icon className="w-7 h-7 text-[#d4af37] group-hover:text-black transition-all" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-[#d4af37]">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────── */}
        <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <p className="text-[#d4af37] tracking-widest text-sm uppercase mb-3">ماذا يقولون عنا</p>
              <h2 className="text-4xl md:text-5xl font-black mb-4">آراء <span className="text-[#d4af37]">عملائنا</span></h2>
              <div className="w-16 h-0.5 bg-[#d4af37] mx-auto" />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div key={t.id} {...fadeIn} transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 rounded-2xl hover:border-[#d4af37]/40 transition-all duration-500 relative group">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-5 h-5 ${j < t.rating ? "fill-[#d4af37] text-[#d4af37]" : "text-gray-700"}`} />
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed text-lg">"{t.comment}"</p>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteTestimonial(t.id)}
                      className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
            <motion.div {...fadeIn} className="text-center mt-10">
              <button onClick={() => setShowTestimonialForm(true)}
                className="inline-flex items-center gap-2 border border-[#d4af37]/30 hover:border-[#d4af37] text-[#d4af37] px-8 py-3 rounded-xl font-medium transition-all hover:bg-[#d4af37]/5">
                <Plus className="w-4 h-4" /> أضف تقييمك
              </button>
            </motion.div>

            <AnimatePresence>
              {showTestimonialForm && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setShowTestimonialForm(false)}>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="relative bg-[#111] border border-[#d4af37]/30 rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowTestimonialForm(false)} className="absolute top-4 left-4 text-gray-500 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-bold text-[#d4af37] mb-6">أضف تقييمك</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">التقييم</p>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(n => (
                            <button key={n} onClick={() => setNewTestimonial(p => ({ ...p, rating: n }))}
                              className={`text-2xl transition-transform hover:scale-110 ${n <= newTestimonial.rating ? "text-[#d4af37]" : "text-gray-600"}`}>★</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">تعليقك</p>
                        <textarea value={newTestimonial.comment} onChange={e => setNewTestimonial(p => ({ ...p, comment: e.target.value }))}
                          className="w-full bg-[#1a1a1a] border border-[#d4af37]/20 p-4 rounded-xl text-white resize-none h-28 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="اكتب تعليقك هنا..." />
                      </div>
                      <motion.button onClick={handleAddTestimonial} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full bg-[#d4af37] text-black py-3 rounded-xl font-bold text-lg">
                        إرسال التقييم
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────── */}
        <section className="py-28 px-4 relative overflow-hidden bg-[#0a0a0a]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4af37] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#d4af37] rounded-full blur-[120px]" />
          </div>
          <motion.div {...fadeIn} className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              احصل على تصميمك الخاص<br />
              <span className="text-[#d4af37]">بأسعار مميزة الآن</span>
            </h2>
            <p className="text-gray-400 text-xl mb-10">عروض حصرية لفترة محدودة</p>
            <motion.a href={whatsappLink} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="inline-block bg-[#d4af37] hover:bg-[#c9a02e] text-black px-14 py-5 rounded-xl font-black text-xl shadow-2xl shadow-[#d4af37]/30 transition-all">
              احجز الآن
            </motion.a>
          </motion.div>
        </section>

        {/* ── Contact ────────────────────────────────────── */}
        <section id="contact" className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <p className="text-[#d4af37] tracking-widest text-sm uppercase mb-3">تواصل معنا</p>
              <h2 className="text-4xl md:text-5xl font-black mb-4"><span className="text-[#d4af37]">نحن</span> في خدمتكم</h2>
              <div className="w-16 h-0.5 bg-[#d4af37] mx-auto" />
            </motion.div>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <motion.div {...fadeIn}>
                <div className="glass-card p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-[#d4af37] mb-6">معلومات التواصل</h3>
                  <div className="space-y-5">
                    {[
                      { icon: Phone, label: "رقم الهاتف", content: <a href={phoneLink} className="text-white hover:text-[#d4af37] transition-colors font-semibold">{settings.phone}</a> },
                      { icon: MessageCircle, label: "واتساب", content: <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#d4af37] transition-colors font-semibold">تواصل مباشر</a> },
                      { icon: Sofa, label: "الموقع", content: <p className="text-white font-semibold whitespace-pre-line">{settings.location}</p> },
                    ].map(({ icon: Icon, label, content }, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="bg-[#d4af37]/10 p-3 rounded-xl flex-shrink-0"><Icon className="w-5 h-5 text-[#d4af37]" /></div>
                        <div><p className="text-gray-500 text-xs mb-1">{label}</p>{content}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-[#d4af37]/10 grid grid-cols-2 gap-3">
                    <a href={phoneLink} className="flex items-center justify-center gap-2 bg-[#d4af37] text-black py-3 rounded-xl font-bold text-sm transition-all hover:bg-[#c9a02e]">
                      <Phone className="w-4 h-4" />اتصال
                    </a>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm transition-all hover:bg-[#20ba5a]">
                      <MessageCircle className="w-4 h-4" />واتساب
                    </a>
                  </div>
                </div>
              </motion.div>
              <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-all">
                <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080" alt="معرض الأسدي" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 right-6 left-6">
                  <h4 className="text-xl font-bold text-white mb-1">تفضل بزيارتنا</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-line">{settings.location}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="bg-[#080808] border-t border-[#d4af37]/10 py-14 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h3 className="text-3xl font-black text-[#d4af37] mb-2">{settings.title}</h3>
            <p className="text-gray-500 mb-8 text-sm">{settings.subtitle}</p>
            <div className="flex justify-center gap-4 mb-10">
              {[
                { href: settings.tiktok, icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg> },
                { href: settings.facebook, icon: <Facebook className="w-5 h-5" /> },
                { href: settings.instagram, icon: <Instagram className="w-5 h-5" /> },
              ].map(({ href, icon }, i) => (
                <motion.a key={i} href={href} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.15 }}
                  className="glass-card hover:bg-[#d4af37] hover:border-[#d4af37] p-4 rounded-full transition-all group text-[#d4af37] hover:text-black">
                  {icon}
                </motion.a>
              ))}
            </div>
            <div className="border-t border-[#d4af37]/10 pt-6">
              <p className="text-gray-600 text-sm select-none cursor-default" onClick={handleSecretTrigger}>
                © {new Date().getFullYear()} {settings.title} — جميع الحقوق محفوظة
              </p>
              {isAdmin && (
                <button onClick={() => { sessionStorage.removeItem("isAdmin"); setIsAdmin(false); setShowPanel(false); }}
                  className="mt-2 text-xs text-gray-700 hover:text-gray-500 transition-colors">
                  تسجيل خروج
                </button>
              )}
            </div>
          </div>
        </footer>

        {/* ── Lightbox ───────────────────────────────────── */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4" onClick={closeModal}>
              <button onClick={closeModal} className="absolute top-4 right-4 z-50 bg-[#d4af37] text-black p-3 rounded-full">
                <X className="w-5 h-5" />
              </button>
              <motion.img src={selectedImage} alt="عمل مميز"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                onClick={e => e.stopPropagation()}
                onTouchStart={e => { if (e.touches.length === 2) setLastTouchDistance(Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY)); }}
                onTouchMove={e => {
                  if (e.touches.length === 2) {
                    const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
                    setScale(prev => Math.max(1, Math.min(prev + (d - lastTouchDistance) * 0.01, 4)));
                    setLastTouchDistance(d);
                  }
                }}
                onWheel={e => { e.preventDefault(); setScale(prev => Math.max(1, Math.min(prev + (e.deltaY > 0 ? -0.1 : 0.1), 4))); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Admin Panel ────────────────────────────────── */}
        <AdminPanel
          open={showPanel}
          onClose={() => setShowPanel(false)}
          settings={settings}
          onSettingsChange={setSettings}
          galleryItems={galleryItems}
          onGalleryChange={handleGalleryChange}
          testimonials={testimonials}
          onTestimonialsChange={setTestimonials}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    </>
  );
}
