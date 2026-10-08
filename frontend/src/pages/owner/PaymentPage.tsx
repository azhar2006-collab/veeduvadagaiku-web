import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { planService } from '../../services/plan.service';
import { paymentService } from '../../services/payment.service';
import { propertyService } from '../../services/property.service';
import { useAuth } from '../../hooks/useAuth';
import { getCashfree } from '../../utils/cashfree';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { CreditCard, ShieldCheck, ArrowRight, Smartphone, Banknote, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load plans
  const { data: plansRes, isLoading: loadingPlans } = useQuery({
    queryKey: ['listingPlans'],
    queryFn: () => planService.getPlans(),
  });
  const plans = plansRes?.data || [];

  // Auto-select standard plan or first available plan when plans load
  React.useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      const defaultPlan = plans.find((p) => p.id === 'plan_standard') || plans[0];
      if (defaultPlan) setSelectedPlanId(defaultPlan.id);
    }
  }, [plans, selectedPlanId]);

  // Load property details
  const { data: propRes } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertyService.getPropertyById(propertyId),
    enabled: !!propertyId,
    retry: 1,
  });
  const property = propRes?.data;

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

      // 1. Create order on backend (returns payment_session_id, order_id, etc.)
      const orderRes = await paymentService.createOrder(propertyId, selectedPlanId);
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
      <SEOHead title="Select Listing Plan & Pay | Veedu Vadagaiku" />

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
        <h2 className="text-base font-bold text-gray-900">Choose a Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative rounded-2xl p-5 border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#C5A059] bg-[#FCFAF5] ring-2 ring-[#C5A059] shadow-md shadow-[#D4AF37]/15'
                    : 'border-[#EFE8D8] bg-white hover:border-[#C5A059]'
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-3 right-4 px-2.5 py-0.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-xs">
                    Selected
                  </span>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-gray-900">{plan.name}</h3>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#C5A059]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />}
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-[#9A7818] font-bold">{plan.durationDays} Days Active</p>
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
          <span className="font-bold text-gray-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Cashfree Secure Checkout
          </span>
        </div>

        {/* Accepted Payment Methods */}
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

        <button
          type="button"
          onClick={handlePay}
          disabled={!selectedPlanId || isProcessing}
          className="w-full py-4 px-6 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 active:scale-[0.98] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#D4AF37]/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Opening Cashfree Gateway...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pay & Activate Listing with Cashfree</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

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
    </div>
  );
};
