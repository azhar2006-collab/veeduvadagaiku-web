import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { DashboardSidebar, SidebarItem } from '../components/dashboard/DashboardSidebar';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Clock,
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Layers,
  MessageSquare,
  Home,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const items: SidebarItem[] = [
    { label: 'Admin Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Pending Approvals', href: '/admin/pending', icon: Clock },
    { label: 'Manage Properties', href: '/admin/properties', icon: Building2 },
    { label: 'Manage Owners', href: '/admin/owners', icon: ShieldCheck },
    { label: 'Manage Users', href: '/admin/users', icon: Users },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    { label: 'Listing Plans', href: '/admin/plans', icon: Layers },
    { label: 'All Enquiries', href: '/admin/enquiries', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Admin Top Header */}
      <header className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white">
              V
            </div>
            <span className="font-extrabold text-base tracking-tight">
              Veedu Vadagaiku <span className="text-orange-500 font-normal">| Admin Portal</span>
            </span>
          </div>
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>View Live Website</span>
          </Link>
        </div>
      </header>

      {/* Main Admin Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar title="Super Admin" items={items} />
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
