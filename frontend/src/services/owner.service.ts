import api from '../lib/axios';
import { ApiResponse, Owner } from '../types';

export interface OwnerDashboardData {
  stats: Record<string, number>;
  recentEnquiries: any[];
  recentPayments: any[];
}

export interface OwnerNotification {
  id: string;
  propertyId: string | null;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  readAt: string | null;
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

  getNotifications: async () => {
    const res = await api.get<ApiResponse<{ notifications: OwnerNotification[]; unreadCount: number }>>(
      '/api/owners/notifications'
    );
    return res.data;
  },

  markNotificationRead: async (id: string) => {
    const res = await api.patch<ApiResponse<null>>(`/api/owners/notifications/${id}/read`);
    return res.data;
  },

  registerPushToken: async (token: string) => {
    const res = await api.post<ApiResponse<null>>('/api/owners/notifications/push-token', { token });
    return res.data;
  },
};
