import api from '../lib/axios';
import { ApiResponse, Payment } from '../types';

export interface RazorpayOrderResponse {
  success: boolean;
  order_id: string;
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  key_id?: string;
  paymentId?: string;
  message?: string;
}

export interface VerifyRazorpayPaymentData {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  order_id?: string;
  orderId?: string;
  payment_id?: string;
  paymentId?: string;
  signature?: string;
  propertyId?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  order_id?: string;
  payment_id?: string;
  payment?: Payment;
}

export const paymentService = {
  /**
   * Create Razorpay Order via POST /api/create-order
   * amount is in paise (e.g., 50000 = ₹500)
   */
  createRazorpayOrder: async (data: {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, any>;
    propertyId?: string;
    planId?: string;
  }) => {
    const res = await api.post<RazorpayOrderResponse>('/api/create-order', data);
    return res.data;
  },

  /**
   * Create Order for property listing plan
   */
  createOrder: async (propertyId: string, planId: string) => {
    const res = await api.post<RazorpayOrderResponse>('/api/payments/create-order', {
      propertyId,
      planId,
    });
    return res.data;
  },

  /**
   * Verify Razorpay Payment Signature via POST /api/verify-payment
   */
  verifyPayment: async (data: VerifyRazorpayPaymentData) => {
    const res = await api.post<VerifyPaymentResponse>('/api/verify-payment', data);
    return res.data;
  },

  /**
   * Fetch payment history for owner
   */
  getPaymentHistory: async () => {
    const res = await api.get<ApiResponse<Payment[]>>('/api/payments/history');
    return res.data;
  },
};
