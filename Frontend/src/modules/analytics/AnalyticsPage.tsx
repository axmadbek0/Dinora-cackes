import React from 'react';
import { useAnalytics } from './hooks/useAnalytics';
import { StatGrid } from './components/StatGrid';
import { SalesChart } from './components/SalesChart';
import { CategoryPieChart } from './components/CategoryPieChart';
import { Loader2, TrendingUp, Award, Clock } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-dinora-gold animate-spin mb-3" />
        <p className="text-sm font-medium text-dinora-chocolate">Tahliliy ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  const hasSalesData = data?.monthlyRevenue && data.monthlyRevenue.some(m => m.revenue > 0 || m.orders > 0);
  const hasCategoryData = data?.categoryDistribution && data.categoryDistribution.some(c => c.count > 0);

  return (
    <div className="space-y-8">
      {/* Top Stat Cards Grid */}
      <StatGrid data={data} isLoading={isLoading} />

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SalesChart data={data?.monthlyRevenue} hasData={hasSalesData} />
        </div>
        <div>
          <CategoryPieChart data={data?.categoryDistribution} hasData={hasCategoryData} />
        </div>
      </div>

      {/* Quick Operational Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-dinora-border shadow-dinora flex items-center gap-4">
          <div className="p-3 bg-dinora-gold-light rounded-xl text-dinora-chocolate">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-dinora-chocolate font-serif">Eng Ommabop Mahsulot</h4>
            <p className="text-xs text-dinora-gray">
              {hasSalesData ? "Pistachili Medovik" : "Hozircha sotuv mavjud emas"}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-dinora-border shadow-dinora flex items-center gap-4">
          <div className="p-3 bg-dinora-pink-light rounded-xl text-dinora-pink">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-dinora-chocolate font-serif">Mijozlar Mamnunligi</h4>
            <p className="text-xs text-dinora-gray">100% Sifat кафолати</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-dinora-border shadow-dinora flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-dinora-chocolate font-serif">Yetkazib Berish Rejimi</h4>
            <p className="text-xs text-dinora-gray">Standart: 09:00 — 21:00</p>
          </div>
        </div>
      </div>
    </div>
  );
};
