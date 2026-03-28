import { useState, useEffect, FormEvent } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { Save, ArrowRight, Loader2 } from "lucide-react";
import { createProduct, updateProduct, fetchProductById, type ProductInput } from "../services/products";
import { ImageUpload } from "../components/ImageUpload";
import { useToast } from "../hooks/use-toast";

const EMPTY: ProductInput = {
  name: "",
  description: "",
  price: 0,
  image: "",
};

export default function AddProduct() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEdit = Boolean(params.id);

  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !params.id) return;
    (async () => {
      console.log(`[AddProduct] جاري تحميل المنتج #${params.id}`);
      const product = await fetchProductById(Number(params.id));
      if (product) {
        setForm({
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
        });
      } else {
        toast({ title: "❌ خطأ", description: "المنتج غير موجود", variant: "destructive" });
        navigate("/products");
      }
      setLoadingProduct(false);
    })();
  }, [params.id, isEdit, navigate, toast]);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm(p => ({ ...p, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "تنبيه", description: "يرجى إدخال اسم المنتج", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (isEdit && params.id) {
        await updateProduct(Number(params.id), form);
        toast({ title: "✅ تم الحفظ", description: "تم تحديث المنتج بنجاح" });
      } else {
        await createProduct(form);
        toast({ title: "✅ تمت الإضافة", description: `تم إضافة "${form.name}" بنجاح` });
        setForm(EMPTY);
      }
      navigate("/products");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "فشل الحفظ";
      console.error("[AddProduct] ❌", msg);
      toast({ title: "❌ فشل الحفظ", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/products")}
          className="w-9 h-9 flex items-center justify-center bg-[#0d0d0d] border border-[#d4af37]/20 hover:border-[#d4af37]/40 rounded-xl text-gray-400 hover:text-white transition-all"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white font-cairo">
            {isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? "قم بتعديل بيانات المنتج" : "أدخل بيانات المنتج الجديد"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#0d0d0d] border border-[#d4af37]/15 rounded-2xl p-6 space-y-5">
        {/* Image */}
        <div>
          <label className="block text-gray-400 text-xs mb-2">صورة المنتج</label>
          <ImageUpload
            value={form.image}
            onChange={url => set("image", url)}
            disabled={saving}
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-gray-400 text-xs mb-2">
            اسم المنتج <span className="text-red-400">*</span>
          </label>
          <input
            value={form.name}
            onChange={e => set("name", e.target.value)}
            placeholder="مثال: كنبة مخمل فاخر"
            disabled={saving}
            className={inp}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-400 text-xs mb-2">الوصف</label>
          <textarea
            value={form.description}
            onChange={e => set("description", e.target.value)}
            placeholder="وصف تفصيلي للمنتج..."
            rows={3}
            disabled={saving}
            className={`${inp} resize-none`}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-gray-400 text-xs mb-2">السعر (دينار عراقي)</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1000"
              value={form.price || ""}
              onChange={e => set("price", Number(e.target.value))}
              placeholder="0"
              dir="ltr"
              disabled={saving}
              className={`${inp} pl-14`}
            />
            <span className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-500 text-xs font-bold">
              د.ع
            </span>
          </div>
          {form.price > 0 && (
            <p className="text-[#d4af37] text-xs mt-1.5">
              {form.price.toLocaleString("ar-IQ")} دينار عراقي
            </p>
          )}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={saving}
          whileHover={{ scale: saving ? 1 : 1.02 }}
          whileTap={{ scale: saving ? 1 : 0.98 }}
          className="w-full flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#c9a02e] disabled:opacity-60 disabled:cursor-not-allowed text-black py-3.5 rounded-xl font-black text-sm transition-all mt-2"
        >
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" />جاري الحفظ...</>
            : <><Save className="w-4 h-4" />{isEdit ? "حفظ التعديلات" : "إضافة المنتج"}</>
          }
        </motion.button>
      </form>
    </div>
  );
}

const inp = "w-full bg-[#1a1a1a] border border-[#d4af37]/20 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder-gray-600 text-sm disabled:opacity-50";
