import React, { useState } from 'react';
import { ShoppingBag, Cake, Clock, MapPin, Menu, X, Award, Phone, Compass, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useTelegram } from '../../context/TelegramContext';
import { formatUZS } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageSelector } from './LanguageSelector';

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
  const { t } = useTranslation();
  const { totalCount, totalAmount, toggleCart } = useCart();
  const { user, isTelegram } = useTelegram();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
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
                  Ta'm san'atga aylansa...
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links (Visible on xl: >= 1280px) */}
            <nav className="hidden xl:flex items-center space-x-6 xl:space-x-8 text-xs xl:text-sm font-semibold text-[#6B5B52]">
              <button
                onClick={() => onNavigateSection('catalog')}
                className="hover:text-[#D65B78] transition-colors py-1 border-b-2 border-transparent hover:border-[#D65B78]"
              >
                {t('nav.catalog')}
              </button>
              <button
                onClick={onOpenCustomCake}
                className="hover:text-[#D65B78] transition-colors py-1 flex items-center space-x-1.5 text-[#2B1810] font-bold"
              >
                <Cake className="w-4 h-4 text-[#D65B78]" />
                <span>{t('nav.custom_cake')}</span>
              </button>
              <button
                onClick={() => onNavigateSection('location')}
                className="hover:text-[#D65B78] transition-colors py-1 flex items-center space-x-1 font-bold text-[#D65B78]"
              >
                <MapPin className="w-4 h-4 text-[#D65B78]" />
                <span>{t('nav.location')}</span>
              </button>
              <button
                onClick={() => onNavigateSection('certificate')}
                className="hover:text-[#D65B78] transition-colors py-1"
              >
                {t('nav.certificate')}
              </button>
              <button
                onClick={() => onNavigateSection('contact')}
                className="hover:text-[#D65B78] transition-colors py-1"
              >
                {t('nav.contact')}
              </button>
            </nav>

            {/* Right Actions Group */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              
              {/* Language Selector */}
              <LanguageSelector />

              {/* Telegram User Greeting Badge */}
              {isTelegram && user && (
                <div className="hidden 2xl:flex items-center space-x-2 bg-[#F8E7EA] px-3 py-1.5 rounded-full border border-[#D65B78]/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold text-[#2B1810]">
                    {user.first_name}
                  </span>
                </div>
              )}

              {/* Custom Cake Button (Visible on Tablets & iPad Pro) */}
              <button
                onClick={onOpenCustomCake}
                title={t('nav.custom_cake')}
                className="hidden sm:flex xl:hidden items-center space-x-1.5 px-3 py-2 rounded-2xl bg-[#F8E7EA] text-[#D65B78] border border-[#D65B78]/30 active:scale-95 transition-transform shrink-0 shadow-sm text-xs font-bold"
              >
                <Cake className="w-4 h-4 text-[#D65B78]" />
                <span>Custom Cake</span>
              </button>

              {/* Order Tracking Button */}
              <button
                onClick={onOpenOrdersTrack}
                title={t('nav.track')}
                className="w-10 h-10 sm:h-11 sm:w-11 rounded-2xl bg-white border border-[#2B1810]/10 text-[#6B5B52] hover:text-[#2B1810] hover:bg-[#F8E7EA] active:scale-95 transition-all shadow-sm shrink-0 flex items-center justify-center"
              >
                <Clock className="w-5 h-5" />
              </button>

              {/* Cart Trigger Button */}
              <button
                onClick={toggleCart}
                title={t('nav.cart')}
                className="relative w-10 h-10 sm:h-11 sm:w-auto sm:px-4 rounded-2xl bg-[#2B1810] hover:bg-[#3D2318] text-[#FAF6F0] shadow-md hover:shadow-lg active:scale-95 transition-all border border-[#CBB279]/40 shrink-0 flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5 text-[#D65B78] shrink-0" />
                
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-[10px] text-[#CBB279] font-bold uppercase tracking-wider">
                    {t('nav.cart')}
                  </span>
                  <span className="text-xs font-extrabold">
                    {formatUZS(totalAmount)}
                  </span>
                </div>
                
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 sm:static bg-[#D65B78] text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border border-[#2B1810] sm:border-none animate-bounce shrink-0">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* Mobile / iPad Hamburger Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="xl:hidden w-10 h-10 rounded-2xl bg-[#FAF6F0] border border-[#2B1810]/15 text-[#2B1810] flex items-center justify-center active:scale-95 transition-transform"
                aria-label={t('nav.menu')}
              >
                <Menu className="w-5 h-5" />
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile, iPad Mini & iPad Pro Slide-Out Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 xl:hidden flex">
            {/* Dark Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-in Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative ml-auto w-80 max-w-[85vw] bg-[#FAF6F0] h-full shadow-2xl z-10 flex flex-col justify-between p-6 border-l border-[#2B1810]/15 overflow-y-auto"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-[#2B1810]/10 pb-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <img
                      src="/carts/logotip.jpg"
                      alt="DINORA"
                      className="w-10 h-10 rounded-full border border-[#CBB279]"
                    />
                    <div>
                      <span className="font-serif font-bold text-lg text-[#2B1810] block">DINORA</span>
                      <span className="text-[10px] text-[#CBB279] font-bold">Pastry & Art</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-9 h-9 rounded-full bg-white text-[#2B1810] flex items-center justify-center border border-[#2B1810]/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Language Selector in Drawer */}
                <div className="mb-4">
                  <LanguageSelector />
                </div>

                {/* Nav Links List */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleNavClick(() => onNavigateSection('catalog'))}
                    className="w-full p-3.5 bg-white rounded-2xl border border-[#2B1810]/10 flex items-center justify-between font-bold text-sm text-[#2B1810] active:scale-95 transition-transform"
                  >
                    <div className="flex items-center space-x-3">
                      <Compass className="w-5 h-5 text-[#D65B78]" />
                      <span>{t('nav.catalog')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick(onOpenCustomCake)}
                    className="w-full p-3.5 bg-gradient-to-r from-[#2B1810] to-[#42261A] text-white rounded-2xl flex items-center justify-between font-bold text-sm border border-[#CBB279]/40 active:scale-95 transition-transform"
                  >
                    <div className="flex items-center space-x-3">
                      <Cake className="w-5 h-5 text-[#CBB279]" />
                      <span>{t('nav.custom_cake')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#CBB279]" />
                  </button>

                  <button
                    onClick={() => handleNavClick(() => onNavigateSection('location'))}
                    className="w-full p-3.5 bg-white rounded-2xl border border-[#2B1810]/10 flex items-center justify-between font-bold text-sm text-[#2B1810] active:scale-95 transition-transform"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-[#D65B78]" />
                      <span>{t('nav.location')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick(() => onNavigateSection('certificate'))}
                    className="w-full p-3.5 bg-white rounded-2xl border border-[#2B1810]/10 flex items-center justify-between font-bold text-sm text-[#2B1810] active:scale-95 transition-transform"
                  >
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-[#CBB279]" />
                      <span>{t('nav.certificate')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick(() => onNavigateSection('contact'))}
                    className="w-full p-3.5 bg-white rounded-2xl border border-[#2B1810]/10 flex items-center justify-between font-bold text-sm text-[#2B1810] active:scale-95 transition-transform"
                  >
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-emerald-600" />
                      <span>{t('nav.contact')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick(onOpenOrdersTrack)}
                    className="w-full p-3.5 bg-[#F8E7EA] rounded-2xl border border-[#D65B78]/20 flex items-center justify-between font-bold text-sm text-[#D65B78] active:scale-95 transition-transform mt-4"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-[#D65B78]" />
                      <span>{t('nav.track')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#D65B78]" />
                  </button>
                </div>
              </div>

              {/* Footer info inside Drawer */}
              <div className="pt-6 border-t border-[#2B1810]/10 text-center space-y-1">
                <p className="text-xs font-bold text-[#2B1810]">DINORA Shirinliklari</p>
                <p className="text-[11px] text-[#6B5B52]">Sirdaryo tumani, M34 ko'chasi 9-uy</p>
                <p className="text-[11px] font-semibold text-[#D65B78]">+998 99 495 78 06</p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};


