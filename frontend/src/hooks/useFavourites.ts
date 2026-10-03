import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favouriteService } from '../services/favourite.service';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useFavourites = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: favouriteIds = [] } = useQuery({
    queryKey: ['favouriteIds'],
    queryFn: async () => {
      const res = await favouriteService.getFavouriteIds();
      return res.data;
    },
    enabled: isAuthenticated,
  });

  const toggleMutation = useMutation({
    mutationFn: (propertyId: string) => favouriteService.toggleFavourite(propertyId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['favouriteIds'] });
      queryClient.invalidateQueries({ queryKey: ['userFavourites'] });
      if (data.data.isFavourite) {
        toast.success('Added to favourites');
      } else {
        toast.success('Removed from favourites');
      }
    },
    onError: () => {
      toast.error('Failed to update favourites');
    },
  });

  const isFavourite = (propertyId: string) => favouriteIds.includes(propertyId);

  return {
    favouriteIds,
    isFavourite,
    toggleFavourite: (propertyId: string) => {
      if (!isAuthenticated) {
        toast.error('Please login to save properties');
        return;
      }
      toggleMutation.mutate(propertyId);
    },
    isPending: toggleMutation.isPending,
  };
};
