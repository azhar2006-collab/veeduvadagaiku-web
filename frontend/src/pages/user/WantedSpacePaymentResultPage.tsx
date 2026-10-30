import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { verifyWantedSpacePayment } from '../../services/wantedSpace.service';

type ResultState = 'loading' | 'success' | 'failed' | 'error';

export default function WantedSpacePaymentResultPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || '';
  const wantedSpaceId = searchParams.get('wantedSpaceId') || '';
  const statusParam = searchParams.get('status') || '';

  const [state, setState] = useState<ResultState>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // If status param already set by the checkout handler, skip verification
    if (statusParam === 'success') {
      setState('success');
      setMessage('Payment verified. Your requirement has been submitted for review.');
      return;
    }
    if (statusParam === 'failed') {
      setState('failed');
      setMessage('Payment was not completed. Please try again.');
      return;
    }

    if (!orderId) {
      setState('error');
      setMessage('Invalid payment result link.');
      return;
    }

    // Verify with backend
    verifyWantedSpacePayment(orderId, wantedSpaceId || undefined)
      .then((res) => {
        if (res.status === 'PAID' || res.success) {
          setState('success');
          setMessage('Payment verified. Your requirement has been submitted for review.');
        } else {
          setState('failed');
          setMessage('Payment could not be verified. If money was deducted, please contact support.');
        }
      })
      .catch(() => {
        setState('error');
        setMessage('Could not verify payment. If money was deducted, contact support with your order ID.');
      });
  }, [orderId, wantedSpaceId, statusParam]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
        {state === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800">Verifying payment…</h2>
            <p className="text-sm text-gray-400 mt-2">Please wait, this takes a few seconds.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link
                to="/user/wanted-spaces"
                className="bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-2xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
              >
                My Requirements <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/wanted-spaces"
                className="border border-gray-200 text-gray-600 font-medium rounded-2xl py-3 text-sm hover:bg-gray-50 transition-colors"
              >
                Browse Wanted Spaces
              </Link>
            </div>
          </>
        )}

        {(state === 'failed' || state === 'error') && (
          <>
            <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {state === 'failed' ? 'Payment Failed' : 'Verification Error'}
            </h2>
            <p className="text-sm text-gray-500 mb-2">{message}</p>
            {orderId && (
              <p className="text-xs text-gray-400 mb-6">Order ID: {orderId}</p>
            )}
            <div className="flex flex-col gap-3">
              <Link
                to="/user/wanted-spaces"
                className="bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-2xl py-3 text-sm transition-colors"
              >
                Try Again
              </Link>
              <Link
                to="/"
                className="border border-gray-200 text-gray-600 font-medium rounded-2xl py-3 text-sm hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

