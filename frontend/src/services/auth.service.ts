import api from '../lib/axios';
import { ApiResponse, User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  firebaseLogin: async (idToken: string, role?: 'USER' | 'OWNER', name?: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>('/api/auth/firebase-login', {
      idToken,
      role,
      name,
    });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<User>>('/api/auth/me');
    return res.data;
  },
};
