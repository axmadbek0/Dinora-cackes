import React from 'react';
import { AdminLayout } from './components/layout/AdminLayout';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { AnalyticsPage } from './modules/analytics/AnalyticsPage';
import { ProductsPage } from './modules/products/ProductsPage';
import { OrdersPage } from './modules/orders/OrdersPage';
import { CustomCakesPage } from './modules/custom-cakes/CustomCakesPage';
import { SettingsPage } from './modules/settings/SettingsPage';
import { UsersPage } from './modules/users/UsersPage';
import { ToastContainer } from './components/ui/ToastNotification';
import { useCustomCakes } from './modules/custom-cakes/hooks/useCustomCakes';
import { useOrders } from './modules/orders/hooks/useOrders';
import { useQueryClient } from '@tanstack/react-query';
import { CustomCakeStatus } from './types/custom-cake.types';
import { OrderStatus } from './types/order.types';

export const AdminApp: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: cakes = [], isRefetching: isCakesRefetching } = useCustomCakes();
  const { data: orders = [], isRefetching: isOrdersRefetching } = useOrders();

  const pendingCakesCount = cakes.filter((c) => c.status === CustomCakeStatus.PENDING_PRICING).length;
  const pendingOrdersCount = orders.filter((o) => o.status === OrderStatus.PENDING_APPROVAL).length;

  const handleRefreshAll = () => {
    queryClient.invalidateQueries();
  };

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <AdminLayout
          pendingCakesCount={pendingCakesCount}
          pendingOrdersCount={pendingOrdersCount}
          onRefreshAll={handleRefreshAll}
          isRefreshing={isCakesRefetching || isOrdersRefetching}
        >
          {(activeTab) => {
            switch (activeTab) {
              case 'analytics':
                return <AnalyticsPage />;
              case 'products':
                return <ProductsPage />;
              case 'orders':
                return <OrdersPage />;
              case 'custom-cakes':
                return <CustomCakesPage />;
              case 'users':
                return <UsersPage />;
              case 'settings':
                return <SettingsPage />;
              default:
                return <AnalyticsPage />;
            }
          }}
        </AdminLayout>
      </ProtectedRoute>
      <ToastContainer />
    </ErrorBoundary>
  );
};

export default AdminApp;
