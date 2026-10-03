import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { DashboardSidebar, SidebarItem } from '../components/dashboard/DashboardSidebar';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Building2, PlusCircle, MessageSquare, UserCheck } from 'lucide-react';

export const OwnerLayout: React.FC = () => {
  const { isAuthenticated, isOwner } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login?role=OWNER" replace />;
  }

  if (!isOwner) {
    return <Navigate to="/user/dashboard" replace />;
  }

  const items: SidebarItem[] = [
    { label: 'Dashboard', href: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'My Properties', href: '/owner/properties', icon: Building2 },
    { label: 'Add New Property', href: '/owner/properties/add', icon: PlusCircle },
    { label: 'Tenant Enquiries', href: '/owner/enquiries', icon: MessageSquare },
    { label: 'Owner Profile', href: '/owner/profile', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar title="Property Owner" items={items} />
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
