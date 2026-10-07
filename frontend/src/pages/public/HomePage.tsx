import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building2,
  Store,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useProperties, useLocalities } from '../../hooks/useProperties';
import { PropertyCard } from '../../components/property/PropertyCard';
import { PropertySwipeDeck } from '../../components/property/PropertySwipeDeck';
import { SEOHead } from '../../components/common/SEOHead';
import { useLanguage } from '../../context/LanguageContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [viewMode, setViewMode] = useState<'swipe' | 'search'>('swipe');
  const [deckType, setDeckType] = useState<'HOUSE' | 'SHOP' | ''>('');

  const [locality, setLocality] = useState('');
  const [propertyType, setPropertyType] = useState<'HOUSE' | 'SHOP' | ''>('');
  const [maxRent, setMaxRent] = useState('');

  const { data: localitiesRes } = useLocalities();
  const localities = localitiesRes?.data || [];

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (locality) params.append('locality', locality);
    if (propertyType) params.append('propertyType', propertyType);
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
    <div className="space-y-16 sm:space-y-24 pb-16">
      <SEOHead
        title="Find Your Next Home or Shop in Chennai | Veedu Vadagaiku"
        description="Chennai's premier rental marketplace. Verified houses, apartments and commercial shops direct from owners. Zero brokerage."
      />

      {/* Hero Section (NoBroker style with White & Lite Gold Theme) */}
      <section className="relative overflow-x-hidden pt-8 pb-16 md:pt-12 md:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FCFAF6] via-white to-[#F8F5EE] border-b border-[#EFE8D8]">
        {/* Subtle decorative gold radial glows */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none opacity-40" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30" style={{ background: 'radial-gradient(circle, rgba(197,160,89,0.12) 0%, transparent 65%)' }} />

        <div className="relative max-w-5xl mx-auto space-y-7 sm:space-y-8">
          {/* Top Tagline */}
          <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] text-[11px] sm:text-xs font-bold tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.15] text-[#1E2329]">
              {t('hero.title1')}{' '}
              <span className="text-[#C5A059]">{t('hero.titleHouse')}</span>{' '}
              {t('hero.titleOr')}{' '}
              <span className="text-[#C5A059]">{t('hero.titleShop')}</span>{' '}
              {t('hero.titleEnd')}
            </h1>

            <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
              {t('hero.desc')}
            </p>
          </div>

          {/* NoBroker-style Tab Switcher */}
          <div className="flex items-center justify-center">
            <div
              className="inline-flex items-center p-1 rounded-2xl bg-[#FAF7F0] border border-[#E8DFC8] shadow-xs"
              role="tablist"
              aria-label="Browse mode"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'search' && propertyType !== 'SHOP'}
                onClick={() => {
                  setViewMode('search');
                  setPropertyType('');
                }}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  viewMode === 'search' && propertyType === ''
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{lang === 'ta' ? 'அனைத்து வாடகை' : 'All Rentals'}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'search' && propertyType === 'HOUSE'}
                onClick={() => {
                  setViewMode('search');
                  setPropertyType('HOUSE');
                }}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  viewMode === 'search' && propertyType === 'HOUSE'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{t('card.house')}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'search' && propertyType === 'SHOP'}
                onClick={() => {
                  setViewMode('search');
                  setPropertyType('SHOP');
                }}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  viewMode === 'search' && propertyType === 'SHOP'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{t('card.shop')}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'swipe'}
                onClick={() => setViewMode('swipe')}
                className={`hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
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
            <div className="pt-2 max-w-4xl mx-auto animate-fade-in">
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
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="">{t('hero.selectLocality')}</option>
                      {localities.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Property Type Dropdown */}
                <div className="relative text-left">
                  <label className="block text-[11px] font-bold uppercase text-gray-600 tracking-wider mb-1 ml-1">
                    {t('filter.propertyType')}
                  </label>
                  <div className="flex items-center gap-2 bg-[#FCFAF5] hover:bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E8DFC8] transition">
                    {propertyType === 'SHOP' ? (
                      <Store className="w-4 h-4 text-[#C5A059] shrink-0" />
                    ) : (
                      <Building2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                    )}
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value as any)}
                      className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="">{t('hero.allTypes')}</option>
                      <option value="HOUSE">{t('card.house')}</option>
                      <option value="SHOP">{t('card.shop')}</option>
                    </select>
                  </div>
                </div>

                {/* Max Rent */}
                <div className="relative text-left">
                  <label className="block text-[11px] font-bold uppercase text-gray-600 tracking-wider mb-1 ml-1">
                    {t('hero.maxBudget')}
                  </label>
                  <div className="flex items-center gap-2 bg-[#FCFAF5] hover:bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E8DFC8] transition">
                    <span className="text-sm font-bold text-[#C5A059] pl-1">₹</span>
                    <select
                      value={maxRent}
                      onChange={(e) => setMaxRent(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="">{lang === 'ta' ? 'அனைத்து பட்ஜெட்' : 'Any Budget'}</option>
                      <option value="10000">Up to ₹10,000</option>
                      <option value="15000">Up to ₹15,000</option>
                      <option value="25000">Up to ₹25,000</option>
                      <option value="50000">Up to ₹50,000</option>
                      <option value="100000">Up to ₹1,00,000</option>
                    </select>
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
          <div className="pt-2 sm:pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#EFE8D8] shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900">{t('hero.zeroBrokerage')}</p>
                <p className="text-[11px] text-gray-500">{t('hero.zeroBrokerageDesc')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#EFE8D8] shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900">{t('hero.verifiedListings')}</p>
                <p className="text-[11px] text-gray-500">{t('hero.verifiedListingsDesc')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#EFE8D8] shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900">{t('hero.instantConnect')}</p>
                <p className="text-[11px] text-gray-500">{t('hero.instantConnectDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse By Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            to="/houses"
            className="group bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE8D8] shadow-md hover:shadow-xl hover:border-[#C5A059] transition-all flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6 text-[#C5A059]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#B08B40] transition">
                {t('nav.houses')}
              </h3>
              <p className="text-sm text-gray-600 max-w-xs">
                {lang === 'ta'
                  ? 'குடும்பங்கள் மற்றும் பேச்சிலர்களுக்கான தனி வீடுகள், அபார்ட்மெண்ட்கள் மற்றும் வில்லாக்கள்.'
                  : 'Independent houses, apartments, and villas for families & bachelors in Chennai.'}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C5A059] group-hover:text-[#9A7818] pt-2">
                <span>{t('home.viewAll')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-[#FCFAF5] text-[#C5A059] border border-[#E8DFC8] items-center justify-center group-hover:scale-105 group-hover:bg-[#FAF4E6] transition">
              <Building2 className="w-8 h-8" />
            </div>
          </Link>

          <Link
            to="/shops"
            className="group bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE8D8] shadow-md hover:shadow-xl hover:border-[#C5A059] transition-all flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center font-bold">
                <Store className="w-6 h-6 text-[#C5A059]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#B08B40] transition">
                {t('nav.shops')}
              </h3>
              <p className="text-sm text-gray-600 max-w-xs">
                {lang === 'ta'
                  ? 'அதிக மக்கள் நடமாட்டம் உள்ள மெயின் ரோடு வணிக கடைகள், ஷோரூம்கள் மற்றும் அலுவலக இடங்கள்.'
                  : 'Retail showrooms, office spaces, and road-facing shops in prime commercial hubs.'}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C5A059] group-hover:text-[#9A7818] pt-2">
                <span>{t('home.viewAll')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-[#FCFAF5] text-[#C5A059] border border-[#E8DFC8] items-center justify-center group-hover:scale-105 group-hover:bg-[#FAF4E6] transition">
              <Store className="w-8 h-8" />
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
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
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

      {/* Popular Chennai Areas Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {t('hero.popularLocalities')}
          </h2>
          <p className="text-sm text-gray-600 font-normal">
            {lang === 'ta'
              ? 'சென்னையின் முக்கிய பகுதிகளில் கிடைக்கும் வாடகை வீடுகள் மற்றும் கடைகளை கண்டறியுங்கள்.'
              : "Quickly browse available houses and shops in Chennai's high-demand neighborhoods."}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {popularLocalities.map((loc) => (
            <Link
              key={loc}
              to={`/properties?locality=${encodeURIComponent(loc)}`}
              className="p-4 bg-white rounded-2xl border border-[#EFE8D8] hover:border-[#C5A059] hover:shadow-md transition text-center group"
            >
              <MapPin className="w-5 h-5 text-[#C5A059] mx-auto mb-2 group-hover:scale-110 transition" />
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#9A7818] transition">
                {loc}
              </h4>
              <span className="text-[11px] text-gray-500 font-normal">View rentals</span>
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
