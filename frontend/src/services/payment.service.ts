import api from '../lib/axios';
import { ApiResponse, Payment } from '../types';

export interface CreateOrderResponse {
  paymentId: string;
  orderId: string;
  cfOrderId: string;
  paymentSessionId: string;
  amount: number;
  currency: string;
}

export const paymentService = {
  createOrder: async (propertyId: string, planId: string) => {
    const res = await api.post<ApiResponse<CreateOrderResponse>>('/api/payments/create-order', {
      propertyId,
      planId,
    });
    return res.data;
  },

  verifyPayment: async (data: { orderId: string; paymentId?: string }) => {
    const res = await api.post<ApiResponse<{ payment: Payment }>>('/api/payments/verify', data);
    return res.data;
  },

  getPaymentHistory: async () => {
    const res = await api.get<ApiResponse<Payment[]>>('/api/payments/history');
    return res.data;
  },
};
