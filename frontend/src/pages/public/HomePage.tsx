import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Building,
  Store,
  Users,
  PartyPopper,
  ChevronDown,
  Truck,
  Wrench,
  Wind,
  FileText,
  Shield,
} from 'lucide-react';
import { useProperties, useLocalities } from '../../hooks/useProperties';
import { PropertyCard } from '../../components/property/PropertyCard';
import { PropertySwipeDeck } from '../../components/property/PropertySwipeDeck';
import { SEOHead } from '../../components/common/SEOHead';
import { useLanguage } from '../../context/LanguageContext';
import { COMMERCIAL_SUBTYPES, HOSTEL_GENDERS, MARRIAGE_HALL_CAPACITIES, FURNISHING_OPTIONS } from '../../utils/categoryUtils';
import { CHENNAI_LOCALITIES } from '../../utils/chennaiLocalities';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [viewMode, setViewMode] = useState<'search' | 'swipe'>('search');
  const [deckType, setDeckType] = useState<'HOUSE' | 'SHOP' | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<'HOUSE' | 'APARTMENT' | 'SHOP' | 'HOSTEL' | 'MARRIAGE_HALL' | ''>('');

  const [locality, setLocality] = useState('');
  const [maxRent, setMaxRent] = useState('');

  // NoBroker / OLX style Rentals popover state
  const [isRentalsOpen, setIsRentalsOpen] = useState(false);
  const rentalsRef = React.useRef<HTMLDivElement>(null);
  const [rentalTab, setRentalTab] = useState<'RESIDENTIAL' | 'COMMERCIAL' | 'HOSTEL' | 'MARRIAGE_HALL'>('RESIDENTIAL');
  const [selectedBhks, setSelectedBhks] = useState<string[]>([]);
  const [residentialType, setResidentialType] = useState<'ALL' | 'HOUSE' | 'APARTMENT'>('ALL');
  const [selectedCommercialTypes, setSelectedCommercialTypes] = useState<string[]>([]);
  const [hostelGender, setHostelGender] = useState<'MALE' | 'FEMALE' | 'COLIVING' | ''>('');
  const [hallCapacity, setHallCapacity] = useState<'UP_TO_250' | '250_TO_500' | '500_TO_1000' | '1000_PLUS' | ''>('');

  // Close popover on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rentalsRef.current && !rentalsRef.current.contains(event.target as Node)) {
        setIsRentalsOpen(false);
      }
    };
    if (isRentalsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRentalsOpen]);

  const { data: localitiesRes } = useLocalities();
  const localities = useMemo((): string[] => {
    if (Array.isArray(localitiesRes) && localitiesRes.length > 0) return localitiesRes;
    if (Array.isArray((localitiesRes as any)?.data)) return (localitiesRes as any).data;
    return CHENNAI_LOCALITIES;
  }, [localitiesRes]);

  // Fetch properties for the Swipe Deck
  const { data: deckRes, isLoading: loadingDeck } = useProperties({
    propertyType: deckType || undefined,
    limit: 25,
    sortBy: 'newest',
  });
  const deckProperties = deckRes?.data || [];

  // Fetch featured and latest properties for below sections
  const { data: featuredData, isLoading: loadingFeatured } = useProperties({
    limit: 6,
    sortBy: 'newest',
  });
  const featuredProperties = Array.isArray(featuredData?.data) ? featuredData.data : [];

  const { data: housesData, isLoading: loadingHouses } = useProperties({
    propertyType: 'HOUSE',
    limit: 3,
  });
  const houseProperties = Array.isArray(housesData?.data) ? housesData.data : [];

  const { data: shopsData, isLoading: loadingShops } = useProperties({
    propertyType: 'SHOP',
    limit: 3,
  });
  const shopProperties = Array.isArray(shopsData?.data) ? shopsData.data : [];

  const getRentalsSummary = () => {
    if (rentalTab === 'RESIDENTIAL') {
      const typeLabel =
        residentialType === 'APARTMENT'
          ? (lang === 'ta' ? 'அபார்ட்மெண்ட்' : 'Apartment')
          : residentialType === 'HOUSE'
          ? (lang === 'ta' ? 'தனி வீடு' : 'House')
          : (lang === 'ta' ? 'வீடு / பிளாட்' : 'House / Flat');

      if (selectedBhks.length > 0) {
        return `${typeLabel} (${selectedBhks.join(', ')} BHK)`;
      }
      if (residentialType !== 'ALL') return typeLabel;
      return lang === 'ta' ? 'வீடு / பிளாட்' : 'House / Flat';
    }
    if (rentalTab === 'COMMERCIAL') {
      if (selectedCommercialTypes.length > 0) {
        return `${lang === 'ta' ? 'வணிகம்' : 'Commercial'}: ${selectedCommercialTypes.slice(0, 2).join(', ')}${
          selectedCommercialTypes.length > 2 ? ' +' + (selectedCommercialTypes.length - 2) : ''
        }`;
      }
      return lang === 'ta' ? 'வணிக சொத்து (Commercial)' : 'Commercial (All)';
    }
    if (rentalTab === 'HOSTEL') {
      return lang === 'ta' ? 'விடுதி / PG' : 'Hostel / PG';
    }
    if (rentalTab === 'MARRIAGE_HALL') {
      return lang === 'ta' ? 'கல்யாண மண்டபம்' : 'Kalyana Mandapam';
    }
    return t('filter.propertyCategory');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (locality) params.append('locality', locality);

    if (rentalTab === 'RESIDENTIAL') {
      if (residentialType === 'APARTMENT') {
        params.append('category', 'APARTMENT');
      } else if (residentialType === 'HOUSE') {
        params.append('category', 'HOUSE');
      } else {
        params.append('propertyType', 'HOUSE');
      }
      if (selectedBhks.length > 0) {
        params.append('bedrooms', selectedBhks.join(','));
      }
    } else if (rentalTab === 'COMMERCIAL') {
      params.append('propertyType', 'SHOP');
      params.append('category', 'SHOP');
      if (selectedCommercialTypes.length > 0) {
        params.append('commercialType', selectedCommercialTypes.join(','));
      }
    } else if (rentalTab === 'HOSTEL') {
      params.append('category', 'HOSTEL');
      if (hostelGender) params.append('hostelGender', hostelGender);
    } else if (rentalTab === 'MARRIAGE_HALL') {
      params.append('category', 'MARRIAGE_HALL');
      if (hallCapacity) params.append('hallCapacity', hallCapacity);
    }

    if (maxRent) params.append('maxRent', maxRent);
    navigate(`/properties?${params.toString()}`);
  };

  const popularLocalities = [
    'Anna Nagar',
    'T. Nagar',
    'Velachery',
    'Adyar',
    'Mylapore',
    'Porur',
    'Tambaram',
    'Sholinganallur',
    'Vadapalani',
    'Besant Nagar',
    'Guindy',
    'Thiruvanmiyur',
  ];

  return (
    <div className="space-y-6 sm:space-y-16 pb-12">
      <SEOHead
        title="Chennai's Exclusive One-Stop Property Rental Webapp | Veedu Vadagaiku"
        description="Chennai's exclusive one-stop property rental webapp. Verified houses, apartments, shops, hostels & marriage halls direct from owners."
      />

      {/* Hero Section (NoBroker style with White & Lite Gold Theme) */}
      <section className="relative overflow-x-hidden pt-4 pb-4 sm:pb-6 md:pt-8 md:pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FCFAF6] via-white to-[#F8F5EE] border-b border-[#EFE8D8]">
        {/* Subtle decorative gold radial glows */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none opacity-40" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30" style={{ background: 'radial-gradient(circle, rgba(197,160,89,0.12) 0%, transparent 65%)' }} />

        <div className="relative max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Top Tagline */}
          <div className="text-center space-y-2 max-w-3xl mx-auto px-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] text-[10px] sm:text-xs font-bold tracking-wide shadow-2xs max-w-[95vw] flex-wrap justify-center">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C5A059] shrink-0" />
              <span className="text-center leading-snug">{t('hero.badge')}</span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-[2.25rem] font-bold sm:font-extrabold tracking-tight leading-snug sm:leading-tight text-[#1E2329]">
              {t('hero.title1')}{' '}
              <span className="text-[#C5A059]">{t('hero.titleHouse')}</span>
            </h1>

            <p className="max-w-xl mx-auto text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              {t('hero.desc')}
            </p>
            <p className="max-w-xl mx-auto text-[11px] sm:text-xs text-[#9A7818] font-medium leading-relaxed">
              {t('hero.descSub')}
            </p>
          </div>

          {/* NoBroker-style Tab Switcher with 4 Categories + Swipe Deck */}
          <div className="w-full flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-1 px-4 sm:px-0">
            <div
              className="inline-flex items-center p-1 rounded-2xl bg-[#FAF7F0] border border-[#E8DFC8] shadow-xs flex-nowrap shrink-0 sm:mx-auto"
              role="tablist"
              aria-label="Browse mode"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'search' && selectedCategory === ''}
                onClick={() => {
                  setViewMode('search');
                  setSelectedCategory('');
                }}
                className={`flex items-center px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  viewMode === 'search' && selectedCategory === ''
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{lang === 'ta' ? 'அனைத்தும்' : 'All Rentals'}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'search' && selectedCategory === 'HOUSE'}
                onClick={() => {
                  setViewMode('search');
                  setSelectedCategory('HOUSE');
                }}
                className={`flex items-center px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  viewMode === 'search' && selectedCategory === 'HOUSE'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{t('card.house')}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'search' && selectedCategory === 'SHOP'}
                onClick={() => {
                  setViewMode('search');
                  setSelectedCategory('SHOP');
                }}
                className={`flex items-center px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  viewMode === 'search' && selectedCategory === 'SHOP'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{t('card.shop')}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'search' && selectedCategory === 'HOSTEL'}
                onClick={() => {
                  setViewMode('search');
                  setSelectedCategory('HOSTEL');
                }}
                className={`flex items-center px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  viewMode === 'search' && selectedCategory === 'HOSTEL'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{t('card.hostel')}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'search' && selectedCategory === 'MARRIAGE_HALL'}
                onClick={() => {
                  setViewMode('search');
                  setSelectedCategory('MARRIAGE_HALL');
                }}
                className={`flex items-center px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  viewMode === 'search' && selectedCategory === 'MARRIAGE_HALL'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{t('card.marriageHall')}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'swipe'}
                onClick={() => setViewMode('swipe')}
                className={`hidden md:flex items-center px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  viewMode === 'swipe'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{t('home.cardDeck')}</span>
              </button>
            </div>
          </div>

          {/* MAIN INTERACTIVE AREA */}
          {viewMode === 'swipe' ? (
            /* Swipe Discovery Mode */
            <div className="w-full flex flex-col items-center pt-1 animate-fade-in">
              {loadingDeck ? (
                <div className="w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4.15] min-h-[380px] sm:min-h-[510px] bg-white border border-[#E8DFC8] rounded-3xl animate-pulse flex flex-col items-center justify-center gap-3">
                  <Sparkles className="w-10 h-10 text-[#C5A059]" />
                  <p className="text-xs text-gray-500 font-normal">Loading listings…</p>
                </div>
              ) : (
                <PropertySwipeDeck
                  properties={deckProperties}
                  selectedType={deckType}
                  onFilterChange={setDeckType}
                />
              )}
            </div>
          ) : (
            /* NoBroker-style Classic Search Box */
            <div className="pt-1 max-w-4xl mx-auto animate-fade-in">
              <form
                onSubmit={handleSearch}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl shadow-[#D4AF37]/10 border border-[#E8DFC8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-center"
              >
                {/* Locality Dropdown */}
                <div className="relative text-left">
                  <label className="block text-[11px] font-bold uppercase text-gray-600 tracking-wider mb-1 ml-1">
                    {t('filter.locality')}
                  </label>
                  <div className="flex items-center gap-2 bg-[#FCFAF5] hover:bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E8DFC8] transition">
                    <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <select
                      value={
                        !locality
                          ? ''
                          : localities.includes(locality)
                          ? locality
                          : (localities.find((l) => l.toLowerCase().startsWith(locality.toLowerCase())) || locality)
                      }
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="">{t('hero.selectLocality')}</option>
                      {locality && !localities.includes(locality) && !localities.some((l) => l.toLowerCase().startsWith(locality.toLowerCase())) && (
                        <option value={locality}>{locality}</option>
                      )}
                      {localities.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* RENTALS - NoBroker / OLX Style Interactive Popover Dropdown */}
                <div className="relative text-left" ref={rentalsRef}>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 tracking-wider mb-1 ml-1">
                    {t('filter.propertyCategory')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsRentalsOpen(!isRentalsOpen)}
                    className="w-full flex items-center justify-between gap-2 bg-[#FCFAF5] hover:bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E8DFC8] transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {rentalTab === 'COMMERCIAL' ? (
                        <Store className="w-4 h-4 text-[#C5A059] shrink-0" />
                      ) : rentalTab === 'HOSTEL' ? (
                        <Users className="w-4 h-4 text-[#C5A059] shrink-0" />
                      ) : rentalTab === 'MARRIAGE_HALL' ? (
                        <PartyPopper className="w-4 h-4 text-[#C5A059] shrink-0" />
                      ) : residentialType === 'APARTMENT' ? (
                        <Building className="w-4 h-4 text-[#C5A059] shrink-0" />
                      ) : (
                        <Building2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {getRentalsSummary()}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${
                        isRentalsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Popover Dropdown Modal */}
                  {isRentalsOpen && (
                    <div className="absolute top-full left-0 right-0 sm:left-auto sm:-translate-x-12 sm:w-[380px] mt-2 bg-white rounded-2xl shadow-2xl border border-[#E8DFC8] p-4 z-50 animate-scale-in">
                      {/* Segmented Category Switcher */}
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FAF4E6] rounded-xl mb-3 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setRentalTab('RESIDENTIAL')}
                          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                            rentalTab === 'RESIDENTIAL'
                              ? 'bg-white text-[#9A7818] shadow-xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>{lang === 'ta' ? 'வீடு / பிளாட்' : 'House'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRentalTab('COMMERCIAL')}
                          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                            rentalTab === 'COMMERCIAL'
                              ? 'bg-white text-[#9A7818] shadow-xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Store className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>{lang === 'ta' ? 'வணிகம்' : 'Commercial'}</span>
                        </button>
                      </div>

                      <div className="flex gap-1.5 mb-3">
                        <button
                          type="button"
                          onClick={() => setRentalTab('HOSTEL')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition ${
                            rentalTab === 'HOSTEL'
                              ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818]'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {lang === 'ta' ? 'விடுதி / PG' : 'Hostel / PG'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRentalTab('MARRIAGE_HALL')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition ${
                            rentalTab === 'MARRIAGE_HALL'
                              ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818]'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {lang === 'ta' ? 'கல்யாண மண்டபம்' : 'Marriage Hall'}
                        </button>
                      </div>

                      {/* TAB 1: RESIDENTIAL */}
                      {rentalTab === 'RESIDENTIAL' && (
                        <div className="space-y-3.5">
                          {/* BHK Filter */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                                {lang === 'ta' ? 'அறை எண்ணிக்கை (BHK Type)' : 'Apartment Type / BHK'}
                              </label>
                              {selectedBhks.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedBhks([])}
                                  className="text-[10px] font-bold text-[#9A7818] hover:underline"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                              {['1', '2', '3', '4+'].map((bhk) => {
                                const isSelected = selectedBhks.includes(bhk);
                                return (
                                  <button
                                    key={bhk}
                                    type="button"
                                    onClick={() => {
                                      setSelectedBhks((prev) =>
                                        prev.includes(bhk) ? prev.filter((b) => b !== bhk) : [...prev, bhk]
                                      );
                                    }}
                                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                                      isSelected
                                        ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818] shadow-xs'
                                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {bhk} BHK
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Property Subtype */}
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-500 tracking-wider mb-2">
                              {lang === 'ta' ? 'சொத்து வகை' : 'Property Type'}
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { id: 'ALL', label: 'All' },
                                { id: 'HOUSE', label: 'House / Villa' },
                                { id: 'APARTMENT', label: 'Apartment' },
                              ].map((type) => (
                                <button
                                  key={type.id}
                                  type="button"
                                  onClick={() => setResidentialType(type.id as any)}
                                  className={`p-2 text-center rounded-xl text-xs font-semibold border transition ${
                                    residentialType === type.id
                                      ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818] font-bold'
                                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {type.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: COMMERCIAL - MATCHING IMAGE 2 EXACT CHECKLIST */}
                      {rentalTab === 'COMMERCIAL' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                              {lang === 'ta' ? 'வணிக சொத்து வகை' : 'Property Type'}
                            </label>
                            {selectedCommercialTypes.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSelectedCommercialTypes([])}
                                className="text-[10px] font-bold text-[#9A7818] hover:underline"
                              >
                                Clear all
                              </button>
                            )}
                          </div>

                          <div className="space-y-1 max-h-52 overflow-y-auto pr-1 border border-gray-100 rounded-xl p-1.5 bg-gray-50/50">
                            {COMMERCIAL_SUBTYPES.map((sub) => {
                              const isChecked = selectedCommercialTypes.includes(sub.label);
                              return (
                                <label
                                  key={sub.id}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                                    isChecked
                                      ? 'bg-white text-[#9A7818] shadow-xs'
                                      : 'text-gray-700 hover:bg-white/60'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCommercialTypes((prev) => [...prev, sub.label]);
                                      } else {
                                        setSelectedCommercialTypes((prev) => prev.filter((t) => t !== sub.label));
                                      }
                                    }}
                                    className="rounded text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 border-gray-300"
                                  />
                                  <span>{lang === 'ta' ? sub.labelTa : sub.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* TAB 3: HOSTEL */}
                      {rentalTab === 'HOSTEL' && (
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-gray-800">{lang === 'ta' ? 'விடுதி வகை தேர்வு' : 'Hostel Type'}</p>
                          <div className="grid grid-cols-1 gap-1.5">
                            {HOSTEL_GENDERS.map((g) => {
                              const isSelected = hostelGender === g.id;
                              return (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() => setHostelGender(isSelected ? '' : g.id as typeof hostelGender)}
                                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition text-left ${
                                    isSelected
                                      ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818] shadow-xs'
                                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <span className="text-base">{g.id === 'MALE' ? '👨' : g.id === 'FEMALE' ? '👩' : '🤝'}</span>
                                  <span>{lang === 'ta' ? g.labelTa : g.label}</span>
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            {lang === 'ta' ? 'மகளிர் மற்றும் ஆடவர் விடுதிகள், Co-living PG' : 'Verified Men & Women Hostels, Co-living PG in Chennai'}
                          </p>
                        </div>
                      )}

                      {/* TAB 4: MARRIAGE HALL */}
                      {rentalTab === 'MARRIAGE_HALL' && (
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-gray-800">{lang === 'ta' ? 'திட்டமிட்ட விருந்தினர் எண்ணிக்கை' : 'Expected Guest Capacity'}</p>
                          <div className="space-y-1.5">
                            {MARRIAGE_HALL_CAPACITIES.map((cap) => {
                              const isSelected = hallCapacity === cap.id;
                              return (
                                <button
                                  key={cap.id}
                                  type="button"
                                  onClick={() => setHallCapacity(isSelected ? '' : cap.id as typeof hallCapacity)}
                                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition text-left ${
                                    isSelected
                                      ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818] shadow-xs'
                                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <div>
                                    <div className="font-bold">{lang === 'ta' ? cap.labelTa : cap.label}</div>
                                    <div className="text-[10px] text-gray-500 font-normal">{cap.labelSub}</div>
                                  </div>
                                  {isSelected && <span className="text-[#C5A059] font-bold text-sm">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBhks([]);
                            setResidentialType('ALL');
                            setSelectedCommercialTypes([]);
                            setHostelGender('');
                            setHallCapacity('');
                          }}
                          className="text-xs font-bold text-gray-400 hover:text-gray-600"
                        >
                          {lang === 'ta' ? 'நீக்குக' : 'Reset'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsRentalsOpen(false)}
                          className="px-4 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white text-xs font-bold rounded-xl shadow-xs"
                        >
                          {lang === 'ta' ? 'சரி (Apply)' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Max Budget - Enter value directly or pick preset */}
                <div className="relative text-left">
                  <div className="flex items-center justify-between mb-1 ml-1">
                    <label className="block text-[11px] font-bold uppercase text-gray-600 tracking-wider">
                      {t('hero.maxBudget')}
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">₹0 – Any</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#FCFAF5] hover:bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E8DFC8] transition">
                    <span className="text-sm font-bold text-[#C5A059] pl-1">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      list="budget-presets"
                      placeholder={lang === 'ta' ? 'அதிகபட்ச பட்ஜெட் ₹ (எ.கா. 50000+)' : 'Enter budget ₹ (e.g. 50,000+)'}
                      value={maxRent}
                      onChange={(e) => setMaxRent(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none"
                    />
                    <datalist id="budget-presets">
                      <option value="8000">Up to ₹8,000</option>
                      <option value="10000">Up to ₹10,000</option>
                      <option value="15000">Up to ₹15,000</option>
                      <option value="20000">Up to ₹20,000</option>
                      <option value="25000">Up to ₹25,000</option>
                      <option value="30000">Up to ₹30,000</option>
                      <option value="40000">Up to ₹40,000</option>
                      <option value="50000">Up to ₹50,000</option>
                      <option value="50000+">₹50,000+ (Premium / Commercial)</option>
                    </datalist>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="sm:col-span-2 lg:col-span-1 pt-1 sm:pt-0">
                  <button
                    type="submit"
                    className="w-full h-[48px] flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 text-white font-bold text-sm rounded-xl shadow-md shadow-[#D4AF37]/25 transition active:scale-[0.98]"
                  >
                    <Search className="w-4 h-4 text-white" />
                    <span>{t('hero.searchBtn')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* NoBroker-style Trust Guarantee Badges */}
          <div className="pt-1 sm:pt-3 grid grid-cols-3 gap-1.5 sm:gap-3 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-[#EFE8D8] shadow-2xs">
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">{t('hero.zeroBrokerage')}</p>
                <p className="text-[9px] sm:text-[11px] text-gray-500 hidden sm:block">{t('hero.zeroBrokerageDesc')}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-[#EFE8D8] shadow-2xs">
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">{t('hero.verifiedListings')}</p>
                <p className="text-[9px] sm:text-[11px] text-gray-500 hidden sm:block">{t('hero.verifiedListingsDesc')}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-[#EFE8D8] shadow-2xs">
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">{t('hero.instantConnect')}</p>
                <p className="text-[9px] sm:text-[11px] text-gray-500 hidden sm:block">{t('hero.instantConnectDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse By Category Section - 4 Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* 1. Houses */}
          <Link
            to="/houses"
            className="group bg-white rounded-2xl p-3.5 sm:p-6 border border-[#EFE8D8] shadow-sm hover:shadow-xl hover:border-[#C5A059] transition-all flex flex-col justify-between"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-[#B08B40] transition">
                {t('nav.houses')}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed hidden sm:block">
                {lang === 'ta'
                  ? 'குடும்பங்கள் மற்றும் பேச்சிலர்களுக்கான தனி வீடுகள், பிளாட்டுகள் மற்றும் வில்லாக்கள்.'
                  : 'Independent houses, apartments, and villas for families & bachelors.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C5A059] group-hover:text-[#9A7818] pt-3 sm:pt-4">
              <span>{t('home.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* 2. Commercial Shops */}
          <Link
            to="/shops"
            className="group bg-white rounded-2xl p-3.5 sm:p-6 border border-[#EFE8D8] shadow-sm hover:shadow-xl hover:border-[#C5A059] transition-all flex flex-col justify-between"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-[#B08B40] transition">
                {t('nav.shops')}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed hidden sm:block">
                {lang === 'ta'
                  ? 'அதிக மக்கள் நடமாட்டம் உள்ள மெயின் ரோடு வணிக கடைகள் & அலுவலக இடங்கள்.'
                  : 'Retail showrooms, office spaces, and road-facing shops in prime commercial hubs.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C5A059] group-hover:text-[#9A7818] pt-3 sm:pt-4">
              <span>{t('home.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* 3. Hostels & PG */}
          <Link
            to="/hostels"
            className="group bg-white rounded-2xl p-3.5 sm:p-6 border border-[#EFE8D8] shadow-sm hover:shadow-xl hover:border-[#C5A059] transition-all flex flex-col justify-between"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-[#B08B40] transition">
                {t('nav.hostels')}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed hidden sm:block">
                {lang === 'ta'
                  ? 'மாணவர்கள் மற்றும் பணிபுரிபவர்களுக்கான பாதுகாப்பான மகளிர் & ஆடவர் விடுதிகள், மேன்ஷன்.'
                  : 'Safe, verified Gents & Ladies hostels, PG stays, and mansions in Chennai.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C5A059] group-hover:text-[#9A7818] pt-3 sm:pt-4">
              <span>{t('home.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* 4. Marriage Halls */}
          <Link
            to="/marriage-halls"
            className="group bg-white rounded-2xl p-3.5 sm:p-6 border border-[#EFE8D8] shadow-sm hover:shadow-xl hover:border-[#C5A059] transition-all flex flex-col justify-between"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-[#B08B40] transition">
                {t('nav.marriageHalls')}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed hidden sm:block">
                {lang === 'ta'
                  ? 'திருமணம், வரவேற்பு மற்றும் விசேஷங்களுக்கான பிரம்மாண்ட மண்டபங்கள் & மினி ஹால்கள்.'
                  : 'Spacious wedding halls, mini-mandapams, and party halls across Chennai.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C5A059] group-hover:text-[#9A7818] pt-3 sm:pt-4">
              <span>{t('home.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9A7818] bg-[#FAF4E6] border border-[#E8DFC8] px-3 py-1 rounded-full mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{lang === 'ta' ? 'சிறந்த தேர்வுகள்' : 'Handpicked Deals'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {t('home.featuredTitle')}
            </h2>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#C5A059] hover:text-[#9A7818] transition"
          >
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EFE8D8] shadow-xs overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-24 bg-gray-200 rounded-full" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <div className="h-3 w-16 bg-gray-200 rounded-full" />
                    <div className="h-3 w-14 bg-gray-200 rounded-full" />
                    <div className="h-3 w-18 bg-gray-200 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="h-5 w-28 bg-gray-200 rounded-lg" />
                    <div className="h-8 w-24 bg-gray-200 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* Houses Spotlight */}
      <section className="bg-[#FAF8F4] py-14 border-y border-[#EFE8D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                {t('home.housesTitle')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{t('home.housesSubtitle')}</p>
            </div>
            <Link
              to="/houses"
              className="text-xs sm:text-sm font-bold text-[#C5A059] hover:text-[#9A7818] flex items-center gap-1"
            >
              <span>{t('home.viewAll')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingHouses ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#EFE8D8] shadow-xs overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-24 bg-gray-200 rounded-full" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                      <div className="h-3 w-16 bg-gray-200 rounded-full" />
                      <div className="h-3 w-14 bg-gray-200 rounded-full" />
                      <div className="h-3 w-16 bg-gray-200 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="h-5 w-28 bg-gray-200 rounded-lg" />
                      <div className="h-8 w-24 bg-gray-200 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              houseProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Commercial Shops Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {t('home.shopsTitle')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{t('home.shopsSubtitle')}</p>
          </div>
          <Link
            to="/shops"
            className="text-xs sm:text-sm font-bold text-[#C5A059] hover:text-[#9A7818] flex items-center gap-1"
          >
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingShops ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EFE8D8] shadow-xs overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-24 bg-gray-200 rounded-full" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <div className="h-3 w-16 bg-gray-200 rounded-full" />
                    <div className="h-3 w-14 bg-gray-200 rounded-full" />
                    <div className="h-3 w-16 bg-gray-200 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="h-5 w-28 bg-gray-200 rounded-lg" />
                    <div className="h-8 w-24 bg-gray-200 rounded-xl" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            shopProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))
          )}
        </div>
      </section>

      {/* Home Services Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9A7818] bg-[#FAF4E6] border border-[#E8DFC8] px-3 py-1 rounded-full mb-1">
              <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{lang === 'ta' ? 'சரிபார்க்கப்பட்ட சேவைகள்' : 'Verified Professionals'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {lang === 'ta' ? 'சென்னை வீட்டு சேவைகள்' : 'Chennai Home Services'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {lang === 'ta'
                ? 'மூவர்ஸ், புதுப்பித்தல், ஏசி பழுது, துப்புரவு மற்றும் சட்ட ஆவண சேவைகள் — நேரடி வல்லுநர்கள்'
                : 'Movers & Packers, Renovation, AC Care, Cleaning & Pest Control, Legal Documentation'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/home-services/list"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#D4AF37] to-[#C5A059] shadow-xs hover:brightness-105 transition"
            >
              <span>+ {lang === 'ta' ? 'சேவை சேர்க்க' : 'List Your Service (Free)'}</span>
            </Link>
            <Link
              to="/home-services"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#C5A059] hover:text-[#9A7818] transition"
            >
              <span>{t('home.viewAll')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Link
            to="/home-services?category=MOVERS"
            className="group bg-white rounded-2xl p-4 border border-[#EFE8D8] shadow-xs hover:border-blue-400 hover:shadow-md transition text-center flex flex-col items-center justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-700 transition leading-tight mb-1">
              {lang === 'ta' ? 'மூவர்ஸ் & பேக்கர்ஸ்' : 'Movers & Packers'}
            </h4>
            <p className="text-[11px] text-gray-500">
              {lang === 'ta' ? 'உள்ளூர் & வெளியூர் இடமாற்றம்' : 'Local & Intercity Shifting'}
            </p>
          </Link>

          <Link
            to="/home-services?category=RENOVATION"
            className="group bg-white rounded-2xl p-4 border border-[#EFE8D8] shadow-xs hover:border-orange-400 hover:shadow-md transition text-center flex flex-col items-center justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-orange-700 transition leading-tight mb-1">
              {lang === 'ta' ? 'புதுப்பித்தல் & பழுது' : 'Renovation & Repairs'}
            </h4>
            <p className="text-[11px] text-gray-500">
              {lang === 'ta' ? 'மின்சாரம், பிளம்பிங், பெயிண்டிங்' : 'Painting, Plumbing, Electric'}
            </p>
          </Link>

          <Link
            to="/home-services?category=CLEANING"
            className="group bg-white rounded-2xl p-4 border border-[#EFE8D8] shadow-xs hover:border-green-400 hover:shadow-md transition text-center flex flex-col items-center justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-green-700 transition leading-tight mb-1">
              {lang === 'ta' ? 'துப்புரவு & பூச்சி கட்டுப்பாடு' : 'Cleaning & Pest Control'}
            </h4>
            <p className="text-[11px] text-gray-500">
              {lang === 'ta' ? 'ஆழ்ந்த சுத்தம், கரப்பான், கறையான்' : 'Deep Clean & Pest Treatment'}
            </p>
          </Link>

          <Link
            to="/home-services?category=AC_SERVICE"
            className="group bg-white rounded-2xl p-4 border border-[#EFE8D8] shadow-xs hover:border-cyan-400 hover:shadow-md transition text-center flex flex-col items-center justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
              <Wind className="w-6 h-6" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-cyan-700 transition leading-tight mb-1">
              {lang === 'ta' ? 'AC சேவை & துப்புரவு' : 'AC Service & Cleaning'}
            </h4>
            <p className="text-[11px] text-gray-500">
              {lang === 'ta' ? 'கேஸ் நிரப்புதல், நிறுவுதல்' : 'Gas Refill, Service, Install'}
            </p>
          </Link>

          <Link
            to="/home-services?category=LEGAL"
            className="group bg-white rounded-2xl p-4 border border-[#EFE8D8] shadow-xs hover:border-purple-400 hover:shadow-md transition text-center flex flex-col items-center justify-between col-span-2 sm:col-span-1"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-purple-700 transition leading-tight mb-1">
              {lang === 'ta' ? 'சட்ட ஆவணங்கள்' : 'Legal Documentation'}
            </h4>
            <p className="text-[11px] text-gray-500">
              {lang === 'ta' ? 'வாடகை ஒப்பந்தம், பத்திரம்' : 'Rental Agreements & Deeds'}
            </p>
          </Link>
        </div>
      </section>

      {/* Popular Chennai Areas Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {t('hero.popularLocalities')}
          </h2>
          <p className="text-sm text-gray-600 font-normal">
            {lang === 'ta'
              ? 'சென்னையின் முக்கிய பகுதிகளில் கிடைக்கும் வாடகை வீடுகள் மற்றும் கடைகளை கண்டறியுங்கள்.'
              : "Quickly browse available houses and shops in Chennai's high-demand neighborhoods."}
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {popularLocalities.map((loc) => (
            <Link
              key={loc}
              to={`/properties?locality=${encodeURIComponent(loc)}`}
              className="p-2.5 sm:p-4 bg-white rounded-2xl border border-[#EFE8D8] hover:border-[#C5A059] hover:shadow-md transition text-center group"
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059] mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition" />
              <h4 className="text-[10px] sm:text-sm font-semibold text-gray-800 group-hover:text-[#9A7818] transition leading-tight">
                {loc}
              </h4>
              <span className="hidden sm:block text-[11px] text-gray-500 font-normal">View rentals</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works (White and Lite Gold Theme) */}
      <section className="bg-[#FAF8F4] text-gray-900 py-16 border-y border-[#EFE8D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-block px-3 py-1 bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] rounded-full text-xs font-bold uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900">
              How Veedu Vadagaiku Works
            </h2>
            <p className="text-sm text-gray-600 font-normal">
              We connect tenants directly with verified Chennai landlords without middlemen or hidden commission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-3xl border border-[#EFE8D8] shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center font-bold text-lg mx-auto shadow-xs">
                1
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Browse & Discover Rentals</h3>
              <p className="text-sm text-gray-600 font-normal">
                Explore properties using our card-based discovery view or filter by locality, price bracket, and furnishing.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-[#EFE8D8] shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center font-bold text-lg mx-auto shadow-xs">
                2
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Inspect Verified Details</h3>
              <p className="text-sm text-gray-600 font-normal">
                Check high-res photos, exact address, amenities, security deposit, and house rules.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-[#EFE8D8] shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center font-bold text-lg mx-auto shadow-xs">
                3
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Connect via WhatsApp or Call</h3>
              <p className="text-sm text-gray-600 font-normal">
                Directly dial the owner, message on WhatsApp, or send an enquiry instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Property Owners CTA (NoBroker White & Lite Gold Theme) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#FAF4E6] via-[#F8F1E0] to-[#F4E8D0] rounded-3xl p-8 sm:p-12 text-gray-900 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-[#E5DAC4]">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <span className="inline-block px-3.5 py-1 bg-white border border-[#E8DFC8] text-[#9A7818] rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
              Landlords & Commercial Space Owners
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight text-gray-900">
              Have a House or Shop to Rent Out in Chennai?
            </h2>
            <p className="text-sm sm:text-base text-gray-700 font-normal">
              Get thousands of verified tenant views every month. Manage multiple properties from one single owner dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/owner/properties/add"
              className="px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#D4AF37]/25 text-center transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Post Your Property</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
            <Link
              to="/owner/listing-plans"
              className="px-6 py-3.5 bg-white hover:bg-[#FAF7F0] border border-[#E8DFC8] text-gray-800 font-bold text-sm rounded-2xl text-center transition shadow-xs"
            >
              View Listing Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
