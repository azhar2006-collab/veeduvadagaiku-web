import React, { useState, useMemo } from 'react';
import { useProperties } from '../../hooks/useProperties';
import { PropertyGrid } from '../../components/property/PropertyGrid';
import { PropertyFilters as FilterComponent } from '../../components/property/PropertyFilters';
import { PropertyFilters as FilterType } from '../../types';
import { SEOHead } from '../../components/common/SEOHead';
import { Users, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { filterByExtendedCategory } from '../../utils/categoryUtils';

export const HostelsPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const [filters, setFilters] = useState<FilterType>({
    propertyType: 'HOUSE',
    locality: '',
    minRent: '',
    maxRent: '',
    bedrooms: '',
    furnishing: '',
    sortBy: 'newest',
    page: 1,
    limit: 12,
  });

  const { data, isLoading } = useProperties(filters);

  const handleReset = () => {
    setFilters({
      propertyType: 'HOUSE',
      locality: '',
      minRent: '',
      maxRent: '',
      bedrooms: '',
      furnishing: '',
      sortBy: 'newest',
      page: 1,
      limit: 12,
    });
  };

  // Filter for Hostels / PG
  const allProperties = data?.data || [];
  const hostelProperties = useMemo(() => {
    const filtered = filterByExtendedCategory(allProperties, 'HOSTEL');
    // If specifically tagged hostels exist, show them; otherwise show residential options suitable for bachelors/PG
    return filtered.length > 0 ? filtered : allProperties;
  }, [allProperties]);

  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SEOHead
        title="Hostels & PG Accommodations in Chennai | Veedu Vadagaiku"
        description="Find verified Gents and Ladies hostels, PG stays and mansions in Chennai. Connect directly with owners."
      />

      {/* Header (White & Lite Gold Theme) */}
      <div className="bg-gradient-to-r from-[#FCFAF6] via-white to-[#F8F5EE] rounded-3xl p-6 sm:p-8 border border-[#E8DFC8] shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9A7818]">
            <Users className="w-4 h-4 text-[#C5A059]" />
            <span>{lang === 'ta' ? 'விடுதிகள் & PG மேன்ஷன்' : 'Student & Working Professional Living'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {lang === 'ta' ? 'சென்னையில் வாடகை விடுதிகள் & PG' : 'Hostels & PG for Rent in Chennai'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {pagination ? `${hostelProperties.length} ${lang === 'ta' ? 'சரிபார்க்கப்பட்ட விடுதிகள் உள்ளன' : 'verified accommodations available'}` : 'Loading...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1 sticky top-24">
          <FilterComponent
            filters={filters}
            onChange={(f) => setFilters({ ...f, propertyType: 'HOUSE' })}
            onReset={handleReset}
          />
        </div>

        <div className="lg:col-span-3 space-y-8">
          <PropertyGrid properties={hostelProperties} isLoading={isLoading} />

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#EFE8D8]">
              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={!pagination.hasPrev}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-[#E8DFC8] rounded-xl hover:bg-[#FAF7F0] disabled:opacity-40 transition"
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
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-[#E8DFC8] rounded-xl hover:bg-[#FAF7F0] disabled:opacity-40 transition"
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
