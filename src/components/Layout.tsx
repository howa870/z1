import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, PlusCircle, LogOut, Menu, X, Store
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/products", label: "المنتجات", icon: Package },
  { href: "/products/add", label: "إضافة منتج", icon: PlusCircle },
];

interface Props {
  children: React.ReactNode;
}

export function Layout({ children }: Props) {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#d4af37]/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-[#d4af37]" />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-tight font-cairo">لوحة الإدارة</p>
            <p className="text-gray-500 text-xs truncate max-w-[120px]">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <button
                onClick={() => setMobileOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold font-cairo
                  ${active
                    ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#d4af37]/10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-bold font-cairo"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-cairo" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 right-0 h-full w-60 bg-[#0d0d0d] border-l border-[#d4af37]/10 flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-[#0d0d0d] border-b border-[#d4af37]/10 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-[#d4af37]" />
          <span className="text-white font-black text-sm font-cairo">لوحة الإدارة</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/70 z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="lg:hidden fixed top-0 right-0 h-full w-64 bg-[#0d0d0d] border-l border-[#d4af37]/10 z-50"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 left-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="lg:mr-60 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
