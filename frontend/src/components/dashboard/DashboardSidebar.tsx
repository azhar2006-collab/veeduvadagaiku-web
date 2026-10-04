import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LucideIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
}

interface DashboardSidebarProps {
  title: string;
  items: SidebarItem[];
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ title, items }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-full lg:w-64 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm h-fit">
      {/* Logo */}
      <div className="px-2 pb-4 mb-2 border-b border-gray-100 flex items-center gap-2.5">
        <img src="/logo-badge.jpg" alt="Veedu Vadagaiku" className="w-8 h-8 rounded-lg object-cover" />
        <img src="/logo-header.jpg" alt="Veedu Vadagaiku" className="h-5 object-contain" />
      </div>

      {/* User Mini Profile */}
      <div className="p-4 mb-4 bg-orange-50/60 rounded-xl border border-orange-100/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-gray-900 truncate">{user?.name}</h4>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full inline-block">
              {title}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/user/dashboard' || item.href === '/owner/dashboard' || item.href === '/admin/dashboard'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-current font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="border-t border-gray-100 my-2 pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
