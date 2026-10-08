import React, { useState } from 'react';
import { getCashfree } from '../../utils/cashfree';
import { paymentService } from '../../services/payment.service';
import toast from 'react-hot-toast';
import { CreditCard, Loader2 } from 'lucide-react';

interface CashfreeCheckoutButtonProps {
  amount: number; // in rupees
  propertyId?: string;
  planId?: string;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  onDismiss?: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const CashfreeCheckoutButton: React.FC<CashfreeCheckoutButtonProps> = ({
  amount,
  propertyId,
  planId,
  onSuccess,
  onError,
  className,
  children,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // 1. Create order on backend
      let orderRes: any;
      if (propertyId && planId) {
        orderRes = await paymentService.createOrder(propertyId, planId);
      } else {
        orderRes = await paymentService.createCashfreeOrder(propertyId || '', planId || '');
      }

      if (!orderRes || !orderRes.payment_session_id) {
        throw new Error(orderRes?.message || 'Failed to initialize Cashfree payment session');
      }

      // 2. Initialize SDK
      const cashfree = await getCashfree();

      // 3. Open Modal Checkout
      const result = await cashfree.checkout({
        paymentSessionId: orderRes.payment_session_id,
        redirectTarget: '_modal',
      });

      if (result?.error) {
        setLoading(false);
        toast.error(result.error.message || 'Payment was cancelled');
        onError?.(result.error);
        return;
      }

      if (result?.paymentDetails) {
        // Verify with backend
        const verifyRes = await paymentService.verifyPayment({ order_id: orderRes.order_id });
        setLoading(false);
        if (verifyRes.success || verifyRes.status === 'PAID') {
          toast.success('Payment verified successfully!');
          onSuccess?.(verifyRes);
        } else {
          toast.error(verifyRes.message || 'Payment not completed');
          onError?.(verifyRes);
        }
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message || 'Payment error';
      toast.error(errMsg);
      onError?.(err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={
        className ||
        'w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 active:scale-[0.98] transition shadow-md shadow-[#D4AF37]/20 disabled:opacity-50 disabled:cursor-not-allowed'
      }
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children || (
          <>
            <CreditCard className="w-4 h-4" />
            <span>Pay ₹{amount.toLocaleString('en-IN')} with Cashfree</span>
          </>
        )
      )}
    </button>
  );
};
