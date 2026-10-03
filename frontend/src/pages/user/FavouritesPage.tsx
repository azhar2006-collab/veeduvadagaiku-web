import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { favouriteService } from '../../services/favourite.service';
import { PropertyGrid } from '../../components/property/PropertyGrid';
import { SEOHead } from '../../components/common/SEOHead';
import { Heart } from 'lucide-react';

export const FavouritesPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['userFavourites'],
    queryFn: () => favouriteService.getUserFavourites(),
  });

  const properties = data?.data || [];

  return (
    <div className="space-y-6">
      <SEOHead title="Saved Properties | Veedu Vadagaiku" />

      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>Shortlisted Rentals</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
            My Saved Properties
          </h1>
        </div>
      </div>

      <PropertyGrid
        properties={properties}
        isLoading={isLoading}
        emptyTitle="No saved properties yet"
        emptyDescription="When you browse houses or shops, tap the heart icon on any listing to save it here for quick access."
      />
    </div>
  );
};
