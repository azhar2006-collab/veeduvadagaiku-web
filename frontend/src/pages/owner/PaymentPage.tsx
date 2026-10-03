import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { planService } from '../../services/plan.service';
import { paymentService } from '../../services/payment.service';
import { propertyService } from '../../services/property.service';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { CreditCard, ShieldCheck, ArrowRight, Smartphone, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

// Declare cashfree on window to avoid TS errors
declare global {
  interface Window {
    Cashfree: any;
  }
}

export const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';
  const navigate = useNavigate();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load plans
  const { data: plansRes, isLoading: loadingPlans } = useQuery({
    queryKey: ['listingPlans'],
    queryFn: () => planService.getPlans(),
  });
  const plans = plansRes?.data || [];

  // Load property details
  const { data: propRes, isLoading: loadingProp } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertyService.getPropertyById(propertyId),
    enabled: !!propertyId,
  });
  const property = propRes?.data;

  // Load Cashfree JS SDK dynamically
  const loadCashfreeScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Cashfree) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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

      const scriptLoaded = await loadCashfreeScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please check your connection.');
        setIsProcessing(false);
        return;
      }

      // 1. Create order on backend → get paymentSessionId
      const orderRes = await paymentService.createOrder(propertyId, selectedPlanId);
      const { paymentId, orderId, paymentSessionId } = orderRes.data;

      // 2. Initialize Cashfree with the session
      const cashfreeEnv =
        (import.meta.env.VITE_CASHFREE_ENV as string) === 'production'
          ? 'production'
          : 'sandbox';

      const cashfree = new window.Cashfree({ mode: cashfreeEnv });

      // 3. Open Cashfree checkout in modal
      const checkoutOptions = {
        paymentSessionId,
        redirectTarget: '_modal',
      };

      cashfree.checkout(checkoutOptions).then(async (result: any) => {
        setIsProcessing(false);
        if (result.error) {
          // User cancelled or error occurred
          const msg = result.error.message || 'Payment cancelled or failed';
          if (result.error.type === 'USER_DROP') {
            toast('Payment window closed. You can retry anytime.', { icon: 'ℹ️' });
          } else {
            navigate(
              `/owner/payment/result?status=failure&paymentId=${paymentId}&message=${encodeURIComponent(msg)}`
            );
          }
          return;
        }

        if (result.paymentDetails || result.redirectUrl?.includes('success')) {
          // 4. Verify with backend
          try {
            const verifyRes = await paymentService.verifyPayment({ orderId, paymentId });
            if (verifyRes.success) {
              navigate(
                `/owner/payment/result?status=success&paymentId=${paymentId}&propTitle=${encodeURIComponent(
                  property?.title || 'Your Property'
                )}`
              );
            }
          } catch (err: any) {
            navigate(
              `/owner/payment/result?status=failure&paymentId=${paymentId}&message=${encodeURIComponent(
                err.response?.data?.message || 'Payment verification failed'
              )}`
            );
          }
        }
      });
    } catch (err: any) {
      setIsProcessing(false);
      toast.error(err.response?.data?.message || 'Could not initiate payment. Try again.');
    }
  };

  if (loadingPlans || loadingProp) {
    return <Loader fullScreen text="Preparing payment..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <SEOHead title="Select Listing Plan & Pay | Veedu Vadagaiku" />

      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
          Step 2 of 2
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Select Listing Plan for Your Property
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Once payment is confirmed, our moderation team will review and approve your listing.
        </p>
      </div>

      {/* Property Summary Pill */}
      {property && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">
              Selected Property
            </span>
            <h4 className="text-sm font-bold text-gray-900 truncate">{property.title}</h4>
            <p className="text-xs text-gray-600">
              {property.locality}, Chennai • ₹{property.rent.toLocaleString('en-IN')}/mo
            </p>
          </div>
        </div>
      )}

      {/* Plans Selection */}
      <div className="space-y-4">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          Choose a Plan
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-5 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-base text-gray-900">{plan.name}</h3>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-emerald-600 font-bold">{plan.durationDays} Days Active</p>
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium">Payment Gateway</span>
          <span className="font-bold text-gray-900">Cashfree (UPI, Cards, Net Banking)</span>
        </div>

        {/* Accepted Payment Methods */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Accepted:</span>
          {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'].map((method) => (
            <span
              key={method}
              className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-1 rounded-lg"
            >
              {method}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={!selectedPlanId || isProcessing}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          <span>{isProcessing ? 'Opening Payment Gateway...' : 'Pay & Submit for Approval'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            256-bit SSL Encrypted
          </span>
          <span className="flex items-center gap-1">
            <Smartphone className="w-4 h-4 text-emerald-500" />
            UPI Instant Pay
          </span>
          <span className="flex items-center gap-1">
            <Banknote className="w-4 h-4 text-emerald-500" />
            RBI Regulated Gateway
          </span>
        </div>
      </div>
    </div>
  );
};
