import React, { useState } from 'react';
import { Sidebar, ActiveTab } from './Sidebar';
import { Header } from './AdminHeader';

interface AdminLayoutProps {
  children: (activeTab: ActiveTab) => React.ReactNode;
  pendingCakesCount?: number;
  pendingOrdersCount?: number;
  onRefreshAll?: () => void;
  isRefreshing?: boolean;
}

import { clsx } from 'clsx';

const VALID_TABS: ActiveTab[] = ['analytics', 'products', 'orders', 'custom-cakes', 'users', 'settings'];

const getInitialTab = (): ActiveTab => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '') as ActiveTab;
    if (VALID_TABS.includes(hash)) return hash;

    const saved = localStorage.getItem('dinora_admin_active_tab') as ActiveTab;
    if (VALID_TABS.includes(saved)) return saved;
  }
  return 'analytics';
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  pendingCakesCount = 0,
  pendingOrdersCount = 0,
  onRefreshAll,
  isRefreshing,
}) => {
  const [activeTab, setActiveTabState] = useState<ActiveTab>(getInitialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
      localStorage.setItem('dinora_admin_active_tab', tab);
    }
  };

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-dinora-bg font-sans selection:bg-dinora-gold selection:text-dinora-chocolate relative">
      {/* Permanent Fixed Desktop & Responsive Mobile Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        pendingCakesCount={pendingCakesCount}
        pendingOrdersCount={pendingOrdersCount}
        isOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content View with Dynamic Left Margin Offset */}
      <div
        className={clsx(
          'flex flex-col min-h-screen min-w-0 transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        )}
      >
        <Header
          activeTab={activeTab}
          onRefresh={onRefreshAll}
          isRefreshing={isRefreshing}
          onToggleMobileMenu={toggleSidebar}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 w-full max-w-full">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full">
            {children(activeTab)}
          </div>
        </main>
      </div>
    </div>
  );
};


