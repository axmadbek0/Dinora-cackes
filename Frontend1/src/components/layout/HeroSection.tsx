import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Cake, ChevronRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { triggerHaptic, triggerSelectionHaptic } from '../../utils/haptics';
import { OnlineVisitorsBadge } from '../live/LiveOnlineVisitors';

interface HeroSectionProps {
  onOpenCustomCake: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCustomCake,
  onNavigateSection,
}) => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF6F0] via-[#F8E7EA]/40 to-[#FAF6F0] py-10 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#2B1810]/5 select-none">
      {/* Decorative Gold & Berry Glow Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] max-w-[90vw] h-[300px] bg-gradient-to-r from-[#D4AF37]/10 via-[#D65B78]/10 to-[#CBB279]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Column Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left"
        >
          {/* Top Brand Pill & Live Active Visitors */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#CBB279]/40 shadow-sm text-[11px] sm:text-xs font-bold text-[#2B1810]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="gold-gradient-text uppercase tracking-wider">
                {t('hero.pill')}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D65B78]" />
              <span className="text-[#6B5B52] hidden xs:inline">Storefront</span>
            </div>

            <OnlineVisitorsBadge variant="hero" />
          </div>

          {/* Main Title with Fluid Scale */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-[#2B1810] tracking-tight leading-[1.15]">
            <span className="block">{t('hero.title_line1')}</span>
            <span className="italic font-normal text-[#D65B78] font-serif">{t('hero.title_line2')}</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[#6B5B52] max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                onNavigateSection('catalog');
              }}
              className="w-full sm:w-auto min-h-[48px] bg-[#2B1810] hover:bg-[#3D2318] text-[#FAF6F0] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-xs sm:text-sm shadow-dinora-glow hover:shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2 border-2 border-[#D4AF37] touch-manipulation"
            >
              <span>{t('hero.menu_btn')}</span>
              <ChevronRight className="w-4 h-4 text-[#D65B78]" />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onOpenCustomCake();
              }}
              className="w-full sm:w-auto min-h-[48px] bg-[#F8E7EA] hover:bg-white text-[#D65B78] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-xs sm:text-sm shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2 border border-[#D65B78]/30 touch-manipulation"
            >
              <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-[#D65B78]" />
              <span>{t('hero.custom_cake_btn')}</span>
            </button>
          </div>

          {/* Highlights Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-[#2B1810]/10 text-left max-w-lg mx-auto lg:mx-0">
            <div className="p-2 sm:p-0">
              <span className="text-base sm:text-xl font-serif font-extrabold text-[#2B1810] block">100%</span>
              <span className="text-[10px] sm:text-[11px] text-[#6B5B52] leading-tight block">{t('hero.natural_ingredients')}</span>
            </div>
            <div className="p-2 sm:p-0">
              <span className="text-base sm:text-xl font-serif font-extrabold text-[#D65B78] block">Universal</span>
              <span className="text-[10px] sm:text-[11px] text-[#6B5B52] leading-tight block">{t('hero.master_quality')}</span>
            </div>
            <div className="p-2 sm:p-0">
              <span className="text-base sm:text-xl font-serif font-extrabold text-[#CBB279] block">Express</span>
              <span className="text-[10px] sm:text-[11px] text-[#6B5B52] leading-tight block">{t('hero.fast_delivery')}</span>
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
          <div className="relative aspect-[4/5] w-full max-w-xs sm:max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white gold-border-glow bg-white">
            <img
              src="/logatip.jpg"
              alt="DINORA Royal Pastry"
              className="w-full h-full object-contain p-4 sm:p-6 hover:scale-105 transition-transform duration-500"
            />

            {/* Floating Overlay Badge */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-[#CBB279]/30 shadow-lg flex items-center space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2B1810] text-[#D4AF37] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2B1810]">
                  {t('hero.author_recipe')}
                </p>
                <p className="text-[10px] sm:text-[11px] text-[#6B5B52]">
                  {t('hero.royal_cake_desc')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
