import api from '../lib/axios';
import { ApiResponse, ListingPlan } from '../types';

export const planService = {
  getPlans: async () => {
    const res = await api.get<ApiResponse<ListingPlan[]>>('/api/plans');
    return res.data;
  },

  getPlanById: async (id: string) => {
    const res = await api.get<ApiResponse<ListingPlan>>(`/api/plans/${id}`);
    return res.data;
  },
};
