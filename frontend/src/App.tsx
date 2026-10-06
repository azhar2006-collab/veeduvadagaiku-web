import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { UserLayout } from './layouts/UserLayout';
import { OwnerLayout } from './layouts/OwnerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { PropertiesPage } from './pages/public/PropertiesPage';
import { HousesPage } from './pages/public/HousesPage';
import { ShopsPage } from './pages/public/ShopsPage';
import { PropertyDetailPage } from './pages/public/PropertyDetailPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';

// Tenant / User Pages
import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { UserProfilePage } from './pages/user/UserProfilePage';
import { FavouritesPage } from './pages/user/FavouritesPage';
import { UserEnquiriesPage } from './pages/user/UserEnquiriesPage';

// Owner Pages
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage';
import { OwnerProfilePage } from './pages/owner/OwnerProfilePage';
import { MyPropertiesPage } from './pages/owner/MyPropertiesPage';
import { AddPropertyPage } from './pages/owner/AddPropertyPage';
import { EditPropertyPage } from './pages/owner/EditPropertyPage';
import { ListingPlansPage } from './pages/owner/ListingPlansPage';
import { PaymentPage } from './pages/owner/PaymentPage';
import { PaymentResultPage } from './pages/owner/PaymentResultPage';
import { PropertyStatusPage } from './pages/owner/PropertyStatusPage';
import { OwnerEnquiriesPage } from './pages/owner/OwnerEnquiriesPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ManageUsersPage } from './pages/admin/ManageUsersPage';
import { ManageOwnersPage } from './pages/admin/ManageOwnersPage';
import { ManagePropertiesPage } from './pages/admin/ManagePropertiesPage';
import { PendingApprovalsPage } from './pages/admin/PendingApprovalsPage';
import { ManagePaymentsPage } from './pages/admin/ManagePaymentsPage';
import { ManagePlansPage } from './pages/admin/ManagePlansPage';
import { ManageEnquiriesPage } from './pages/admin/ManageEnquiriesPage';

export const App: React.FC = () => {
  React.useEffect(() => {
    const mountTime = Date.now();
    const MIN_DISPLAY = 3000; // hold for at least 3 seconds
    const ANIM_DURATION = 1500; // matches CSS preloaderSlideUp duration

    const dismiss = () => {
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.classList.add('preloader-exit');
        setTimeout(() => preloader.remove(), ANIM_DURATION);
      }
    };

    const elapsed = Date.now() - mountTime;
    const delay = Math.max(0, MIN_DISPLAY - elapsed);
    const timer = setTimeout(dismiss, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Routes>
      {/* ─── Public Routes ─── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/houses" element={<HousesPage />} />
        <Route path="/shops" element={<ShopsPage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>

      {/* ─── Tenant / User Portal ─── */}
      <Route path="/user" element={<UserLayout />}>
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboardPage />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="favourites" element={<FavouritesPage />} />
        <Route path="enquiries" element={<UserEnquiriesPage />} />
      </Route>

      {/* ─── Property Owner Portal ─── */}
      <Route path="/owner" element={<OwnerLayout />}>
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboardPage />} />
        <Route path="profile" element={<OwnerProfilePage />} />
        <Route path="properties" element={<MyPropertiesPage />} />
        <Route path="properties/add" element={<AddPropertyPage />} />
        <Route path="properties/:id/edit" element={<EditPropertyPage />} />
        <Route path="listing-plans" element={<ListingPlansPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="payment/result" element={<PaymentResultPage />} />
        <Route path="property-status" element={<PropertyStatusPage />} />
        <Route path="enquiries" element={<OwnerEnquiriesPage />} />
      </Route>

      {/* ─── Admin Portal ─── */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<ManageUsersPage />} />
        <Route path="owners" element={<ManageOwnersPage />} />
        <Route path="properties" element={<ManagePropertiesPage />} />
        <Route path="pending" element={<PendingApprovalsPage />} />
        <Route path="payments" element={<ManagePaymentsPage />} />
        <Route path="plans" element={<ManagePlansPage />} />
        <Route path="enquiries" element={<ManageEnquiriesPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
