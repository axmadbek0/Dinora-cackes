import React from 'react';
import { DollarSign, ShoppingCart, Sparkles, Package } from 'lucide-react';
import { StatCard } from '../../../components/layout/StatCard';
import { AnalyticsSummary } from '../../../types/api.types';

interface StatGridProps {
  data?: AnalyticsSummary;
  isLoading?: boolean;
}

export const StatGrid: React.FC<StatGridProps> = ({ data, isLoading }) => {
  const formatMoney = (amount: number = 0) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  const revenue = data?.totalRevenue ?? 0;
  const ordersCount = data?.totalOrders ?? 0;
  const customCakesCount = data?.pendingCustomCakes ?? 0;
  const activeProductsCount = data?.activeProducts ?? 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Jami Tushum (UZS)"
        value={isLoading ? '...' : formatMoney(revenue)}
        change={revenue > 0 ? "+0.0% yangi" : "Hozircha tushum yo'q"}
        isPositive={true}
        icon={<DollarSign className="w-6 h-6" />}
        accentColor="gold"
      />
      <StatCard
        title="Jami Buyurtmalar"
        value={isLoading ? '...' : ordersCount}
        change={ordersCount > 0 ? `${ordersCount} ta jami` : "Hozircha buyurtma yo'q"}
        isPositive={true}
        icon={<ShoppingCart className="w-6 h-6" />}
        accentColor="chocolate"
      />
      <StatCard
        title="Kutilayotgan Buyurtma Tortlar"
        value={isLoading ? '...' : customCakesCount}
        change={customCakesCount > 0 ? `${customCakesCount} ta kutilmoqda` : "Kutilayotgan so'rov yo'q"}
        isPositive={true}
        icon={<Sparkles className="w-6 h-6" />}
        accentColor="pink"
      />
      <StatCard
        title="Faol Mahsulotlar"
        value={isLoading ? '...' : activeProductsCount}
        change={activeProductsCount > 0 ? "Sotuvda mavjud" : "Katalog bo'sh"}
        isPositive={true}
        icon={<Package className="w-6 h-6" />}
        accentColor="emerald"
      />
    </div>
  );
};
