import React, { useState, useMemo } from 'react';
import { useProperties } from '../../hooks/useProperties';
import { PropertyGrid } from '../../components/property/PropertyGrid';
import { PropertyFilters as FilterComponent } from '../../components/property/PropertyFilters';
import { PropertyFilters as FilterType } from '../../types';
import { SEOHead } from '../../components/common/SEOHead';
import { Sparkles, ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  filterByExtendedCategory,
  filterByHallCapacity,
  filterByHallDining,
  filterByHallAc,
  filterBySize,
  filterByParking,
} from '../../utils/categoryUtils';

export const MarriageHallsPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const [filters, setFilters] = useState<FilterType>({
    category: 'MARRIAGE_HALL',
    propertyType: 'SHOP',
    locality: '',
    minRent: '',
    maxRent: '',
    hallCapacity: '',
    hallDining: '',
    hallAc: '',
    minSize: '',
    maxSize: '',
    carParking: '',
    furnishing: '',
    sortBy: 'newest',
    page: 1,
    limit: 12,
  });

  const { data, isLoading } = useProperties(filters);

  const handleReset = () => {
    setFilters({
      category: 'MARRIAGE_HALL',
      propertyType: 'SHOP',
      locality: '',
      minRent: '',
      maxRent: '',
      hallCapacity: '',
      hallDining: '',
      hallAc: '',
      minSize: '',
      maxSize: '',
      carParking: '',
      furnishing: '',
      sortBy: 'newest',
      page: 1,
      limit: 12,
    });
  };

  const allProperties = data?.data || [];
  const marriageHalls = useMemo(() => {
    let filtered = filterByExtendedCategory(allProperties, 'MARRIAGE_HALL');
    if (filtered.length === 0) filtered = allProperties;

    if (filters.hallCapacity) {
      filtered = filterByHallCapacity(filtered, filters.hallCapacity);
    }
    if (filters.hallDining) {
      filtered = filterByHallDining(filtered, filters.hallDining);
    }
    if (filters.hallAc) {
      filtered = filterByHallAc(filtered, filters.hallAc);
    }
    if (filters.minSize || filters.maxSize) {
      filtered = filterBySize(filtered, filters.minSize, filters.maxSize);
    }
    if (filters.carParking) {
      filtered = filterByParking(filtered, filters.carParking);
    }
    return filtered;
  }, [
    allProperties,
    filters.hallCapacity,
    filters.hallDining,
    filters.hallAc,
    filters.minSize,
    filters.maxSize,
    filters.carParking,
  ]);

  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SEOHead
        title="Marriage Halls & Kalyana Mandapam for Rent in Chennai | Veedu Vadagaiku"
        description="Book verified Kalyana Mandapams, mini party halls and wedding venues in Chennai directly from owners."
      />

      {/* Header (White & Lite Gold Theme) */}
      <div className="bg-gradient-to-r from-[#FCFAF6] via-white to-[#F8F5EE] rounded-3xl p-6 sm:p-8 border border-[#E8DFC8] shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9A7818]">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>{lang === 'ta' ? 'திருமணம் & விசேஷ அரங்கங்கள்' : 'Weddings & Celebrations'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {lang === 'ta' ? 'சென்னையில் கல்யாண மண்டபங்கள் & பார்ட்டி ஹால்கள்' : 'Marriage Halls & Mandapams in Chennai'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {pagination ? `${marriageHalls.length} ${lang === 'ta' ? 'சரிபார்க்கப்பட்ட மண்டபங்கள் உள்ளன' : 'verified venues available'}` : 'Loading...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1 sticky top-24">
          <FilterComponent
            filters={filters}
            onChange={(f) => setFilters({ ...f, propertyType: 'SHOP', category: 'MARRIAGE_HALL' })}
            onReset={handleReset}
          />
        </div>

        <div className="lg:col-span-3 space-y-8">
          <PropertyGrid properties={marriageHalls} isLoading={isLoading} />

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
