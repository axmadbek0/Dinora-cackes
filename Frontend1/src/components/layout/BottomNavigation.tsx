import React from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, Cake, ShoppingBag, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { triggerSelectionHaptic, triggerHaptic } from '../../utils/haptics';

interface BottomNavigationProps {
  onOpenCustomCake: () => void;
  onOpenOrdersTrack: () => void;
  onNavigateCatalog: () => void;
  activeSection?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onOpenCustomCake,
  onOpenOrdersTrack,
  onNavigateCatalog,
}) => {
  const { t } = useTranslation();
  const { totalCount, toggleCart } = useCart();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#2B1810]/10 shadow-[0_-4px_24px_rgba(43,24,16,0.08)] safe-area-bottom select-none"
      aria-label="Mobil Asosiy Menyu"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-2">
        {/* 1. Menyu / Katalog */}
        <button
          type="button"
          onClick={() => {
            triggerSelectionHaptic();
            onNavigateCatalog();
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 group transition-transform active:scale-95 touch-manipulation"
        >
          <div className="p-1.5 rounded-full text-[#6B5B52] group-hover:text-[#2B1810] group-hover:bg-[#FAF6F0] transition-colors">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-[#6B5B52] group-hover:text-[#2B1810] tracking-tight">
            {t('nav.menu')}
          </span>
        </button>

        {/* 2. Custom Cake (✨ O'zim xohlaganimdek) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            onOpenCustomCake();
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 group transition-transform active:scale-95 touch-manipulation"
        >
          <div className="p-1.5 rounded-full bg-[#F8E7EA] text-[#D65B78] shadow-sm border border-[#D65B78]/20 transition-colors">
            <Cake className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-extrabold text-[#D65B78] tracking-tight truncate max-w-[4.5rem]">
            {t('nav.custom_cake').replace('✨ ', '')}
          </span>
        </button>

        {/* 3. Savat (Cart) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            toggleCart();
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 group transition-transform active:scale-95 relative touch-manipulation"
        >
          <div className="p-1.5 rounded-full text-[#2B1810] bg-[#FAF6F0] border border-[#2B1810]/10 shadow-sm relative transition-colors">
            <ShoppingBag className="w-5 h-5 text-[#2B1810]" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D65B78] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-extrabold text-[#2B1810] tracking-tight">
            {t('nav.cart')}
          </span>
        </button>

        {/* 4. Buyurtmalar Kuzatuvi */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenOrdersTrack();
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 group transition-transform active:scale-95 touch-manipulation"
        >
          <div className="p-1.5 rounded-full text-[#6B5B52] group-hover:text-[#2B1810] group-hover:bg-[#FAF6F0] transition-colors">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-[#6B5B52] group-hover:text-[#2B1810] tracking-tight truncate max-w-[4.5rem]">
            {t('nav.track')}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavigation;
