import api from '../lib/axios';
import { ApiResponse, PaginatedResponse, Property, User, Owner, Payment, ListingPlan, Enquiry } from '../types';

export interface AdminDashboardStats {
  users: { total: number; owners: number; tenants: number };
  properties: { total: number; pendingApprovals: number; [key: string]: number };
  payments: { total: number; revenue: number };
  recentProperties: any[];
  recentPayments: any[];
  recentUsers: any[];
}

export const adminService = {
  getDashboardStats: async () => {
    const res = await api.get<ApiResponse<AdminDashboardStats>>('/api/admin/dashboard/stats');
    return res.data;
  },

  getUsers: async (params: { page?: number; limit?: number; search?: string; role?: string; status?: string } = {}) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') p.append(k, String(v));
    });
    const res = await api.get<PaginatedResponse<User>>(`/api/admin/users?${p.toString()}`);
    return res.data;
  },

  updateUserStatus: async (id: string, status: 'ACTIVE' | 'SUSPENDED') => {
    const res = await api.put<ApiResponse<null>>(`/api/admin/users/${id}/status`, { status });
    return res.data;
  },

  getOwners: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') p.append(k, String(v));
    });
    const res = await api.get<PaginatedResponse<Owner>>(`/api/admin/owners?${p.toString()}`);
    return res.data;
  },

  getOwnerById: async (id: string) => {
    const res = await api.get<ApiResponse<Owner>>(`/api/admin/owners/${id}`);
    return res.data;
  },

  getProperties: async (params: { page?: number; limit?: number; search?: string; status?: string; propertyType?: string } = {}) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') p.append(k, String(v));
    });
    const res = await api.get<PaginatedResponse<Property>>(`/api/admin/properties?${p.toString()}`);
    return res.data;
  },

  getPropertyById: async (id: string) => {
    const res = await api.get<ApiResponse<Property>>(`/api/admin/properties/${id}`);
    return res.data;
  },

  approveProperty: async (id: string) => {
    const res = await api.put<ApiResponse<null>>(`/api/admin/properties/${id}/approve`);
    return res.data;
  },

  rejectProperty: async (id: string, reason: string) => {
    const res = await api.put<ApiResponse<null>>(`/api/admin/properties/${id}/reject`, { reason });
    return res.data;
  },

  updatePropertyStatus: async (id: string, status: string) => {
    const res = await api.put<ApiResponse<null>>(`/api/admin/properties/${id}/status`, { status });
    return res.data;
  },

  getPayments: async (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') p.append(k, String(v));
    });
    const res = await api.get<PaginatedResponse<Payment>>(`/api/admin/payments?${p.toString()}`);
    return res.data;
  },

  getPlans: async () => {
    const res = await api.get<ApiResponse<ListingPlan[]>>('/api/admin/plans');
    return res.data;
  },

  createPlan: async (data: Partial<ListingPlan>) => {
    const res = await api.post<ApiResponse<ListingPlan>>('/api/admin/plans', data);
    return res.data;
  },

  updatePlan: async (id: string, data: Partial<ListingPlan>) => {
    const res = await api.put<ApiResponse<ListingPlan>>(`/api/admin/plans/${id}`, data);
    return res.data;
  },

  deletePlan: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/api/admin/plans/${id}`);
    return res.data;
  },

  getEnquiries: async (params: { page?: number; limit?: number } = {}) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) p.append(k, String(v));
    });
    const res = await api.get<PaginatedResponse<Enquiry>>(`/api/admin/enquiries?${p.toString()}`);
    return res.data;
  },
};
