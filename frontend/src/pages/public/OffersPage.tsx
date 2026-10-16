import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '../../components/common/SEOHead';
import { offerService } from '../../services/offer.service';
import {
  Sparkles,
  Gift,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  HelpCircle,
  Building2,
  Store,
} from 'lucide-react';
import { Loader } from '../../components/common/Loader';
import { isOfferActive } from '../../config/offersConfig';

export const OffersPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['promotionalOffers'],
    queryFn: () => offerService.getOffers(),
  });

  const offers = data?.allOffers || [];

  return (
    <div className="space-y-12 pb-16">
      <SEOHead
        title="Promotional Offers & Free Property Posting | Veedu Vadagaikku Chennai Chennai"
        description="Check out latest promotional deals on Veedu Vadagaikku Chennai. Post your Chennai house, shop, or flat for free during our festive offers."
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF4E6] via-[#FAF7F0] to-white border-b border-[#EFE8D8] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DFC8] text-[#9A7818] text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Gift className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Chennai Rental Promotions</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Special Offers & Deals
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
            Take advantage of our limited-time promotional offers to list your rental property for free with zero commission and maximum tenant reach in Chennai.
          </p>
        </div>
      </section>

      {/* Offers Showcase Container */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {isLoading ? (
          <Loader text="Loading available promotions..." />
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#EFE8D8] text-center space-y-3">
            <Tag className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-800">No active promotions right now</h3>
            <p className="text-sm text-gray-500">
              Please check back soon for our upcoming festive deals and discounts.
            </p>
            <Link
              to="/owner/listing-plans"
              className="inline-block px-5 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition"
            >
              View Standard Listing Plans
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {offers.map((offer) => {
              const active = offer.isCurrentlyActive ?? isOfferActive(offer);

              return (
                <div
                  key={offer.id}
                  className={`relative rounded-3xl border-2 transition-all overflow-hidden ${
                    active
                      ? 'border-[#D4AF37] bg-white shadow-xl shadow-amber-500/10'
                      : 'border-gray-200 bg-gray-50 opacity-80'
                  }`}
                >
                  {/* Top Ribbon */}
                  <div
                    className={`py-2 px-6 flex items-center justify-between text-xs font-black uppercase tracking-wider ${
                      active
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{offer.tagline || offer.badge}</span>
                    </div>
                    <span>{active ? 'Active Promotion' : 'Offer Expired'}</span>
                  </div>

                  <div className="p-6 sm:p-10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-gray-100">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                            {offer.name}
                          </h2>
                          {active && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                              100% Free
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-normal max-w-xl">
                          {offer.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 pt-1">
                          <Calendar className="w-4 h-4 text-[#C5A059]" />
                          <span>Expiry: {offer.expiryDisplay}</span>
                        </div>
                      </div>

                      {/* Pricing Tag */}
                      <div className="bg-[#FCFAF5] border border-[#E8DFC8] rounded-2xl p-5 text-right shrink-0 min-w-[200px]">
                        <span className="text-[11px] uppercase tracking-wider text-gray-400 font-extrabold block">
                          Posting Price
                        </span>
                        <div className="flex items-baseline justify-end gap-2 mt-1">
                          {offer.originalPrice > 0 && (
                            <span className="text-base sm:text-lg text-gray-400 line-through font-bold">
                              ₹{offer.originalPrice}
                            </span>
                          )}
                          <span className="text-3xl sm:text-4xl font-black text-emerald-600">
                            ₹{offer.price}
                          </span>
                        </div>
                        {offer.originalPrice > 0 && (
                          <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
                            Save ₹{offer.originalPrice} - ₹{offer.commercialOriginalPrice || 555} (100% OFF)
                          </span>
                        )}
                        <span className="text-[11px] text-gray-500 font-medium block mt-1">
                          {offer.durationDays} Days Listing Validity
                        </span>
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                        What’s Included in This Offer
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-700">
                        {offer.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                        <span>Zero payment required. Genuine ₹0 promotional plan.</span>
                      </div>

                      {active ? (
                        <Link
                          to={offer.ctaLink || '/owner/properties/add'}
                          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 active:scale-95 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#D4AF37]/25 transition flex items-center justify-center gap-2 text-center"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{offer.ctaText || 'Post Your Property for FREE'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-4 py-2.5 rounded-xl">
                          This festive offer has ended. Standard pricing applies.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* How to Claim in 3 Easy Steps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F0] rounded-3xl p-8 sm:p-10 border border-[#E8DFC8] space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#9A7818]">
              Simple & Straightforward
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              How to Claim Your Free Property Listing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#EFE8D8] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF4E6] text-[#9A7818] font-black text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-sm text-gray-900">Add Property Details</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Click “Post Your Property for FREE”, enter your locality, rent, and upload your property photos.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#EFE8D8] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF4E6] text-[#9A7818] font-black text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-sm text-gray-900">Choose Free Plan</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Select the <strong>Navaratri Free Posting Plan (₹0)</strong>. Payment gateway is completely bypassed.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#EFE8D8] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF4E6] text-[#9A7818] font-black text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-sm text-gray-900">Connect with Tenants</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Your listing is submitted for verification and published for 30 full days with direct calls & WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Everything you need to know about our Navaratri Free Posting promotion
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#C5A059]" />
              Is property posting really ₹0 during this offer?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Yes, absolutely! The Navaratri Free Posting Plan has a price of exactly ₹0. You do not need to enter credit card details or make any UPI payment to submit your listing.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#C5A059]" />
              Can I post both residential houses and commercial shops?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Yes, the Navaratri festive offer is applicable to all property categories across Chennai, including independent houses, apartments, commercial retail shops, hostels, and marriage halls.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#C5A059]" />
              What happens after the Navaratri offer expires?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Any property listing published during the promotional period will stay active for its full 30-day listing duration without any interruption. Once the promotional period ends, standard listing pricing (e.g. ₹222 for residential, ₹555 for commercial) will be automatically restored for new postings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
