import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { planService } from '../../services/plan.service';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';

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
        <span className="text-xs font-black uppercase tracking-widest text-orange-600">
          Transparent Pricing
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Choose a Chennai Listing Plan
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          List your house or commercial shop with guaranteed tenant reach across Chennai. Zero commissions.
        </p>
      </div>

      {isLoading ? (
        <Loader text="Loading listing plans..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => {
            const isPopular = plan.name.toLowerCase() === 'standard';

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-6 sm:p-8 border flex flex-col justify-between transition-all ${
                  isPopular
                    ? 'border-orange-500 shadow-xl shadow-orange-500/10 scale-105 z-10'
                    : 'border-gray-200 shadow-sm hover:border-orange-300'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                  </div>

                  <div className="pt-2 pb-4 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-gray-900">
                        ₹{plan.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-orange-600 block mt-1">
                      Active for {plan.durationDays} Days
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

                <div className="pt-8">
                  <Link
                    to={`/owner/properties`}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition active:scale-95 ${
                      isPopular
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/30'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    <span>Choose {plan.name}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-6 bg-emerald-50/60 rounded-3xl border border-emerald-100 flex items-center gap-4 text-xs text-emerald-950">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
        <p className="leading-relaxed">
          <strong>Safe & Secure Indian Payments:</strong> All transactions are processed via Cashfree (UPI, Cards, Net Banking) with instant server-side verification. Your property moves immediately to the admin verification queue.
        </p>
      </div>
    </div>
  );
};
