import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';
import { SEOHead } from '../../components/common/SEOHead';
import { paymentService } from '../../services/payment.service';

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const paymentId = searchParams.get('paymentId') || undefined;
  const orderId = searchParams.get('orderId') || undefined;
  const propTitle = searchParams.get('propTitle');
  const messageParam = searchParams.get('message');

  const [verifying, setVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(messageParam);

  const isSuccessParam =
    statusParam?.toLowerCase() === 'success' || statusParam?.toLowerCase() === 'completed';

  useEffect(() => {
    // If Cashfree redirected back with orderId and status is SUCCESS, ensure verification is run
    if (orderId && isSuccessParam && verifiedSuccess === null) {
      setVerifying(true);
      paymentService
        .verifyPayment({ orderId, paymentId })
        .then(() => {
          setVerifiedSuccess(true);
        })
        .catch((err) => {
          // If already verified or other status
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
    } else if (!isSuccessParam) {
      setVerifiedSuccess(false);
    }
  }, [orderId, isSuccessParam, paymentId]);

  const isSuccess = verifiedSuccess ?? isSuccessParam;

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-8">
      <SEOHead title={isSuccess ? 'Payment Successful' : 'Payment Failed'} />

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl text-center space-y-6">
        {verifying ? (
          <div className="py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-gray-700">
              Confirming payment status with Cashfree...
            </p>
          </div>
        ) : isSuccess ? (
          <>
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Payment Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Listing Submitted for Review!
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Thank you! Your payment has been successfully verified. Your property listing is now under{' '}
                <strong className="text-gray-800">Pending Admin Approval</strong>.
              </p>
            </div>

            {propTitle && (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-950 font-bold truncate">
                {propTitle}
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/owner/properties"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>View Property Status</span>
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
