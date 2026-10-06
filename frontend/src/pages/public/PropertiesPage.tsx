import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProperties } from '../../hooks/useProperties';
import { PropertyGrid } from '../../components/property/PropertyGrid';
import { PropertyFilters as FilterComponent } from '../../components/property/PropertyFilters';
import { PropertyFilters as FilterType } from '../../types';
import { SEOHead } from '../../components/common/SEOHead';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PropertiesPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filters from search params
  const [filters, setFilters] = useState<FilterType>({
    propertyType: (searchParams.get('propertyType') as any) || '',
    locality: searchParams.get('locality') || '',
    minRent: searchParams.get('minRent') ? Number(searchParams.get('minRent')) : '',
    maxRent: searchParams.get('maxRent') ? Number(searchParams.get('maxRent')) : '',
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : '',
    furnishing: (searchParams.get('furnishing') as any) || '',
    sortBy: (searchParams.get('sortBy') as any) || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 9,
  });

  // Keep URL in sync with filters
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) {
        params.set(k, String(v));
      }
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const { data, isLoading } = useProperties(filters);

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({
      propertyType: '',
      locality: '',
      minRent: '',
      maxRent: '',
      bedrooms: '',
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
        title="Verified Houses and Shops for Rent in Chennai | Veedu Vadagaiku"
        description="Browse all available rental properties in Chennai. Filter by locality, rent range, bedrooms, and furnishing."
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {t('properties.title')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {pagination ? `${pagination.total} ${t('properties.count')}` : t('properties.loading')}
          </p>
        </div>

        {/* Quick Sort */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {t('filter.sortBy')}:
          </label>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) =>
              handleFilterChange({ ...filters, sortBy: e.target.value as any, page: 1 })
            }
            className="bg-white border border-gray-200 text-xs sm:text-sm font-semibold text-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="newest">{t('filter.newest')}</option>
            <option value="rent_asc">{t('filter.rentAsc')}</option>
            <option value="rent_desc">{t('filter.rentDesc')}</option>
          </select>
        </div>
      </div>

      {/* Main Grid & Filters layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 sticky top-24">
          <FilterComponent
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>

        {/* Property Grid & Pagination */}
        <div className="lg:col-span-3 space-y-8">
          <PropertyGrid properties={data?.data || []} isLoading={isLoading} />

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={!pagination.hasPrev}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('common.prev')}</span>
              </button>

              <span className="text-xs sm:text-sm font-semibold text-gray-600">
                {t('common.page')} {pagination.page} {t('common.of')} {pagination.totalPages}
              </span>

              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={!pagination.hasNext}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <span>{t('common.next')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
