import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { planService } from '../../services/plan.service';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { RazorpayCheckoutButton } from '../../components/payment/RazorpayCheckoutButton';

export const ListingPlansPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['listingPlans'],
    queryFn: () => planService.getPlans(),
  });

  const plans = data?.data || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <SEOHead title="Listing Plans & Pricing | Veedu Vadagaiku" />

      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-black uppercase tracking-widest text-[#9A7818]">
          Transparent Pricing
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Simple Plans, No Hidden Fees
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          List your property for 30 days. Save more with pack deals. No commissions, no brokerage.
        </p>
        {/* Quick price summary pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {[
            { label: 'Residential', price: '₹222/ad' },
            { label: 'Commercial', price: '₹555/ad' },
            { label: 'Residential Pack', price: '₹199/ad ×5' },
            { label: 'Commercial Pack', price: '₹444/ad ×5' },
          ].map(({ label, price }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF4E6] border border-[#E8DFC8] rounded-full text-[11px] font-bold text-[#9A7818]"
            >
              {label}: <span className="text-gray-900">{price}</span>
            </span>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Loader text="Loading listing plans..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
          {plans.map((plan) => {
            const isPack = plan.id.includes('_pack_');
            const perAdPrice = plan.id === 'plan_residential_pack_5' ? 199 : plan.id === 'plan_commercial_pack_5' ? 444 : null;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-6 sm:p-8 border flex flex-col justify-between transition-all ${
                  isPack
                    ? 'border-emerald-400 shadow-xl shadow-emerald-500/10'
                    : 'border-[#E8DFC8] shadow-sm hover:border-[#C5A059]'
                }`}
              >
                {isPack && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Best Value</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{plan.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                  </div>

                  <div className="pt-2 pb-4 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-gray-900">
                        ₹{plan.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {perAdPrice && (
                      <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                        ₹{perAdPrice}/ad — save with 5-pack!
                      </span>
                    )}
                    <span className="text-xs font-semibold text-[#9A7818] block mt-1">
                      {plan.durationDays} Days Active per Listing
                    </span>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2.5 text-xs text-gray-600">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link
                    to="/owner/properties/add"
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition active:scale-95 ${
                      isPack
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:brightness-105 text-white shadow-md shadow-[#D4AF37]/25'
                    }`}
                  >
                    <span>List & Choose {plan.name}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-6 bg-[#FCFAF5] rounded-3xl border border-[#E8DFC8] space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#C5A059] shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-gray-900">Razorpay Standard Checkout</h3>
            <p className="text-xs text-gray-600">
              Safe & Secure Indian Payments: All transactions are processed via Razorpay (UPI, Cards, Net Banking, Wallets) with instant HMAC-SHA256 signature verification.
            </p>
          </div>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EFE8D8]">
          <span className="text-xs text-gray-500 font-medium">
            Demo & Testing: Verify Razorpay Standard Checkout modal (₹1 minimum test)
          </span>
          <div className="w-full sm:w-auto">
            <RazorpayCheckoutButton
              amount={100}
              description="Razorpay Checkout Test"
              className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold text-xs rounded-xl shadow-sm hover:brightness-105 active:scale-95 transition"
            >
              Test Razorpay Checkout (₹1)
            </RazorpayCheckoutButton>
          </div>
        </div>
      </div>
    </div>
  );
};
