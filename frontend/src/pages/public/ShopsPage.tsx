import React, { useState } from 'react';
import { useProperties } from '../../hooks/useProperties';
import { PropertyGrid } from '../../components/property/PropertyGrid';
import { PropertyFilters as FilterComponent } from '../../components/property/PropertyFilters';
import { PropertyFilters as FilterType } from '../../types';
import { SEOHead } from '../../components/common/SEOHead';
import { Store, ChevronLeft, ChevronRight } from 'lucide-react';

export const ShopsPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterType>({
    propertyType: 'SHOP',
    locality: '',
    minRent: '',
    maxRent: '',
    furnishing: '',
    sortBy: 'newest',
    page: 1,
    limit: 9,
  });

  const { data, isLoading } = useProperties(filters);

  const handleReset = () => {
    setFilters({
      propertyType: 'SHOP',
      locality: '',
      minRent: '',
      maxRent: '',
      furnishing: '',
      sortBy: 'newest',
      page: 1,
      limit: 9,
    });
  };

  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SEOHead
        title="Commercial Shops and Retail Space for Rent in Chennai | Veedu Vadagaiku"
        description="Find prime retail shops, office spaces and commercial showrooms for rent across Chennai."
      />

      {/* Header */}
      <div className="bg-amber-50 rounded-3xl p-6 sm:p-8 border border-amber-100 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <Store className="w-4 h-4" />
            <span>Commercial Real Estate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Commercial Shops for Rent in Chennai
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {pagination ? `${pagination.total} commercial shops and spaces available` : 'Loading...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1 sticky top-24">
          <FilterComponent
            filters={filters}
            onChange={(f) => setFilters({ ...f, propertyType: 'SHOP' })}
            onReset={handleReset}
          />
        </div>

        <div className="lg:col-span-3 space-y-8">
          <PropertyGrid
            properties={data?.data || []}
            isLoading={isLoading}
            emptyTitle="No shops found"
            emptyDescription="Try selecting different Chennai localities or adjusting rent limits."
          />

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={!pagination.hasPrev}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <span className="text-xs sm:text-sm font-semibold text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={!pagination.hasNext}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
