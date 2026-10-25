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

      // 1. Create Cashfree order on backend to obtain payment_session_id
      const orderRes: any = await paymentService.createCashfreeOrder(propertyId || '', planId || '');

      if (!orderRes || !orderRes.payment_session_id) {
        throw new Error(orderRes?.message || 'Failed to initialize Cashfree payment session');
      }

      console.log('[Cashfree] Session ID received:', orderRes.payment_session_id ? 'present' : 'MISSING');

      // 2. Initialize SDK in production mode
      const cashfree = await getCashfree();

      // 3. Redirect to Cashfree payment page (return_url brings user back to /payment-result)
      // Using '_self' — more reliable than '_modal' and avoids payment_session_id_invalid errors
      const checkoutOptions = {
        paymentSessionId: orderRes.payment_session_id,
        redirectTarget: '_self' as const,
      };
      console.log('[Cashfree] Starting checkout with session:', orderRes.payment_session_id?.substring(0, 20) + '...');
      const result = await cashfree.checkout(checkoutOptions);

      if (result?.error) {
        setLoading(false);
        toast.error(result.error.message || 'Payment was cancelled');
        onError?.(result.error);
        return;
      }

      if (result?.paymentDetails) {
        // Verify with Cashfree-specific endpoint
        const verifyRes = await paymentService.verifyCashfreePayment(orderRes.order_id);
        setLoading(false);
        if (verifyRes.success || verifyRes.status === 'PAID') {
          toast.success('Payment verified successfully!');
          onSuccess?.(verifyRes);
        } else {
          toast.error(verifyRes.message || 'Payment not completed');
          onError?.(verifyRes);
        }
      } else {
        // Modal closed without payment completion
        setLoading(false);
        toast.error('Payment was not completed. Please try again.');
        onError?.({ message: 'Payment not completed' });
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
