import React from 'react';
import { Property } from '../../types';
import { PropertyCard } from './PropertyCard';
import { EmptyState } from '../common/EmptyState';
import { Home } from 'lucide-react';

interface PropertyGridProps {
  properties: Property[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  isLoading,
  emptyTitle = 'No properties found',
  emptyDescription = 'Try adjusting your filters or search keywords to find matching rentals in Chennai.',
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse">
            <div className="aspect-[16/10] bg-gray-200 rounded-xl mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-8 bg-gray-100 rounded mb-4" />
            <div className="h-10 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={Home}
        title={emptyTitle}
        description={emptyDescription}
        actionText="View All Properties"
        actionLink="/properties"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};
