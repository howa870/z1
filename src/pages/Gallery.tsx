import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Grid, LayoutGrid, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { getGallery, type GalleryItem } from "../lib/db";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [layout, setLayout] = useState<"grid" | "masonry">("grid");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getGallery();
        setItems(data);
      } catch (err) {
        console.error("[Gallery] خطأ في جلب البيانات:", err);
        setError("تعذّر تحميل المعرض. تحقق من الاتصال.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = filter === "all" ? items : items.filter(i => i.type === filter);

  const prev = () => {
    if (selected === null) return;
    const idx = filtered.findIndex(i => i.id === selected);
    if (idx > 0) setSelected(filtered[idx - 1].id);
  };
  const next = () => {
    if (selected === null) return;
    const idx = filtered.findIndex(i => i.id === selected);
    if (idx < filtered.length - 1) setSelected(filtered[idx + 1].id);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selected === null) return;
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, filtered]);

  const selectedItem = filtered.find(i => i.id === selected);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#d4af37]/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/">
            <span className="text-[#d4af37] font-black text-xl cursor-pointer hover:opacity-80 transition-opacity">قنفات ودواوين الأسدي</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#1a1a1a] rounded-xl p-1">
              {(["all", "image", "video"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-[#d4af37] text-black" : "text-gray-400 hover:text-white"}`}>
                  {f === "all" ? "الكل" : f === "image" ? "صور" : "فيديو"}
                </button>
              ))}
            </div>
            <button onClick={() => setLayout(l => l === "grid" ? "masonry" : "grid")}
              className="text-[#d4af37] border border-[#d4af37]/30 p-2 rounded-xl hover:bg-[#d4af37]/10 transition-all">
              {layout === "grid" ? <LayoutGrid className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-[#d4af37] tracking-widest text-sm uppercase mb-3">أعمالنا</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">المعرض <span className="text-[#d4af37]">الكامل</span></h1>
          <div className="w-16 h-0.5 bg-[#d4af37] mx-auto mb-4" />
          {!loading && <p className="text-gray-400">{filtered.length} عنصر</p>}
        </motion.div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-28 text-gray-500 gap-4">
            <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
            <p>جاري تحميل المعرض...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20 text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20 mx-4">
            <p className="text-lg font-bold mb-2">⚠️ خطأ في التحميل</p>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">لا توجد عناصر في هذه الفئة</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className={`grid gap-5 ${layout === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {filtered.map((item, i) => (
              <motion.div key={item.id} {...fadeIn} transition={{ delay: i * 0.06 }}
                onClick={() => setSelected(item.id)}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer border border-[#d4af37]/10 hover:border-[#d4af37]/40 transition-all duration-500 ${layout === "masonry" && i % 3 === 1 ? "row-span-2" : ""}`}>
                <div className={`relative ${layout === "masonry" && i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
                  {item.type === "video"
                    ? <video src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" muted loop playsInline />
                    : <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex items-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div>
                      <p className="text-white font-bold">{item.title}</p>
                      <span className="text-[#d4af37] text-xs">{item.type === "video" ? "🎬 فيديو" : "🖼️ صورة"}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-[#d4af37] text-black text-xs font-bold px-2.5 py-1 rounded-full">{i + 1}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected !== null && selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center" onClick={() => setSelected(null)}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 z-50 bg-[#d4af37] text-black p-3 rounded-full shadow-xl hover:bg-[#c9a02e]">
              <X className="w-5 h-5" />
            </button>
            {filtered.findIndex(i => i.id === selected) > 0 && (
              <button onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] p-3 rounded-full hover:bg-[#d4af37]/20 transition-all z-50">
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
            {filtered.findIndex(i => i.id === selected) < filtered.length - 1 && (
              <button onClick={e => { e.stopPropagation(); next(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] p-3 rounded-full hover:bg-[#d4af37]/20 transition-all z-50">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <motion.div key={selected} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              className="relative max-w-5xl w-full mx-4 md:mx-16" onClick={e => e.stopPropagation()}>
              {selectedItem.type === "video"
                ? <video src={selectedItem.url} className="w-full max-h-[80vh] object-contain rounded-2xl" controls autoPlay />
                : <img src={selectedItem.url} alt={selectedItem.title} className="w-full max-h-[80vh] object-contain rounded-2xl" />
              }
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
                <p className="text-white font-bold text-lg">{selectedItem.title}</p>
                <p className="text-gray-400 text-sm">{filtered.findIndex(i => i.id === selected) + 1} / {filtered.length}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
