import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight, Plus, Pencil, Trash2, BookOpen, Loader2,
  ChevronRight, X, CheckCircle, AlertCircle, Palette
} from "lucide-react";
import {
  getCatalogs, addCatalog, updateCatalog, deleteCatalog,
  getColorsByCatalog, addColor, updateColor, deleteColor,
  type Catalog, type CatalogColor,
} from "../lib/catalogsDb";
import { getSettings, DEFAULT_SETTINGS, type SiteSettings } from "../lib/db";
import { CatalogModal } from "../components/CatalogModal";
import { ColorModal } from "../components/ColorModal";

const MAX_CATALOGS = 24;
const MAX_COLORS = 20;

type Toast = { msg: string; ok: boolean };

export default function Catalogs() {
  // ── Auth ──────────────────────────────────────────────
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  // ── State ─────────────────────────────────────────────
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [colors, setColors] = useState<Record<number, CatalogColor[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [loadingColors, setLoadingColors] = useState(false);

  // Modals
  const [catalogModal, setCatalogModal] = useState<{ open: boolean; initial?: Partial<Catalog> }>({ open: false });
  const [colorModal, setColorModal] = useState<{ open: boolean; initial?: Partial<CatalogColor> }>({ open: false });
  const [saving, setSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState<Toast | null>(null);
  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<{ type: "catalog" | "color"; id: number; name: string } | null>(null);

  // ── Load ──────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, c] = await Promise.all([getSettings(), getCatalogs()]);
        setSettings(s);
        setCatalogs(c);
      } catch {
        setError("تعذّر تحميل البيانات. تحقق من الاتصال بـ Supabase.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openCatalog = useCallback(async (cat: Catalog) => {
    setSelectedCatalog(cat);
    if (colors[cat.id]) return;
    setLoadingColors(true);
    try {
      const c = await getColorsByCatalog(cat.id);
      setColors(prev => ({ ...prev, [cat.id]: c }));
    } catch {
      showToast("فشل في جلب الألوان", false);
    } finally {
      setLoadingColors(false);
    }
  }, [colors, showToast]);

  // ── Catalog CRUD ──────────────────────────────────────
  const handleSaveCatalog = async (data: Omit<Catalog, "id" | "created_at">) => {
    setSaving(true);
    if (catalogModal.initial?.id) {
      const ok = await updateCatalog(catalogModal.initial.id, data);
      if (ok) {
        setCatalogs(prev => prev.map(c => c.id === catalogModal.initial!.id ? { ...c, ...data } : c));
        if (selectedCatalog?.id === catalogModal.initial.id) setSelectedCatalog(prev => prev ? { ...prev, ...data } : prev);
        showToast("تم تحديث الكتلوك ✅");
      } else showToast("فشل التحديث", false);
    } else {
      if (catalogs.length >= MAX_CATALOGS) { showToast("وصلت للحد الأقصى (24 كتلوك)", false); setSaving(false); return; }
      const added = await addCatalog(data);
      if (added) { setCatalogs(prev => [...prev, added]); showToast("تمت إضافة الكتلوك ✅"); }
      else showToast("فشلت الإضافة", false);
    }
    setSaving(false);
    setCatalogModal({ open: false });
  };

  const handleDeleteCatalog = async (id: number) => {
    setConfirmDelete(null);
    const ok = await deleteCatalog(id);
    if (ok) {
      setCatalogs(prev => prev.filter(c => c.id !== id));
      setColors(prev => { const n = { ...prev }; delete n[id]; return n; });
      if (selectedCatalog?.id === id) setSelectedCatalog(null);
      showToast("تم حذف الكتلوك ✅");
    } else showToast("فشل الحذف", false);
  };

  // ── Color CRUD ────────────────────────────────────────
  const handleSaveColor = async (data: { name: string; code: string; image: string }) => {
    if (!selectedCatalog) return;
    setSaving(true);
    const catColors = colors[selectedCatalog.id] ?? [];

    if (colorModal.initial?.id) {
      const ok = await updateColor(colorModal.initial.id, data);
      if (ok) {
        setColors(prev => ({
          ...prev,
          [selectedCatalog.id]: catColors.map(c => c.id === colorModal.initial!.id ? { ...c, ...data } : c),
        }));
        showToast("تم تحديث اللون ✅");
      } else showToast("فشل التحديث", false);
    } else {
      if (catColors.length >= MAX_COLORS) { showToast("الحد الأقصى 20 لون لكل كتلوك", false); setSaving(false); return; }
      const added = await addColor({ catalog_id: selectedCatalog.id, ...data });
      if (added) {
        setColors(prev => ({ ...prev, [selectedCatalog.id]: [...catColors, added] }));
        showToast("تمت إضافة اللون ✅");
      } else showToast("فشلت الإضافة", false);
    }
    setSaving(false);
    setColorModal({ open: false });
  };

  const handleDeleteColor = async (id: number) => {
    if (!selectedCatalog) return;
    setConfirmDelete(null);
    const ok = await deleteColor(id);
    if (ok) {
      setColors(prev => ({ ...prev, [selectedCatalog.id]: (prev[selectedCatalog.id] ?? []).filter(c => c.id !== id) }));
      showToast("تم حذف اللون ✅");
    } else showToast("فشل الحذف", false);
  };

  const catColors = selectedCatalog ? (colors[selectedCatalog.id] ?? []) : [];

  // ── Render ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
          <p>جاري تحميل الكتلوكات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">
      {/* ── Toast ─────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-2xl text-sm ${toast.ok ? "bg-green-700 text-white" : "bg-red-700 text-white"}`}>
            {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete confirm ────────────────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[280] flex items-center justify-center p-4" dir="rtl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 bg-[#111] border border-red-500/30 rounded-2xl p-7 max-w-sm w-full text-center">
              <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <p className="font-bold text-lg mb-1">هل أنت متأكد؟</p>
              <p className="text-gray-400 text-sm mb-6">
                سيتم حذف <span className="text-white font-bold">"{confirmDelete.name}"</span> نهائياً
                {confirmDelete.type === "catalog" && " مع جميع ألوانه"}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-[#1a1a1a] border border-[#d4af37]/20 text-gray-300 py-2.5 rounded-xl font-bold hover:bg-[#222] transition-all">
                  إلغاء
                </button>
                <button onClick={() => confirmDelete.type === "catalog" ? handleDeleteCatalog(confirmDelete.id) : handleDeleteColor(confirmDelete.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold transition-all">
                  حذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Header ────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#d4af37]/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <motion.span whileHover={{ x: 4 }} className="flex items-center gap-1.5 text-[#d4af37] cursor-pointer hover:opacity-80 transition-opacity text-sm">
                <ArrowRight className="w-4 h-4" />رجوع
              </motion.span>
            </Link>
            <span className="text-gray-700">|</span>
            <h1 className="text-[#d4af37] font-black text-lg">كتلوكات الأقمشة</h1>
          </div>
          {isAdmin && !selectedCatalog && (
            <motion.button
              onClick={() => { if (catalogs.length >= MAX_CATALOGS) { showToast("وصلت للحد الأقصى (24 كتلوك)", false); return; } setCatalogModal({ open: true }); }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#c9a02e] text-black px-4 py-2 rounded-xl font-bold text-sm transition-all">
              <Plus className="w-4 h-4" />
              إضافة كتلوك
              <span className="text-xs opacity-60">({catalogs.length}/{MAX_CATALOGS})</span>
            </motion.button>
          )}
          {isAdmin && selectedCatalog && (
            <motion.button
              onClick={() => {
                const count = catColors.length;
                if (count >= MAX_COLORS) { showToast("تم الوصول إلى الحد الأقصى (20 لون)", false); return; }
                setColorModal({ open: true });
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#c9a02e] text-black px-4 py-2 rounded-xl font-bold text-sm transition-all">
              <Plus className="w-4 h-4" />
              إضافة لون
              <span className="text-xs opacity-60">({catColors.length}/{MAX_COLORS})</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────── */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* ── Breadcrumb ────────────────────────────────── */}
      {selectedCatalog && (
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setSelectedCatalog(null)} className="text-[#d4af37] hover:underline">الكتلوكات</button>
            <ChevronRight className="w-4 h-4 text-gray-600 rotate-180" />
            <span className="text-gray-300">{selectedCatalog.name}</span>
            {isAdmin && (
              <span className={`mr-2 text-xs px-2 py-0.5 rounded-full ${catColors.length >= MAX_COLORS ? "bg-red-900/40 text-red-400" : "bg-[#1a1a1a] text-gray-500"}`}>
                {catColors.length}/{MAX_COLORS} لون
              </span>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Catalog Grid ─────────────────────────── */}
        {!selectedCatalog && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
              <p className="text-[#d4af37] tracking-widest text-sm uppercase mb-2">تشكيلتنا</p>
              <h2 className="text-3xl md:text-4xl font-black mb-3">كتلوكات <span className="text-[#d4af37]">الأقمشة الفاخرة</span></h2>
              <div className="w-12 h-0.5 bg-[#d4af37] mx-auto mb-3" />
              <p className="text-gray-400 text-sm">{catalogs.length} كتلوك متاح</p>
            </motion.div>

            {catalogs.length === 0 && !error && (
              <div className="text-center py-20 text-gray-600">
                <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium mb-1">لا توجد كتلوكات بعد</p>
                {isAdmin && <p className="text-sm">اضغط على "إضافة كتلوك" لإنشاء أول كتلوك</p>}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {catalogs.map((cat, i) => (
                <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="group relative bg-[#0d0d0d] border border-[#d4af37]/15 hover:border-[#d4af37]/50 rounded-2xl overflow-hidden transition-all duration-400 hover:shadow-2xl hover:shadow-[#d4af37]/5">

                  {/* Image */}
                  <div className="aspect-[4/3] bg-[#111] overflow-hidden">
                    {cat.image
                      ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-[#d4af37]/20" />
                        </div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-black text-white text-base mb-1">{cat.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cat.fabric_type && <span className="text-xs bg-[#d4af37]/10 text-[#d4af37] px-2 py-0.5 rounded-full">{cat.fabric_type}</span>}
                      {cat.warranty && <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">{cat.warranty}</span>}
                    </div>
                    <button onClick={() => openCatalog(cat)}
                      className="w-full flex items-center justify-center gap-2 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/20 hover:border-[#d4af37]/50 text-[#d4af37] py-2 rounded-xl text-sm font-bold transition-all">
                      <Palette className="w-4 h-4" />
                      عرض الألوان
                    </button>
                  </div>

                  {/* Admin actions */}
                  {isAdmin && (
                    <div className="absolute top-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); setCatalogModal({ open: true, initial: cat }); }}
                        className="bg-[#d4af37] text-black p-2 rounded-lg shadow-lg hover:bg-[#c9a02e] transition-colors" title="تعديل">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDelete({ type: "catalog", id: cat.id, name: cat.name }); }}
                        className="bg-red-600 text-white p-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors" title="حذف">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Add placeholder */}
              {isAdmin && catalogs.length < MAX_CATALOGS && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => setCatalogModal({ open: true })}
                  className="bg-[#0d0d0d] border-2 border-dashed border-[#d4af37]/20 hover:border-[#d4af37]/50 rounded-2xl aspect-auto min-h-[200px] flex flex-col items-center justify-center gap-3 text-[#d4af37]/40 hover:text-[#d4af37]/70 transition-all group">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold">إضافة كتلوك</span>
                </motion.button>
              )}
            </div>
          </>
        )}

        {/* ── Colors Detail View ─────────────────────── */}
        {selectedCatalog && (
          <div>
            {/* Catalog info banner */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8 p-5 bg-[#0d0d0d] border border-[#d4af37]/20 rounded-2xl">
              {selectedCatalog.image && (
                <img src={selectedCatalog.image} alt={selectedCatalog.name} className="w-20 h-16 object-cover rounded-xl border border-[#d4af37]/20" />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-black text-[#d4af37]">{selectedCatalog.name}</h2>
                <div className="flex flex-wrap gap-3 mt-1.5">
                  {selectedCatalog.fabric_type && <span className="text-xs text-gray-400">القماش: <span className="text-white">{selectedCatalog.fabric_type}</span></span>}
                  {selectedCatalog.warranty && <span className="text-xs text-gray-400">الضمان: <span className="text-white">{selectedCatalog.warranty}</span></span>}
                  <span className="text-xs text-gray-400">الألوان: <span className={catColors.length >= MAX_COLORS ? "text-red-400 font-bold" : "text-white"}>{catColors.length}/{MAX_COLORS}</span></span>
                </div>
              </div>
              {isAdmin && (
                <button onClick={() => setCatalogModal({ open: true, initial: selectedCatalog })}
                  className="flex items-center gap-1.5 border border-[#d4af37]/30 hover:border-[#d4af37] text-[#d4af37] px-3 py-2 rounded-xl text-sm font-bold transition-all hover:bg-[#d4af37]/5">
                  <Pencil className="w-3.5 h-3.5" /> تعديل الكتلوك
                </button>
              )}
            </motion.div>

            {/* Colors grid */}
            {loadingColors ? (
              <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
                <Loader2 className="w-6 h-6 text-[#d4af37] animate-spin" />
                <span>جاري تحميل الألوان...</span>
              </div>
            ) : (
              <>
                {catColors.length === 0 && (
                  <div className="text-center py-20 text-gray-600">
                    <Palette className="w-14 h-14 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-1">لا توجد ألوان بعد</p>
                    {isAdmin && <p className="text-sm">اضغط "إضافة لون" لإضافة أول لون</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {catColors.map((color, i) => (
                    <motion.div key={color.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                      className="group relative bg-[#0d0d0d] border border-[#d4af37]/15 hover:border-[#d4af37]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#d4af37]/5">

                      {/* Color image */}
                      <div className="aspect-square bg-[#111] overflow-hidden">
                        {color.image
                          ? <img src={color.image} alt={color.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                                <span className="text-[#d4af37] text-lg">🎨</span>
                              </div>
                            </div>
                        }
                      </div>

                      {/* Color info */}
                      <div className="p-3">
                        <p className="text-white text-sm font-bold truncate">{color.name}</p>
                        <p className="text-[#d4af37] text-xs font-mono mt-0.5" dir="ltr">{color.code}</p>
                      </div>

                      {/* Admin actions */}
                      {isAdmin && (
                        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setColorModal({ open: true, initial: color })}
                            className="bg-[#d4af37] text-black p-1.5 rounded-lg hover:bg-[#c9a02e] transition-colors shadow-lg" title="تعديل">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => setConfirmDelete({ type: "color", id: color.id, name: color.name })}
                            className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 transition-colors shadow-lg" title="حذف">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Add color placeholder */}
                  {isAdmin && catColors.length < MAX_COLORS && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      onClick={() => setColorModal({ open: true })}
                      className="bg-[#0d0d0d] border-2 border-dashed border-[#d4af37]/20 hover:border-[#d4af37]/50 rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 text-[#d4af37]/40 hover:text-[#d4af37]/70 transition-all group">
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold">إضافة لون</span>
                    </motion.button>
                  )}

                  {/* Limit reached */}
                  {catColors.length >= MAX_COLORS && isAdmin && (
                    <div className="bg-red-900/10 border border-red-500/20 rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 text-red-400/60">
                      <X className="w-8 h-8" />
                      <span className="text-xs font-bold text-center px-2">الحد الأقصى (20 لون)</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────── */}
      <CatalogModal
        open={catalogModal.open}
        onClose={() => setCatalogModal({ open: false })}
        initial={catalogModal.initial}
        onSave={handleSaveCatalog}
        saving={saving}
        totalCatalogs={catalogs.length}
      />

      <ColorModal
        open={colorModal.open}
        onClose={() => setColorModal({ open: false })}
        initial={colorModal.initial}
        onSave={handleSaveColor}
        saving={saving}
        colorCount={catColors.length}
      />
    </div>
  );
}
