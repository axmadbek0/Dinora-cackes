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
      title: t('admin.analytics'),
      subtitle: t('admin.header_analytics'),
    },
    products: {
      title: t('admin.products'),
      subtitle: t('admin.header_products'),
    },
    orders: {
      title: t('admin.orders'),
      subtitle: t('admin.header_orders'),
    },
    'custom-cakes': {
      title: t('admin.custom_cakes'),
      subtitle: t('admin.header_custom_cakes'),
    },
    users: {
      title: t('admin.users'),
      subtitle: t('admin.header_users'),
    },
    settings: {
      title: t('admin.settings'),
      subtitle: t('admin.header_settings'),
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
            title={t('admin.refresh')}
          >
            <RefreshCw className={`w-4 h-4 text-dinora-gold ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('admin.refresh')}</span>
          </button>
        )}

        {/* Language Selector */}
        <LanguageSelector />

        {/* Telegram WebApp Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate max-w-[140px]">
            {telegramUser ? `TG: ${telegramUser.first_name}` : t('admin.admin')}
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

