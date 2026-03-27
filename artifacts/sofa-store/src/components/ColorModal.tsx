import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Upload } from "lucide-react";
import { type CatalogColor } from "../lib/catalogsDb";

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Partial<CatalogColor>;
  onSave: (data: { name: string; code: string; image: string }) => Promise<void>;
  saving: boolean;
  colorCount: number;
}

const MAX_COLORS = 20;
const EMPTY = { name: "", code: "", image: "" };

export function ColorModal({ open, onClose, initial, onSave, saving, colorCount }: Props) {
  const [form, setForm] = useState(EMPTY);
  const isNew = !initial?.id;
  const limitReached = isNew && colorCount >= MAX_COLORS;

  useEffect(() => {
    if (open) {
      setForm(initial ? { name: initial.name ?? "", code: initial.code ?? "", image: initial.image ?? "" } : EMPTY);
    }
  }, [open, initial]);

  const set = (k: keyof typeof EMPTY, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set("image", reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" dir="rtl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
            className="relative w-full max-w-sm bg-[#0d0d0d] border border-[#d4af37]/30 rounded-2xl shadow-2xl z-10 overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#d4af37]/20 bg-[#111]">
              <h3 className="text-[#d4af37] font-black">
                {isNew ? "إضافة لون جديد" : "تعديل اللون"}
              </h3>
              {isNew && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${limitReached ? "bg-red-900/40 text-red-400" : "bg-[#1a1a1a] text-gray-400"}`}>
                  {colorCount} / {MAX_COLORS}
                </span>
              )}
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors mr-auto ms-3">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {limitReached ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">🚫</div>
                  <p className="text-red-400 font-bold text-lg mb-2">تم الوصول إلى الحد الأقصى</p>
                  <p className="text-gray-500 text-sm">(20 لون) لكل كتلوك</p>
                </div>
              ) : (
                <>
                  {/* Image */}
                  <div>
                    <p className="text-gray-400 text-xs mb-2">صورة اللون</p>
                    <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/20 aspect-square w-28 mx-auto bg-[#111] group">
                      {form.image
                        ? <img src={form.image} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-700 text-2xl">🎨</div>
                      }
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="w-5 h-5 text-[#d4af37]" />
                        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                      </label>
                    </div>
                    <div className="mt-2">
                      <input value={form.image.startsWith("data:") ? "" : form.image}
                        onChange={e => set("image", e.target.value)}
                        className={inp} placeholder="رابط الصورة..." dir="ltr" />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs block mb-1.5">اسم اللون *</label>
                    <input value={form.name} onChange={e => set("name", e.target.value)} className={inp} placeholder="مثال: بيج كريمي" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1.5">كود اللون *</label>
                    <input value={form.code} onChange={e => set("code", e.target.value)} className={inp} placeholder="مثال: BG-01" dir="ltr" />
                  </div>

                  <motion.button onClick={() => onSave(form)} disabled={saving || !form.name.trim() || !form.code.trim()}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#c9a02e] disabled:opacity-50 disabled:cursor-not-allowed text-black py-3 rounded-xl font-black transition-all">
                    <Save className="w-4 h-4" />
                    {saving ? "جاري الحفظ..." : (isNew ? "إضافة اللون" : "حفظ التعديل")}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const inp = "w-full bg-[#1a1a1a] border border-[#d4af37]/20 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#d4af37] transition-colors placeholder-gray-600 text-sm";
