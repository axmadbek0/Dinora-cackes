import React from 'react';
import {
  LayoutDashboard,
  Cake,
  ShoppingBag,
  Sparkles,
  Settings,
  LogOut,
  CakeSlice,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

export type ActiveTab = 'analytics' | 'products' | 'orders' | 'custom-cakes' | 'settings';

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
  onToggleSidebar,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { logout, user } = useAuth();

  const navItems = [
    {
      id: 'analytics' as ActiveTab,
      label: 'Tahlil va Statistika',
      shortLabel: 'Tahlil',
      subtitle: "Sotuvlar ko'rsatkichlari",
      icon: LayoutDashboard,
    },
    {
      id: 'products' as ActiveTab,
      label: 'Mahsulotlar Katalogi',
      shortLabel: 'Katalog',
      subtitle: 'Narxlar va zaxira holati',
      icon: Cake,
    },
    {
      id: 'orders' as ActiveTab,
      label: 'Jonli Buyurtmalar',
      shortLabel: 'Buyurtma',
      subtitle: 'Tasdiqlash va boshqarish',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: 'custom-cakes' as ActiveTab,
      label: 'Maxsus Tort Buyurtmalar',
      shortLabel: 'Maxsus',
      subtitle: 'Narx belgilash va tasdiqlash',
      icon: Sparkles,
      badge: pendingCakesCount > 0 ? pendingCakesCount : undefined,
      badgeColor: 'bg-dinora-pink',
    },
    {
      id: 'settings' as ActiveTab,
      label: "Do'kon Sozlamalari",
      shortLabel: 'Sozlama',
      subtitle: 'Ish vaqti va parametrlar',
      icon: Settings,
    },
  ];

  // Responsive Sidebar Content (Supports Full w-64 and Compact Icon-Only w-20 modes)
  const isCompact = !isOpen;

  const sidebarContent = (
    <div className={clsx('flex flex-col h-full bg-white select-none transition-all duration-300', isCompact ? 'w-20' : 'w-64')}>
      {/* Brand Logo & Header */}
      <div className={clsx('p-4 border-b border-dinora-border flex items-center justify-between', isCompact && 'flex-col gap-3 p-3')}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-dinora-chocolate flex items-center justify-center text-dinora-gold shadow-md shrink-0">
            <CakeSlice className="w-6 h-6" />
          </div>
          {!isCompact && (
            <div className="overflow-hidden animate-in fade-in duration-200">
              <h1 className="text-lg font-bold text-dinora-chocolate font-serif tracking-tight truncate">
                DINORA
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-dinora-gold truncate">
                Shirinliklar Admin
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 rounded-xl text-dinora-gray hover:text-dinora-chocolate hover:bg-dinora-bg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-5 space-y-2 overflow-y-auto scrollbar-none">
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
                'w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 group text-left relative',
                isCompact ? 'justify-center p-3' : 'justify-between px-3.5 py-3',
                isActive
                  ? 'bg-dinora-chocolate text-white shadow-md'
                  : 'text-dinora-chocolate hover:bg-dinora-gold-light/40 hover:text-dinora-chocolate'
              )}
            >
              <div className={clsx('flex items-center gap-3 overflow-hidden', isCompact && 'justify-center')}>
                <Icon
                  className={clsx(
                    'w-5 h-5 transition-colors shrink-0',
                    isActive ? 'text-dinora-gold' : 'text-dinora-chocolate/70 group-hover:text-dinora-chocolate'
                  )}
                />
                {!isCompact && (
                  <div className="overflow-hidden animate-in fade-in duration-200">
                    <span className="block font-medium truncate">{item.label}</span>
                    {item.subtitle && (
                      <span
                        className={clsx(
                          'block text-[10px] truncate',
                          isActive ? 'text-dinora-gold/80' : 'text-dinora-gray'
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
                      ? 'absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] ring-2 ring-white ' + (item.badgeColor || 'bg-dinora-pink')
                      : 'px-2 py-0.5 text-xs ml-1 ' + (item.badgeColor || 'bg-dinora-gold text-dinora-chocolate')
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
      <div className="p-3 border-t border-dinora-border bg-dinora-bg/50">
        <div className={clsx('flex items-center justify-between', isCompact && 'flex-col gap-2')}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-dinora-gold/20 text-dinora-chocolate flex items-center justify-center font-bold text-sm border border-dinora-gold/40 shrink-0">
              {user?.firstName ? user.firstName[0].toUpperCase() : 'D'}
            </div>
            {!isCompact && (
              <div className="overflow-hidden animate-in fade-in duration-200">
                <p className="text-xs font-bold text-dinora-chocolate truncate">
                  {user?.firstName} {user?.lastName || ''}
                </p>
                <p className="text-[10px] text-dinora-gray truncate">
                  @{user?.username || 'admin'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            title="Chiqish"
            className="p-2 text-dinora-gray hover:text-dinora-pink hover:bg-dinora-pink-light rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Responsive Collapsible Left Sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex bg-white border-r border-dinora-border flex-col h-screen sticky top-0 shadow-dinora z-20 shrink-0 transition-all duration-300 ease-in-out',
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

      {/* 3. Sleek Mobile Bottom Navigation Bar with Perfectly Spaced Bold Labels */}
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
              {/* Active Icon Container with Sleek Pill Badge */}
              <div
                className={clsx(
                  'relative p-1.5 rounded-full transition-all duration-200 flex items-center justify-center',
                  isActive
                    ? 'bg-[#2B1810] text-[#D4AF37] shadow-md scale-110'
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

              {/* Text Label Always Fully Visible Under Icon */}
              <span
                className={clsx(
                  'text-[10px] sm:text-[11px] font-extrabold mt-1 leading-tight tracking-tight block text-center truncate max-w-full',
                  isActive ? 'text-[#2B1810]' : 'text-[#6B5B52]'
                )}
              >
                {item.shortLabel || item.label}
              </span>

              {/* Subtle Gold Active Indicator Dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-0.5 animate-in fade-in zoom-in-75 duration-200" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
