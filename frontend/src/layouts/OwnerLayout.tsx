import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { DashboardSidebar, SidebarItem } from '../components/dashboard/DashboardSidebar';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, Building2, PlusCircle, MessageSquare, UserCheck } from 'lucide-react';

export const OwnerLayout: React.FC = () => {
  const { isAuthenticated, isOwner } = useAuth();
  const { t, lang } = useLanguage();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?role=OWNER&redirect=${redirectParam}`} replace />;
  }

  if (!isOwner) {
    return <Navigate to="/user/dashboard" replace />;
  }

  const items: SidebarItem[] = [
    { label: t('nav.dashboard', 'Dashboard'), href: '/owner/dashboard', icon: LayoutDashboard },
    { label: t('nav.myProperties', 'My Properties'), href: '/owner/properties', icon: Building2 },
    { label: lang === 'ta' ? 'சொத்தை பதிவேற்றுக' : 'Add New Property', href: '/owner/properties/add', icon: PlusCircle },
    { label: t('nav.enquiries', 'Tenant Enquiries'), href: '/owner/enquiries', icon: MessageSquare },
    { label: t('nav.profile', 'Owner Profile'), href: '/owner/profile', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar title={lang === 'ta' ? 'சொத்து உரிமையாளர்' : 'Property Owner'} items={items} />
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
