import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, MapPin, Clock, Heart, ExternalLink } from 'lucide-react';
import { fetchSystemSettings, DEFAULT_SYSTEM_SETTINGS } from '../../services/api';
import type { SystemSettingDto } from '../../types';

export const ContactSection: React.FC = () => {
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
  const workingDays = settings.workingDays ? settings.workingDays : t('contact.work_hours_val');
  const deliveryText = settings.deliveryAddressText ? settings.deliveryAddressText : t('contact.delivery_val');

  const cleanPhone1 = primaryPhone.replace(/\s+/g, '');
  const cleanPhone2 = secondaryPhone.replace(/\s+/g, '');

  return (
    <section id="contact" className="py-10 sm:py-16 bg-[#2B1810] text-[#FAF6F0] relative overflow-hidden select-none">
      {/* Decorative gold background circles */}
      <div className="absolute top-0 right-0 w-96 max-w-[80vw] h-96 bg-[#CBB279]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 max-w-[80vw] h-96 bg-[#D65B78]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left info column */}
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#FAF6F0]/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#D4AF37] uppercase tracking-widest border border-[#D4AF37]/30">
              <Heart className="w-3.5 h-3.5 text-[#D65B78]" />
              <span>{t('contact.pill')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white leading-tight">
              {t('contact.title')}
            </h2>

            <p className="text-xs sm:text-sm text-[#FAF6F0]/80 leading-relaxed max-w-lg">
              {t('contact.subtitle')}
            </p>

            {/* Operating Hours & Location info */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-[#FAF6F0]/90">
                <div className="w-8 h-8 rounded-xl bg-[#FAF6F0]/10 flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">{t('contact.work_hours_label')}</span>
                  <span>{workingDays}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs sm:text-sm text-[#FAF6F0]/90">
                <div className="w-8 h-8 rounded-xl bg-[#FAF6F0]/10 flex items-center justify-center text-[#D4AF37] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">{t('contact.delivery_label')}</span>
                  <span>{deliveryText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Direct Action Buttons Column */}
          <div className="bg-[#3D2318] p-5 sm:p-8 rounded-3xl border border-[#CBB279]/30 shadow-2xl space-y-4">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center justify-between">
              <span>{t('contact.box_title')}</span>
              <span className="text-xs font-serif italic text-[#CBB279]">{instagramUsername}</span>
            </h3>

            {/* Phone Buttons */}
            <div className="space-y-3 pt-2">
              <a
                href={`tel:${cleanPhone1}`}
                className="min-h-[44px] w-full bg-[#FAF6F0] text-[#2B1810] p-3.5 sm:p-4 rounded-2xl font-extrabold text-xs sm:text-base flex items-center justify-between shadow-md hover:bg-white hover:scale-102 active:scale-98 transition-all border border-[#CBB279] touch-manipulation"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2B1810] text-[#D65B78] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] sm:text-[10px] text-[#6B5B52] block uppercase tracking-wider font-bold">{t('contact.primary_phone_label')}</span>
                    <span>{primaryPhone}</span>
                  </div>
                </div>
                <span className="text-xs bg-[#F8E7EA] text-[#D65B78] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold">{t('contact.call_btn')}</span>
              </a>

              <a
                href={`tel:${cleanPhone2}`}
                className="min-h-[44px] w-full bg-[#FAF6F0] text-[#2B1810] p-3.5 sm:p-4 rounded-2xl font-extrabold text-xs sm:text-base flex items-center justify-between shadow-md hover:bg-white hover:scale-102 active:scale-98 transition-all border border-[#CBB279] touch-manipulation"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2B1810] text-[#D65B78] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] sm:text-[10px] text-[#6B5B52] block uppercase tracking-wider font-bold">{t('contact.secondary_phone_label')}</span>
                    <span>{secondaryPhone}</span>
                  </div>
                </div>
                <span className="text-xs bg-[#F8E7EA] text-[#D65B78] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold">{t('contact.call_btn')}</span>
              </a>
            </div>

            {/* Instagram Direct Button */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white p-3.5 sm:p-4 rounded-2xl font-bold text-xs sm:text-base flex items-center justify-between shadow-lg hover:opacity-95 active:scale-98 transition-all touch-manipulation"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <div className="text-left">
                  <span className="text-[9px] sm:text-[10px] text-white/80 block uppercase tracking-wider">{t('contact.instagram_label')}</span>
                  <span className="truncate">{instagramUsername}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </a>

          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
