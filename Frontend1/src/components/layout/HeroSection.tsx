import React from 'react';
import { Sparkles, Cake, ChevronRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  onOpenCustomCake: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCustomCake,
  onNavigateSection,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF6F0] via-[#F8E7EA]/40 to-[#FAF6F0] py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#2B1810]/5">
      {/* Decorative Gold & Berry Glow Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#D4AF37]/10 via-[#D65B78]/10 to-[#CBB279]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Column Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-6 text-center lg:text-left"
        >
          {/* Top Brand Pill */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#CBB279]/40 shadow-sm text-xs font-bold text-[#2B1810]">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="gold-gradient-text uppercase tracking-wider">
              Premium Pastry & Art Bakery
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D65B78]" />
            <span className="text-[#6B5B52]">Telegram Storefront</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-[#2B1810] tracking-tight leading-[1.15]">
            <span className="block">Ta'm san'at'a</span>
            <span className="italic font-normal text-[#D65B78] font-serif">aylanganda...</span>
          </h1>

          <p className="text-sm sm:text-base text-[#6B5B52] max-w-xl mx-auto lg:mx-0 leading-relaxed">
            DINORA — Oliy toifali konditer Axmedova Dinora tomonidan yaratilgan eksklyuziv tortlar, Fransuz makaronlari va mualliflik art-desertlari dunyosiga xush kelibsiz!
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={() => onNavigateSection('catalog')}
              className="w-full sm:w-auto bg-[#2B1810] hover:bg-[#3D2318] text-[#FAF6F0] px-8 py-4 rounded-2xl font-bold text-sm shadow-dinora-glow hover:shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2 border-2 border-[#D4AF37]"
            >
              <span>Shirinliklar Menyusi</span>
              <ChevronRight className="w-4 h-4 text-[#D65B78]" />
            </button>

            <button
              onClick={onOpenCustomCake}
              className="w-full sm:w-auto bg-[#F8E7EA] hover:bg-white text-[#D65B78] px-8 py-4 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2 border border-[#D65B78]/30"
            >
              <Cake className="w-5 h-5 text-[#D65B78]" />
              <span>✨ O'zim xohlaganimdek (Custom Cake)</span>
            </button>
          </div>

          {/* Highlights Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#2B1810]/10 text-left max-w-lg mx-auto lg:mx-0">
            <div>
              <span className="text-lg sm:text-xl font-serif font-extrabold text-[#2B1810] block">100%</span>
              <span className="text-[11px] text-[#6B5B52]">Tabiiy masalliqlar</span>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-serif font-extrabold text-[#D65B78] block">Universal</span>
              <span className="text-[11px] text-[#6B5B52]">Konditer malakasi</span>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-serif font-extrabold text-[#CBB279] block">Tezkor</span>
              <span className="text-[11px] text-[#6B5B52]">Sirdaryo tumanida yetkazish</span>
            </div>
          </div>

        </motion.div>

        {/* Right Column Visual Media */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white gold-border-glow bg-white">
            <img
              src="/carts/logotip.jpg"
              alt="DINORA Royal Pastry"
              className="w-full h-full object-contain p-6"
            />

            {/* Floating Overlay Badge */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#CBB279]/30 shadow-lg flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#2B1810] text-[#D4AF37] flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2B1810]">
                  Mualliflik Retsepturasi
                </p>
                <p className="text-[11px] text-[#6B5B52]">
                  Pistachio & Raspberry Royal Cake
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
