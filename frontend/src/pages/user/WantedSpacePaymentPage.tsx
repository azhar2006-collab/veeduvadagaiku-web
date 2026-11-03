import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Shield, MapPin, IndianRupee, ArrowLeft, Loader2 } from 'lucide-react';
import {
  initiateWantedSpacePayment,
  verifyWantedSpacePayment,
  myWantedSpaces,
  WantedSpace,
} from '../../services/wantedSpace.service';
import { useAuth } from '../../hooks/useAuth';
import { getCashfree } from '../../utils/cashfree';
import toast from 'react-hot-toast';

export default function WantedSpacePaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const wantedSpaceId = searchParams.get('wantedSpaceId') || '';

  const [initiating, setInitiating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  // Load the requirement details from user's own list
  const { data, isLoading } = useQuery({
    queryKey: ['my-wanted-spaces'],
    queryFn: () => myWantedSpaces({ limit: 100 }),
    enabled: !!user && !!wantedSpaceId,
  });

  const space: WantedSpace | undefined = (data?.data || []).find(
    (s: WantedSpace) => s.id === wantedSpaceId
  );

  async function handlePay() {
    if (!wantedSpaceId) return;
    setInitiating(true);
    try {
      const orderData = await initiateWantedSpacePayment(wantedSpaceId);

      if (orderData.isFree) {
        toast.success('Submitted for review!');
        navigate('/user/wanted-spaces');
        return;
      }

      if (!orderData.payment_session_id) {
        throw new Error('No payment session received');
      }

      setPaying(true);
      const cashfree = await getCashfree();
      const sdkMode: 'production' | 'sandbox' =
        orderData.environment === 'sandbox' ? 'sandbox' : 'production';

      await cashfree.checkout({
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: '_self',
        mode: sdkMode,
        onSuccess: async (cf: any) => {
          try {
            await verifyWantedSpacePayment(orderData.order_id, wantedSpaceId);
            setDone(true);
            toast.success('Payment successful! Requirement submitted for review.');
            navigate(`/wanted-spaces/payment-result?order_id=${orderData.order_id}&wantedSpaceId=${wantedSpaceId}&status=success`);
          } catch {
            navigate(`/wanted-spaces/payment-result?order_id=${orderData.order_id}&wantedSpaceId=${wantedSpaceId}`);
          }
        },
        onFailure: (cf: any) => {
          toast.error('Payment failed. Please try again.');
          setPaying(false);
          navigate(`/wanted-spaces/payment-result?order_id=${orderData.order_id}&wantedSpaceId=${wantedSpaceId}&status=failed`);
        },
        onDismiss: () => {
          setPaying(false);
          toast('Payment cancelled.');
        },
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to initiate payment');
      setPaying(false);
    } finally {
      setInitiating(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Please <Link to="/login" className="text-amber-600 underline">log in</Link> to continue.</p>
      </div>
    );
  }

  if (!wantedSpaceId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No requirement selected. <Link to="/wanted-spaces/specify" className="text-amber-600 underline">Post a requirement</Link></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-10">
        <Link to="/user/wanted-spaces" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> My Requirements
        </Link>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#2D0A18] text-white px-6 py-5">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">Secure Payment · Cashfree</span>
            </div>
            <h1 className="text-lg font-bold">Complete Payment</h1>
            <p className="text-sm text-white/60">Pay ₹{space?.paymentAmount || 99} to publish your requirement</p>
          </div>

          {/* Requirement Summary */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Your Requirement</h2>
            {isLoading ? (
              <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ) : space ? (
              <div className="space-y-2">
                <p className="font-semibold text-gray-800 text-sm">{space.title}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>{space.preferredLocality ? `${space.preferredLocality}, ` : ''}{space.preferredCity}</span>
                </div>
                <p className="text-xs text-gray-400">Category: {space.category?.replace(/_/g, ' ')}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Requirement #{wantedSpaceId.slice(-8)}</p>
            )}
          </div>

          {/* Amount */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <IndianRupee className="w-4 h-4" />
                <span className="text-sm">Listing fee (30 days)</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">₹{space?.paymentAmount || 99}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Your requirement will be reviewed by our team and published within 24 hours.
            </p>
          </div>

          {/* Pay Button */}
          <div className="px-6 py-5">
            <button
              onClick={handlePay}
              disabled={initiating || paying || done}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-2xl py-3.5 text-base transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {initiating || paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {initiating ? 'Creating order…' : 'Processing…'}
                </>
              ) : (
                `Pay ₹${space?.paymentAmount || 99}`
              )}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              By paying you confirm your information is accurate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
