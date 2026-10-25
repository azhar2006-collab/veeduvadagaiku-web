import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../services/property.service';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { CashfreeCheckoutButton } from '../../components/payment/CashfreeCheckoutButton';
import api from '../../lib/axios';
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Check,
  Home,
  CheckCircle,
  Star,
  Zap,
  Crown,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Plan feature sets by tier
const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    'Basic property listing for 30 days',
    'Direct tenant inquiry via phone/WhatsApp',
    'Admin verification within 24 hours',
    'Visible to all Chennai visitors',
  ],
  residential: [
    'Premium property listing for 90 days',
    'Priority placement in search results',
    'Direct tenant inquiry via phone/WhatsApp',
    'Admin verification within 24 hours',
    'Visible to all Chennai visitors',
    'High-resolution photo gallery',
  ],
  home_services: [
    'Home Services listing for 90 days',
    'Priority placement for service searches',
    'Direct client inquiry via phone/WhatsApp',
    'Admin verification within 24 hours',
    'Highlighted badge in service listings',
    'High-resolution photo gallery',
  ],
  commercial: [
    'Commercial property listing for 180 days',
    'Top placement in commercial searches',
    'Direct tenant inquiry via phone/WhatsApp',
    'Admin verification within 24 hours',
    'Featured commercial badge',
    'High-resolution photo gallery',
    'Extended listing duration (6 months)',
  ],
  kalyana_mandapam: [
    'Marriage Hall / Kalyana Mandapam listing for 365 days',
    'Top placement in event venue searches',
    'Direct booking inquiry via phone/WhatsApp',
    'Admin verification within 24 hours',
    'Premium event venue badge',
    'Full photo gallery showcase',
    '1-Year listing duration',
    'Priority customer support',
  ],
};

function getPlanFeatures(planName: string): string[] {
  const name = planName.toLowerCase();
  if (name.includes('free') || name.includes('0')) return PLAN_FEATURES.free;
  if (name.includes('residential') || name.includes('house') || name.includes('flat')) return PLAN_FEATURES.residential;
  if (name.includes('home service') || name.includes('service')) return PLAN_FEATURES.home_services;
  if (name.includes('commercial') || name.includes('shop')) return PLAN_FEATURES.commercial;
  if (name.includes('kalyana') || name.includes('marriage') || name.includes('mandapam')) return PLAN_FEATURES.kalyana_mandapam;
  return PLAN_FEATURES.residential;
}

function getPlanIcon(planName: string) {
  const name = planName.toLowerCase();
  if (name.includes('free')) return <Home className="w-5 h-5" />;
  if (name.includes('home service')) return <Zap className="w-5 h-5" />;
  if (name.includes('commercial')) return <Building2 className="w-5 h-5" />;
  if (name.includes('kalyana') || name.includes('marriage')) return <Crown className="w-5 h-5" />;
  return <Star className="w-5 h-5" />;
}

