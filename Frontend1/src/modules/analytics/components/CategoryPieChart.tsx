import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

interface CategoryPieChartProps {
  data?: { category: string; count: number }[];
  hasData?: boolean;
}

const COLORS = ['#2B1810', '#CBB279', '#D65B78', '#3D2419', '#10B981'];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data = [], hasData = false }) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-dinora border border-dinora-border flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-bold text-dinora-chocolate font-serif">
          Kategoriyalar Ulushi
        </h3>
        <p className="text-xs text-dinora-gray">Eng ko'p sotilgan mahsulotlar turkumi</p>
      </div>

      {!hasData ? (
        <div className="h-64 w-full my-4 flex flex-col items-center justify-center text-center p-6 bg-dinora-bg/50 rounded-xl border border-dashed border-dinora-border">
          <PieIcon className="w-10 h-10 text-dinora-gray/40 mb-2" />
          <p className="text-xs font-bold text-dinora-chocolate">Kategoriyalar statistikasi yo'q</p>
          <p className="text-[11px] text-dinora-gray mt-1 max-w-xs">
            Xaridlar boshlangach, ulushlar bu yerda ko'rinadi.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full my-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="count"
                nameKey="category"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2B1810',
                  borderColor: '#CBB279',
                  borderRadius: '12px',
                  color: '#FAF6F0',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-xs font-semibold text-dinora-chocolate">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
