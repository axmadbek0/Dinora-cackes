import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { OnlineVisitorsBadge } from '../live/LiveOnlineVisitors';

export const AnnouncementBar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-[#2B1810] via-[#42261A] to-[#2B1810] text-[#FAF6F0] py-1.5 px-3 text-[11px] sm:text-xs font-medium text-center shadow-sm relative overflow-hidden z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="hidden md:flex items-center space-x-2 text-[10px] text-[#FAF6F0]/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t('footer.delivery_text_val')}</span>
        </div>

        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mx-auto md:mx-0">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] shrink-0" />
          <span className="tracking-tight sm:tracking-wide truncate max-w-[85vw] sm:max-w-none">
            {t('announcement.text')}
          </span>
        </div>

        <div className="hidden sm:flex items-center">
          <OnlineVisitorsBadge variant="header" />
        </div>
      </div>
    </div>
  );
};
