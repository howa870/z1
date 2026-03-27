import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-[500] bg-black/80 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full"
      />
    </div>
  );
}
