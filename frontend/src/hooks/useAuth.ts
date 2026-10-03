import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, isLoading, setUser, updateUser, logout } = useAuthStore();

  const isAuthenticated = !!token && !!user;
  const isOwner = user?.role === 'OWNER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  return {
    user,
    token,
    isLoading,
    setUser,
    updateUser,
    logout,
    isAuthenticated,
    isOwner,
    isAdmin,
  };
};
