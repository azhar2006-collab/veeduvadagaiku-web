import React, { useState } from 'react';
import { Filter, RotateCcw, Building2, Store, Check } from 'lucide-react';
import { PropertyFilters as FilterType } from '../../types';
import { useLocalities } from '../../hooks/useProperties';
import { useLanguage } from '../../context/LanguageContext';

interface PropertyFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
  onReset: () => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const { t } = useLanguage();
  const { data: localitiesRes } = useLocalities();
  const localities = localitiesRes?.data || [];
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const handleFieldChange = (key: keyof FilterType, val: any) => {
    onChange({
      ...filters,
      [key]: val === '' ? undefined : val,
      page: 1, // reset page on filter change
    });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v !== undefined && v !== '' && k !== 'page' && k !== 'limit' && k !== 'sortBy'
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-[#EFE8D8] p-5 shadow-xs">
      {/* Mobile Toggle Bar */}
      <div className="flex lg:hidden items-center justify-between">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="flex items-center gap-2 font-bold text-gray-900 text-sm py-1"
        >
          <Filter className="w-4 h-4 text-orange-600" />
          <span>{t('filter.title')} {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-orange-600 flex items-center gap-1 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('filter.reset')}
          </button>
        )}
      </div>

      {/* Main Filter Content */}
      <div className={`${isOpenMobile ? 'block mt-4' : 'hidden'} lg:block space-y-6`}>
        <div className="hidden lg:flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
            <Filter className="w-4 h-4 text-orange-600" />
            <span>{t('filter.title')}</span>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="text-xs font-semibold text-gray-400 hover:text-orange-600 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('filter.resetAll')}
            </button>
          )}
        </div>

        {/* Property Type Radio */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
            {t('filter.propertyCategory')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                handleFieldChange('propertyType', filters.propertyType === 'HOUSE' ? '' : 'HOUSE')
              }
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                filters.propertyType === 'HOUSE'
                  ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              {t('card.house')}
            </button>
            <button
              type="button"
              onClick={() =>
                handleFieldChange('propertyType', filters.propertyType === 'SHOP' ? '' : 'SHOP')
              }
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                filters.propertyType === 'SHOP'
                  ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Store className="w-4 h-4" />
              {t('card.shop')}
            </button>
          </div>
        </div>

        {/* Chennai Locality */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            {t('filter.locality')}
          </label>
          <select
            value={filters.locality || ''}
            onChange={(e) => handleFieldChange('locality', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          >
            <option value="">{t('filter.allAreas')}</option>
            {localities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Rent Range */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            {t('filter.budget')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                placeholder={t('filter.minRent', 'Min ₹')}
                value={filters.minRent || ''}
                onChange={(e) =>
                  handleFieldChange('minRent', e.target.value ? Number(e.target.value) : '')
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder={t('filter.maxRent', 'Max ₹')}
                value={filters.maxRent || ''}
                onChange={(e) =>
                  handleFieldChange('maxRent', e.target.value ? Number(e.target.value) : '')
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Bedrooms (if House) */}
        {filters.propertyType !== 'SHOP' && (
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {t('filter.bedrooms')}
            </label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() =>
                    handleFieldChange('bedrooms', filters.bedrooms === num ? '' : num)
                  }
                  className={`w-10 h-10 rounded-xl text-xs font-bold border transition ${
                    filters.bedrooms === num
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  handleFieldChange('bedrooms', filters.bedrooms === 5 ? '' : 5)
                }
                className={`px-3 h-10 rounded-xl text-xs font-bold border transition ${
                  filters.bedrooms === 5
                    ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                5+
              </button>
            </div>
          </div>
        )}

        {/* Furnishing */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            {t('filter.furnishing')}
          </label>
          <div className="space-y-1.5">
            {[
              { val: 'FURNISHED', label: t('card.furnished') },
              { val: 'SEMI_FURNISHED', label: t('card.semiFurnished') },
              { val: 'UNFURNISHED', label: t('card.unfurnished') },
            ].map(({ val, label }) => {
              const isSelected = filters.furnishing === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleFieldChange('furnishing', isSelected ? '' : val)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                    isSelected
                      ? 'bg-orange-50 border-orange-400 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{label}</span>
                  {isSelected && <Check className="w-4 h-4 text-orange-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            {t('filter.sortBy')}
          </label>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleFieldChange('sortBy', e.target.value as any)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          >
            <option value="newest">{t('filter.newest')}</option>
            <option value="rent_asc">{t('filter.rentAsc')}</option>
            <option value="rent_desc">{t('filter.rentDesc')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};
