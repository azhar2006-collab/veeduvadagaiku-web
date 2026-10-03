import api from '../lib/axios';
import { ApiResponse, Enquiry, EnquiryStatus } from '../types';

export const enquiryService = {
  createEnquiry: async (propertyId: string, message: string, phone?: string) => {
    const res = await api.post<ApiResponse<Enquiry>>('/api/enquiries', {
      propertyId,
      message,
      phone,
    });
    return res.data;
  },

  getUserEnquiries: async () => {
    const res = await api.get<ApiResponse<Enquiry[]>>('/api/users/enquiries');
    return res.data;
  },

  getOwnerEnquiries: async () => {
    const res = await api.get<ApiResponse<Enquiry[]>>('/api/owners/enquiries');
    return res.data;
  },

  updateEnquiryStatus: async (id: string, status: EnquiryStatus) => {
    const res = await api.put<ApiResponse<Enquiry>>(`/api/enquiries/${id}/status`, { status });
    return res.data;
  },
};
