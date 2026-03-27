import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, MessageCircle } from "lucide-react";
import { getSettings, type SiteSettings, DEFAULT_SETTINGS } from "../lib/db";

const COLORS = [
  { name: "أسود فاخر", hex: "#0a0a0a", bg: "#111", desc: "الكلاسيكية الأنيقة" },
  { name: "ذهبي ملكي", hex: "#d4af37", bg: "#1a1500", desc: "فخامة بلا حدود" },
  { name: "رمادي فاتح", hex: "#8a8a8a", bg: "#111", desc: "عصري وهادئ" },
  { name: "بيج كريمي", hex: "#f5f0e8", bg: "#1a1a12", desc: "دفء ونعومة" },
  { name: "بني داكن", hex: "#4a2c0a", bg: "#0d0800", desc: "طبيعي وأصيل" },
  { name: "كحلي عميق", hex: "#1a237e", bg: "#090c1f", desc: "راقٍ ومتميز" },
  { name: "أحمر ياقوتي", hex: "#8b0000", bg: "#1a0000", desc: "جرأة وشخصية" },
  { name: "أخضر زمردي", hex: "#006400", bg: "#001400", desc: "طازج ومبهج" },
  { name: "رمادي داكن", hex: "#333333", bg: "#111", desc: "أناقة محايدة" },
  { name: "أزرق سماوي", hex: "#1565c0", bg: "#091120", desc: "نقاء وهدوء" },
  { name: "بنفسجي ملكي", hex: "#6a0dad", bg: "#120a1a", desc: "فريد ومميز" },
  { name: "بيج ذهبي", hex: "#c8a96e", bg: "#1a1508", desc: "دفء وفخامة" },
  { name: "أبيض ثلجي", hex: "#f8f8f8", bg: "#1a1a1a", desc: "نقاء وأناقة" },
  { name: "تركوازي", hex: "#00808b", bg: "#001a1c", desc: "حديث ومنعش" },
  { name: "برتقالي دافئ", hex: "#c8621a", bg: "#1a0a00", desc: "دفء وحيوية" },
  { name: "وردي فاتح", hex: "#d4789c", bg: "#1a0c12", desc: "رقة وجمال" },
  { name: "زيتي داكن", hex: "#3d4a1e", bg: "#0a0d06", desc: "طبيعي وراقٍ" },
  { name: "ذهبي فاتح", hex: "#f0d060", bg: "#1a1600", desc: "إشراق وتألق" },
  { name: "نحاسي", hex: "#b87333", bg: "#18100a", desc: "دفء معدني" },
  { name: "فضي لامع", hex: "#c0c0c0", bg: "#111", desc: "بريق عصري" },
  { name: "أزرق سلاطيني", hex: "#1a4a7a", bg: "#090f1a", desc: "وقار وثقة" },
  { name: "بني رملي", hex: "#c2a06e", bg: "#1a1408", desc: "هادئ ودافئ" },
  { name: "أخضر نعناعي", hex: "#3aafa9", bg: "#031414", desc: "منعش وعصري" },
  { name: "أسود مخملي", hex: "#1c1c1c", bg: "#111", desc: "فخامة مطلقة" },
  { name: "كراميل فاتح", hex: "#d2956c", bg: "#1a0e00", desc: "حنين ودفء" },
  { name: "ليلكي هادئ", hex: "#9c7fc0", bg: "#10091a", desc: "رقي وتميز" },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function Colors() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(err => console.error("[Colors] خطأ في جلب الإعدادات:", err));
  }, []);

  const whatsappLink = `https://wa.me/${settings.whatsapp}${selected ? `?text=أريد%20طلب%20قنفة%20باللون%3A%20${encodeURIComponent(selected)}` : ""}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#d4af37]/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/">
            <motion.span whileHover={{ x: 4 }} className="flex items-center gap-2 text-[#d4af37] cursor-pointer hover:opacity-80 transition-opacity">
              <ArrowRight className="w-5 h-5" />رجوع
            </motion.span>
          </Link>
          <span className="text-[#d4af37] font-black text-xl">{settings.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-[#d4af37] tracking-widest text-sm uppercase mb-3">تشكيلتنا</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            ألوان <span className="text-[#d4af37]">فاخرة</span> لكل ذوق
          </h1>
          <div className="w-16 h-0.5 bg-[#d4af37] mx-auto mb-6" />
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            اختر من بين أكثر من {COLORS.length} لون فاخر — اضغط على أي لون لاختياره ثم اطلب عبر الواتساب
          </p>
          {selected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 inline-flex items-center gap-3 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl px-5 py-2.5">
              <div className="w-6 h-6 rounded-full border-2 border-white/20" style={{ backgroundColor: COLORS.find(c => c.name === selected)?.hex }} />
              <span className="text-[#d4af37] font-bold">اخترت: {selected}</span>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white transition-colors text-sm">✕</button>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-16">
          {COLORS.map((color, i) => (
            <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(color.name)}
              className={`group cursor-pointer transition-all duration-300 ${selected === color.name ? "scale-105" : ""}`}>
              <div className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl
                ${selected === color.name ? "border-[#d4af37] shadow-2xl shadow-[#d4af37]/30" : "border-[#d4af37]/10 hover:border-[#d4af37]/50"}`}
                style={{ backgroundColor: color.bg }}>
                {selected === color.name && (
                  <div className="absolute top-2 right-2 z-10 bg-[#d4af37] text-black text-xs font-bold px-1.5 py-0.5 rounded-full">✓</div>
                )}
                <div className="aspect-square flex items-center justify-center p-4">
                  <div className="w-16 h-16 rounded-full shadow-2xl border-2 border-white/10 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: color.hex }} />
                </div>
                <div className="px-3 pb-4 text-center">
                  <p className="text-white text-xs font-bold leading-tight">{color.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{color.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeIn} className="text-center">
          <div className="glass-card max-w-2xl mx-auto p-10 rounded-3xl">
            <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-[#25D366]" />
            </div>
            <h2 className="text-2xl font-black mb-3 text-white">
              {selected ? `اخترت: ${selected}` : "أعجبك لون؟"}
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              {selected
                ? "ممتاز! اضغط على الزر لإرسال طلبك مباشرة عبر الواتساب مع اسم اللون"
                : "اختر لوناً ثم تواصل معنا وسنجهز قنفتك أو ديوانك بهذا اللون الفاخر"}
            </p>
            <motion.a href={whatsappLink} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white px-12 py-4 rounded-xl font-black text-lg shadow-2xl shadow-green-500/20 transition-all">
              <MessageCircle className="w-5 h-5" />
              {selected ? "اطلب هذا اللون الآن" : "اطلب عبر الواتساب"}
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
