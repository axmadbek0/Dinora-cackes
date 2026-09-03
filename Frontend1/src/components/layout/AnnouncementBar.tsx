import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { OnlineVisitorsBadge } from '../live/LiveOnlineVisitors';

export const AnnouncementBar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-[#2B1810] via-[#42261A] to-[#2B1810] text-[#FAF6F0] py-1 sm:py-1.5 px-2 xs:px-3 text-[10px] 2xs:text-[11px] sm:text-xs font-medium text-center shadow-sm relative overflow-hidden z-20 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 xs:gap-2">
        <div className="hidden md:flex items-center space-x-2 text-[10px] text-[#FAF6F0]/80 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t('footer.delivery_text_val')}</span>
        </div>

        <div className="flex items-center justify-center space-x-1 xs:space-x-1.5 sm:space-x-2 mx-auto md:mx-0 min-w-0 max-w-full">
          <Sparkles className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] shrink-0" />
          <span className="tracking-tight sm:tracking-wide truncate max-w-[88vw] xs:max-w-[80vw] sm:max-w-none font-medium">
            {t('announcement.text')}
          </span>
        </div>

        <div className="hidden sm:flex items-center shrink-0">
          <OnlineVisitorsBadge variant="header" />
        </div>
      </div>
    </div>
  );
};
