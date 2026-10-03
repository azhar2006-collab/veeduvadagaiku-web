import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building2,
  Store,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Flame,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useProperties, useLocalities } from '../../hooks/useProperties';
import { PropertyCard } from '../../components/property/PropertyCard';
import { PropertyTinderDeck } from '../../components/property/PropertyTinderDeck';
import { SEOHead } from '../../components/common/SEOHead';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'tinder' | 'search'>('tinder');
  const [deckType, setDeckType] = useState<'HOUSE' | 'SHOP' | ''>('');

  const [locality, setLocality] = useState('');
  const [propertyType, setPropertyType] = useState<'HOUSE' | 'SHOP' | ''>('');
  const [maxRent, setMaxRent] = useState('');

  const { data: localitiesRes } = useLocalities();
  const localities = localitiesRes?.data || [];

  // Fetch properties for the Tinder Deck
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

  const { data: housesData, isLoading: loadingHouses } = useProperties({
    propertyType: 'HOUSE',
    limit: 3,
  });

  const { data: shopsData, isLoading: loadingShops } = useProperties({
    propertyType: 'SHOP',
    limit: 3,
  });

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
        description="Chennai’s premier rental marketplace with interactive Tinder-style swipe discovery. Verified houses, apartments and commercial shops direct from owners."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#060D1E] via-[#0B1B3D] to-[#064E3B] text-white pt-8 pb-16 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        {/* Background Decorative patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto space-y-6">
          {/* Top Tagline */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/70 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm animate-fade-in">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>வாடகை-குத்தகை • Direct from Chennai Landlords</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Find Your Match in <span className="text-amber-400 underline decoration-amber-400 decoration-wavy decoration-2">Chennai</span>
            </h1>

            <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-300 font-medium">
              Swipe right to shortlist properties you love, swipe left to pass. Direct owner contacts with zero brokerage.
            </p>
          </div>

          {/* View Mode Switcher (Tinder Swipe vs Search Filter) */}
          <div className="flex items-center justify-center pt-1 pb-2">
            <div className="inline-flex items-center p-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
              <button
                type="button"
                onClick={() => setViewMode('tinder')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
                  viewMode === 'tinder'
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Tinder Swipe Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('search')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
                  viewMode === 'search'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Search & Filter</span>
              </button>
            </div>
          </div>

          {/* MAIN INTERACTIVE AREA */}
          {viewMode === 'tinder' ? (
            /* Tinder Mode Card Stack */
            <div className="pt-2 animate-fade-in">
              {loadingDeck ? (
                <div className="w-full max-w-md mx-auto aspect-[3/4.4] min-h-[510px] bg-white/5 border border-white/10 rounded-3xl animate-pulse flex flex-col items-center justify-center gap-3">
                  <Flame className="w-12 h-12 text-emerald-400 animate-bounce" />
                  <p className="text-xs text-gray-400 font-semibold">Loading Chennai rental deck...</p>
                </div>
              ) : (
                <PropertyTinderDeck
                  properties={deckProperties}
                  selectedType={deckType}
                  onFilterChange={setDeckType}
                />
              )}
            </div>
          ) : (
            /* Classic Search Box Mode */
            <div className="pt-4 max-w-4xl mx-auto animate-fade-in">
              <form
                onSubmit={handleSearch}
                className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl text-gray-900 border border-white/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-center"
              >
                {/* Locality Dropdown */}
                <div className="relative text-left">
                  <label className="block text-[11px] font-extrabold uppercase text-gray-500 tracking-wider mb-1 ml-1">
                    Chennai Locality
                  </label>
                  <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 p-2.5 rounded-xl border border-gray-200 transition">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="">All Chennai Areas</option>
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
                  <label className="block text-[11px] font-extrabold uppercase text-gray-500 tracking-wider mb-1 ml-1">
                    Property Category
                  </label>
                  <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 p-2.5 rounded-xl border border-gray-200 transition">
                    {propertyType === 'SHOP' ? (
                      <Store className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value as any)}
                      className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="">Houses & Shops</option>
                      <option value="HOUSE">House / Flat / Villa</option>
                      <option value="SHOP">Commercial Shop</option>
                    </select>
                  </div>
                </div>

                {/* Max Rent */}
                <div className="relative text-left">
                  <label className="block text-[11px] font-extrabold uppercase text-gray-500 tracking-wider mb-1 ml-1">
                    Budget (Max Rent)
                  </label>
                  <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 p-2.5 rounded-xl border border-gray-200 transition">
                    <span className="text-sm font-bold text-gray-400 pl-1">₹</span>
                    <select
                      value={maxRent}
                      onChange={(e) => setMaxRent(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="">Any Budget</option>
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
                    className="w-full h-[48px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition active:scale-[0.98]"
                  >
                    <Search className="w-4 h-4 text-white" />
                    <span>Search Rentals</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-300 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>100% Verified Owners</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Direct WhatsApp & Call</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Zero Tenant Brokerage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Browse By Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            to="/houses"
            className="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl hover:border-emerald-300 transition-all flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-emerald-600 transition">
                Houses for Rent
              </h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Independent houses, apartments, and villas for families & bachelors in Chennai.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 pt-2">
                <span>Browse Houses</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
            <div className="hidden sm:block text-5xl opacity-80 group-hover:scale-110 transition">
              🏡
            </div>
          </Link>

          <Link
            to="/shops"
            className="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl hover:border-amber-300 transition-all flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-amber-600 transition">
                Commercial Shops for Rent
              </h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Retail showrooms, office spaces, and road-facing shops in prime commercial hubs.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 pt-2">
                <span>Browse Commercial Shops</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
            <div className="hidden sm:block text-5xl opacity-80 group-hover:scale-110 transition">
              🏪
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              Handpicked Deals
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Featured Chennai Rentals
            </h2>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition"
          >
            <span>Explore All Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredData?.data.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* Houses Spotlight */}
      <section className="bg-emerald-50/50 py-12 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Latest Houses & Flats
              </h2>
              <p className="text-sm text-gray-500 mt-1">Comfortable living spaces across Chennai</p>
            </div>
            <Link
              to="/houses"
              className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All Houses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingHouses ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
              ))
            ) : (
              housesData?.data.map((prop) => (
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
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Commercial Shops for Rent
            </h2>
            <p className="text-sm text-gray-500 mt-1">Grow your business in Chennai's prominent retail markets</p>
          </div>
          <Link
            to="/shops"
            className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All Commercial Shops</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingShops ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
            ))
          ) : (
            shopsData?.data.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))
          )}
        </div>
      </section>

      {/* Popular Chennai Areas Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            Popular Chennai Localities
          </h2>
          <p className="text-sm text-gray-500">
            Quickly browse available houses and shops in Chennai's high-demand neighborhoods.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {popularLocalities.map((loc) => (
            <Link
              key={loc}
              to={`/properties?locality=${encodeURIComponent(loc)}`}
              className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-emerald-500 hover:shadow-md transition text-center group"
            >
              <MapPin className="w-5 h-5 text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition" />
              <h4 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition">
                {loc}
              </h4>
              <span className="text-[11px] text-gray-400">View rentals</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-black">
              How Veedu Vadagaiku Works
            </h2>
            <p className="text-sm text-gray-400">
              We connect tenants directly with verified Chennai landlords without middlemen or hidden commission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-gray-800/60 rounded-3xl border border-gray-800 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-emerald-600/30">
                1
              </div>
              <h3 className="text-lg font-bold">Swipe or Search Rentals</h3>
              <p className="text-sm text-gray-400">
                Swipe right on homes or shops you love, or filter by your favorite locality, price bracket, and furnishing.
              </p>
            </div>

            <div className="p-6 bg-gray-800/60 rounded-3xl border border-gray-800 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-emerald-600/30">
                2
              </div>
              <h3 className="text-lg font-bold">Inspect Verified Details</h3>
              <p className="text-sm text-gray-400">
                Check high-res photos, exact address, amenities, security deposit, and house rules.
              </p>
            </div>

            <div className="p-6 bg-gray-800/60 rounded-3xl border border-gray-800 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-emerald-600/30">
                3
              </div>
              <h3 className="text-lg font-bold">Connect via WhatsApp or Call</h3>
              <p className="text-sm text-gray-400">
                Directly dial the owner, message on WhatsApp, or send an enquiry instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Property Owners CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#060D1E] via-[#0B1B3D] to-[#064E3B] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-amber-400/20">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <span className="inline-block px-3.5 py-1 bg-amber-400/20 border border-amber-400/30 text-amber-300 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              Landlords & Commercial Space Owners
            </span>
            <h2 className="text-2xl sm:text-4xl font-black leading-tight">
              Have a House or Shop to Rent Out in Chennai?
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Get thousands of verified tenant views every month. Manage multiple properties from one single owner dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/owner/properties/add"
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm rounded-2xl shadow-xl text-center transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Post Your Property</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>
            <Link
              to="/owner/listing-plans"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-bold text-sm rounded-2xl text-center transition"
            >
              View Listing Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
