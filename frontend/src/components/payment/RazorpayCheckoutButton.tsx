import React, { useState } from 'react';
import { loadRazorpayScript } from '../../utils/razorpay';
import { paymentService } from '../../services/payment.service';
import toast from 'react-hot-toast';
import { CreditCard, Loader2 } from 'lucide-react';

interface RazorpayCheckoutButtonProps {
  amount: number; // in paise (e.g. 10000 = ₹100)
  currency?: string;
  name?: string;
  description?: string;
  receipt?: string;
  propertyId?: string;
  planId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: Record<string, any>;
  onSuccess?: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onError?: (error: any) => void;
  onDismiss?: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  amount,
  currency = 'INR',
  name = 'Veedu Vadagaiku',
  description = 'Rental Marketplace Payment',
  receipt,
  propertyId,
  planId,
  customerName,
  customerEmail,
  customerPhone,
  notes,
  onSuccess,
  onError,
  onDismiss,
  className,
  children,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // 1. Ensure Razorpay script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Unable to load payment gateway. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // 2. Call backend create-order endpoint
      let orderData: any;
      if (propertyId && planId) {
        orderData = await paymentService.createOrder(propertyId, planId);
      } else {
        orderData = await paymentService.createRazorpayOrder({
          amount,
          currency,
          receipt,
          notes,
          propertyId,
          planId,
        });
      }

      if (!orderData || !orderData.order_id) {
        throw new Error(orderData?.message || 'Failed to create payment order');
      }

      const keyId =
        (import.meta.env.VITE_RAZORPAY_KEY_ID as string) ||
        orderData.key_id ||
        'rzp_test_Tl5hQJ1DIU9ooD';

      // 3. Configure Razorpay Standard Checkout options
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name,
        description,
        order_id: orderData.order_id,
        image: '/logo-full.png',
        handler: async function (response: any) {
          // Success callback with payment credentials
          try {
            setLoading(true);
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: orderData.paymentId,
              propertyId,
            });

            if (verifyRes.success) {
              toast.success('Payment verified successfully!');
              onSuccess?.(response);
            } else {
              toast.error(verifyRes.message || 'Payment signature verification failed.');
              onError?.(verifyRes);
            }
          } catch (verifyErr: any) {
            const errMsg = verifyErr.response?.data?.message || 'Verification failed';
            toast.error(errMsg);
            onError?.(verifyErr);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: customerName || '',
          email: customerEmail || '',
          contact: customerPhone || '',
        },
        theme: {
          color: '#C5A059', // Lite Gold theme matching website brand
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast('Payment modal closed');
            onDismiss?.();
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      // Handle payment.failed event
      razorpayInstance.on('payment.failed', function (failureResponse: any) {
        setLoading(false);
        const errorDescription =
          failureResponse?.error?.description || 'Payment failed. Please try again.';
        toast.error(`Payment failed: ${errorDescription}`);
        onError?.(failureResponse.error);
      });

      // Open checkout modal
      razorpayInstance.open();
    } catch (err: any) {
      setLoading(false);
      const errMsg =
        err.response?.data?.message || err.message || 'Could not initiate payment. Try again.';
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
            <span>Pay ₹{(amount / 100).toFixed(0)} with Razorpay</span>
          </>
        )
      )}
    </button>
  );
};
