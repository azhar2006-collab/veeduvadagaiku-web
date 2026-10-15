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

        {/* ─── Home Services Platform Disclaimer ─── */}
        <section id="home-services-disclaimer" className="pt-6 border-t border-gray-200 space-y-6">
          <div className="bg-[#FAF4E6] border border-[#E8DFC8] rounded-2xl p-5 sm:p-6 space-y-2">
            <span className="inline-block px-3 py-1 bg-white border border-[#E8DFC8] text-[#9A7818] rounded-full text-xs font-bold uppercase tracking-wider">
              Platform Disclaimer
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Home Services Platform Disclaimer
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              This disclaimer governs the discovery, connection, and engagement of independent home service
              providers listed on VeeduVadagaiku. Please read these terms carefully before engaging any service provider.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">1. Our Role as a Platform</h3>
              <p>
                VeeduVadagaiku operates solely as an intermediary technology platform connecting customers with
                independent home service providers, technicians, workers, and service owners across Chennai. We
                facilitate discovery and direct communication for services such as movers and packers, renovation,
                cleaning, pest control, AC servicing, and legal documentation. While we strive to maintain a trusted
                marketplace, VeeduVadagaiku acts as a connecting platform and is not an employer, contractor, or joint
                venture partner of any service provider, subject to all statutory responsibilities applicable under
                relevant consumer protection and intermediary laws.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">2. Independent Service Providers</h3>
              <p>
                All home service providers listed on the platform operate as independent business entities and
                professionals. Service providers are solely responsible for their conduct, workforce, equipment,
                safety practices, licensing, and the execution of all tasks commissioned by customers. VeeduVadagaiku
                does not directly employ service workers or supervise on-site service delivery.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">3. Service Quality and Responsibility</h3>
              <p>
                The respective service providers are directly responsible for carrying out work in accordance with
                agreed specifications, safety guidelines, and quality standards. While VeeduVadagaiku conducts basic
                administrative verification of listed profiles, customers are encouraged to verify service scopes,
                credentials, warranties, and terms directly with the provider before authorizing work. Nothing in this
                disclaimer or these Terms & Conditions excludes, restricts, or limits any statutory consumer rights or
                guarantees that cannot be lawfully excluded under applicable laws, including the Consumer Protection
                Act, 2019.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">4. Pricing and Payments</h3>
              <p>
                All service estimates, hourly rates, material costs, and payment milestones are negotiated and
                established directly between the customer and the service provider. Unless a payment is explicitly
                processed through an official VeeduVadagaiku platform checkout feature, all payments are made directly
                to the service provider. Customers are advised to obtain written estimates, confirm deliverables, and
                retain receipts or invoices for all transactions.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">5. Disputes and Complaints</h3>
              <p>
                If any dispute, dissatisfaction, or disagreement arises regarding service delivery, delays, or
                pricing, customers should first attempt to resolve the matter directly with the service provider.
                Customers may also notify VeeduVadagaiku support at{' '}
                <a
                  href="mailto:admin@veeduvadagaiku.com"
                  className="text-[#9A7818] font-semibold underline hover:text-[#C5A059]"
                >
                  admin@veeduvadagaiku.com
                </a>
                . We review complaints and take appropriate administrative measures, including issuing warnings,
                suspending, or permanently removing non-compliant service providers from the platform. These platform
                moderation processes are supplementary and do not diminish or waive any statutory remedies, consumer
                forum proceedings, or legal claims available to consumers under applicable law.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">6. Accuracy of Information</h3>
              <p>
                Service providers are obligated to ensure that their business descriptions, service areas, contact
                numbers, pricing ranges, and experience credentials are accurate, lawful, and updated. VeeduVadagaiku
                makes reasonable efforts to maintain authentic listings; however, customers must confirm critical
                requirements and terms directly with the provider prior to engagement.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">7. Acceptance of These Terms</h3>
              <p>
                By accessing, browsing, or contacting service providers through the Home Services section of
                VeeduVadagaiku, you acknowledge that you have read, understood, and agreed to this Home Services
                Platform Disclaimer in conjunction with our general Terms & Conditions. These terms do not waive or
                affect any non-excludable legal protections or statutory rights granted to you by law.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
