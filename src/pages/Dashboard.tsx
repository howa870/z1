import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Package, PlusCircle, TrendingUp, Database } from "lucide-react";
import { getProductsCount, fetchProducts, type Product } from "../services/products";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [count, setCount] = useState<number | null>(null);
  const [recent, setRecent] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, all] = await Promise.all([getProductsCount(), fetchProducts()]);
        setCount(c);
        setRecent(all.slice(0, 5));
      } catch (e) {
        console.error("[Dashboard]", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    {
      label: "إجمالي المنتجات",
      value: loading ? "—" : count?.toString() ?? "0",
      icon: Package,
      color: "text-[#d4af37]",
      bg: "bg-[#d4af37]/10",
      border: "border-[#d4af37]/20",
    },
    {
      label: "آخر إضافة",
      value: recent[0]
        ? new Date(recent[0].created_at).toLocaleDateString("ar-IQ")
        : "—",
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      label: "قاعدة البيانات",
      value: "Supabase",
      icon: Database,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-white font-cairo">
          مرحباً 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-[#0d0d0d] border ${stat.border} rounded-2xl p-5`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-xs font-medium">{stat.label}</span>
              <div className={`w-8 h-8 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-black ${stat.color} font-cairo`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/products/add">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 bg-[#d4af37] hover:bg-[#c9a02e] text-black px-5 py-4 rounded-xl font-black text-sm transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              إضافة منتج جديد
            </motion.button>
          </Link>
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 bg-[#1a1a1a] border border-[#d4af37]/20 hover:border-[#d4af37]/40 text-white px-5 py-4 rounded-xl font-black text-sm transition-all"
            >
              <Package className="w-5 h-5 text-[#d4af37]" />
              عرض جميع المنتجات
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      {recent.length > 0 && (
        <div>
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
            آخر المنتجات المضافة
          </h2>
          <div className="bg-[#0d0d0d] border border-[#d4af37]/10 rounded-2xl overflow-hidden">
            {recent.map((product, i) => (
              <div
                key={product.id}
                className={`flex items-center gap-4 px-5 py-4 ${i < recent.length - 1 ? "border-b border-[#d4af37]/5" : ""}`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                  {product.image
                    ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    : <Package className="w-5 h-5 text-gray-600 m-auto mt-2.5" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{product.name}</p>
                  <p className="text-gray-500 text-xs">{product.price.toLocaleString("ar-IQ")} د.ع</p>
                </div>
                <span className="text-gray-600 text-xs flex-shrink-0">
                  {new Date(product.created_at).toLocaleDateString("ar-IQ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
