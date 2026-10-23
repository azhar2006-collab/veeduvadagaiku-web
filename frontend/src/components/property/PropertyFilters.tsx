import React, { useState, useMemo } from 'react';
import { Filter, RotateCcw, Building2, Building, Store, Users, PartyPopper, Check } from 'lucide-react';
import { PropertyFilters as FilterType } from '../../types';
import { useLocalities } from '../../hooks/useProperties';
import { useLanguage } from '../../context/LanguageContext';
import { COMMERCIAL_SUBTYPES, HOSTEL_GENDERS, HOSTEL_SHARING_TYPES, HOSTEL_TOTAL_MEMBERS, FURNISHING_OPTIONS, MARRIAGE_HALL_CAPACITIES, MARRIAGE_HALL_DINING, MARRIAGE_HALL_AC_TYPES } from '../../utils/categoryUtils';
import { CHENNAI_LOCALITIES } from '../../utils/chennaiLocalities';

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
  const { lang, t } = useLanguage();
  const { data: localitiesRes } = useLocalities();
  const localities = useMemo((): string[] => {
    if (Array.isArray(localitiesRes) && localitiesRes.length > 0) return localitiesRes;
    if (Array.isArray((localitiesRes as any)?.data)) return (localitiesRes as any).data;
    return CHENNAI_LOCALITIES;
  }, [localitiesRes]);
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

        {/* Section / Category Dropdown */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            {filters.propertyType === 'HOUSE' && filters.category !== 'HOSTEL'
              ? (lang === 'ta' ? 'வீடு வகை (House Type)' : 'House Type')
              : filters.propertyType === 'SHOP' && filters.category !== 'MARRIAGE_HALL'
              ? (lang === 'ta' ? 'வணிக வகை / வசதிகள்' : 'Commercial Facility / Type')
              : filters.category === 'HOSTEL'
              ? (lang === 'ta' ? 'விடுதி வகை' : 'Hostel & PG Accommodation')
              : filters.category === 'MARRIAGE_HALL'
              ? (lang === 'ta' ? 'மண்டபம் வகை' : 'Marriage Hall Facility')
              : t('filter.propertyCategory')}
          </label>

          {/* 1. House Section Dropdown */}
          {filters.propertyType === 'HOUSE' && filters.category !== 'HOSTEL' && (
            <select
              value={filters.category || ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange({
                  ...filters,
                  propertyType: 'HOUSE',
                  category: val as any,
                  page: 1,
                });
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition cursor-pointer"
            >
              <option value="">{lang === 'ta' ? 'அனைத்து வீடுகள் (All Residential)' : 'All Residential (Houses & Flats)'}</option>
              <option value="HOUSE">{lang === 'ta' ? '🏢 தனி வீடு (Individual / Independent House)' : '🏢 Individual / Independent House'}</option>
              <option value="APARTMENT">{lang === 'ta' ? '🏢 அபார்ட்மெண்ட் / பிளாட் (Apartment / Flat)' : '🏢 Apartment / Flat'}</option>
              <option value="VILLA">{lang === 'ta' ? '🏡 தனி வில்லா (Independent Villa)' : '🏡 Independent Villa'}</option>
              <option value="BUILDER_FLOOR">{lang === 'ta' ? '🏠 பில்டர் புளோர் (Builder Floor)' : '🏠 Builder / Independent Floor'}</option>
            </select>
          )}

          {/* 2. Shop Section Dropdown (Related Facilities) */}
          {filters.propertyType === 'SHOP' && filters.category !== 'MARRIAGE_HALL' && (
            <select
              value={
                filters.category === 'COMMERCIAL_BUILDING'
                  ? 'COMMERCIAL_BUILDING'
                  : filters.commercialType === 'Office Space'
                  ? 'OFFICE_SPACE'
                  : filters.commercialType === 'Showroom'
                  ? 'SHOWROOM'
                  : filters.commercialType === 'Godown/Warehouse'
                  ? 'GODOWN'
                  : filters.commercialType === 'Industrial Shed'
                  ? 'INDUSTRIAL_SHED'
                  : filters.commercialType === 'Shop' || filters.category === 'SHOP'
                  ? 'RETAIL_SHOP'
                  : ''
              }
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  onChange({ ...filters, propertyType: 'SHOP', category: undefined, commercialType: undefined, page: 1 });
                } else if (val === 'COMMERCIAL_BUILDING') {
                  onChange({ ...filters, propertyType: 'SHOP', category: 'COMMERCIAL_BUILDING', commercialType: undefined, page: 1 });
                } else if (val === 'RETAIL_SHOP') {
                  onChange({ ...filters, propertyType: 'SHOP', category: 'SHOP', commercialType: 'Shop', page: 1 });
                } else if (val === 'OFFICE_SPACE') {
                  onChange({ ...filters, propertyType: 'SHOP', category: 'SHOP', commercialType: 'Office Space', page: 1 });
                } else if (val === 'SHOWROOM') {
                  onChange({ ...filters, propertyType: 'SHOP', category: 'SHOP', commercialType: 'Showroom', page: 1 });
                } else if (val === 'GODOWN') {
                  onChange({ ...filters, propertyType: 'SHOP', category: 'SHOP', commercialType: 'Godown/Warehouse', page: 1 });
                } else if (val === 'INDUSTRIAL_SHED') {
                  onChange({ ...filters, propertyType: 'SHOP', category: 'SHOP', commercialType: 'Industrial Shed', page: 1 });
                }
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition cursor-pointer"
            >
              <option value="">{lang === 'ta' ? 'அனைத்து வணிக வசதிகள் & கடைகள்' : 'All Commercial Facilities & Shops'}</option>
              <option value="RETAIL_SHOP">{lang === 'ta' ? '🏪 சில்லறை கடை (Retail Shop / Store)' : '🏪 Retail Shop / Store'}</option>
              <option value="COMMERCIAL_BUILDING">{lang === 'ta' ? '🏢 வணிக கட்டிடம் (Commercial Building / Complex)' : '🏢 Commercial Building / Complex'}</option>
              <option value="OFFICE_SPACE">{lang === 'ta' ? '💼 அலுவலக இடம் (Office Space / IT)' : '💼 Office Space / Corporate'}</option>
              <option value="SHOWROOM">{lang === 'ta' ? '✨ ஷோரூம் (Commercial Showroom)' : '✨ Commercial Showroom'}</option>
              <option value="GODOWN">{lang === 'ta' ? '📦 கிடங்கு (Godown / Warehouse)' : '📦 Godown / Warehouse'}</option>
              <option value="INDUSTRIAL_SHED">{lang === 'ta' ? '🏭 தொழிற்சாலை / தொழிலக ஷெட் (Industrial)' : '🏭 Industrial Shed / Building'}</option>
            </select>
          )}

          {/* 3. Hostel Section Dropdown */}
          {filters.category === 'HOSTEL' && (
            <select
              value={filters.hostelGender || ''}
              onChange={(e) => {
                onChange({
                  ...filters,
                  category: 'HOSTEL',
                  propertyType: 'HOUSE',
                  hostelGender: (e.target.value as any) || undefined,
                  page: 1,
                });
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition cursor-pointer"
            >
              <option value="">{lang === 'ta' ? 'அனைத்து விடுதிகள் & PG Accommodations' : 'All Hostels & PG Accommodations'}</option>
              <option value="MALE">{lang === 'ta' ? "\u0b86\u0ba3\u0bcd\u0b95\u0bb3\u0bcd \u0bb5\u0bbf\u0b9f\u0bc1\u0ba4\u0bbf / PG (Men's / Gents)" : "Men's / Gents Hostel & PG"}</option>
              <option value="FEMALE">{lang === 'ta' ? "\u0baa\u0bc6\u0ba3\u0bcd\u0b95\u0bb3\u0bcd \u0bb5\u0bbf\u0b9f\u0bc1\u0ba4\u0bbf / PG (Women's / Ladies)" : "Women's / Ladies Hostel & PG"}</option>
              <option value="COLIVING">{lang === 'ta' ? '\u0b95\u0bcb-\u0bb2\u0bbf\u0bb5\u0bbf\u0b99\u0bcd (Co-Living PG)' : 'Co-Living PG'}</option>
            </select>
          )}

          {/* 4. Marriage Hall Section Dropdown */}
          {filters.category === 'MARRIAGE_HALL' && (
            <select
              value={filters.hallAc || ''}
              onChange={(e) => {
                onChange({
                  ...filters,
                  category: 'MARRIAGE_HALL',
                  propertyType: 'SHOP',
                  hallAc: (e.target.value as any) || undefined,
                  page: 1,
                });
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition cursor-pointer"
            >
              <option value="">{lang === 'ta' ? 'அனைத்து மண்டபங்கள்' : 'All Marriage Halls & Mandapams'}</option>
              <option value="AC">{lang === 'ta' ? 'ஏசி கல்யாண மண்டபம் (Central AC)' : 'Central AC Marriage Hall'}</option>
              <option value="NON_AC">{lang === 'ta' ? 'நான்-ஏசி / மினி ஹால் (Non-AC)' : 'Non-AC / Mini Hall'}</option>
            </select>
          )}

          {/* 5. General / All Categories Dropdown */}
          {!((filters.propertyType === 'HOUSE' && filters.category !== 'HOSTEL') ||
            (filters.propertyType === 'SHOP' && filters.category !== 'MARRIAGE_HALL') ||
            filters.category === 'HOSTEL' ||
            filters.category === 'MARRIAGE_HALL') && (
            <select
              value={filters.category || (filters.propertyType === 'SHOP' ? 'SHOP' : filters.propertyType === 'HOUSE' ? 'HOUSE' : '')}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  onChange({ ...filters, propertyType: undefined, category: undefined, page: 1 });
                } else if (val === 'HOUSE') {
                  onChange({ ...filters, propertyType: 'HOUSE', category: 'HOUSE', page: 1 });
                } else if (val === 'APARTMENT') {
                  onChange({ ...filters, propertyType: 'HOUSE', category: 'APARTMENT', page: 1 });
                } else if (val === 'SHOP') {
                  onChange({ ...filters, propertyType: 'SHOP', category: 'SHOP', page: 1 });
                } else if (val === 'COMMERCIAL_BUILDING') {
                  onChange({ ...filters, propertyType: 'SHOP', category: 'COMMERCIAL_BUILDING', page: 1 });
                } else if (val === 'HOSTEL') {
                  onChange({ ...filters, propertyType: 'HOUSE', category: 'HOSTEL', page: 1 });
                } else if (val === 'MARRIAGE_HALL') {
                  onChange({ ...filters, propertyType: 'SHOP', category: 'MARRIAGE_HALL', page: 1 });
                }
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition cursor-pointer"
            >
              <option value="">{lang === 'ta' ? 'அனைத்து சொத்து பிரிவுகள்' : 'All Property Categories'}</option>
              <option value="HOUSE">{lang === 'ta' ? '🏢 தனி வீடு / வில்லா (House / Villa)' : '🏢 Independent House / Villa'}</option>
              <option value="APARTMENT">{lang === 'ta' ? '🏢 அபார்ட்மெண்ட் / பிளாட் (Apartment / Flat)' : '🏢 Apartment / Flat'}</option>
              <option value="SHOP">{lang === 'ta' ? '🏪 வணிக கடை (Retail Shop)' : '🏪 Commercial Shop'}</option>
              <option value="COMMERCIAL_BUILDING">{lang === 'ta' ? '🏢 வணிக கட்டிடம் (Commercial Building)' : '🏢 Commercial Building'}</option>
              <option value="HOSTEL">{lang === 'ta' ? '👥 விடுதிகள் & PG Accommodation' : '👥 Hostels & PG Accommodation'}</option>
              <option value="MARRIAGE_HALL">{lang === 'ta' ? '🎉 கல்யாண மண்டபம் (Marriage Hall)' : '🎉 Marriage Hall / Mandapam'}</option>
            </select>
          )}
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

        {/* Rent Range - Scaling Slider + Numeric Inputs */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              {t('filter.budget')}
            </label>
            <span className="text-xs font-extrabold text-[#9A7818]">
              {filters.maxRent
                ? `≤ ₹${Number(filters.maxRent).toLocaleString('en-IN')}`
                : filters.minRent
                ? `≥ ₹${Number(filters.minRent).toLocaleString('en-IN')}`
                : lang === 'ta'
                ? 'அனைத்தும் (No Limit)'
                : 'Any Budget'}
            </span>
          </div>

          {/* Interactive Scaling Slider */}
          <div className="py-2 px-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1">
              <span>₹5k</span>
              <span>₹25k</span>
              <span>₹50k</span>
              <span>₹1L+</span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="2500"
              value={filters.maxRent ? Math.min(100000, Number(filters.maxRent)) : 100000}
              onChange={(e) => {
                const val = Number(e.target.value);
                handleFieldChange('maxRent', val >= 100000 ? '' : val);
              }}
              className="w-full h-2 bg-gradient-to-r from-[#FAF4E6] via-[#D4AF37] to-[#9A7818] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
            />
            <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
              <span>{lang === 'ta' ? 'குறைந்தது: ₹5,000' : 'Min: ₹5,000'}</span>
              <span>
                {filters.maxRent && Number(filters.maxRent) < 100000
                  ? `≤ ₹${Number(filters.maxRent).toLocaleString('en-IN')}`
                  : lang === 'ta'
                  ? 'வரம்பற்றது (No Limit)'
                  : 'No Limit'}
              </span>
            </div>
          </div>

          {/* Numeric Min / Max Inputs */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <input
                type="number"
                min="0"
                placeholder={t('filter.minRent', 'Min ₹')}
                value={filters.minRent || ''}
                onChange={(e) =>
                  handleFieldChange('minRent', e.target.value ? Number(e.target.value) : '')
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition"
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition"
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
                { val: '1RK', label: '1 RK' },
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

        {/* Floor Filter */}
        {filters.category !== 'MARRIAGE_HALL' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                {t('filter.floor', 'Floor')}
              </label>
              {filters.floor && (
                <button
                  type="button"
                  onClick={() => handleFieldChange('floor', '')}
                  className="text-[10px] font-bold text-[#9A7818] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { val: '', label: t('filter.allFloors', 'All Floors') },
                { val: 'ground', label: t('filter.groundFloor', 'Ground Floor') },
                { val: '1-3', label: t('filter.floor1to3', '1st – 3rd Floor') },
                { val: '4+', label: t('filter.floor4plus', '4th+ Floor') },
              ].map((fl) => {
                const isSelected = String(filters.floor || '') === fl.val;
                return (
                  <button
                    key={fl.val || 'all'}
                    type="button"
                    onClick={() => handleFieldChange('floor', fl.val)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-[#FAF4E6] text-[#9A7818] border-[#C5A059] shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {fl.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Built-up Area / Sq Ft Filter - Scaling Slider + Numeric Inputs */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              {t('filter.sqft', 'Built-up Area (Sq Ft)')}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#9A7818]">
                {filters.maxSize
                  ? `≤ ${Number(filters.maxSize).toLocaleString('en-IN')} sqft`
                  : filters.minSize
                  ? `≥ ${Number(filters.minSize).toLocaleString('en-IN')} sqft`
                  : lang === 'ta'
                  ? 'அனைத்தும் (No Limit)'
                  : 'Any Size'}
              </span>
              {(filters.minSize || filters.maxSize) && (
                <button
                  type="button"
                  onClick={() => {
                    handleFieldChange('minSize', '');
                    handleFieldChange('maxSize', '');
                  }}
                  className="text-[10px] font-bold text-[#9A7818] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Interactive Scaling Slider for Sq Ft */}
          <div className="py-2 px-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1">
              <span>300</span>
              <span>1k</span>
              <span>2.5k</span>
              <span>5k+ sqft</span>
            </div>
            <input
              type="range"
              min="300"
              max="5000"
              step="100"
              value={filters.maxSize ? Math.min(5000, Number(filters.maxSize)) : 5000}
              onChange={(e) => {
                const val = Number(e.target.value);
                handleFieldChange('maxSize', val >= 5000 ? '' : val);
              }}
              className="w-full h-2 bg-gradient-to-r from-[#FAF4E6] via-[#D4AF37] to-[#9A7818] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
            />
            <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
              <span>{lang === 'ta' ? 'குறைந்தது: 300 ச.அடி' : 'Min: 300 sqft'}</span>
              <span>
                {filters.maxSize && Number(filters.maxSize) < 5000
                  ? `≤ ${Number(filters.maxSize).toLocaleString('en-IN')} sqft`
                  : lang === 'ta'
                  ? 'வரம்பற்றது (No Limit)'
                  : 'No Limit'}
              </span>
            </div>
          </div>

          {/* Quick Area Preset Pills */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {[
              { min: '', max: '', label: t('filter.allSizes', 'All Sizes') },
              { min: '', max: '500', label: '< 500 sqft' },
              { min: '500', max: '1000', label: '500 – 1k sqft' },
              { min: '1000', max: '2000', label: '1k – 2k sqft' },
              { min: '2000', max: '5000', label: '2k – 5k sqft' },
              { min: '5000', max: '', label: '5k+ sqft' },
            ].map((sz, idx) => {
              const isSelected =
                String(filters.minSize || '') === sz.min && String(filters.maxSize || '') === sz.max;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleFieldChange('minSize', sz.min ? Number(sz.min) : '');
                    handleFieldChange('maxSize', sz.max ? Number(sz.max) : '');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                    isSelected
                      ? 'bg-[#FAF4E6] text-[#9A7818] border-[#C5A059] shadow-xs'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {sz.label}
                </button>
              );
            })}
          </div>

          {/* Numeric Min / Max Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min Sq Ft"
              value={filters.minSize || ''}
              onChange={(e) => handleFieldChange('minSize', e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059]"
            />
            <input
              type="number"
              placeholder="Max Sq Ft"
              value={filters.maxSize || ''}
              onChange={(e) => handleFieldChange('maxSize', e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059]"
            />
          </div>
        </div>

        {/* Parking Filter (Dropdown) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              {lang === 'ta' ? 'வாகன பார்க்கிங்' : 'Parking'}
            </label>
            {filters.carParking && (
              <button
                type="button"
                onClick={() => handleFieldChange('carParking', '')}
                className="text-[10px] font-bold text-[#9A7818] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <select
            value={typeof filters.carParking === 'boolean' ? (filters.carParking ? 'car' : '') : (filters.carParking || '')}
            onChange={(e) => handleFieldChange('carParking', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition cursor-pointer"
          >
            <option value="">{t('filter.allParking', 'All Parking')}</option>
            <option value="car">🚗 {t('filter.carParking', 'Car Parking')}</option>
            <option value="bike">🛵 {t('filter.bikeParking', 'Bike Parking')}</option>
          </select>
        </div>

        {/* Commercial Property Types (Matching Image 2 - NoBroker & OLX checklist) */}
        {(filters.propertyType === 'SHOP' || filters.category === 'SHOP' || filters.category === 'COMMERCIAL_BUILDING') && (
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

        {/* Hostel Filters — shown only when category is HOSTEL */}
        {filters.category === 'HOSTEL' && (
          <div className="space-y-4">
            {/* 1. Hostel Gender */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {lang === 'ta' ? 'விடுதி வகை (பாலினம்)' : 'Hostel For (Gender)'}
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
                      <span>{lang === 'ta' ? g.labelTa : g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Room Sharing / Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {lang === 'ta' ? 'அறை பகிர்வு (Members)' : 'Room Sharing (Members)'}
                </label>
                {filters.hostelSharing && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange('hostelSharing', '')}
                    className="text-[10px] font-bold text-[#9A7818] hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {HOSTEL_SHARING_TYPES.map((st) => {
                  const isSelected = filters.hostelSharing === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleFieldChange('hostelSharing', isSelected ? '' : st.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        isSelected
                          ? 'bg-[#FAF4E6] text-[#9A7818] border-[#C5A059] shadow-xs'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{lang === 'ta' ? st.labelTa : st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Total Members / Capacity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {lang === 'ta' ? 'மொத்த உறுப்பினர்கள் (Capacity)' : 'Total Members (Capacity)'}
                </label>
                {filters.hostelTotalMembers && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange('hostelTotalMembers', '')}
                    className="text-[10px] font-bold text-[#9A7818] hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {HOSTEL_TOTAL_MEMBERS.map((tm) => {
                  const isSelected = filters.hostelTotalMembers === tm.id;
                  return (
                    <button
                      key={tm.id}
                      type="button"
                      onClick={() => handleFieldChange('hostelTotalMembers', isSelected ? '' : tm.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        isSelected
                          ? 'bg-[#FAF4E6] text-[#9A7818] border-[#C5A059] shadow-xs'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{lang === 'ta' ? tm.labelTa : tm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Marriage Hall Filters — shown only when category is MARRIAGE_HALL */}
        {filters.category === 'MARRIAGE_HALL' && (
          <div className="space-y-4">
            {/* 1. Guest Capacity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {lang === 'ta' ? 'விருந்தினர் கொள்ளளவு' : 'Guest Capacity'}
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
                        <div className="font-bold">{lang === 'ta' ? cap.labelTa : cap.label}</div>
                        <div className="text-[10px] text-gray-500 font-normal">{cap.labelSub}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Dining Seating Capacity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {lang === 'ta' ? 'உணவுக்கூடம் / பந்தி கொள்ளளவு' : 'Dining Seating Capacity'}
                </label>
                {filters.hallDining && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange('hallDining', '')}
                    className="text-[10px] font-bold text-[#9A7818] hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {MARRIAGE_HALL_DINING.map((din) => {
                  const isSelected = filters.hallDining === din.id;
                  return (
                    <button
                      key={din.id}
                      type="button"
                      onClick={() => handleFieldChange('hallDining', isSelected ? '' : din.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border text-left transition ${
                        isSelected
                          ? 'bg-[#FAF4E6] text-[#9A7818] border-[#C5A059] shadow-xs'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{lang === 'ta' ? din.labelTa : din.label}</div>
                        <div className="text-[10px] text-gray-500 font-normal">{din.labelSub}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. AC Type */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {lang === 'ta' ? 'ஏசி வசதி (AC Type)' : 'AC Facility / Type'}
                </label>
                {filters.hallAc && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange('hallAc', '')}
                    className="text-[10px] font-bold text-[#9A7818] hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MARRIAGE_HALL_AC_TYPES.map((ac) => {
                  const isSelected = filters.hallAc === ac.id;
                  return (
                    <button
                      key={ac.id}
                      type="button"
                      onClick={() => handleFieldChange('hallAc', isSelected ? '' : ac.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold border transition ${
                        isSelected
                          ? 'bg-[#FAF4E6] text-[#9A7818] border-[#C5A059] shadow-xs'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{lang === 'ta' ? ac.labelTa : ac.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Furnishing (Dropdown) */}
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
          <select
            value={filters.furnishing || ''}
            onChange={(e) => handleFieldChange('furnishing', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition cursor-pointer"
          >
            <option value="">{lang === 'ta' ? 'அனைத்து பர்னிச்சர் நிலை (All)' : 'All Furnishing Status'}</option>
            {FURNISHING_OPTIONS.map(({ id, label, labelTa }) => (
              <option key={id} value={id}>
                {lang === 'ta' ? labelTa : label}
              </option>
            ))}
          </select>
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
