import api from '../lib/axios';
import { ApiResponse, Owner } from '../types';

export interface OwnerDashboardData {
  stats: Record<string, number>;
  recentEnquiries: any[];
  recentPayments: any[];
}

export const ownerService = {
  registerOwner: async () => {
    const res = await api.post<ApiResponse<{ role: 'OWNER' }>>('/api/owners/register');
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get<ApiResponse<Owner>>('/api/owners/profile');
    return res.data;
  },

  updateProfile: async (data: { name?: string; bio?: string; profileImage?: string | null }) => {
    const res = await api.put<ApiResponse<null>>('/api/owners/profile', data);
    return res.data;
  },

  getDashboard: async () => {
    const res = await api.get<ApiResponse<OwnerDashboardData>>('/api/owners/dashboard');
    return res.data;
  },
};
