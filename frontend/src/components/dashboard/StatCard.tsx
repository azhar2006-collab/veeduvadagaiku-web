import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  color?: 'orange' | 'blue' | 'green' | 'red' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive,
  color = 'orange',
}) => {
  const colorStyles = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  }[color];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">{value}</h3>
          {change && (
            <p
              className={`text-xs font-semibold mt-2 ${
                isPositive ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl border ${colorStyles}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
