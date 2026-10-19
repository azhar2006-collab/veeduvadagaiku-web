import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Layers,
  Car,
  Home,
  Maximize2,
  Briefcase,
  Utensils,
  Gift,
  LayoutGrid,
  X,
  IndianRupee,
  SlidersHorizontal,
} from 'lucide-react';
import { useProperties, useLocalities } from '../../hooks/useProperties';
import { PropertyCard } from '../../components/property/PropertyCard';
import { SEOHead } from '../../components/common/SEOHead';
import { useLanguage } from '../../context/LanguageContext';
import {
  COMMERCIAL_SUBTYPES,
  HOSTEL_GENDERS,
  MARRIAGE_HALL_CAPACITIES,
  MARRIAGE_HALL_DINING,
  MARRIAGE_HALL_AC_TYPES,
  FURNISHING_OPTIONS,
  getPropertyCategory,
} from '../../utils/categoryUtils';
import { CHENNAI_LOCALITIES } from '../../utils/chennaiLocalities';
import { NavaratriPromotionalPopup } from '../../components/common/NavaratriPromotionalPopup';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<'HOUSE' | 'APARTMENT' | 'SHOP' | 'COMMERCIAL_BUILDING' | 'HOSTEL' | 'MARRIAGE_HALL' | ''>('');

  const [locality, setLocality] = useState('');
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);
  const localityRef = useRef<HTMLDivElement>(null);

  const [maxRent, setMaxRent] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [selectedParking, setSelectedParking] = useState<string>('');
  const [selectedSizeRange, setSelectedSizeRange] = useState<string>('');
  const [minSize, setMinSize] = useState<string>('');
  const [maxSize, setMaxSize] = useState<string>('');

  // Budget interactive picker popover state
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const budgetRef = useRef<HTMLDivElement>(null);
  const [rentalTab, setRentalTab] = useState<'RESIDENTIAL' | 'COMMERCIAL' | 'HOSTEL' | 'MARRIAGE_HALL'>('RESIDENTIAL');
  const [selectedBhks, setSelectedBhks] = useState<string[]>([]);
  const [residentialType, setResidentialType] = useState<'ALL' | 'HOUSE' | 'APARTMENT'>('ALL');
  const [selectedCommercialTypes, setSelectedCommercialTypes] = useState<string[]>([]);
  const [hostelGender, setHostelGender] = useState<'MALE' | 'FEMALE' | 'COLIVING' | ''>('');
  const [hostelSharing, setHostelSharing] = useState<string>('');
  const [hostelTotalMembers, setHostelTotalMembers] = useState<string>('');
  const [hallCapacity, setHallCapacity] = useState<'UP_TO_250' | '250_TO_500' | '500_TO_1000' | '1000_PLUS' | ''>('');
  const [hallDining, setHallDining] = useState<string>('');
  const [hallAc, setHallAc] = useState<'AC' | 'NON_AC' | ''>('');

  // Featured properties filter tab
  const [featuredFilterTab, setFeaturedFilterTab] = useState<'ALL' | 'HOUSE' | 'SHOP' | 'HOSTEL'>('ALL');

  // Close budget & locality popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (budgetRef.current && !budgetRef.current.contains(event.target as Node)) {
        setIsBudgetOpen(false);
      }
      if (localityRef.current && !localityRef.current.contains(event.target as Node)) {
        setShowLocalityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { data: localitiesRes } = useLocalities();
  const localities = useMemo((): string[] => {
    if (Array.isArray(localitiesRes) && localitiesRes.length > 0) return localitiesRes;
    if (Array.isArray((localitiesRes as any)?.data)) return (localitiesRes as any).data;
    return CHENNAI_LOCALITIES;
  }, [localitiesRes]);

  const popularLocalities = useMemo(() => [
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
  ], []);

  const filteredLocalities = useMemo(() => {
    if (!locality || !locality.trim()) return popularLocalities;
    const q = locality.toLowerCase().trim();
    return localities.filter((loc) => loc.toLowerCase().includes(q));
  }, [locality, localities, popularLocalities]);

  // Fetch featured and latest properties for below sections
  const { data: featuredData, isLoading: loadingFeatured } = useProperties({
    limit: 6,
    sortBy: 'newest',
  });
  const featuredProperties = Array.isArray(featuredData?.data) ? featuredData.data : [];

  const filteredFeatured = useMemo(() => {
    if (featuredFilterTab === 'ALL') return featuredProperties;
    return featuredProperties.filter((p) => {
      const cat = getPropertyCategory(p);
      if (featuredFilterTab === 'HOUSE') return cat === 'HOUSE' || cat === 'APARTMENT' || p.propertyType === 'HOUSE';
      if (featuredFilterTab === 'SHOP') return cat === 'SHOP' || cat === 'COMMERCIAL_BUILDING' || p.propertyType === 'SHOP';
      if (featuredFilterTab === 'HOSTEL') return cat === 'HOSTEL';
      return true;
    });
  }, [featuredProperties, featuredFilterTab]);

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

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (locality) count++;
    if (selectedCategory) count++;
    if (maxRent) count++;
    if (selectedBhks.length > 0) count += selectedBhks.length;
    if (selectedFloor) count++;
    if (selectedParking) count++;
    if (minSize || maxSize) count++;
    if (selectedCommercialTypes.length > 0) count += selectedCommercialTypes.length;
    if (hostelGender) count++;
    if (hostelSharing) count++;
    if (hallCapacity) count++;
    if (hallDining) count++;
    if (hallAc) count++;
    return count;
  }, [locality, selectedCategory, maxRent, selectedBhks, selectedFloor, selectedParking, minSize, maxSize, selectedCommercialTypes, hostelGender, hostelSharing, hallCapacity, hallDining, hallAc]);

  const clearAllFilters = () => {
    setLocality('');
    setSelectedCategory('');
    setMaxRent('');
    setSelectedBhks([]);
    setSelectedFloor('');
    setSelectedParking('');
    setMinSize('');
    setMaxSize('');
    setSelectedSizeRange('');
    setSelectedCommercialTypes([]);
    setHostelGender('');
    setHostelSharing('');
    setHallCapacity('');
    setHallDining('');
    setHallAc('');
  };

  const handleSearch = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const params = new URLSearchParams();
    if (locality) params.append('locality', locality);

    if (selectedCategory === 'HOUSE' || (rentalTab === 'RESIDENTIAL' && selectedCategory !== 'COMMERCIAL_BUILDING' && selectedCategory !== 'SHOP')) {
      if (residentialType === 'APARTMENT') {
        params.append('category', 'APARTMENT');
      } else if (residentialType === 'HOUSE' || selectedCategory === 'HOUSE') {
        params.append('category', 'HOUSE');
        params.append('propertyType', 'HOUSE');
      } else {
        params.append('propertyType', 'HOUSE');
      }
      if (selectedBhks.length > 0) {
        params.append('bedrooms', selectedBhks.join(','));
      }
      if (selectedFloor) {
        params.append('floor', selectedFloor);
      }
      if (selectedParking) {
        params.append('carParking', selectedParking);
      }
    } else if (selectedCategory === 'COMMERCIAL_BUILDING') {
      params.append('propertyType', 'SHOP');
      params.append('category', 'COMMERCIAL_BUILDING');
      if (selectedCommercialTypes.length > 0) {
        params.append('commercialType', selectedCommercialTypes.join(','));
      } else {
        params.append('commercialType', 'Industrial Building,Office Space,Commercial Building');
      }
      if (minSize) params.append('minSize', minSize);
      if (maxSize) params.append('maxSize', maxSize);
      if (selectedFloor) params.append('floor', selectedFloor);
      if (selectedParking) params.append('carParking', selectedParking);
    } else if (selectedCategory === 'SHOP' || rentalTab === 'COMMERCIAL') {
      params.append('propertyType', 'SHOP');
      params.append('category', 'SHOP');
      if (selectedCommercialTypes.length > 0) {
        params.append('commercialType', selectedCommercialTypes.join(','));
      }
      if (minSize) params.append('minSize', minSize);
      if (maxSize) params.append('maxSize', maxSize);
      if (selectedFloor) params.append('floor', selectedFloor);
      if (selectedParking) params.append('carParking', selectedParking);
    } else if (selectedCategory === 'HOSTEL' || rentalTab === 'HOSTEL') {
      params.append('category', 'HOSTEL');
      if (hostelGender) params.append('hostelGender', hostelGender);
      if (hostelSharing) params.append('hostelSharing', hostelSharing);
      if (hostelTotalMembers) params.append('hostelTotalMembers', hostelTotalMembers);
      if (minSize) params.append('minSize', minSize);
      if (maxSize) params.append('maxSize', maxSize);
    } else if (selectedCategory === 'MARRIAGE_HALL' || rentalTab === 'MARRIAGE_HALL') {
      params.append('category', 'MARRIAGE_HALL');
      params.append('propertyType', 'SHOP');
      if (hallCapacity) params.append('hallCapacity', hallCapacity);
      if (hallDining) params.append('hallDining', hallDining);
      if (hallAc) params.append('hallAc', hallAc);
      if (minSize) params.append('minSize', minSize);
      if (maxSize) params.append('maxSize', maxSize);
      if (selectedParking) params.append('carParking', selectedParking);
    }

    if (maxRent) params.append('maxRent', maxRent);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="space-y-6 sm:space-y-16 pb-12">
      <SEOHead
        title="Chennai's Exclusive One-Stop Property Rental Webapp | veeduvadagaikkuchennai"
        description="veeduvadagaikkuchennai - Chennai's exclusive one-stop property rental webapp. Verified houses, apartments, shops, hostels & marriage halls direct from owners."
      />

      {/* ===== PREMIUM HERO SECTION ===== */}
      <section className="relative overflow-hidden pt-6 pb-6 sm:pb-10 md:pt-10 md:pb-16 px-4 sm:px-6 lg:px-8 animate-gradient-shift border-b border-[#EFE8D8]"
        style={{ background: 'linear-gradient(135deg, #FDFBF7 0%, #FAF4E6 25%, #FFFFFF 50%, #F8F5EE 75%, #FDFBF7 100%)' }}>

        {/* Floating gold particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-[10%] left-[8%] w-2 h-2 rounded-full bg-[#D4AF37]/30 animate-float-slow" />
          <div className="absolute top-[20%] right-[12%] w-3 h-3 rounded-full bg-[#C5A059]/20 animate-float-medium" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[60%] left-[15%] w-1.5 h-1.5 rounded-full bg-[#D4AF37]/25 animate-float-fast" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[40%] right-[20%] w-2.5 h-2.5 rounded-full bg-[#C5A059]/20 animate-float-slow" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-[20%] left-[30%] w-2 h-2 rounded-full bg-[#D4AF37]/15 animate-float-medium" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-[30%] left-[60%] w-1 h-1 rounded-full bg-[#B08B40]/30 animate-float-fast" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-[35%] right-[35%] w-2 h-2 rounded-full bg-[#D4AF37]/20 animate-float-slow" style={{ animationDelay: '4s' }} />
          {/* Decorative gold radial glows */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, rgba(197,160,89,0.15) 0%, transparent 65%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 50%)' }} />
        </div>

        <div className="relative max-w-5xl mx-auto space-y-5 sm:space-y-7">
          {/* Top Badge with shimmer */}
          <div className="text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8DFC8] text-[#9A7818] text-[10px] sm:text-xs font-bold tracking-wide shadow-lg shadow-[#D4AF37]/5 relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer rounded-full" />
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A059] animate-spin-slow relative z-10" />
              <span className="relative z-10">{t('hero.badge')}</span>
            </div>
          </div>

          {/* Hero Title with gradient text */}
          <div className="text-center space-y-3 max-w-3xl mx-auto px-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h1 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-snug sm:leading-tight text-[#1E2329]">
              {t('hero.title1')}{' '}
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B40] bg-clip-text text-transparent">
                {t('hero.titleHouse')}
              </span>
            </h1>

            <p className="max-w-xl mx-auto text-xs sm:text-sm text-gray-600 font-medium leading-relaxed animate-slide-up" style={{ animationDelay: '200ms' }}>
              {t('hero.desc')}
            </p>
            <p className="max-w-xl mx-auto text-[11px] sm:text-xs font-semibold leading-relaxed animate-slide-up" style={{ animationDelay: '250ms' }}>
              <span className="bg-gradient-to-r from-[#9A7818] to-[#C5A059] bg-clip-text text-transparent">
                {t('hero.descSub')}
              </span>
            </p>
          </div>

          {/* Interactive Category Tabs */}
          <div className="w-full flex items-center justify-start min-[920px]:justify-center overflow-x-auto no-scrollbar py-2 px-2 sm:px-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* All Rentals Tab */}
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`relative text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap px-3.5 py-2.5 rounded-2xl cursor-pointer border ${
                  selectedCategory === ''
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-lg shadow-[#D4AF37]/25 scale-[1.03]'
                    : 'bg-white/80 hover:bg-[#FAF4E6] text-gray-700 border-[#E8DFC8] hover:border-[#D8BC76]'
                }`}
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
                  selectedCategory === '' ? 'bg-white/20 text-white' : 'bg-[#FAF4E6] text-[#C5A059]'
                }`}>
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span>{lang === 'ta' ? 'அனைத்தும்' : 'All Rentals'}</span>
              </button>

              {/* Houses Tab */}
              <button
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === 'HOUSE' ? '' : 'HOUSE')}
                className={`relative text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap px-3.5 py-2.5 rounded-2xl cursor-pointer border ${
                  selectedCategory === 'HOUSE'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-lg shadow-[#D4AF37]/25 scale-[1.03]'
                    : 'bg-white/80 hover:bg-[#FAF4E6] text-gray-700 border-[#E8DFC8] hover:border-[#D8BC76]'
                }`}
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
                  selectedCategory === 'HOUSE' ? 'bg-white/20 text-white' : 'bg-[#FAF4E6] text-[#C5A059]'
                }`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <span>{t('nav.houses')}</span>
              </button>

              {/* Commercial Shops Tab */}
              <button
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === 'SHOP' ? '' : 'SHOP')}
                className={`relative text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap px-3.5 py-2.5 rounded-2xl cursor-pointer border ${
                  selectedCategory === 'SHOP'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-lg shadow-[#D4AF37]/25 scale-[1.03]'
                    : 'bg-white/80 hover:bg-[#FAF4E6] text-gray-700 border-[#E8DFC8] hover:border-[#D8BC76]'
                }`}
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
                  selectedCategory === 'SHOP' ? 'bg-white/20 text-white' : 'bg-[#FAF4E6] text-[#C5A059]'
                }`}>
                  <Store className="w-4 h-4" />
                </div>
                <span>{t('nav.shops')}</span>
              </button>

              {/* Hostels & PG Tab */}
              <button
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === 'HOSTEL' ? '' : 'HOSTEL')}
                className={`relative text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shrink-0 text-left px-3.5 py-2.5 rounded-2xl cursor-pointer border ${
                  selectedCategory === 'HOSTEL'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-lg shadow-[#D4AF37]/25 scale-[1.03]'
                    : 'bg-white/80 hover:bg-[#FAF4E6] text-gray-700 border-[#E8DFC8] hover:border-[#D8BC76]'
                }`}
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
                  selectedCategory === 'HOSTEL' ? 'bg-white/20 text-white' : 'bg-[#FAF4E6] text-[#C5A059]'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="whitespace-nowrap">{lang === 'ta' ? 'விடுதிகள் & PG' : 'Hostels & PG'}</span>
                  <span className={`text-[10px] font-semibold whitespace-nowrap ${
                    selectedCategory === 'HOSTEL' ? 'text-white/80' : 'text-gray-400'
                  }`}>
                    Accommodation
                  </span>
                </div>
              </button>

              {/* Marriage Halls Tab */}
              <button
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === 'MARRIAGE_HALL' ? '' : 'MARRIAGE_HALL')}
                className={`relative text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap px-3.5 py-2.5 rounded-2xl cursor-pointer border ${
                  selectedCategory === 'MARRIAGE_HALL'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-lg shadow-[#D4AF37]/25 scale-[1.03]'
                    : 'bg-white/80 hover:bg-[#FAF4E6] text-gray-700 border-[#E8DFC8] hover:border-[#D8BC76]'
                }`}
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
                  selectedCategory === 'MARRIAGE_HALL' ? 'bg-white/20 text-white' : 'bg-[#FAF4E6] text-[#C5A059]'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>{t('nav.marriageHalls')}</span>
              </button>

              {/* Home Services Link */}
              <Link
                to="/home-services"
                className="relative text-xs sm:text-sm font-bold text-gray-800 hover:text-[#B08B40] transition-all duration-300 flex items-center gap-1.5 sm:gap-2 group shrink-0 whitespace-nowrap px-3.5 py-2.5 rounded-2xl bg-white/80 hover:bg-[#FAF4E6] border border-[#E8DFC8] hover:border-[#D8BC76] shadow-xs"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#FAF4E6] to-[#F3E8CE] border border-[#E8DFC8] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wrench className="w-4 h-4 text-[#C5A059] group-hover:text-[#9A7818]" />
                </div>
                <span>{t('nav.homeServices')}</span>
              </Link>

              {/* Offers Link */}
              <Link
                to="/offers"
                className="relative text-xs sm:text-sm font-bold text-[#9A7818] hover:text-[#B08B40] transition-all duration-300 flex items-center gap-1.5 sm:gap-2 group shrink-0 whitespace-nowrap px-3.5 py-2.5 rounded-2xl bg-white/80 hover:bg-[#FAF4E6] border border-[#E8DFC8] hover:border-[#D8BC76] shadow-xs"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#FAF4E6] to-[#F3E8CE] border border-[#E8DFC8] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Gift className="w-4 h-4 text-[#D4AF37] group-hover:text-[#9A7818]" />
                </div>
                <span>{lang === 'ta' ? 'சலுகைகள்' : 'Offers'}</span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-red-500 text-white text-[9px] font-black rounded-full uppercase tracking-wider animate-pulse shadow-md shadow-red-500/20">
                  Free
                </span>
              </Link>
            </div>
          </div>

          {/* ===== CENTRAL INTERACTIVE SEARCH HUB CARD ===== */}
          <div className="w-full max-w-4xl mx-auto px-2 sm:px-0 animate-slide-up" style={{ animationDelay: '350ms' }}>
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-[#E8DFC8] shadow-2xl shadow-[#D4AF37]/15 space-y-3 sm:space-y-4 relative">
              {/* Main search inputs row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
                {/* Locality input with autocomplete dropdown */}
                <div className="relative sm:col-span-6" ref={localityRef}>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3.5 w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059] shrink-0 pointer-events-none" />
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => {
                        setLocality(e.target.value);
                        setShowLocalityDropdown(true);
                      }}
                      onFocus={() => setShowLocalityDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setShowLocalityDropdown(false);
                          handleSearch(e);
                        }
                      }}
                      placeholder={lang === 'ta' ? 'சென்னையில் பகுதி அல்லது ஏரியா (எ.கா: வேளச்சேரி, அண்ணா நகர்)...' : 'Search locality, area, landmark in Chennai (e.g. Velachery, T. Nagar)...'}
                      className="w-full pl-10 sm:pl-11 pr-8 py-3 sm:py-3.5 bg-gray-50/90 hover:bg-gray-50 focus:bg-white rounded-xl sm:rounded-2xl border border-[#E8DFC8] text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059] transition shadow-inner"
                    />
                    {locality && (
                      <button
                        type="button"
                        onClick={() => setLocality('')}
                        className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition"
                        aria-label="Clear locality"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete suggestions dropdown */}
                  {showLocalityDropdown && filteredLocalities.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xl max-h-56 overflow-y-auto no-scrollbar py-1">
                      {filteredLocalities.slice(0, 8).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onMouseDown={() => {
                            setLocality(loc);
                            setShowLocalityDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-[#FAF4E6] hover:text-[#9A7818] flex items-center justify-between transition font-medium cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>{loc}</span>
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">Chennai</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Budget popover / dropdown */}
                <div className="relative sm:col-span-3" ref={budgetRef}>
                  <button
                    type="button"
                    onClick={() => setIsBudgetOpen(!isBudgetOpen)}
                    className="w-full h-full px-3 sm:px-4 py-3 sm:py-3.5 bg-gray-50/90 hover:bg-[#FAF4E6] rounded-xl sm:rounded-2xl border border-[#E8DFC8] text-xs sm:text-sm font-semibold text-gray-800 flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <IndianRupee className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span className="truncate">
                        {maxRent ? `Up to ₹${Number(maxRent).toLocaleString('en-IN')}` : (lang === 'ta' ? 'அனைத்து வாடகை' : 'Any Budget')}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isBudgetOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isBudgetOpen && (
                    <div className="absolute z-50 left-0 right-0 sm:right-auto sm:w-64 mt-1 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xl p-3 space-y-2">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-1">
                        {lang === 'ta' ? 'மாத வாடகை வரம்பு' : 'Monthly Budget'}
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {[
                          { val: '', label: lang === 'ta' ? 'அனைத்து வாடகை (All)' : 'Any Budget' },
                          { val: '10000', label: '< ₹10,000 / mo' },
                          { val: '20000', label: 'Up to ₹20,000 / mo' },
                          { val: '35000', label: 'Up to ₹35,000 / mo' },
                          { val: '50000', label: 'Up to ₹50,000 / mo' },
                          { val: '100000', label: 'Up to ₹1,00,000 / mo' },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => {
                              setMaxRent(item.val);
                              setIsBudgetOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs font-bold rounded-xl transition flex items-center justify-between cursor-pointer ${
                              maxRent === item.val
                                ? 'bg-[#FAF4E6] text-[#9A7818] border border-[#D8BC76]'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>{item.label}</span>
                            {maxRent === item.val && <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="w-full h-full py-3 sm:py-3.5 px-5 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-[#D4AF37]/25 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{t('hero.searchBtn')}</span>
                  </button>
                </div>
              </div>

              {/* Quick Popular Locality Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                <span className="text-[11px] font-bold text-gray-500 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#C5A059]" />
                  {t('hero.popular')}:
                </span>
                {popularLocalities.map((loc) => {
                  const isSelected = locality.toLowerCase() === loc.toLowerCase();
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setLocality('');
                        } else {
                          setLocality(loc);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 border cursor-pointer ${
                        isSelected
                          ? 'bg-[#C5A059] text-white border-[#C5A059] shadow-xs'
                          : 'bg-[#FAF8F2] hover:bg-[#FAF4E6] text-[#7A5C10] border-[#E8DFC8] hover:border-[#C5A059]'
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>

              {/* Active Filter Clear Bar if any filter applied */}
              {activeFilterCount > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1 text-[#9A7818] font-bold">
                    <span className="w-4 h-4 rounded-full bg-[#C5A059] text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                    <span>{lang === 'ta' ? 'வடிகட்டிகள் பயன்படுத்தப்பட்டுள்ளன' : 'filters active'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    {lang === 'ta' ? 'அனைத்தையும் அழிக்க' : 'Clear All Filters'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* House Sub-filters: All BHKs, Floor, Car Parking, All */}
          {selectedCategory === 'HOUSE' && (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 animate-bounce-in">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-[#E8DFC8] shadow-xl shadow-[#D4AF37]/8 space-y-3">
                {/* 1. BHK Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'அறைகள் (BHK)' : 'Bedrooms'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்து BHK (All)' : 'All BHKs' },
                      { id: '1RK', label: '1 RK' },
                      { id: '1', label: '1 BHK' },
                      { id: '2', label: '2 BHK' },
                      { id: '3', label: '3 BHK' },
                      { id: '4+', label: '4+ BHK' },
                    ].map((item) => {
                      const isSelected = item.id === '' ? selectedBhks.length === 0 : selectedBhks.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (item.id === '') {
                              setSelectedBhks([]);
                            } else {
                              setSelectedBhks((prev) =>
                                prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id]
                              );
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Floor Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'தளம் (Floor)' : 'Floor'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்து தளம் (All)' : 'All Floors' },
                      { id: 'ground', label: lang === 'ta' ? 'தரை தளம் (Ground)' : 'Ground Floor' },
                      { id: '1-3', label: lang === 'ta' ? '1 – 3 வது தளம்' : '1st – 3rd Floor' },
                      { id: '4+', label: lang === 'ta' ? '4+ வது தளம்' : '4th+ Floor' },
                    ].map((item) => {
                      const isSelected = selectedFloor === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedFloor(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Car Parking Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Car className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'கார் பார்க்கிங்' : 'Car Parking'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்தும் (All)' : 'All Parking' },
                      { id: 'car', label: lang === 'ta' ? '🚗 கார் பார்க்கிங்' : '🚗 Car Parking' },
                      { id: 'bike', label: lang === 'ta' ? '🛵 பைக் பார்க்கிங்' : '🛵 Bike Parking' },
                    ].map((item) => {
                      const isSelected = selectedParking === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedParking(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shop Sub-filters: Area (Sq Ft), Floor, Shop Type, Parking */}
          {selectedCategory === 'SHOP' && (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 animate-bounce-in">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-[#E8DFC8] shadow-xl shadow-[#D4AF37]/8 space-y-3">
                {/* 1. Size / Area Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Maximize2 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'பரப்பளவு' : 'Area (Sq Ft)'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்து அளவுகளும்' : 'All Sq Ft', min: '', max: '' },
                      { id: '<300', label: lang === 'ta' ? '< 300 ச.அடி' : '< 300 sq ft', min: '', max: '300' },
                      { id: '300-600', label: lang === 'ta' ? '300 – 600 ச.அடி' : '300 – 600 sq ft', min: '300', max: '600' },
                      { id: '600-1200', label: lang === 'ta' ? '600 – 1,200 ச.அடி' : '600 – 1,200 sq ft', min: '600', max: '1200' },
                      { id: '1200+', label: lang === 'ta' ? '1,200+ ச.அடி' : '1,200+ sq ft', min: '1200', max: '' },
                    ].map((item) => {
                      const isSelected = selectedSizeRange === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSizeRange('');
                              setMinSize('');
                              setMaxSize('');
                            } else {
                              setSelectedSizeRange(item.id);
                              setMinSize(item.min);
                              setMaxSize(item.max);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Floor Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'தளம் (Floor)' : 'Floor'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்து தளம் (All)' : 'All Floors' },
                      { id: 'ground', label: lang === 'ta' ? 'தரை தளம் (Ground)' : 'Ground Floor' },
                      { id: '1-3', label: lang === 'ta' ? '1 – 2 வது தளம்' : '1st – 2nd Floor' },
                      { id: '4+', label: lang === 'ta' ? 'மேல் தளம் / பிற' : 'Upper / Other' },
                    ].map((item) => {
                      const isSelected = selectedFloor === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedFloor(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Shop Type */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Store className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'கடை வகை' : 'Shop Type'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்து வகை (All)' : 'All Shop Types' },
                      { id: 'Shop', label: lang === 'ta' ? 'சில்லறை கடை (Retail)' : 'Retail Shop' },
                      { id: 'Showroom', label: lang === 'ta' ? 'காட்சியகம் (Showroom)' : 'Showroom' },
                      { id: 'Godown/Warehouse', label: lang === 'ta' ? 'கிடங்கு (Godown)' : 'Godown / Storage' },
                      { id: 'Office Space', label: lang === 'ta' ? 'வணிக இடம்' : 'Commercial Space' },
                    ].map((item) => {
                      const isSelected = item.id === '' ? selectedCommercialTypes.length === 0 : selectedCommercialTypes.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (item.id === '') {
                              setSelectedCommercialTypes([]);
                            } else {
                              setSelectedCommercialTypes((prev) =>
                                prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id]
                              );
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Parking Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Car className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'பார்க்கிங்' : 'Parking'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்தும் (All)' : 'All Parking' },
                      { id: 'car', label: lang === 'ta' ? '🚗 வாடிக்கையாளர் பார்க்கிங்' : '🚗 Car / Customer Parking' },
                      { id: 'bike', label: lang === 'ta' ? '🛵 பைக் பார்க்கிங்' : '🛵 Bike Parking' },
                    ].map((item) => {
                      const isSelected = selectedParking === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedParking(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commercial Building Sub-filters: Area (Sq Ft), Building Type, Floor, Parking */}
          {selectedCategory === 'COMMERCIAL_BUILDING' && (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 animate-bounce-in">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-[#E8DFC8] shadow-xl shadow-[#D4AF37]/8 space-y-3">
                {/* 1. Size / Area Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Maximize2 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'பரப்பளவு' : 'Building Area'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்து அளவுகளும்' : 'All Sq Ft', min: '', max: '' },
                      { id: '<1000', label: lang === 'ta' ? '< 1,000 ச.அடி' : '< 1,000 sq ft', min: '', max: '1000' },
                      { id: '1000-3000', label: lang === 'ta' ? '1,000 – 3,000 ச.அடி' : '1,000 – 3,000 sq ft', min: '1000', max: '3000' },
                      { id: '3000-5000', label: lang === 'ta' ? '3,000 – 5,000 ச.அடி' : '3,000 – 5,000 sq ft', min: '3000', max: '5000' },
                      { id: '5000-10000', label: lang === 'ta' ? '5,000 – 10,000 ச.அடி' : '5,000 – 10,000 sq ft', min: '5000', max: '10000' },
                      { id: '10000+', label: lang === 'ta' ? '10,000+ ச.அடி' : '10,000+ sq ft', min: '10000', max: '' },
                    ].map((item) => {
                      const isSelected = selectedSizeRange === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSizeRange('');
                              setMinSize('');
                              setMaxSize('');
                            } else {
                              setSelectedSizeRange(item.id);
                              setMinSize(item.min);
                              setMaxSize(item.max);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Building Type */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Building className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'கட்டிட வகை' : 'Building Type'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்து வகை' : 'All Types' },
                      { id: 'Industrial Building', label: lang === 'ta' ? 'தொழிற்சாலை' : 'Industrial Building' },
                      { id: 'Office Space', label: lang === 'ta' ? 'அலுவலக இடம்' : 'Office Space' },
                      { id: 'Commercial Building', label: lang === 'ta' ? 'வணிக கட்டிடம்' : 'Commercial Building' },
                    ].map((item) => {
                      const isSelected = item.id === '' ? selectedCommercialTypes.length === 0 : selectedCommercialTypes.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (item.id === '') {
                              setSelectedCommercialTypes([]);
                            } else {
                              setSelectedCommercialTypes((prev) =>
                                prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id]
                              );
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Floor Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'தளம்' : 'Floor'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்து தளம்' : 'All Floors' },
                      { id: 'ground', label: lang === 'ta' ? 'தரை தளம்' : 'Ground Floor' },
                      { id: '1-3', label: lang === 'ta' ? '1–3 தளம்' : '1st – 3rd' },
                      { id: '4+', label: lang === 'ta' ? '4+ தளம்' : '4th+' },
                    ].map((item) => {
                      const isSelected = selectedFloor === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedFloor(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Parking */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Car className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'பார்க்கிங்' : 'Parking'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்தும்' : 'All Parking' },
                      { id: 'car', label: '🚗 Car Parking' },
                      { id: 'bike', label: '🛵 Bike Parking' },
                    ].map((item) => {
                      const isSelected = selectedParking === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedParking(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hostel Sub-filters */}
          {selectedCategory === 'HOSTEL' && (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 animate-bounce-in">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-[#E8DFC8] shadow-xl shadow-[#D4AF37]/8 space-y-3">
                {/* 1. Gender */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'பாலினம்' : 'Gender'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்தும் (All)' : 'All Hostels' },
                      { id: 'MALE', label: lang === 'ta' ? '👨 ஆண்கள் விடுதி' : '👨 Gents Hostel' },
                      { id: 'FEMALE', label: lang === 'ta' ? '👩 மகளிர் விடுதி' : '👩 Ladies Hostel' },
                      { id: 'COLIVING', label: lang === 'ta' ? '🏠 கோ-லிவிங்' : '🏠 Co-Living' },
                    ].map((item) => {
                      const isSelected = hostelGender === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setHostelGender(item.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Sharing */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Home className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'பகிர்வு வகை' : 'Sharing'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்தும்' : 'All Sharing' },
                      { id: 'single', label: lang === 'ta' ? 'ஒற்றை அறை' : 'Single Room' },
                      { id: '2share', label: lang === 'ta' ? '2 பேர் பகிர்வு' : '2 Sharing' },
                      { id: '3share', label: lang === 'ta' ? '3 பேர் பகிர்வு' : '3 Sharing' },
                      { id: '4+share', label: lang === 'ta' ? '4+ பேர் பகிர்வு' : '4+ Sharing' },
                    ].map((item) => {
                      const isSelected = hostelSharing === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setHostelSharing(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Marriage Hall Sub-filters */}
          {selectedCategory === 'MARRIAGE_HALL' && (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 animate-bounce-in">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-[#E8DFC8] shadow-xl shadow-[#D4AF37]/8 space-y-3">
                {/* 1. Guest Capacity */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-1.5 w-36 shrink-0">
                    <PartyPopper className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'விருந்தினர் கொள்ளளவு' : 'Guest Capacity'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்து அரங்கம் (All)' : 'All Halls' },
                      { id: 'UP_TO_250', label: lang === 'ta' ? '🏛️ 250 பேர் வரை (மினி ஹால்)' : '🏛️ Up to 250 (Mini Hall)' },
                      { id: '250_TO_500', label: lang === 'ta' ? '🏛️ 250 – 500 பேர் (நடுத்தர)' : '🏛️ 250 – 500 (Medium)' },
                      { id: '500_TO_1000', label: lang === 'ta' ? '🏛️ 500 – 1000 பேர் (பெரிய)' : '🏛️ 500 – 1000 (Large)' },
                      { id: '1000_PLUS', label: lang === 'ta' ? '✨ 1000+ பேர் (பிரம்மாண்ட மஹால்)' : '✨ 1000+ Guests (Convention)' },
                    ].map((item) => {
                      const isSelected = hallCapacity === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setHallCapacity(item.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Dining Seating Capacity */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-36 shrink-0">
                    <Utensils className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'பந்தி கொள்ளளவு' : 'Dining Capacity'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்து பந்தி (All)' : 'All Dining' },
                      { id: 'UP_TO_150', label: lang === 'ta' ? '🍽️ 150 இலைகள் வரை' : '🍽️ Up to 150 Seater' },
                      { id: '150_TO_350', label: lang === 'ta' ? '🍽️ 150 – 350 இலைகள்' : '🍽️ 150 – 350 Seater' },
                      { id: '350_TO_600', label: lang === 'ta' ? '🍽️ 350 – 600 இலைகள்' : '🍽️ 350 – 600 Seater' },
                      { id: '600_PLUS', label: lang === 'ta' ? '🍽️ 600+ இலைகள் (பிரம்மாண்ட பந்தி)' : '🍽️ 600+ Seater (Grand)' },
                    ].map((item) => {
                      const isSelected = hallDining === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setHallDining(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Air Conditioning Type */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-36 shrink-0">
                    <Wind className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'ஏசி வசதி' : 'Hall AC Type'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்து அரங்கம் (All)' : 'All Hall Types' },
                      { id: 'AC', label: lang === 'ta' ? '❄️ முழு ஏசி அரங்கம் (AC Hall)' : '❄️ Centralized AC Hall' },
                      { id: 'NON_AC', label: lang === 'ta' ? '🍃 ஏசி அல்லாதது (Non-AC)' : '🍃 Non-AC Hall' },
                    ].map((item) => {
                      const isSelected = hallAc === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setHallAc(item.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Hall Area / Built-up Size (Sq Ft) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-36 shrink-0">
                    <Maximize2 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'அரங்க பரப்பளவு' : 'Hall Area (Sq Ft)'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்து அளவுகளும்' : 'All Sizes', min: '', max: '' },
                      { id: '<3000', label: lang === 'ta' ? '< 3,000 ச.அடி' : '< 3,000 sq ft', min: '', max: '3000' },
                      { id: '3000-7000', label: lang === 'ta' ? '3,000 – 7,000 ச.அடி' : '3k – 7k sq ft', min: '3000', max: '7000' },
                      { id: '7000-15000', label: lang === 'ta' ? '7,000 – 15,000 ச.அடி' : '7k – 15k sq ft', min: '7000', max: '15000' },
                      { id: '15000+', label: lang === 'ta' ? '15,000+ ச.அடி' : '15,000+ sq ft', min: '15000', max: '' },
                    ].map((item) => {
                      const isSelected = selectedSizeRange === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSizeRange('');
                              setMinSize('');
                              setMaxSize('');
                            } else {
                              setSelectedSizeRange(item.id);
                              setMinSize(item.min);
                              setMaxSize(item.max);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Car Parking */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 w-36 shrink-0">
                    <Car className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                      {lang === 'ta' ? 'பார்க்கிங்' : 'Parking'}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: '', label: lang === 'ta' ? 'அனைத்தும் (All)' : 'All Parking' },
                      { id: 'car', label: lang === 'ta' ? '🚗 கார் பார்க்கிங்' : '🚗 Car Parking' },
                      { id: 'bike', label: lang === 'ta' ? '🛵 பைக் பார்க்கிங்' : '🛵 Bike Parking' },
                    ].map((item) => {
                      const isSelected = selectedParking === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedParking(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                              : 'bg-white/80 text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76] hover:shadow-sm'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== PREMIUM TRUST BADGES with glassmorphism & animations ===== */}
          <div className="pt-2 sm:pt-4 grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '400ms' }}>
            {/* Badge 1: Direct Owner Connect */}
            <div className="group flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-3 p-2.5 sm:p-4 bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl border border-[#EFE8D8] shadow-lg shadow-[#D4AF37]/5 hover:shadow-xl hover:shadow-[#D4AF37]/10 hover:border-[#D8BC76] hover:bg-white/90 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer rounded-2xl" />
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#FAF4E6] to-[#F3E8CE] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0 relative z-10">
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">{t('hero.zeroBrokerage')}</p>
                <p className="text-[9px] sm:text-[11px] text-gray-500 hidden sm:block">{t('hero.zeroBrokerageDesc')}</p>
              </div>
            </div>

            {/* Badge 2: Verified Listings */}
            <div className="group flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-3 p-2.5 sm:p-4 bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl border border-[#EFE8D8] shadow-lg shadow-[#D4AF37]/5 hover:shadow-xl hover:shadow-[#D4AF37]/10 hover:border-[#D8BC76] hover:bg-white/90 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer rounded-2xl" />
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#FAF4E6] to-[#F3E8CE] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0 relative z-10">
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">{t('hero.verifiedListings')}</p>
                <p className="text-[9px] sm:text-[11px] text-gray-500 hidden sm:block">{t('hero.verifiedListingsDesc')}</p>
              </div>
            </div>

            {/* Badge 3: Direct Phone & WhatsApp */}
            <div className="group flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-3 p-2.5 sm:p-4 bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl border border-[#EFE8D8] shadow-lg shadow-[#D4AF37]/5 hover:shadow-xl hover:shadow-[#D4AF37]/10 hover:border-[#D8BC76] hover:bg-white/90 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer rounded-2xl" />
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#FAF4E6] to-[#F3E8CE] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0 relative z-10">
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">{t('hero.instantConnect')}</p>
                <p className="text-[9px] sm:text-[11px] text-gray-500 hidden sm:block">{t('hero.instantConnectDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9A7818] bg-[#FAF4E6] border border-[#E8DFC8] px-3 py-1 rounded-full mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{lang === 'ta' ? 'சிறந்த தேர்வுகள்' : 'Handpicked Deals'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {t('home.featuredTitle')}
            </h2>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'ALL', label: lang === 'ta' ? 'அனைத்தும்' : 'All Listings' },
              { id: 'HOUSE', label: lang === 'ta' ? 'வீடுகள்' : 'Houses & Flats' },
              { id: 'SHOP', label: lang === 'ta' ? 'வணிக கடைகள்' : 'Shops' },
              { id: 'HOSTEL', label: lang === 'ta' ? 'விடுதிகள்' : 'Hostels' },
            ].map((tab) => {
              const isSelected = featuredFilterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFeaturedFilterTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-md shadow-[#D4AF37]/20 scale-[1.03]'
                      : 'bg-white text-gray-700 border-[#E8DFC8] hover:bg-[#FAF4E6] hover:border-[#D8BC76]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            <Link
              to="/properties"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#C5A059] hover:text-[#9A7818] transition ml-2 whitespace-nowrap"
            >
              <span>{t('home.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
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
        ) : filteredFeatured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatured.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8DFC8] p-8 text-center space-y-3">
            <p className="text-gray-500 text-sm">
              {lang === 'ta' ? 'இந்த பிரிவில் சிறப்பான பதிவுகள் எதுவும் தற்போது இல்லை.' : 'No featured properties in this category currently.'}
            </p>
            <button
              type="button"
              onClick={() => setFeaturedFilterTab('ALL')}
              className="px-4 py-2 bg-[#FAF4E6] text-[#9A7818] font-bold text-xs rounded-xl border border-[#E8DFC8] hover:bg-[#F3E8CE] transition cursor-pointer"
            >
              {lang === 'ta' ? 'அனைத்து பதிவுகளையும் பார்க்க' : 'Show All Featured'}
            </button>
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
              <span>+ {lang === 'ta' ? 'சேவை சேர்க்க' : 'List Your Service'}</span>
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
              How veeduvadagaikkuchennai Works
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

      {/* Navaratri Promotional Festive Offer Popup */}
      <NavaratriPromotionalPopup />
    </div>
  );
};
