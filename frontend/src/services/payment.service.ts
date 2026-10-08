import api from '../lib/axios';
import { ApiResponse, Payment } from '../types';

export interface CashfreeOrderResponse {
  success: boolean;
  payment_session_id: string;
  order_id: string;
  cf_order_id?: string;
  amount: number;
  currency: string;
  paymentId?: string;
  message?: string;
}

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

export interface VerifyPaymentData {
  order_id?: string;
  orderId?: string;
  payment_id?: string;
  paymentId?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  signature?: string;
  propertyId?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  status?: string;
  order_id?: string;
  payment_id?: string;
  payment?: Payment;
}

export const paymentService = {
  /**
   * Create Cashfree Order for property listing plan
   */
  createCashfreeOrder: async (propertyId: string, planId: string) => {
    const res = await api.post<CashfreeOrderResponse>('/api/payments/cashfree/create-order', {
      propertyId,
      planId,
    });
    return res.data;
  },

  /**
   * Verify Cashfree Payment via order_id
   */
  verifyCashfreePayment: async (order_id: string) => {
    const res = await api.post<VerifyPaymentResponse>('/api/payments/cashfree/verify', {
      order_id,
    });
    return res.data;
  },

  /**
   * Generic Create Order (defaults to Cashfree)
   */
  createOrder: async (propertyId: string, planId: string) => {
    const res = await api.post<CashfreeOrderResponse>('/api/payments/create-order', {
      propertyId,
      planId,
    });
    return res.data;
  },

  /**
   * Create Razorpay Order via POST /api/create-order
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
   * Verify Payment (unified for Cashfree order_id and Razorpay signatures)
   */
  verifyPayment: async (data: VerifyPaymentData) => {
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
