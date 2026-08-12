import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatUZS } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingCartButton: React.FC = () => {
  const { totalCount, totalAmount, toggleCart } = useCart();

  if (totalCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 inset-x-4 sm:hidden z-30"
      >
        <button
          onClick={toggleCart}
          className="w-full bg-[#2B1810] text-[#FAF6F0] p-4 rounded-2xl shadow-dinora-glow flex items-center justify-between border-2 border-[#D4AF37] active:scale-98 transition-transform"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-[#D65B78]" />
              <span className="absolute -top-2 -right-2 bg-[#D65B78] text-white text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#2B1810]">
                {totalCount}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs text-[#CBB279] uppercase font-bold tracking-wider">
                Savatda {totalCount} ta mahsulot
              </p>
              <p className="text-base font-extrabold tracking-tight">
                {formatUZS(totalAmount)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 bg-[#D65B78] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow">
            <span>Savatga o'tish</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