export const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Load property details
  const { data: propRes, isLoading: loadingProp } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertyService.getPropertyById(propertyId),
    enabled: !!propertyId,
    retry: 1,
  });
  const property = propRes?.data;

  // Load available plans
  const { data: plansRes, isLoading: loadingPlans } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const res = await api.get('/api/plans');
      return res.data?.data || res.data || [];
    },
    retry: 1,
  });
  const plans: any[] = Array.isArray(plansRes) ? plansRes : [];
  const activePlans = plans.filter((p: any) => p.isActive !== false);

  const selectedPlan = activePlans.find((p: any) => p.id === selectedPlanId);

  // Free plan submit (no payment)
  const handleFreeSubmit = async () => {
    if (!propertyId) {
      toast.error('Property not identified. Please select a property from My Properties.');
      return;
    }
    try {
      setIsProcessing(true);
      await propertyService.submitForReview(propertyId);
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      setShowSuccessPopup(true);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to submit property for review';
      if (errMsg.includes('already')) {
        setShowSuccessPopup(true);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
    queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    navigate(`/payment-result?status=success&propertyId=${propertyId}`);
  };

  if (loadingProp || loadingPlans) {
    return <Loader fullScreen text="Loading listing plans..." />;
  }

  const isAlreadyPending = property?.status === 'PENDING_APPROVAL';
  const isAlreadyPublished = property?.status === 'PUBLISHED';

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <SEOHead title="Choose Listing Plan | Veedu Vadagaikku Chennai" />

      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#9A7818] bg-[#FAF4E6] border border-[#E8DFC8] px-3.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          Deepavali Special Offers â€” Choose Your Plan
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Select a Listing Plan
        </h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          Choose the plan that fits your property type. Free listing available â€” paid plans get priority placement and longer durations.
        </p>
      </div>

      {/* Property Summary Card */}
      {property && (
        <div className="bg-white rounded-3xl p-6 border border-[#EFE8D8] shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A7818] bg-[#FAF4E6] px-2.5 py-0.5 rounded-full">
                {property.propertyType}
              </span>
              <h2 className="text-lg font-black text-gray-900 leading-snug">
                {property.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{property.locality}, Chennai</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-gray-400 block font-medium">Rent</span>
              <span className="text-xl font-black text-[#0B3B60]">
                â‚¹{property.rent?.toLocaleString('en-IN') || 'â€”'}
                <span className="text-xs font-normal text-gray-500">/mo</span>
              </span>
            </div>
          </div>

          {isAlreadyPending && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-900 font-semibold">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>This property is already under admin review and will be live shortly.</span>
            </div>
          )}
          {isAlreadyPublished && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-xs text-green-900 font-semibold">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <span>This property is already published and live to Chennai renters!</span>
            </div>
          )}
        </div>
      )}

      {/* Plan Cards */}
      {activePlans.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 px-1">Available Plans</h3>
          <div className="grid gap-3">
            {activePlans.map((plan: any) => {
              const isFree = plan.price === 0;
              const isSelected = selectedPlanId === plan.id;
              const features = getPlanFeatures(plan.name);

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                    isSelected
                      ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFFDF7] to-[#FAF6EE] shadow-lg shadow-[#D4AF37]/10'
                      : 'border-gray-200 bg-white hover:border-[#D4AF37]/40 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {getPlanIcon(plan.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900 text-sm">{plan.name}</span>
                          {isFree && (
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                              Free
                            </span>
                          )}
                          {plan.durationDays && (
                            <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                              {plan.durationDays} days
                            </span>
                          )}
                        </div>
                        {plan.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-2xl font-black text-[#0B3B60]">
                        {isFree ? 'â‚¹0' : `â‚¹${plan.price.toLocaleString('en-IN')}`}
                      </span>
                      {!isFree && (
                        <span className="text-xs text-gray-400 block">one-time</span>
                      )}
                    </div>
                  </div>

                  {/* Features (show when selected) */}
                  {isSelected && (
                    <ul className="mt-4 space-y-2 border-t border-[#EFE8D8] pt-4">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Section */}
      {selectedPlan && (
        <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FAF6EE] rounded-3xl p-6 sm:p-8 border border-[#E8DFC8] shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFE8D8]">
            <div>
              <h3 className="font-bold text-sm text-gray-900">{selectedPlan.name}</h3>
              <p className="text-xs text-gray-500">Selected Plan</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#0B3B60]">
                {selectedPlan.price === 0 ? 'â‚¹0' : `â‚¹${selectedPlan.price.toLocaleString('en-IN')}`}
              </span>
              {selectedPlan.price === 0 && (
                <p className="text-xs text-emerald-600 font-semibold">100% Free</p>
              )}
            </div>
          </div>

          {/* Action Button */}
          {isAlreadyPublished ? (
            <Link
              to="/owner/properties"
              className="w-full py-4 px-6 bg-[#0B3B60] hover:bg-[#072640] text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>View in My Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : isAlreadyPending ? (
            <div className="space-y-3">
              <button
                type="button"
                disabled
                className="w-full py-4 px-6 bg-blue-600 text-white font-extrabold text-sm rounded-xl opacity-90 cursor-default flex items-center justify-center gap-2"
              >
                <Clock className="w-5 h-5" />
                <span>Already Under Admin Review</span>
              </button>
              <div className="text-center">
                <Link to="/owner/properties" className="text-xs text-[#0B3B60] font-bold hover:underline">
                  â† Return to My Properties
                </Link>
              </div>
            </div>
          ) : selectedPlan.price === 0 ? (
            // Free plan â€” direct submit
            <button
              type="button"
              onClick={handleFreeSubmit}
              disabled={isProcessing}
              className="w-full py-4 px-6 text-white font-extrabold text-sm rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 shadow-[#D4AF37]/25"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting for Admin Review...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  <span>Submit for Admin Review (Free)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            // Paid plan â€” Cashfree checkout
            <CashfreeCheckoutButton
              amount={selectedPlan.price}
              propertyId={propertyId}
              planId={selectedPlan.id}
              onSuccess={handlePaymentSuccess}
              onError={(err) => {
                console.error('Payment error:', err);
              }}
            />
          )}

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-5 text-xs text-gray-400 pt-2 flex-wrap">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              Secure Cashfree Checkout
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C5A059]" />
              24-Hour Review Turnaround
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
              Zero Commission
            </span>
          </div>
        </div>
      )}

      {/* Default CTA when no plan selected */}
      {!selectedPlan && activePlans.length > 0 && (
        <div className="text-center py-6 text-sm text-gray-500">
          <p>Select a plan above to continue with your listing.</p>
        </div>
      )}

      {/* Fallback if no plans */}
      {!loadingPlans && activePlans.length === 0 && (
        <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FAF6EE] rounded-3xl p-6 sm:p-8 border border-[#E8DFC8] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFE8D8]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FAF4E6] border border-[#D4AF37]/30 flex items-center justify-center text-[#9A7818]">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Standard Listing Plan</h3>
                <p className="text-xs text-emerald-700 font-semibold">100% Free Forever</p>
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-600">â‚¹0</span>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-gray-700 font-medium">
            {[
              'Free property listing across Chennai for 30+ days',
              'Direct tenant inquiries via Phone Call & WhatsApp â€” Zero Brokerage',
              'Admin quality verification within 24 hours',
              'Visible to all Chennai visitors, even non-registered users',
              'High-resolution photo gallery & locality search prominence',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {isAlreadyPublished ? (
            <Link to="/owner/properties" className="w-full py-4 px-6 bg-[#0B3B60] hover:bg-[#072640] text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2">
              <span>View in My Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleFreeSubmit}
              disabled={isProcessing || isAlreadyPending}
              className="w-full py-4 px-6 text-white font-extrabold text-sm rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105"
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /><span>Submitting...</span></>
              ) : isAlreadyPending ? (
                <><Clock className="w-5 h-5" /><span>Already Under Admin Review</span></>
              ) : (
                <><Sparkles className="w-5 h-5 text-amber-200" /><span>Submit for Admin Review (100% Free)</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
      )}

      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#0B3B60]" />
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#9A7818]">
                Listing Submitted Successfully!
              </span>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Your Request Has Been Received
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                Your property <strong className="text-gray-800">"{property?.title || 'Your Property'}"</strong> has been submitted <strong className="text-emerald-700">FREE</strong> for admin review.
              </p>
            </div>
            <div className="bg-[#FCFAF5] border border-[#E8DFC8] rounded-2xl px-5 py-4 text-left space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-[#0B3B60] text-white text-xs font-black px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> Within 24 Hours
                </span>
                <span className="text-xs font-bold text-gray-700">Fast Admin Review</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Our team will verify the listing photos and details. Once approved, your property will go live immediately.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/owner/properties')}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:brightness-105 text-white font-black text-sm rounded-xl shadow-lg transition active:scale-[0.98]"
              >
                Go to My Properties â†’
              </button>
              <Link to="/" className="block text-xs text-gray-400 font-bold hover:text-gray-600 transition pt-1">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
