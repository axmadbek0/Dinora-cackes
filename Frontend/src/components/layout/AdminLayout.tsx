import React, { useState } from 'react';
import { Sidebar, ActiveTab } from './Sidebar';
import { Header } from './Header';

interface AdminLayoutProps {
  children: (activeTab: ActiveTab) => React.ReactNode;
  pendingCakesCount?: number;
  pendingOrdersCount?: number;
  onRefreshAll?: () => void;
  isRefreshing?: boolean;
}

const VALID_TABS: ActiveTab[] = ['analytics', 'products', 'orders', 'custom-cakes', 'settings'];

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
    // On mobile (< 1024px), toggle mobile drawer; on desktop toggle sidebar collapse
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex min-h-screen max-w-full overflow-x-hidden bg-dinora-bg font-sans selection:bg-dinora-gold selection:text-dinora-chocolate relative">
      {/* Collapsible & Responsive Sidebar */}
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

      {/* Main Content Area - Strictly prevents horizontal scrolling */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden transition-all duration-300">
        <Header
          activeTab={activeTab}
          onRefresh={onRefreshAll}
          isRefreshing={isRefreshing}
          onToggleMobileMenu={toggleSidebar}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto max-w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full overflow-x-hidden">
            {children(activeTab)}
          </div>
        </main>
      </div>
    </div>
  );
};


