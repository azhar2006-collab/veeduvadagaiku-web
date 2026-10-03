import React from 'react';
import { SEOHead } from '../../components/common/SEOHead';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <SEOHead
        title="Privacy Policy | Veedu Vadagaiku"
        description="Privacy policy and data protection principles on Veedu Vadagaiku."
      />

      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mt-1">Last updated: October 2026 • Chennai, India</p>
      </div>

      <div className="prose prose-orange max-w-none text-gray-600 text-sm sm:text-base leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">1. Information We Collect</h2>
          <p>
            We collect personal information such as mobile phone numbers (verified via SMS OTP), names, and optional email addresses when you register on our platform. For property owners, we also collect property addresses, rental rates, and uploaded property images.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">2. How We Use Your Information</h2>
          <p>
            Your information is used solely to facilitate connection between verified tenants and property landlords in Chennai, to process listing subscription payments securely via Cashfree, and to improve our platform experience.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">3. Contact Preference & Privacy Protection</h2>
          <p>
            We respect owner privacy. Owners can choose whether to display direct phone calling, WhatsApp redirection, or only in-app message enquiry options. We never sell your personal information to third-party telemarketers or external broker syndicates.
          </p>
        </section>
      </div>
    </div>
  );
};
