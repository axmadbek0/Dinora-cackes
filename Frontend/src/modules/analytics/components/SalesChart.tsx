import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface SalesChartProps {
  data?: { month: string; revenue: number; orders: number }[];
  hasData?: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data = [], hasData = false }) => {
  const formatMoney = (val: number) => {
    if (val === 0) return '0 UZS';
    return `${(val / 1000000).toFixed(1)}M so'm`;
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-dinora border border-dinora-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-dinora-chocolate font-serif">
            Sotuv Dinamikasi va Oylik Tushum
          </h3>
          <p className="text-xs text-dinora-gray">Oylik tushum ko'rsatkichlari (UZS)</p>
        </div>
        <span className="px-3 py-1 bg-dinora-gold-light text-dinora-chocolate text-xs font-semibold rounded-full border border-dinora-gold/30">
          2026 — Oylik Hisobot
        </span>
      </div>

      {!hasData ? (
        <div className="h-72 w-full flex flex-col items-center justify-center text-center p-6 bg-dinora-bg/50 rounded-xl border border-dashed border-dinora-border">
          <BarChart3 className="w-12 h-12 text-dinora-gray/40 mb-2" />
          <p className="text-sm font-bold text-dinora-chocolate">Hozircha sotuv dinamikasi mavjud emas</p>
          <p className="text-xs text-dinora-gray mt-1 max-w-xs">
            Yangi buyurtmalar kelib tushgach, ushbu grafikda oylik tushum ko'rsatkichlari aks etadi.
          </p>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CBB279" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#CBB279" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={formatMoney}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: any) => [
                  new Intl.NumberFormat('uz-UZ').format(Number(value)) + " so'm",
                  'Tushum',
                ]}
                contentStyle={{
                  backgroundColor: '#2B1810',
                  borderColor: '#CBB279',
                  borderRadius: '12px',
                  color: '#FAF6F0',
                  boxShadow: '0 10px 25px -3px rgba(0,0,0,0.3)',
                }}
                itemStyle={{ color: '#CBB279' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2B1810"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
