import React from 'react';
import {
  LayoutGrid,
  Cake,
  ShoppingBag,
  Sparkles,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CakeSlice,
  X,
  Users,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export type ActiveTab = 'analytics' | 'products' | 'orders' | 'custom-cakes' | 'users' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingCakesCount?: number;
  pendingOrdersCount?: number;
  isOpen?: boolean;
  onToggleSidebar?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingCakesCount = 0,
  pendingOrdersCount = 0,
  isOpen = true,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    {
      id: 'analytics' as ActiveTab,
      label: 'Tahlillar & Statistika',
      shortLabel: 'Tahlillar',
      subtitle: "Sotuvlar ko'rsatkichlari",
      icon: LayoutGrid,
    },
    {
      id: 'products' as ActiveTab,
      label: 'Mahsulotlar',
      shortLabel: 'Mahsulotlar',
      subtitle: 'Narxlar va zaxira holati',
      icon: Cake,
    },
    {
      id: 'orders' as ActiveTab,
      label: 'Buyurtmalar',
      shortLabel: 'Buyurtmalar',
      subtitle: 'Tasdiqlash va boshqarish',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: 'custom-cakes' as ActiveTab,
      label: 'Maxsus Tortlar',
      shortLabel: 'Maxsus Tortlar',
      subtitle: 'Narx belgilash va tasdiqlash',
      icon: Sparkles,
      badge: pendingCakesCount > 0 ? pendingCakesCount : undefined,
      badgeColor: 'bg-[#D65B78]',
    },
    {
      id: 'users' as ActiveTab,
      label: 'Foydalanuvchilar',
      shortLabel: 'Foydalanuvchilar',
      subtitle: 'Xaridorlar va ruxsatlar',
      icon: Users,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Tizim Sozlamalari',
      shortLabel: 'Sozlamalar',
      subtitle: 'Ish vaqti va parametrlar',
      icon: Settings,
    },
  ];

  const isCompact = !isOpen;

  const sidebarContent = (
    <div className={clsx('flex flex-col h-full bg-white select-none transition-all duration-300', isCompact ? 'w-20' : 'w-64')}>
      {/* Brand Logo & Header */}
      <div className={clsx('p-4 border-b border-[#E5E7EB] flex items-center justify-between', isCompact && 'flex-col gap-3 p-3')}>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[#2B1810] flex items-center justify-center text-[#CBB279] shadow-md border border-[#CBB279]/30 shrink-0">
            <CakeSlice className="w-6 h-6" />
          </div>
          {!isCompact && (
            <div className="overflow-hidden animate-in fade-in duration-200">
              <h1 className="text-xl font-bold text-[#2B1810] font-serif tracking-tight truncate leading-none">
                DINORA
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#CBB279] mt-1 truncate">
                SHIRINLIKLAR ADMIN
              </p>
            </div>
          )}
        </div>

        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-[#2B1810] hover:bg-[#FAF6F0]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-2 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onMobileClose) onMobileClose();
              }}
              title={isCompact ? item.label : undefined}
              className={clsx(
                'w-full flex items-center rounded-2xl text-left transition-all duration-200 group relative',
                isCompact ? 'justify-center p-3' : 'justify-between px-4 py-3',
                isActive
                  ? 'bg-[#2B1810] text-white shadow-md'
                  : 'text-[#2B1810] hover:bg-[#FAF6F0]'
              )}
            >
              <div className={clsx('flex items-center gap-3.5 overflow-hidden', isCompact && 'justify-center')}>
                <Icon
                  className={clsx(
                    'w-5 h-5 transition-colors shrink-0',
                    isActive ? 'text-[#CBB279]' : 'text-[#6B5B52] group-hover:text-[#2B1810]'
                  )}
                />
                {!isCompact && (
                  <div className="overflow-hidden animate-in fade-in duration-200">
                    <span className={clsx('block font-bold text-[14px] leading-tight truncate', isActive ? 'text-white' : 'text-[#2B1810]')}>
                      {item.label}
                    </span>
                    {item.subtitle && (
                      <span
                        className={clsx(
                          'block text-[11px] leading-tight mt-0.5 truncate',
                          isActive ? 'text-[#CBB279]' : 'text-[#6B7280]'
                        )}
                      >
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Badge */}
              {item.badge !== undefined && (
                <span
                  className={clsx(
                    'font-bold rounded-full text-white shadow-sm shrink-0',
                    isCompact
                      ? 'absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] ring-2 ring-white ' + (item.badgeColor || 'bg-[#D65B78]')
                      : 'px-2 py-0.5 text-xs ml-1 ' + (item.badgeColor || 'bg-[#CBB279] text-[#2B1810]')
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Profile & Logout */}
      <div className="p-3.5 border-t border-[#E5E7EB] bg-[#FAF6F0]/40">
        <div className={clsx('flex items-center justify-between', isCompact && 'flex-col gap-2')}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-full bg-[#F6EEDC] text-[#2B1810] flex items-center justify-center font-bold text-sm border border-[#CBB279]/50 shrink-0 shadow-sm">
              {user?.firstName ? user.firstName[0].toUpperCase() : 'D'}
            </div>
            {!isCompact && (
              <div className="overflow-hidden animate-in fade-in duration-200">
                <p className="text-xs font-bold text-[#2B1810] truncate">
                  {user?.firstName || 'Dinora'} {user?.lastName || 'Shirinliklari'}
                </p>
                <p className="text-[11px] text-[#6B7280] truncate">
                  @{user?.username || 'dinorashirinliklari'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            title={t('admin.logout', 'Chiqish')}
            className="p-2 text-[#6B7280] hover:text-[#2B1810] hover:bg-white rounded-xl transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Responsive Fixed Left Sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex bg-white border-r border-[#E5E7EB] flex-col h-screen fixed top-0 bottom-0 left-0 shadow-sm z-30 shrink-0 transition-all duration-300 ease-in-out',
          isCompact ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />

          {/* Sliding Drawer */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* 3. Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#2B1810]/15 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-1 pt-2 pb-3 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center flex-1 py-0.5 px-1 min-w-[58px] group transition-all duration-200"
            >
              <div
                className={clsx(
                  'relative p-1.5 rounded-full transition-all duration-200 flex items-center justify-center',
                  isActive
                    ? 'bg-[#2B1810] text-[#CBB279] shadow-md scale-110'
                    : 'text-[#2B1810]/70 hover:text-[#2B1810] hover:bg-[#FAF6F0]'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && (
                  <span
                    className={clsx(
                      'absolute -top-1 -right-2 px-1.5 py-0.2 text-[9px] font-extrabold rounded-full text-white ring-2 ring-white shadow-sm',
                      item.badgeColor || 'bg-[#D65B78]'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={clsx(
                  'text-[10px] sm:text-[11px] font-bold mt-1 leading-tight tracking-tight block text-center truncate max-w-full',
                  isActive ? 'text-[#2B1810]' : 'text-[#6B5B52]'
                )}
              >
                {item.shortLabel || item.label}
              </span>

              {isActive && (
                <span className="w-1.5 h-1.5 bg-[#CBB279] rounded-full mt-0.5 animate-in fade-in zoom-in-75 duration-200" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
