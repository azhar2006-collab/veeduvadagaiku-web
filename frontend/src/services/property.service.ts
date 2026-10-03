import api from '../lib/axios';
import { ApiResponse, PaginatedResponse, Property, PropertyFilters, PropertyImage } from '../types';

export const propertyService = {
  getProperties: async (filters: PropertyFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) {
        params.append(key, String(val));
      }
    });
    const res = await api.get<PaginatedResponse<Property>>(`/api/properties?${params.toString()}`);
    return res.data;
  },

  getPropertyById: async (id: string) => {
    const res = await api.get<ApiResponse<Property>>(`/api/properties/${id}`);
    return res.data;
  },

  getLocalities: async () => {
    const res = await api.get<ApiResponse<string[]>>('/api/properties/localities');
    return res.data;
  },

  // Owner methods
  getOwnerProperties: async () => {
    const res = await api.get<ApiResponse<Property[]>>('/api/properties/owner/list');
    return res.data;
  },

  createProperty: async (data: Partial<Property>) => {
    const res = await api.post<ApiResponse<Property>>('/api/properties', data);
    return res.data;
  },

  updateProperty: async (id: string, data: Partial<Property>) => {
    const res = await api.put<ApiResponse<Property>>(`/api/properties/${id}`, data);
    return res.data;
  },

  deleteProperty: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/api/properties/${id}`);
    return res.data;
  },

  uploadImages: async (propertyId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const res = await api.post<ApiResponse<PropertyImage[]>>(
      `/api/properties/${propertyId}/images`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  deleteImage: async (propertyId: string, imageId: string) => {
    const res = await api.delete<ApiResponse<null>>(`/api/properties/${propertyId}/images/${imageId}`);
    return res.data;
  },

  reorderImages: async (
    propertyId: string,
    imageOrders: Array<{ id: string; displayOrder: number; isPrimary?: boolean }>
  ) => {
    const res = await api.put<ApiResponse<null>>(`/api/properties/${propertyId}/images/reorder`, {
      imageOrders,
    });
    return res.data;
  },
};
