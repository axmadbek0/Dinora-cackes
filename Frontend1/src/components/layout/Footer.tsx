import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { fetchSystemSettings, DEFAULT_SYSTEM_SETTINGS } from '../../services/api';
import type { SystemSettingDto } from '../../types';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SystemSettingDto>(DEFAULT_SYSTEM_SETTINGS);

  useEffect(() => {
    fetchSystemSettings().then((res) => {
      if (res) setSettings(res);
    });
  }, []);

  const primaryPhone = settings.adminPhonePrimary || '+998 99 495 78 06';
  const secondaryPhone = settings.adminPhoneSecondary || '+998 91 023 15 24';
  const instagramUrl = settings.instagramUrl || 'https://www.instagram.com/dinora_shirinliklari/';
  const instagramUsername = settings.instagramUsername || '@dinora_shirinliklari';
  const workingDays = settings.workingDays ? settings.workingDays : t('footer.work_days_val');
  const hoursStart = settings.workingHoursStart || '09:00';
  const hoursEnd = settings.workingHoursEnd || '21:00';
  const deliveryText = settings.deliveryAddressText ? settings.deliveryAddressText : t('footer.delivery_text_val');

  return (
    <footer className="bg-[#2B1810] text-[#FAF6F0] border-t border-[#CBB279]/20 pt-10 sm:pt-12 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand info */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center space-x-3">
            <img
              src="/products/logotip.png"
              alt="DINORA Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-[#CBB279] shadow-md shrink-0"
            />
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                DINORA
              </span>
              <p className="font-serif italic text-xs text-[#CBB279]">
                {t('footer.brand_slogan')}
              </p>
            </div>
          </div>
          <p className="text-xs text-[#FAF6F0]/70 leading-relaxed max-w-sm">
            {t('footer.brand_desc')}
          </p>
        </div>

        {/* Contact Links */}
        <div className="space-y-2 text-xs">
          <h4 className="font-serif font-bold text-sm text-[#D4AF37] uppercase tracking-wider">
            {t('footer.contact_title')}
          </h4>
          <p className="text-[#FAF6F0]/80">{primaryPhone}</p>
          <p className="text-[#FAF6F0]/80">{secondaryPhone}</p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D65B78] hover:underline flex items-center space-x-1 pt-1 font-bold touch-manipulation"
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="truncate">{instagramUsername}</span>
          </a>
        </div>

        {/* Working Hours */}
        <div className="space-y-2 text-xs">
          <h4 className="font-serif font-bold text-sm text-[#D4AF37] uppercase tracking-wider">
            {t('footer.hours_title')}
          </h4>
          <p className="text-[#FAF6F0]/80">{workingDays}</p>
          <p className="text-[#FAF6F0]/80">{hoursStart} — {hoursEnd}</p>
          <p className="text-[#CBB279] italic pt-1">
            ✨ {deliveryText}
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#FAF6F0]/60 space-y-2 sm:space-y-0">
        <p>© {new Date().getFullYear()} DINORA Pastry & Art Bakery. {t('footer.all_rights')}</p>
        <p className="flex items-center space-x-1">
          <span>{t('footer.made_with_love')}</span>
          <Heart className="w-3.5 h-3.5 text-[#D65B78] fill-[#D65B78]" />
        </p>
      </div>
    </footer>
  );
};

export default Footer;
