import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null, token?: string | null) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem('vv_token');
  const savedUserStr = localStorage.getItem('vv_user');
  let savedUser: User | null = null;
  if (savedUserStr) {
    try {
      savedUser = JSON.parse(savedUserStr);
    } catch {
      localStorage.removeItem('vv_user');
    }
  }

  return {
    user: savedUser,
    token: savedToken,
    isLoading: false,

    setUser: (user, token) => {
      if (token !== undefined) {
        if (token) {
          localStorage.setItem('vv_token', token);
        } else {
          localStorage.removeItem('vv_token');
        }
      }
      if (user) {
        localStorage.setItem('vv_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('vv_user');
      }
      set({ user, token: token !== undefined ? token : localStorage.getItem('vv_token') });
    },

    updateUser: (userData) => {
      set((state) => {
        if (!state.user) return state;
        const updated = { ...state.user, ...userData };
        localStorage.setItem('vv_user', JSON.stringify(updated));
        return { user: updated };
      });
    },

    logout: () => {
      localStorage.removeItem('vv_token');
      localStorage.removeItem('vv_user');
      set({ user: null, token: null });
    },
  };
});
