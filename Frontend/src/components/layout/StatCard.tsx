import React from 'react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  accentColor?: 'gold' | 'pink' | 'chocolate' | 'emerald';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  accentColor = 'gold',
}) => {
  const accentStyles = {
    gold: 'bg-dinora-gold-light/60 text-dinora-chocolate border-dinora-gold/30',
    pink: 'bg-dinora-pink-light text-dinora-pink border-dinora-pink/30',
    chocolate: 'bg-dinora-chocolate/10 text-dinora-chocolate border-dinora-chocolate/20',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-dinora border border-dinora-border transition-all duration-300 hover:shadow-dinora-hover hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-dinora-gray">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-dinora-chocolate font-serif">{value}</h3>
          {change && (
            <p
              className={clsx(
                'mt-2 text-xs font-semibold flex items-center gap-1',
                isPositive ? 'text-emerald-600' : 'text-dinora-pink'
              )}
            >
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{change}</span>
            </p>
          )}
        </div>
        <div
          className={clsx(
            'flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm',
            accentStyles[accentColor]
          )}
        >
          {icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-dinora-gold via-dinora-chocolate to-dinora-pink opacity-20" />
    </div>
  );
};
