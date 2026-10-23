import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';
import { SEOHead } from '../../components/common/SEOHead';
import { paymentService } from '../../services/payment.service';

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const paymentId = searchParams.get('paymentId') || undefined;
  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || undefined;
  const propTitle = searchParams.get('propTitle');
  const messageParam = searchParams.get('message');

  const [verifying, setVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(messageParam);

  const isFreeOffer =
    searchParams.get('freeOffer') === 'true' ||
    (orderId ? orderId.startsWith('free_order_') || orderId.startsWith('promo_') : false);

  const isSuccessParam =
    statusParam?.toLowerCase() === 'success' || statusParam?.toLowerCase() === 'completed';

  useEffect(() => {
    // If it's a free promotional listing, mark success directly
    if (isFreeOffer) {
      setVerifiedSuccess(true);
      return;
    }

    // If Cashfree or Razorpay redirected back with orderId, verify order status with backend
    if (orderId && verifiedSuccess === null) {
      setVerifying(true);
      paymentService
        .verifyPayment({ order_id: orderId, orderId, paymentId })
        .then((res) => {
          if (res.success || res.status === 'PAID') {
            setVerifiedSuccess(true);
          } else {
            setVerifiedSuccess(false);
            setErrorMsg(res.message || 'Payment not completed.');
          }
        })
        .catch((err) => {
          if (err.response?.data?.message?.includes('already verified')) {
            setVerifiedSuccess(true);
          } else {
            setVerifiedSuccess(false);
            setErrorMsg(err.response?.data?.message || 'Payment verification could not be confirmed.');
          }
        })
        .finally(() => {
          setVerifying(false);
        });
    } else if (isSuccessParam && !orderId) {
      setVerifiedSuccess(true);
    } else if (statusParam && !isSuccessParam) {
      setVerifiedSuccess(false);
    }
  }, [orderId, isSuccessParam, paymentId, statusParam, verifiedSuccess, isFreeOffer]);

  const isSuccess = verifiedSuccess ?? isSuccessParam;

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-8">
      <SEOHead title={isSuccess ? (isFreeOffer ? '🎉 Request Received!' : 'Payment Successful') : 'Payment Failed'} />

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl text-center space-y-6">
        {verifying ? (
          <div className="py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-[#C5A059] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-gray-700">
              Confirming payment status...
            </p>
          </div>
        ) : isSuccess ? (
          <>
            {/* Icon */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-md ${
              isFreeOffer
                ? 'bg-amber-100 text-amber-600 shadow-amber-500/20'
                : 'bg-emerald-100 text-emerald-600 shadow-emerald-500/20'
            }`}>
              <CheckCircle2 className="w-10 h-10" />
            </div>

            {/* Header */}
            <div className="space-y-2">
              <span className={`text-xs font-black uppercase tracking-widest ${
                isFreeOffer ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {isFreeOffer ? '🪔 Deepavali Special Offer — Request Received!' : 'Payment Confirmed'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {isFreeOffer
                  ? 'Your Request Has Been Submitted!'
                  : 'Listing Submitted for Review!'}
              </h1>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                {isFreeOffer ? (
                  <>
                    Thank you! Your property listing has been submitted <strong className="text-amber-700">100% FREE</strong> under the <strong>Deepavali Special Offer</strong> (₹0 posting fee). Our team will review and post it shortly.
                  </>
                ) : (
                  <>
                    Thank you! Your payment has been successfully verified. Your property listing is now under{' '}
                    <strong className="text-gray-800">Pending Admin Approval</strong>.
                  </>
                )}
              </p>
            </div>

            {/* 24hr promise banner — free offer only */}
            {isFreeOffer && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-left space-y-3">
                {/* 24hr badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                    ⏱ Within 24 Hours
                  </span>
                  <span className="text-xs text-amber-700 font-semibold">Our team will review your listing</span>
                </div>

                {/* Step timeline */}
                <ol className="space-y-2 text-xs text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">✓</span>
                    <span><strong>Step 1 — Done:</strong> Your property details have been received and saved.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-400 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">2</span>
                    <span><strong>Step 2 — In Progress:</strong> Our team will verify the listing details within <strong>24 hours</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-[10px] font-black flex items-center justify-center flex-shrink-0">3</span>
                    <span><strong>Step 3 — Coming Soon:</strong> Once approved, your property goes <strong>LIVE</strong> for all renters to see!</span>
                  </li>
                </ol>
              </div>
            )}

            {/* Property title chip */}
            {propTitle && (
              <div className={`p-3.5 rounded-xl border text-xs font-bold truncate ${
                isFreeOffer
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-100 text-emerald-950'
              }`}>
                🏠 {propTitle}
              </div>
            )}

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/owner/properties"
                className={`px-6 py-3 font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
                  isFreeOffer
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <span>{isFreeOffer ? 'Track My Request' : 'View Property Status'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/owner/dashboard"
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-red-500/20">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-red-600">
                Transaction Incomplete
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Payment Failed
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                {errorMsg ||
                  'The transaction could not be verified or was canceled. Your property remains safely saved as Draft.'}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/owner/properties"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Payment</span>
              </Link>
              <Link
                to="/owner/dashboard"
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
