import React, { useState } from 'react';
import { Filter, RotateCcw, Building2, Building, Store, Users, PartyPopper, Check } from 'lucide-react';
import { PropertyFilters as FilterType } from '../../types';
import { useLocalities } from '../../hooks/useProperties';
import { useLanguage } from '../../context/LanguageContext';
import { COMMERCIAL_SUBTYPES, HOSTEL_GENDERS, FURNISHING_OPTIONS, MARRIAGE_HALL_CAPACITIES } from '../../utils/categoryUtils';

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

        {/* Property Category Radio */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
            {t('filter.propertyCategory')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                const isSelected = filters.category === 'HOUSE';
                onChange({
                  ...filters,
                  propertyType: isSelected ? undefined : 'HOUSE',
                  category: isSelected ? undefined : 'HOUSE',
                  page: 1,
                });
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                filters.category === 'HOUSE'
                  ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818] shadow-xs'
                  : 'border-[#E8DFC8] text-gray-700 hover:bg-[#FAF7F0]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="truncate">{t('card.house')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const isSelected = filters.category === 'APARTMENT';
                onChange({
                  ...filters,
                  propertyType: isSelected ? undefined : 'HOUSE',
                  category: isSelected ? undefined : 'APARTMENT',
                  page: 1,
                });
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                filters.category === 'APARTMENT'
                  ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818] shadow-xs'
                  : 'border-[#E8DFC8] text-gray-700 hover:bg-[#FAF7F0]'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="truncate">{t('card.apartment', 'Apartment')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const isSelected = filters.category === 'SHOP';
                onChange({
                  ...filters,
                  propertyType: isSelected ? undefined : 'SHOP',
                  category: isSelected ? undefined : 'SHOP',
                  page: 1,
                });
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                filters.category === 'SHOP'
                  ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818] shadow-xs'
                  : 'border-[#E8DFC8] text-gray-700 hover:bg-[#FAF7F0]'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="truncate">{t('card.shop')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const isSelected = filters.category === 'HOSTEL';
                onChange({
                  ...filters,
                  propertyType: isSelected ? undefined : 'HOUSE',
                  category: isSelected ? undefined : 'HOSTEL',
                  page: 1,
                });
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                filters.category === 'HOSTEL'
                  ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818] shadow-xs'
                  : 'border-[#E8DFC8] text-gray-700 hover:bg-[#FAF7F0]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="truncate">{t('filter.hostel')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const isSelected = filters.category === 'MARRIAGE_HALL';
                onChange({
                  ...filters,
                  propertyType: isSelected ? undefined : 'SHOP',
                  category: isSelected ? undefined : 'MARRIAGE_HALL',
                  page: 1,
                });
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition col-span-2 sm:col-span-1 ${
                filters.category === 'MARRIAGE_HALL'
                  ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818] shadow-xs'
                  : 'border-[#E8DFC8] text-gray-700 hover:bg-[#FAF7F0]'
              }`}
            >
              <PartyPopper className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="truncate">{t('card.marriageHall')}</span>
            </button>
          </div>
        </div>

        {/* Chennai Locality */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            {t('filter.locality')}
          </label>
          <select
            value={
              !filters.locality
                ? ''
                : localities.includes(filters.locality)
                ? filters.locality
                : (localities.find((l) => l.toLowerCase().startsWith(filters.locality!.toLowerCase())) || filters.locality)
            }
            onChange={(e) => handleFieldChange('locality', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition"
          >
            <option value="">{t('filter.allAreas')}</option>
            {filters.locality && !localities.includes(filters.locality) && !localities.some((l) => l.toLowerCase().startsWith(filters.locality!.toLowerCase())) && (
              <option value={filters.locality}>{filters.locality}</option>
            )}
            {localities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Rent Range - Enter any value up to infinity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              {t('filter.budget')}
            </label>
            <span className="text-[10px] text-gray-400 font-medium">₹0 – Any (No Limit)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                min="0"
                placeholder={t('filter.minRent', 'Min ₹')}
                value={filters.minRent || ''}
                onChange={(e) =>
                  handleFieldChange('minRent', e.target.value ? Number(e.target.value) : '')
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition"
              />
            </div>
            <div>
              <input
                type="number"
                min="0"
                placeholder={t('filter.maxRent', 'Max ₹ (e.g. 50,000+)')}
                value={filters.maxRent || ''}
                onChange={(e) =>
                  handleFieldChange('maxRent', e.target.value ? Number(e.target.value) : '')
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition"
              />
            </div>
          </div>
          {/* Quick budget chip shortcuts */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {[
              { label: '≤ ₹10k', max: 10000, min: '' },
              { label: '≤ ₹20k', max: 20000, min: '' },
              { label: '≤ ₹30k', max: 30000, min: '' },
              { label: '≤ ₹50k', max: 50000, min: '' },
              { label: '₹50k+', max: '', min: 50000 },
              { label: 'Any', max: '', min: '' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  onChange({
                    ...filters,
                    minRent: chip.min as any,
                    maxRent: chip.max as any,
                    page: 1,
                  });
                }}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                  String(filters.maxRent) === String(chip.max) && String(filters.minRent || '') === String(chip.min || '')
                    ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818]'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bedrooms (if House or Apartment) */}
        {filters.propertyType !== 'SHOP' && filters.category !== 'SHOP' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                {t('filter.bedrooms')} (BHK)
              </label>
              {filters.bedrooms && (
                <button
                  type="button"
                  onClick={() => handleFieldChange('bedrooms', '')}
                  className="text-[10px] font-bold text-[#9A7818] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { val: '1', label: '1 BHK' },
                { val: '2', label: '2 BHK' },
                { val: '3', label: '3 BHK' },
                { val: '4', label: '4 BHK' },
                { val: '4+', label: '4+ BHK' },
              ].map((bhk) => {
                const curStr = String(filters.bedrooms || '');
                const curList = curStr ? curStr.split(',').map((s) => s.trim()) : [];
                const isSelected = curList.includes(bhk.val);

                return (
                  <button
                    key={bhk.val}
                    type="button"
                    onClick={() => {
                      let nextList: string[];
                      if (isSelected) {
                        nextList = curList.filter((s) => s !== bhk.val);
                      } else {
                        nextList = [...curList, bhk.val];
                      }
                      handleFieldChange('bedrooms', nextList.join(','));
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-[#FAF4E6] text-[#9A7818] border-[#C5A059] shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {bhk.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Commercial Property Types (Matching Image 2 - NoBroker & OLX checklist) */}
        {(filters.propertyType === 'SHOP' || filters.category === 'SHOP') && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Commercial Type
              </label>
              {filters.commercialType && (
                <button
                  type="button"
                  onClick={() => handleFieldChange('commercialType', '')}
                  className="text-[10px] font-bold text-[#9A7818] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {COMMERCIAL_SUBTYPES.map((sub) => {
                const currentTypes = (filters.commercialType || '')
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean);
                const isChecked = currentTypes.includes(sub.label);

                return (
                  <label
                    key={sub.id}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold border cursor-pointer transition ${
                      isChecked
                        ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818]'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        let nextTypes: string[];
                        if (e.target.checked) {
                          nextTypes = [...currentTypes, sub.label];
                        } else {
                          nextTypes = currentTypes.filter((t) => t !== sub.label);
                        }
                        handleFieldChange('commercialType', nextTypes.join(','));
                      }}
                      className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 border-gray-300"
                    />
                    <span>{sub.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Hostel Gender Filter — shown only when category is HOSTEL */}
        {filters.category === 'HOSTEL' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Hostel For
              </label>
              {filters.hostelGender && (
                <button
                  type="button"
                  onClick={() => handleFieldChange('hostelGender', '')}
                  className="text-[10px] font-bold text-[#9A7818] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {HOSTEL_GENDERS.map((g) => {
                const isSelected = filters.hostelGender === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleFieldChange('hostelGender', isSelected ? '' : g.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-[#FAF4E6] text-[#9A7818] border-[#C5A059] shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Marriage Hall Capacity — shown only when category is MARRIAGE_HALL */}
        {filters.category === 'MARRIAGE_HALL' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Guest Capacity
              </label>
              {filters.hallCapacity && (
                <button
                  type="button"
                  onClick={() => handleFieldChange('hallCapacity', '')}
                  className="text-[10px] font-bold text-[#9A7818] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              {MARRIAGE_HALL_CAPACITIES.map((cap) => {
                const isSelected = filters.hallCapacity === cap.id;
                return (
                  <button
                    key={cap.id}
                    type="button"
                    onClick={() => handleFieldChange('hallCapacity', isSelected ? '' : cap.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border text-left transition ${
                      isSelected
                        ? 'bg-[#FAF4E6] text-[#9A7818] border-[#C5A059] shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{cap.label}</div>
                      <div className="text-[10px] text-gray-500 font-normal">{cap.labelSub}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Furnishing */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              {t('filter.furnishing')}
            </label>
            {filters.furnishing && (
              <button
                type="button"
                onClick={() => handleFieldChange('furnishing', '')}
                className="text-[10px] font-bold text-[#9A7818] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {FURNISHING_OPTIONS.map(({ id, label }) => {
              const isSelected = filters.furnishing === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleFieldChange('furnishing', isSelected ? '' : id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-[#FAF4E6] text-[#9A7818] border-[#C5A059] shadow-xs'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{label}</span>
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
