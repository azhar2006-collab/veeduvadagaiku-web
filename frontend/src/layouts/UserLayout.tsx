import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { DashboardSidebar, SidebarItem } from '../components/dashboard/DashboardSidebar';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Heart, MessageSquare, User } from 'lucide-react';

export const UserLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const items: SidebarItem[] = [
    { label: 'Overview', href: '/user/dashboard', icon: LayoutDashboard },
    { label: 'Saved Properties', href: '/user/favourites', icon: Heart },
    { label: 'My Enquiries', href: '/user/enquiries', icon: MessageSquare },
    { label: 'My Profile', href: '/user/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar title="Tenant Account" items={items} />
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
