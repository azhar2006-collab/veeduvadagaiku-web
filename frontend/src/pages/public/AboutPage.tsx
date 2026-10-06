import React from 'react';
import { Home, ShieldCheck, Zap, Users, Building2, Store } from 'lucide-react';
import { SEOHead } from '../../components/common/SEOHead';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <SEOHead
        title="About Us | Veedu Vadagaiku - Chennai Rental Marketplace"
        description="Learn about Veedu Vadagaiku, Chennai's dedicated rental marketplace for verified houses and commercial shops."
      />

      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-black tracking-widest text-orange-600 uppercase">
          About Veedu Vadagaiku
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Simplifying Rentals Across Chennai
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Founded with a simple mission: To make renting a home or commercial shop in Chennai completely transparent, direct, and zero hassle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Admin-Verified Listings</h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Every house and shop listing goes through manual review before publishing, protecting you from ghost listings and scam deposits.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Direct Owner Contact</h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Zero brokerage fees for tenants. Contact property landlords directly via phone call, WhatsApp, or instant in-app enquiry.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Dedicated Chennai Focus</h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Tailored specifically for Chennai's unique neighborhoods—from Mylapore & T. Nagar to OMR IT corridors & Porur industrial belts.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#FAF4E6] via-[#F8F1E0] to-[#F4E8D0] rounded-3xl p-8 sm:p-12 text-[#1E2329] shadow-xl border border-[#E5DAC4] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Are you a Property Owner in Chennai?</h3>
          <p className="text-sm text-gray-700 max-w-md">
            Reach thousands of prospective tenants searching daily. List your house or commercial shop in under 5 minutes.
          </p>
        </div>
        <a
          href="/owner/properties/add"
          className="px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 text-white font-bold text-sm rounded-xl shadow-md shadow-[#D4AF37]/25 transition whitespace-nowrap"
        >
          Post Property / Register
        </a>
      </div>
    </div>
  );
};
