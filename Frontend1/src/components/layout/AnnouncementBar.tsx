import React from 'react';
import { Sparkles } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-[#2B1810] via-[#42261A] to-[#2B1810] text-[#FAF6F0] py-1.5 px-3 text-[11px] sm:text-xs font-medium text-center shadow-sm relative overflow-hidden z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-1.5 sm:space-x-2">
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] shrink-0" />
        <span className="tracking-tight sm:tracking-wide truncate max-w-[90vw] sm:max-w-none">
          ✨ Barcha pishiriqlar faqat tabiiy va sifatli masalliqlardan tayyorlanadi!
        </span>
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] shrink-0 hidden sm:inline-block" />
      </div>
    </div>
  );
};
