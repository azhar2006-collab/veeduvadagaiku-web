import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { planService } from '../../services/plan.service';
import { paymentService } from '../../services/payment.service';
import { propertyService } from '../../services/property.service';
import { useAuth } from '../../hooks/useAuth';
import { getCashfree } from '../../utils/cashfree';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { CreditCard, ShieldCheck, ArrowRight, Smartphone, Banknote, Loader2, Sparkles, Gift, CheckCircle2, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submittedPropTitle, setSubmittedPropTitle] = useState('');

  // Load plans
  const { data: plansRes, isLoading: loadingPlans } = useQuery({
    queryKey: ['listingPlans'],
    queryFn: () => planService.getPlans(),
  });
  const plans = plansRes?.data || [];

  // Load property details (load early so we can auto-select correct plan)
  const { data: propRes } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertyService.getPropertyById(propertyId),
    enabled: !!propertyId,
    retry: 1,
  });
  const property = propRes?.data;

  // Auto-select plan: prioritize Navaratri Free plan if available, else property type default
  React.useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      const freePlan = plans.find((p) => p.price === 0 || p.id === 'plan_navaratri_free');
      if (freePlan) {
        setSelectedPlanId(freePlan.id);
      } else if (property) {
        const isCommercial = property.propertyType === 'SHOP';
        const defaultPlanId = isCommercial ? 'plan_commercial_single' : 'plan_residential_single';
        const defaultPlan = plans.find((p) => p.id === defaultPlanId) || plans[0];
        if (defaultPlan) setSelectedPlanId(defaultPlan.id);
      } else {
        setSelectedPlanId(plans[0].id);
      }
    }
  }, [plans, selectedPlanId, property]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const isSelectedPlanFree = selectedPlan?.price === 0 || selectedPlan?.id === 'plan_navaratri_free';

  const handlePay = async () => {
    if (!propertyId) {
      toast.error('Property not identified');
      return;
    }
    if (!selectedPlanId) {
      toast.error('Please select a listing plan');
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Create order on backend (handles both free promo and paid plans)
      const orderRes = await paymentService.createOrder(propertyId, selectedPlanId);

      // If this is a free promotional plan, show success popup — no payment gateway needed!
      if (orderRes?.isFree || orderRes?.amount === 0 || isSelectedPlanFree) {
        setIsProcessing(false);
        setSubmittedPropTitle(property?.title || 'Your Property');
        setShowSuccessPopup(true);
        return;
      }

      const paymentSessionId = orderRes?.payment_session_id;
      const orderId = orderRes?.order_id;

      if (!paymentSessionId || !orderId) {
        throw new Error(orderRes?.message || 'Payment session could not be created');
      }

      // 2. Initialize Cashfree Web SDK
      const cashfree = await getCashfree();

      // 3. Open Cashfree Checkout Modal
      const checkoutResult = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_modal',
      });

      if (checkoutResult?.error) {
        setIsProcessing(false);
        toast.error(checkoutResult.error.message || 'Payment was cancelled');
        return;
      }

      // If checkout finishes inline in modal or redirects
      if (checkoutResult?.paymentDetails) {
        // Verify payment status with backend
        try {
          const verifyRes = await paymentService.verifyPayment({ order_id: orderId });
          setIsProcessing(false);
          if (verifyRes.success || verifyRes.status === 'PAID') {
            navigate(
              `/owner/payment/result?status=success&orderId=${orderId}&propTitle=${encodeURIComponent(
                property?.title || 'Your Property'
              )}`
            );
          } else {
            navigate(
              `/owner/payment/result?status=failure&orderId=${orderId}&message=${encodeURIComponent(
                verifyRes.message || 'Payment verification failed'
              )}`
            );
          }
        } catch (verifyErr: any) {
          setIsProcessing(false);
          navigate(
            `/owner/payment/result?status=failure&orderId=${orderId}&message=${encodeURIComponent(
              verifyErr.response?.data?.message || 'Payment verification error'
            )}`
          );
        }
      } else {
        setIsProcessing(false);
      }
    } catch (err: any) {
      setIsProcessing(false);
      const errMsg =
        err.response?.data?.message || err.message || 'Could not initiate payment. Try again.';
      toast.error(errMsg);
    }
  };

  if (loadingPlans) {
    return <Loader fullScreen text="Loading listing plans..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <SEOHead title="Select Listing Plan & Pay | Veedu Vadagaikku Chennai" />

      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-[#9A7818] bg-[#FAF4E6] border border-[#E8DFC8] px-3 py-1 rounded-full">
          Step 2 of 2
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Select Listing Plan for Your Property
        </h1>
        {property ? (
          <p className="text-sm text-gray-500 font-normal">
            Activating: <span className="font-bold text-gray-800">{property.title}</span> in{' '}
            <span className="font-bold text-gray-800">{property.locality}</span>
          </p>
        ) : propertyId ? (
          <p className="text-sm text-gray-500 font-normal">
            Activating Property: <span className="font-mono font-bold text-gray-700">{propertyId}</span>
          </p>
        ) : null}
      </div>

      {/* Plan Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Choose a Plan</h2>
          <span className="text-xs text-gray-500 font-medium">30-day listing per property</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const isFree = plan.price === 0 || plan.id === 'plan_navaratri_free';
            const isPack = plan.id.includes('_pack_');
            const perAdPrice = plan.id === 'plan_residential_pack_5' ? 199 : plan.id === 'plan_commercial_pack_5' ? 444 : null;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative rounded-2xl p-5 border text-left transition-all flex flex-col justify-between ${
                  isFree && isSelected
                    ? 'border-amber-400 bg-[#FFFDF9] ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/15 sm:col-span-2'
                    : isFree
                    ? 'border-amber-300 bg-amber-50/40 hover:border-amber-400 sm:col-span-2'
                    : isSelected
                    ? 'border-[#C5A059] bg-[#FCFAF5] ring-2 ring-[#C5A059] shadow-md shadow-[#D4AF37]/15'
                    : 'border-[#EFE8D8] bg-white hover:border-[#C5A059]'
                }`}
              >
                {isFree ? (
                  <span className="absolute -top-3 left-4 px-3 py-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>🎉 Navaratri Special Offer • 100% Free</span>
                  </span>
                ) : isPack ? (
                  <span className="absolute -top-3 left-4 px-2.5 py-0.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-xs">
                    Best Value
                  </span>
                ) : null}
                {isSelected && (
                  <span className="absolute -top-3 right-4 px-2.5 py-0.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-xs">
                    Selected
                  </span>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-gray-900">{plan.name}</h3>
                      {isFree && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ₹0 Posting Fee
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#C5A059]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    {isFree && (
                      <span className="text-base text-gray-400 line-through font-bold">
                        ₹222
                      </span>
                    )}
                    <p className={`text-2xl font-black ${isFree ? 'text-emerald-600' : 'text-gray-900'}`}>
                      ₹{plan.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  {isFree && (
                    <p className="text-xs font-bold text-amber-700">🎉 Save ₹222 during Navaratri festive promotion!</p>
                  )}
                  {perAdPrice && (
                    <p className="text-xs font-bold text-emerald-600">₹{perAdPrice}/ad — save with pack!</p>
                  )}
                  <p className="text-xs text-[#9A7818] font-bold">{plan.durationDays} Days Active per Listing</p>
                  <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                    {plan.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Button & Trust Badges */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE8D8] shadow-sm space-y-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium">Payment Gateway</span>
          {isSelectedPlanFree ? (
            <span className="font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Festive Offer: Gateway Bypassed (₹0)
            </span>
          ) : (
            <span className="font-bold text-gray-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Cashfree Secure Checkout
            </span>
          )}
        </div>

        {/* Accepted Payment Methods / Offer notice */}
        {isSelectedPlanFree ? (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Navaratri Promotion Active:</strong> No payment required. Submit your property listing 100% free with one click!
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Accepted:</span>
            {['UPI (GPay / PhonePe / Paytm)', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallets'].map((method) => (
              <span
                key={method}
                className="text-[11px] bg-[#FCFAF5] border border-[#E8DFC8] text-[#9A7818] font-semibold px-2.5 py-1 rounded-lg"
              >
                {method}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={!selectedPlanId || isProcessing}
          className={`w-full py-4 px-6 text-white font-extrabold text-sm rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] ${
            isSelectedPlanFree
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-105 shadow-amber-500/25'
              : 'bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 shadow-[#D4AF37]/25'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isSelectedPlanFree ? 'Activating Free Listing...' : 'Opening Cashfree Gateway...'}</span>
            </>
          ) : isSelectedPlanFree ? (
            <>
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Claim Free Navaratri Listing (₹0)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pay & Activate Listing with Cashfree</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
            256-bit SSL Encrypted
          </span>
          <span className="flex items-center gap-1">
            <Smartphone className="w-4 h-4 text-[#C5A059]" />
            UPI Instant Verification
          </span>
          <span className="flex items-center gap-1">
            <Banknote className="w-4 h-4 text-[#C5A059]" />
            Cashfree Trusted Gateway
          </span>
        </div>
      </div>

      {/* ✅ Navaratri Free Claim Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">

            {/* Festive top bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" />

            {/* Success icon */}
            <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-600">
                🎉 Navaratri Special Offer — Request Received!
              </span>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Your Request Has Been Submitted!
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                Your property <strong className="text-gray-800">"{submittedPropTitle}"</strong> has been submitted <strong className="text-amber-700">100% FREE</strong> under the Navaratri Special Offer.
              </p>
            </div>

            {/* 24hr promise card */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-left space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> Within 24 Hours
                </span>
                <span className="text-xs text-amber-700 font-semibold">Our team will review your listing</span>
              </div>
              <ol className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">✓</span>
                  <span><strong>Step 1 — Done:</strong> Property details received &amp; saved.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-400 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">2</span>
                  <span><strong>Step 2 — In Progress:</strong> Admin will verify within <strong>24 hours</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-[10px] font-black flex items-center justify-center flex-shrink-0">3</span>
                  <span><strong>Step 3 — Coming Soon:</strong> Once approved, your property goes <strong>LIVE</strong>!</span>
                </li>
              </ol>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/owner/properties"
                className="flex-1 py-3 px-5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-500/30 transition flex items-center justify-center gap-2"
              >
                <span>Track My Request</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/owner/dashboard"
                className="flex-1 py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl transition flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
