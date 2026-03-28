import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, PlusCircle, Trash2, Edit, Search, AlertCircle, Loader2
} from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useToast } from "../hooks/use-toast";

export default function Products() {
  const { products, loading, error, remove } = useProducts();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل تريد حذف "${name}"؟`)) return;
    setDeletingId(id);
    try {
      await remove(id);
      toast({ title: "تم الحذف", description: `تم حذف "${name}" بنجاح` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "فشل الحذف";
      toast({ title: "❌ خطأ", description: msg, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white font-cairo">المنتجات</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} منتج مسجل</p>
        </div>
        <Link href="/products/add">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#c9a02e] text-black px-5 py-2.5 rounded-xl font-black text-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            إضافة منتج
          </motion.button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-4 w-4 h-4 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="البحث في المنتجات..."
          className="w-full bg-[#0d0d0d] border border-[#d4af37]/15 text-white pr-11 pl-4 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/40 transition-colors placeholder-gray-600 text-sm"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold">فشل تحميل المنتجات</p>
            <p className="text-xs mt-0.5 text-red-400/70">{error}</p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[#d4af37]/60" />
          </div>
          <p className="text-white font-bold mb-1">
            {search ? "لا توجد نتائج" : "لا توجد منتجات"}
          </p>
          <p className="text-gray-600 text-sm mb-5">
            {search ? "جرب كلمات بحث مختلفة" : "ابدأ بإضافة منتجك الأول"}
          </p>
          {!search && (
            <Link href="/products/add">
              <button className="bg-[#d4af37] hover:bg-[#c9a02e] text-black px-5 py-2.5 rounded-xl font-black text-sm transition-all">
                إضافة أول منتج
              </button>
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="bg-[#0d0d0d] border border-[#d4af37]/10 hover:border-[#d4af37]/25 rounded-2xl overflow-hidden transition-all group"
              >
                {/* Image */}
                <div className="aspect-video bg-[#111] overflow-hidden">
                  {product.image
                    ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )
                    : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-700" />
                      </div>
                    )
                  }
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-black text-sm mb-1 truncate font-cairo">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[#d4af37] font-black text-sm font-cairo">
                      {product.price.toLocaleString("ar-IQ")} <span className="text-xs font-normal">د.ع</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/products/edit/${product.id}`}>
                        <button className="p-2 text-gray-500 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-all">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                      >
                        {deletingId === product.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
