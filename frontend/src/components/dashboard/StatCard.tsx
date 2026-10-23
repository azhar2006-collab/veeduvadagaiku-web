import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  change?: string;
  isPositive?: boolean;
  color?: 'orange' | 'blue' | 'green' | 'red' | 'purple';
  hideIcon?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive,
  color = 'orange',
  hideIcon = false,
}) => {
  const accentBorder = {
    orange: 'border-t-amber-500',
    blue: 'border-t-blue-500',
    green: 'border-t-emerald-500',
    red: 'border-t-rose-500',
    purple: 'border-t-purple-500',
  }[color];

  const dotColor = {
    orange: 'bg-amber-400',
    blue: 'bg-blue-400',
    green: 'bg-emerald-400',
    red: 'bg-rose-400',
    purple: 'bg-purple-400',
  }[color];

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 relative overflow-hidden group border-t-[3px] ${accentBorder}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest truncate">
            {title}
          </p>
        </div>

        {Icon && !hideIcon && (
          <Icon className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
        )}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight font-sans">
          {value}
        </h3>
      </div>

      {change && (
        <p
          className={`text-xs font-medium mt-2 flex items-center gap-1 ${
            isPositive ? 'text-emerald-600' : 'text-rose-500'
          }`}
        >
          {change}
        </p>
      )}
    </div>
  );
};
