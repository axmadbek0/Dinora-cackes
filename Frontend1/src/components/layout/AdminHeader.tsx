import React from 'react';
import { Bell, ShieldCheck, RefreshCw } from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  activeTab: ActiveTab;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onRefresh,
  isRefreshing,
  onToggleMobileMenu,
}) => {
  const { telegramUser } = useAuth();
  const { t } = useTranslation();

  const titleMap: Record<ActiveTab, { title: string; subtitle: string }> = {
    analytics: {
      title: t('admin.analytics', 'Tahlillar & Statistika'),
      subtitle: t('admin.header_analytics', "Sotuvlar va buyurtmalar bo'yicha real vaqtdagi ko'rsatkichlar"),
    },
    products: {
      title: t('admin.products', 'Mahsulotlar'),
      subtitle: t('admin.header_products', 'Katalog, narxlar va zaxira holatini boshqarish'),
    },
    orders: {
      title: t('admin.orders', 'Buyurtmalar'),
      subtitle: t('admin.header_orders', 'Mijozlardan tushgan yangi buyurtmalarni tasdiqlash va boshqarish'),
    },
    'custom-cakes': {
      title: t('admin.custom_cakes', 'Maxsus Tortlar'),
      subtitle: t('admin.header_custom_cakes', "Individual dizaynli tortlar bo'yicha so'rovlar va narx belgilash"),
    },
    users: {
      title: t('admin.users', 'Foydalanuvchilar'),
      subtitle: t('admin.header_users', "Mijozlar ro'yxati, buyurtmalar statistikasi va ruxsatlar"),
    },
    settings: {
      title: t('admin.settings', 'Tizim Sozlamalari'),
      subtitle: t('admin.header_settings', "Ish vaqtlari, aloqa va to'lov ma'lumotlari"),
    },
  };

  const current = titleMap[activeTab] || titleMap.analytics;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-dinora-border px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-dinora-chocolate font-serif leading-tight">
            {current.title}
          </h2>
          <p className="text-[10px] sm:text-xs text-dinora-gray line-clamp-1 mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-dinora-chocolate hover:bg-dinora-gold-light/50 transition-all border border-dinora-border flex items-center gap-1.5 text-xs font-medium"
            title={t('admin.refresh', 'Yangilash')}
          >
            <RefreshCw className={`w-4 h-4 text-dinora-gold ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('admin.refresh', 'Yangilash')}</span>
          </button>
        )}

        {/* Language Selector */}
        <LanguageSelector />

        {/* Telegram WebApp Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate max-w-[140px]">
            {telegramUser ? `TG: ${telegramUser.first_name}` : t('admin.admin', 'Admin')}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-xl text-dinora-chocolate hover:bg-dinora-bg border border-dinora-border relative">
            <Bell className="w-5 h-5 text-dinora-chocolate" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-dinora-pink ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

