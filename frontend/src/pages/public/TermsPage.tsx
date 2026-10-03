import React from 'react';
import { SEOHead } from '../../components/common/SEOHead';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <SEOHead
        title="Terms & Conditions | Veedu Vadagaiku"
        description="Terms and conditions for using the Veedu Vadagaiku rental marketplace."
      />

      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Terms & Conditions</h1>
        <p className="text-sm text-gray-500 mt-1">Last updated: October 2026 • Chennai, India</p>
      </div>

      <div className="prose prose-orange max-w-none text-gray-600 text-sm sm:text-base leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Veedu Vadagaiku platform ("Website", "Service"), you agree to be bound by these Terms and Conditions. If you disagree with any part, you may not access our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">2. Rental Marketplace Platform</h2>
          <p>
            Veedu Vadagaiku provides an online marketplace connecting property owners (landlords) and prospective tenants in Chennai, Tamil Nadu. We do not own, manage, or inspect properties personally. All rental negotiations, agreements, and security deposit transactions are strictly between landlords and tenants.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">3. Owner Listing Rules & Payment Policy</h2>
          <p>
            Property owners must provide accurate property descriptions, authentic photos, and true rental and deposit figures. Any listing found to be deceptive, misleading, or fraudulent will be rejected or immediately removed without refund. Listing fees are non-refundable once payment is completed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">4. Admin Approval & Moderation</h2>
          <p>
            All submitted property ads are subject to administrative review. We reserve the absolute right to approve or reject any listing to maintain high trust and safety standards across Chennai.
          </p>
        </section>
      </div>
    </div>
  );
};
