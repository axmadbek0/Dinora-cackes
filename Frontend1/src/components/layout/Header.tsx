import React from 'react';
import { ShoppingBag, Cake, Clock, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTelegram } from '../../context/TelegramContext';
import { formatUZS } from '../../utils/formatters';

interface HeaderProps {
  onOpenCustomCake: () => void;
  onOpenOrdersTrack: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCustomCake,
  onOpenOrdersTrack,
  onNavigateSection,
}) => {
  const { totalCount, totalAmount, toggleCart } = useCart();
  const { user, isTelegram } = useTelegram();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#2B1810]/10 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => onNavigateSection('catalog')}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group shrink-0"
          >
            <img
              src="/carts/logotip.jpg"
              alt="DINORA Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform duration-300 border-2 border-[#CBB279] shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#2B1810] leading-none">
                  DINORA
                </span>
                <span className="hidden xs:inline-block text-[9px] sm:text-xs uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F8E7EA] text-[#D65B78] font-bold shrink-0">
                  Pastry & Art
                </span>
              </div>
              <p className="font-serif italic text-[10px] sm:text-xs text-[#CBB279] tracking-wide truncate max-w-[120px] sm:max-w-none mt-0.5">
                Ta'm san'at'a aylansa...
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs lg:text-sm font-semibold text-[#6B5B52]">
            <button
              onClick={() => onNavigateSection('catalog')}
              className="hover:text-[#D65B78] transition-colors py-1 border-b-2 border-transparent hover:border-[#D65B78]"
            >
              Katalog
            </button>
            <button
              onClick={onOpenCustomCake}
              className="hover:text-[#D65B78] transition-colors py-1 flex items-center space-x-1.5 text-[#2B1810] font-bold"
            >
              <Cake className="w-4 h-4 text-[#D65B78]" />
              <span>✨ O'zim xohlaganimdek</span>
            </button>
            <button
              onClick={() => onNavigateSection('location')}
              className="hover:text-[#D65B78] transition-colors py-1 flex items-center space-x-1 font-bold text-[#D65B78]"
            >
              <MapPin className="w-4 h-4 text-[#D65B78]" />
              <span>📍 Manzilimiz</span>
            </button>
            <button
              onClick={() => onNavigateSection('certificate')}
              className="hover:text-[#D65B78] transition-colors py-1"
            >
              Konditer Sertifikati
            </button>
            <button
              onClick={() => onNavigateSection('contact')}
              className="hover:text-[#D65B78] transition-colors py-1"
            >
              Bog'lanish
            </button>
          </nav>

          {/* Right Actions Group */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Telegram User Greeting Badge if TWA */}
            {isTelegram && user && (
              <div className="hidden xl:flex items-center space-x-2 bg-[#F8E7EA] px-3 py-1.5 rounded-full border border-[#D65B78]/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-semibold text-[#2B1810]">
                  {user.first_name}
                </span>
              </div>
            )}

            {/* Mobile Only: Location Shortcut Button */}
            <button
              onClick={() => onNavigateSection('location')}
              title="Sirdaryo tumani lokatsiyasi"
              className="md:hidden w-10 h-10 rounded-2xl bg-[#F8E7EA] text-[#D65B78] border border-[#D65B78]/30 active:scale-95 transition-transform shrink-0 flex items-center justify-center shadow-sm"
            >
              <MapPin className="w-5 h-5 text-[#D65B78]" />
            </button>

            {/* Mobile Only: Custom Cake Button */}
            <button
              onClick={onOpenCustomCake}
              title="O'zim xohlaganimdek tort"
              className="md:hidden w-10 h-10 rounded-2xl bg-[#F8E7EA] text-[#D65B78] border border-[#D65B78]/30 active:scale-95 transition-transform shrink-0 flex items-center justify-center shadow-sm"
            >
              <Cake className="w-5 h-5 text-[#D65B78]" />
            </button>

            {/* Order Tracking Button (Unified Desktop & Mobile) */}
            <button
              onClick={onOpenOrdersTrack}
              title="Buyurtmalarni kuzatish"
              className="w-10 h-10 sm:h-11 sm:w-11 rounded-2xl bg-white border border-[#2B1810]/10 text-[#6B5B52] hover:text-[#2B1810] hover:bg-[#F8E7EA] active:scale-95 transition-all shadow-sm shrink-0 flex items-center justify-center"
            >
              <Clock className="w-5 h-5" />
            </button>

            {/* Cart Trigger Button (Unified Desktop & Mobile) */}
            <button
              onClick={toggleCart}
              title="Savatcha"
              className="relative w-10 h-10 sm:h-11 sm:w-auto sm:px-4 rounded-2xl bg-[#2B1810] hover:bg-[#3D2318] text-[#FAF6F0] shadow-md hover:shadow-lg active:scale-95 transition-all border border-[#CBB279]/40 shrink-0 flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5 text-[#D65B78] shrink-0" />
              
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-[#CBB279] font-bold uppercase tracking-wider">
                  Savat
                </span>
                <span className="text-xs font-extrabold">
                  {formatUZS(totalAmount)}
                </span>
              </div>
              
              {/* Dynamic Badge Count */}
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:static bg-[#D65B78] text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border border-[#2B1810] sm:border-none animate-bounce shrink-0">
                  {totalCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
