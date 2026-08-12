import React, { useState } from 'react';
import { Award, ShieldCheck, Sparkles, ZoomIn } from 'lucide-react';
import { motion } from 'framer-motion';

export const MasterCertificateCard: React.FC = () => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = (y - centerY) / 12;
    const rotY = (centerX - x) / 12;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <section id="certificate" className="py-12 sm:py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center space-x-2 bg-[#F8E7EA] text-[#D65B78] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[#D65B78]/20">
          <Award className="w-4 h-4" />
          <span>Professional Mahorat</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2B1810]">
          Bosh Konditer Diplom va Sertifikati
        </h2>
        <p className="text-sm text-[#6B5B52]">
          Har bir pishiriq ortida ko'p yillik bilim, tajriba va xalqaro standartdagi konditerlik mahorati yotadi.
        </p>
      </div>

      {/* 3D Tilt Card Wrapper */}
      <div className="max-w-3xl mx-auto perspective-1000">
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: 'transform 0.1s ease-out',
          }}
          className="bg-white rounded-3xl p-6 sm:p-8 gold-border-glow shadow-dinora-gold relative overflow-hidden group cursor-pointer"
          onClick={() => setIsZoomed(true)}
        >
          {/* Subtle gold ribbon decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/30 to-transparent pointer-events-none rounded-tr-3xl" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Image Container with Zoom Preview */}
            <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-[#CBB279] group-hover:scale-102 transition-transform duration-300">
              <img
                src="/carts/diplom.jpg"
                alt="Axmedova Dinora Master Certificate"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  // Fallback preview if diplom image path issue
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-[#2B1810]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white space-x-1.5 font-bold text-xs">
                <ZoomIn className="w-4 h-4" />
                <span>Kattalashtirib ko'rish</span>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#D4AF37]">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#2B1810]">
                  Rasmiy Malaka Sertifikati
                </span>
              </div>

              <blockquote className="font-serif italic text-base sm:text-lg text-[#2B1810] border-l-4 border-[#D65B78] pl-4 py-1 leading-relaxed">
                "Axmedova Dinora — Tort_uz tomonidan tashkil etilgan 5 kunlik «UNIVERSAL KONDITER» kursi bitiruvchisi"
              </blockquote>

              <div className="space-y-2 text-xs text-[#6B5B52] pt-2 border-t border-[#2B1810]/5">
                <p className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#CBB279] shrink-0" />
                  <span>Xalqaro retsepturaga asoslangan zamonaviy art-desert texnikalari</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#CBB279] shrink-0" />
                  <span>Faqat 100% halal va tabiiy masalliqlar bilan ishlash standartlari</span>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#CBB279] uppercase">
                  🏆 Sertifikatlangan Konditer
                </span>
                <span className="text-xs font-serif font-bold text-[#2B1810]">
                  DINORA Bakery
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Fullscreen Lightbox Zoom Modal */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl w-full">
            <img
              src="/carts/diplom.jpg"
              alt="Diploma Fullview"
              className="w-full h-auto max-h-[90vh] object-contain rounded-2xl border-2 border-[#D4AF37] shadow-2xl"
            />
            <p className="text-center text-white text-xs mt-3 font-serif">
              Axmedova Dinora — «UNIVERSAL KONDITER» Malaka Diplom (Kattalashtirilgan tasvir)
            </p>
          </div>
        </div>
      )}

    </section>
  );
};
