import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Image, MessageSquare, Share2, Save, Trash2, Upload, Plus, Phone, Database } from "lucide-react";
import { addGalleryItem, deleteGalleryItem, addTestimonial, deleteTestimonial, isSupabaseConfigured, type GalleryItem, type Testimonial, type SiteSettings } from "../lib/db";

interface Props {
  open: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onSettingsChange: (s: SiteSettings) => void;
  galleryItems: GalleryItem[];
  onGalleryChange: (items: GalleryItem[]) => void;
  testimonials: Testimonial[];
  onTestimonialsChange: (t: Testimonial[]) => void;
  onSave: () => void;
  saving: boolean;
}

type Tab = "general" | "gallery" | "testimonials" | "social" | "contact";

export function AdminPanel({ open, onClose, settings, onSettingsChange, galleryItems, onGalleryChange, testimonials, onTestimonialsChange, onSave, saving }: Props) {
  const [tab, setTab] = useState<Tab>("general");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryType, setNewGalleryType] = useState<"image" | "video">("image");
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [opLoading, setOpLoading] = useState(false);

  const set = (key: keyof SiteSettings, val: string) => onSettingsChange({ ...settings, [key]: val });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const isVideo = file.type.startsWith("video/");
      const item = await addGalleryItem({
        url: reader.result as string,
        type: isVideo ? "video" : "image",
        title: file.name.replace(/\.[^.]+$/, ""),
      });
      if (item) onGalleryChange([...galleryItems, item]);
      setUploadLoading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddFromUrl = async () => {
    if (!newGalleryUrl.trim()) return;
    setOpLoading(true);
    const item = await addGalleryItem({ url: newGalleryUrl.trim(), type: newGalleryType, title: newGalleryTitle || "عنصر جديد" });
    if (item) onGalleryChange([...galleryItems, item]);
    setNewGalleryUrl("");
    setNewGalleryTitle("");
    setOpLoading(false);
  };

  const handleDeleteGallery = async (id: number) => {
    if (!confirm("هل تريد حذف هذا العنصر؟")) return;
    const ok = await deleteGalleryItem(id);
    if (ok) onGalleryChange(galleryItems.filter(i => i.id !== id));
  };

  const handleAddTestimonial = async () => {
    if (!newComment.trim()) return;
    setOpLoading(true);
    const t = await addTestimonial({ rating: newRating, comment: newComment, image: "" });
    if (t) onTestimonialsChange([...testimonials, t]);
    setNewComment("");
    setNewRating(5);
    setOpLoading(false);
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm("هل تريد حذف هذا التعليق؟")) return;
    const ok = await deleteTestimonial(id);
    if (ok) onTestimonialsChange(testimonials.filter(t => t.id !== id));
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "general", label: "عام", icon: <Settings className="w-4 h-4" /> },
    { key: "gallery", label: "المعرض", icon: <Image className="w-4 h-4" /> },
    { key: "testimonials", label: "التقييمات", icon: <MessageSquare className="w-4 h-4" /> },
    { key: "social", label: "روابط", icon: <Share2 className="w-4 h-4" /> },
    { key: "contact", label: "تواصل", icon: <Phone className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150] flex" dir="rtl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80" onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute left-0 top-0 h-full w-full max-w-2xl bg-[#0d0d0d] border-r border-[#d4af37]/20 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#d4af37]/20 bg-[#111]">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#d4af37]">لوحة التحكم</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Database className="w-3 h-3" />
                    <span className={`text-xs ${isSupabaseConfigured ? "text-green-400" : "text-yellow-400"}`}>
                      {isSupabaseConfigured ? "Supabase متصل" : "localStorage (مؤقت)"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button onClick={onSave} disabled={saving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 bg-[#d4af37] hover:bg-[#c9a02e] text-black px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {saving ? "..." : "حفظ"}
                </motion.button>
                <button onClick={onClose} className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#d4af37]/10 bg-[#0d0d0d] overflow-x-auto">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${tab === t.key ? "text-[#d4af37] border-[#d4af37] bg-[#d4af37]/5" : "text-gray-500 border-transparent hover:text-gray-300"}`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* ── General ── */}
              {tab === "general" && (
                <>
                  <Section title="نصوص الموقع">
                    <Field label="اسم الموقع"><input value={settings.title} onChange={e => set("title", e.target.value)} className={inp} /></Field>
                    <Field label="الشعار / الوصف"><input value={settings.subtitle} onChange={e => set("subtitle", e.target.value)} className={inp} /></Field>
                    <Field label="نص زر الطلب"><input value={settings.button} onChange={e => set("button", e.target.value)} className={inp} /></Field>
                    <Field label="الموقع الجغرافي"><textarea value={settings.location} onChange={e => set("location", e.target.value)} className={`${inp} h-20 resize-none`} /></Field>
                  </Section>
                </>
              )}

              {/* ── Contact ── */}
              {tab === "contact" && (
                <Section title="معلومات الاتصال">
                  <Field label="رقم الواتساب (مع كود الدولة)">
                    <input value={settings.whatsapp} onChange={e => set("whatsapp", e.target.value)} className={inp} placeholder="9647881457896" dir="ltr" />
                  </Field>
                  <Field label="رقم الهاتف">
                    <input value={settings.phone} onChange={e => set("phone", e.target.value)} className={inp} placeholder="+9647881457896" dir="ltr" />
                  </Field>
                </Section>
              )}

              {/* ── Gallery ── */}
              {tab === "gallery" && (
                <>
                  <Section title="رفع من الجهاز">
                    <label className={`flex items-center justify-center gap-3 cursor-pointer border-2 border-dashed border-[#d4af37]/30 hover:border-[#d4af37] rounded-xl p-7 transition-all ${uploadLoading ? "opacity-50 pointer-events-none" : ""}`}>
                      <Upload className="w-6 h-6 text-[#d4af37]" />
                      <span className="text-gray-300 font-medium">{uploadLoading ? "جاري الرفع..." : "اختر صورة أو فيديو"}</span>
                      <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </Section>

                  <Section title="إضافة من رابط">
                    <Field label="الرابط"><input value={newGalleryUrl} onChange={e => setNewGalleryUrl(e.target.value)} className={inp} placeholder="https://..." dir="ltr" /></Field>
                    <Field label="العنوان"><input value={newGalleryTitle} onChange={e => setNewGalleryTitle(e.target.value)} className={inp} placeholder="عنوان العنصر" /></Field>
                    <div className="flex gap-2">
                      {(["image", "video"] as const).map(t => (
                        <button key={t} onClick={() => setNewGalleryType(t)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${newGalleryType === t ? "bg-[#d4af37] text-black" : "bg-[#1a1a1a] text-gray-400 border border-[#d4af37]/20"}`}>
                          {t === "image" ? "صورة" : "فيديو"}
                        </button>
                      ))}
                    </div>
                    <button onClick={handleAddFromUrl} disabled={opLoading}
                      className="w-full flex items-center justify-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/30 hover:bg-[#d4af37]/20 text-[#d4af37] py-3 rounded-xl font-medium transition-all disabled:opacity-50">
                      <Plus className="w-4 h-4" />{opLoading ? "جاري الإضافة..." : "إضافة للمعرض"}
                    </button>
                  </Section>

                  <Section title={`عناصر المعرض (${galleryItems.length})`}>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {galleryItems.length === 0 && <p className="text-gray-500 text-center py-4 text-sm">لا توجد عناصر</p>}
                      {galleryItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-[#1a1a1a] border border-[#d4af37]/10 rounded-xl p-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#0a0a0a]">
                            {item.type === "video"
                              ? <div className="w-full h-full flex items-center justify-center text-[#d4af37]">🎬</div>
                              : <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{item.title}</p>
                            <p className="text-gray-500 text-xs">{item.type === "video" ? "فيديو" : "صورة"}</p>
                          </div>
                          <button onClick={() => handleDeleteGallery(item.id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </Section>
                </>
              )}

              {/* ── Testimonials ── */}
              {tab === "testimonials" && (
                <>
                  <Section title="إضافة تقييم">
                    <Field label="التعليق">
                      <textarea value={newComment} onChange={e => setNewComment(e.target.value)} className={`${inp} h-24 resize-none`} placeholder="اكتب التعليق..." />
                    </Field>
                    <Field label="التقييم">
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} onClick={() => setNewRating(n)} className={`text-2xl transition-transform hover:scale-110 ${n <= newRating ? "text-[#d4af37]" : "text-gray-600"}`}>★</button>
                        ))}
                      </div>
                    </Field>
                    <button onClick={handleAddTestimonial} disabled={opLoading}
                      className="w-full flex items-center justify-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/30 hover:bg-[#d4af37]/20 text-[#d4af37] py-3 rounded-xl font-medium transition-all disabled:opacity-50">
                      <Plus className="w-4 h-4" />{opLoading ? "جاري الإضافة..." : "إضافة التقييم"}
                    </button>
                  </Section>

                  <Section title={`التقييمات (${testimonials.length})`}>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {testimonials.length === 0 && <p className="text-gray-500 text-center py-4 text-sm">لا توجد تقييمات</p>}
                      {testimonials.map(t => (
                        <div key={t.id} className="bg-[#1a1a1a] border border-[#d4af37]/10 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex gap-0.5 mb-1.5">
                                {[...Array(5)].map((_, i) => <span key={i} className={`text-sm ${i < t.rating ? "text-[#d4af37]" : "text-gray-700"}`}>★</span>)}
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed">"{t.comment}"</p>
                            </div>
                            <button onClick={() => handleDeleteTestimonial(t.id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-all flex-shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                </>
              )}

              {/* ── Social ── */}
              {tab === "social" && (
                <Section title="روابط التواصل الاجتماعي">
                  <Field label="TikTok"><input value={settings.tiktok} onChange={e => set("tiktok", e.target.value)} className={inp} placeholder="https://tiktok.com/@..." dir="ltr" /></Field>
                  <Field label="Facebook"><input value={settings.facebook} onChange={e => set("facebook", e.target.value)} className={inp} placeholder="https://facebook.com/..." dir="ltr" /></Field>
                  <Field label="Instagram"><input value={settings.instagram} onChange={e => set("instagram", e.target.value)} className={inp} placeholder="https://instagram.com/..." dir="ltr" /></Field>
                </Section>
              )}
            </div>

            <div className="p-4 border-t border-[#d4af37]/10 text-center">
              <p className="text-xs text-gray-700">قنفات ودواوين الأسدي — لوحة التحكم</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[#d4af37] font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-3 h-px bg-[#d4af37]" />{title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
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
