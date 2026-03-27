import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Upload, Loader2 } from "lucide-react";
import { type Catalog } from "../lib/catalogsDb";
import { uploadImage } from "../lib/storage";

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Catalog>;
  onSave: (data: Omit<Catalog, "id" | "created_at">) => Promise<void>;
  saving: boolean;
  totalCatalogs: number;
}

const EMPTY: Omit<Catalog, "id" | "created_at"> = {
  name: "",
  fabric_type: "",
  warranty: "",
  image: "",
};

export function CatalogModal({ open, onClose, initial, onSave, saving, totalCatalogs }: Props) {
  const [form, setForm] = useState<Omit<Catalog, "id" | "created_at">>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const isNew = !initial?.id;

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { name: initial.name ?? "", fabric_type: initial.fabric_type ?? "", warranty: initial.warranty ?? "", image: initial.image ?? "" }
        : EMPTY
      );
      setUploadMsg(null);
    }
  }, [open, initial]);

  const set = (k: keyof typeof EMPTY, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    setUploadMsg(null);
    try {
      const url = await uploadImage(file);
      set("image", url);
      setUploadMsg({ type: "success", text: "تم رفع الصورة بنجاح ✓" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      console.error("[CatalogModal] فشل رفع الصورة:", msg);
      setUploadMsg({ type: "error", text: `فشل الرفع: ${msg}` });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    await onSave(form);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
            className="relative w-full max-w-md bg-[#0d0d0d] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden z-10">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4af37]/20 bg-[#111]">
              <h2 className="text-[#d4af37] font-black text-lg">
                {isNew ? "إضافة كتلوك جديد" : "تعديل الكتلوك"}
              </h2>
              {isNew && (
                <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-1 rounded-full">
                  {totalCatalogs} / 24
                </span>
              )}
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors mr-auto ms-3">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image */}
              <div>
                <p className="text-gray-400 text-xs mb-2">صورة الكتلوك</p>
                <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/20 aspect-video bg-[#111] group">
                  {form.image
                    ? <img src={form.image} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-700 text-sm">لا توجد صورة</div>
                  }
                  <label className={`absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity cursor-pointer ${uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <div className="flex flex-col items-center gap-1 text-[#d4af37]">
                      {uploading
                        ? <><Loader2 className="w-6 h-6 animate-spin" /><span className="text-xs font-bold">جاري الرفع...</span></>
                        : <><Upload className="w-6 h-6" /><span className="text-xs font-bold">رفع صورة</span></>
                      }
                    </div>
                    <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
                  </label>
                </div>

                {/* Upload status */}
                {uploadMsg && (
                  <p className={`text-xs mt-1.5 ${uploadMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
                    {uploadMsg.text}
                  </p>
                )}

                <div className="mt-2">
                  <input
                    value={form.image.startsWith("http") ? form.image : ""}
                    onChange={e => set("image", e.target.value)}
                    className={inp}
                    placeholder="أو أدخل رابط الصورة..."
                    dir="ltr"
                  />
                </div>
              </div>

              <Field label="اسم الكتلوك *">
                <input value={form.name} onChange={e => set("name", e.target.value)} className={inp} placeholder="مثال: كتلوك A - مخمل" />
              </Field>
              <Field label="نوع القماش">
                <input value={form.fabric_type} onChange={e => set("fabric_type", e.target.value)} className={inp} placeholder="مثال: مخمل فاخر" />
              </Field>
              <Field label="الضمان">
                <input value={form.warranty} onChange={e => set("warranty", e.target.value)} className={inp} placeholder="مثال: ضمان سنة" />
              </Field>

              <motion.button
                onClick={handleSubmit}
                disabled={saving || uploading || !form.name.trim()}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#c9a02e] disabled:opacity-50 disabled:cursor-not-allowed text-black py-3 rounded-xl font-black text-base transition-all mt-2">
                <Save className="w-4 h-4" />
                {saving ? "جاري الحفظ..." : (isNew ? "إضافة الكتلوك" : "حفظ التعديلات")}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-gray-400 text-xs block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full bg-[#1a1a1a] border border-[#d4af37]/20 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#d4af37] transition-colors placeholder-gray-600 text-sm";
