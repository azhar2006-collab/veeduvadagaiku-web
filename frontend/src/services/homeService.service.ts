import api from '../lib/axios';

export interface HomeServiceItem {
  id: string;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  providerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  locality: string;
  serviceAreas: string[];
  pricing: string;
  priceFrom?: number;
  features: string[];
  imageUrl?: string;
  experience?: string;
  licenseNo?: string;
  gstin?: string;
  workingHours?: string;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
  viewCount: number;
  createdAt: string;
}

export interface HomeServiceFilters {
  category?: string;
  subcategory?: string;
  locality?: string;
  maxPrice?: string | number;
  page?: number;
  limit?: number;
}

export const homeServiceApi = {
  getServices: async (filters: HomeServiceFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) {
        params.append(key, String(val));
      }
    });
    const res = await api.get<{ services: HomeServiceItem[]; total: number; page: number; totalPages: number }>(
      `/api/home-services?${params.toString()}`
    );
    return res.data;
  },

  getServiceById: async (id: string) => {
    const res = await api.get<HomeServiceItem>(`/api/home-services/${id}`);
    return res.data;
  },

  createService: async (data: Partial<HomeServiceItem>) => {
    const res = await api.post<{ message: string; service: HomeServiceItem }>(
      '/api/home-services',
      data
    );
    return res.data;
  },

  updateStatus: async (id: string, status: 'PENDING' | 'PUBLISHED' | 'REJECTED') => {
    const res = await api.put<HomeServiceItem>(`/api/home-services/${id}/status`, { status });
    return res.data;
  },

  deleteService: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/api/home-services/${id}`);
    return res.data;
  },
};
