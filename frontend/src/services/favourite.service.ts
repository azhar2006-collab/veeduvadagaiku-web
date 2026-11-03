import api from '../lib/axios';
import { ApiResponse, Property } from '../types';

export const favouriteService = {
  toggleFavourite: async (propertyId: string) => {
    const res = await api.post<ApiResponse<{ isFavourite: boolean }>>(`/api/favourites/${propertyId}`);
    return res.data;
  },

  getFavouriteIds: async () => {
    const res = await api.get<ApiResponse<string[]>>('/api/favourites');
    return res.data;
  },

  getUserFavourites: async () => {
    const res = await api.get<ApiResponse<Property[]>>('/api/users/favourites');
    return res.data;
  },
};
