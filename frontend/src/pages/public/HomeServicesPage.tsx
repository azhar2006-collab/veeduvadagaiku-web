import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  MessageCircle,
  MapPin,
  Wrench,
  Truck,
  Sparkles,
  Wind,
  FileText,
  ChevronDown,
  Plus,
  Clock,
  Shield,
  Search,
  X,
  CheckCircle2,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { SEOHead } from '../../components/common/SEOHead';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalities } from '../../hooks/useProperties';
import { homeServiceApi } from '../../services/homeService.service';
import { HomeServicesDisclaimerModal } from '../../components/common/HomeServicesDisclaimerModal';

type ServiceCategory = 'ALL' | 'MOVERS' | 'RENOVATION' | 'CLEANING' | 'AC_SERVICE' | 'LEGAL';

interface HomeService {
  id: string;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  providerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  locality: string;
  serviceAreas: string[];
  pricing: string;
  priceFrom?: number;
  features: string[];
  imageUrl?: string;
  experience?: string;
  workingHours?: string;
  viewCount: number;
  createdAt: string;
}

const CATEGORIES: {
  id: ServiceCategory;
  label: string;
  labelTa: string;
  icon: React.ReactNode;
  subcategories: string[];
}[] = [
  {
    id: 'ALL',
    label: 'All Services',
    labelTa: 'அனைத்து சேவைகளும்',
    icon: <Sparkles className="w-4 h-4" />,
    subcategories: [
      'Local Shifting',
      'Painting',
      'Plumbing',
      'Electrical Work',
      'Deep Home Cleaning',
      'Pest Control',
      'AC Service & Repair',
      'Rental Agreement',
    ],
  },
  {
    id: 'MOVERS',
    label: 'Movers & Packers',
    labelTa: 'மூவர்ஸ் & பேக்கர்ஸ்',
    icon: <Truck className="w-4 h-4" />,
    subcategories: [
      'Local Shifting',
      'Intercity Shifting',
      'Office Relocation',
      'Vehicle Transport',
      'Storage & Warehousing',
    ],
  },
  {
    id: 'RENOVATION',
    label: 'Renovation & Repairs',
    labelTa: 'புதுப்பித்தல் & பழுது',
    icon: <Wrench className="w-4 h-4" />,
    subcategories: [
      'Electrical Work',
      'Plumbing',
      'Painting',
      'Flooring & Tiles',
      'Carpentry & Woodwork',
      'Civil & Masonry',
      'False Ceiling',
      'Full Home Renovation',
      'Waterproofing',
    ],
  },
  {
    id: 'CLEANING',
    label: 'Cleaning & Pest Control',
    labelTa: 'துப்புரவு & பூச்சி கட்டுப்பாடு',
    icon: <Sparkles className="w-4 h-4" />,
    subcategories: [
      'Deep Home Cleaning',
      'Sofa & Carpet Cleaning',
      'Kitchen Deep Clean',
      'Bathroom Cleaning',
      'Cockroach Treatment',
      'Mosquito Treatment',
      'Termite Treatment',
      'Rodent Control',
      'General Pest Control',
    ],
  },
  {
    id: 'AC_SERVICE',
    label: 'AC Service & Cleaning',
    labelTa: 'AC சேவை & துப்புரவு',
    icon: <Wind className="w-4 h-4" />,
    subcategories: [
      'AC Service & Gas Refill',
      'AC Deep Cleaning',
      'AC Installation',
      'AC Uninstallation',
      'AC Repair',
    ],
  },
  {
    id: 'LEGAL',
    label: 'Legal Documentation',
    labelTa: 'சட்ட ஆவணங்கள்',
    icon: <FileText className="w-4 h-4" />,
    subcategories: [
      'Rental Agreement',
      'Property Registration',
      'Sale Deed',
      'Legal Notice',
      'Lease Agreement',
      'Power of Attorney',
      'Tenant Police Verification',
    ],
  },
];

const BUDGET_PRESETS = [
  { label: 'Any Budget', value: '' },
  { label: 'Up to ₹1,000', value: '1000' },
  { label: 'Up to ₹2,500', value: '2500' },
  { label: 'Up to ₹5,000', value: '5000' },
  { label: 'Up to ₹10,000', value: '10000' },
  { label: '₹10,000+', value: '50000' },
];

export const HomeServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { isAuthenticated, isOwner, isAdmin } = useAuth();
  const { data: localitiesRes } = useLocalities();

  const localities: string[] = useMemo(() => {
    const list = (localitiesRes as any)?.data || (Array.isArray(localitiesRes) ? localitiesRes : null);
    if (Array.isArray(list) && list.length > 0) return list;
    return [
      'Anna Nagar',
      'T. Nagar',
      'Velachery',
      'Adyar',
      'Tambaram',
      'Porur',
      'Chromepet',
      'Mylapore',
      'Sholinganallur',
      'Vadapalani',
      'Besant Nagar',
      'Guindy',
      'Thiruvanmiyur',
      'Nungambakkam',
      'Medavakkam',
      'Pallavaram',
      'Perungudi',
      'Ambattur',
      'Koyambedu',
      'Alwarpet',
    ];
  }, [localitiesRes]);

  // Filters State
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('ALL');
  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');

  // Service Data State
  const [services, setServices] = useState<HomeService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Owner Gate Modal State
  const [showOwnerModal, setShowOwnerModal] = useState<boolean>(false);

  // Home Services Disclaimer Modal State (shown when user opens Home Services page)
  const [showDisclaimerModal, setShowDisclaimerModal] = useState<boolean>(true);

  // Available subcategories for currently active category
  const activeCategoryMeta = useMemo(
    () => CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0],
    [activeCategory]
  );

  const fetchServices = () => {
    setLoading(true);
    homeServiceApi
      .getServices({
        category: activeCategory !== 'ALL' ? activeCategory : undefined,
        subcategory: selectedSubcategory || undefined,
        locality: selectedLocality || undefined,
        maxPrice: selectedBudget || undefined,
        limit: 50,
      })
      .then((data) => setServices(data.services || []))
      .catch((err) => {
        console.error('Fetch home services error:', err);
        setServices([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, [activeCategory, selectedSubcategory, selectedLocality, selectedBudget]);

  const handleResetFilters = () => {
    setSelectedLocality('');
    setSelectedSubcategory('');
    setSelectedBudget('');
  };

  const handleListServiceClick = () => {
    if (isAuthenticated && (isOwner || isAdmin)) {
      navigate('/home-services/list');
    } else {
      setShowOwnerModal(true);
    }
  };

  const hasActiveFilters = !!(selectedLocality || selectedSubcategory || selectedBudget);

  return (
    <div className="space-y-6 sm:space-y-16 pb-12 bg-[#FCFAF6] min-h-screen">
      <SEOHead
        title={
          lang === 'ta'
            ? 'சென்னை வீட்டு சேவைகள் | VeeduVadagaiKu'
            : 'Chennai Home Services | VeeduVadagaiKu'
        }
        description="Verified movers, renovation, deep cleaning, AC service and legal documentation experts across Chennai."
      />

      {/* ─── Hero Section (Exact HomePage White & Lite Gold Theme) ─── */}
      <section className="relative overflow-x-hidden pt-4 pb-4 sm:pb-6 md:pt-8 md:pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FCFAF6] via-white to-[#F8F5EE] border-b border-[#EFE8D8]">
        {/* Subtle decorative gold radial glows */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(197,160,89,0.12) 0%, transparent 65%)' }}
        />

        <div className="relative max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Top Tagline */}
          <div className="text-center space-y-2 max-w-3xl mx-auto px-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] text-[10px] sm:text-xs font-bold tracking-wide shadow-2xs max-w-[95vw] flex-wrap justify-center">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C5A059] shrink-0" />
                <span>
                  {lang === 'ta'
                    ? 'சென்னையின் நம்பகமான வீட்டு சேவைகள் — நேரடி தொடர்பு'
                    : "Chennai's Exclusive Home Services — Direct Provider Connect"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDisclaimerModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8DFC8] text-[#9A7818] text-[10px] sm:text-xs font-bold hover:bg-[#FAF7F0] transition cursor-pointer shadow-2xs"
                title="View platform disclaimer"
              >
                <Shield className="w-3 h-3 text-[#C5A059]" />
                <span>{lang === 'ta' ? 'தள அறிவிப்பு' : 'Platform Notice'}</span>
              </button>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-[2.25rem] font-bold sm:font-extrabold tracking-tight leading-snug sm:leading-tight text-[#1E2329]">
              {lang === 'ta' ? 'சென்னையின் நம்பகமான' : "Chennai's Trusted"}{' '}
              <span className="text-[#C5A059]">
                {lang === 'ta' ? 'வீட்டு சேவைகள்' : 'Home Services'}
              </span>
            </h1>

            <p className="max-w-xl mx-auto text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              {lang === 'ta'
                ? 'மூவர்ஸ், புதுப்பித்தல், ஏசி பராமரிப்பு, துப்புரவு மற்றும் சட்ட ஆவண வல்லுநர்கள்.'
                : 'Movers & Packers, Renovation, AC Care, Cleaning & Pest Control, Legal Documentation.'}
            </p>
            <p className="max-w-xl mx-auto text-[11px] sm:text-xs text-[#9A7818] font-medium leading-relaxed">
              {lang === 'ta'
                ? 'நேரடி அழைப்பு · நியாயமான கட்டணம் · 100% தரமான சேவை'
                : 'Direct Phone & WhatsApp · Transparent Pricing · Zero Middlemen'}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleListServiceClick}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md hover:brightness-105 transition"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'ta' ? 'சேவையை சேர்க்க (உரிமையாளர்கள் மட்டும்)' : 'List Your Service (Owners Only)'}</span>
              </button>
            </div>
          </div>



          {/* ─── Classic Search / Filter Box (Matching HomePage Search Card) ─── */}
          <div className="pt-1 max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl shadow-[#D4AF37]/10 border border-[#E8DFC8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-center">
              {/* Filter 1: Locality Dropdown */}
              <div className="relative text-left">
                <label className="block text-[11px] font-bold uppercase text-gray-600 tracking-wider mb-1 ml-1">
                  {t('filter.locality')}
                </label>
                <div className="flex items-center gap-2 bg-[#FCFAF5] hover:bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E8DFC8] transition">
                  <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <select
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
                  >
                    <option value="">{lang === 'ta' ? 'அனைத்து பகுதிகள்' : 'All Chennai Localities'}</option>
                    {localities.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter 2: Service Subcategory */}
              <div className="relative text-left">
                <label className="block text-[11px] font-bold uppercase text-gray-600 tracking-wider mb-1 ml-1">
                  {lang === 'ta' ? 'சேவை பிரிவு' : 'Service Type'}
                </label>
                <div className="flex items-center gap-2 bg-[#FCFAF5] hover:bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E8DFC8] transition">
                  <Wrench className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
                  >
                    <option value="">{lang === 'ta' ? 'அனைத்து பிரிவுகள்' : 'All Service Types'}</option>
                    {activeCategoryMeta.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter 3: Budget Range */}
              <div className="relative text-left">
                <div className="flex items-center justify-between mb-1 ml-1">
                  <label className="block text-[11px] font-bold uppercase text-gray-600 tracking-wider">
                    {t('hero.maxBudget')}
                  </label>
                  <span className="text-[10px] text-gray-400 font-medium">Starting</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FCFAF5] hover:bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E8DFC8] transition">
                  <span className="text-sm font-bold text-[#C5A059] pl-1">₹</span>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
                  >
                    {BUDGET_PRESETS.map((bp) => (
                      <option key={bp.label} value={bp.value}>
                        {bp.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter 4: Search Button / Reset */}
              <div className="sm:col-span-2 lg:col-span-1 pt-1 sm:pt-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchServices}
                  className="flex-1 h-[48px] flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 text-white font-bold text-sm rounded-xl shadow-md shadow-[#D4AF37]/25 transition active:scale-[0.98]"
                >
                  <Search className="w-4 h-4 text-white" />
                  <span>{lang === 'ta' ? 'தேடுக' : 'Find Services'}</span>
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    title="Reset filters"
                    className="h-[48px] px-3 bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] rounded-xl hover:bg-[#F5EDD8] transition text-xs font-bold flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── Trust Guarantee Badges (Matching HomePage) ─── */}
          <div className="pt-1 sm:pt-3 grid grid-cols-3 gap-1.5 sm:gap-3 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-[#EFE8D8] shadow-2xs">
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">
                  {lang === 'ta' ? 'நேரடி வல்லுநர் தொடர்பு' : 'Direct Provider Connect'}
                </p>
                <p className="text-[9px] sm:text-[11px] text-gray-500 hidden sm:block">
                  {lang === 'ta' ? 'இடைத்தரகர் இல்லை' : 'Zero commission or middlemen'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-[#EFE8D8] shadow-2xs">
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">
                  {lang === 'ta' ? 'சரிபார்க்கப்பட்ட வல்லுநர்கள்' : 'Verified Professionals'}
                </p>
                <p className="text-[9px] sm:text-[11px] text-gray-500 hidden sm:block">
                  {lang === 'ta' ? 'அனுபவம் மற்றும் ஆவண சோதனை' : 'Strict background verification'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-[#EFE8D8] shadow-2xs">
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">
                  {lang === 'ta' ? 'வெளிப்படையான கட்டணம்' : 'Transparent Pricing'}
                </p>
                <p className="text-[9px] sm:text-[11px] text-gray-500 hidden sm:block">
                  {lang === 'ta' ? 'மறைமுக கட்டணம் இல்லை' : 'Clear upfront estimates'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Sidebar + Service Results Section ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left Sidebar: Category Nav ── */}
          <aside className="w-full lg:w-60 xl:w-64 shrink-0">
            {/* Mobile: horizontal scrollable strip */}
            <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 -mx-4 px-4">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setActiveCategory(cat.id); setSelectedSubcategory(''); }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white border-[#C5A059] shadow-sm'
                        : 'bg-white border-[#E8DFC8] text-gray-600 hover:bg-[#FAF7F0]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{lang === 'ta' ? cat.labelTa : cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop: vertical sticky sidebar */}
            <div className="hidden lg:block sticky top-24">
              <div className="bg-white border border-[#E8DFC8] rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[#F0E8D5] bg-[#FAF7F0]">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#9A7818]">
                    {lang === 'ta' ? 'சேவை வகைகள்' : 'Service Categories'}
                  </p>
                </div>
                <nav className="p-2 space-y-0.5">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { setActiveCategory(cat.id); setSelectedSubcategory(''); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition ${
                          isActive
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-sm'
                            : 'text-gray-700 hover:bg-[#FAF7F0] hover:text-[#9A7818]'
                        }`}
                      >
                        <span className={isActive ? 'text-white' : 'text-[#C5A059]'}>{cat.icon}</span>
                        <span className="leading-tight">{lang === 'ta' ? cat.labelTa : cat.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* ── Right: Results ── */}
          <div className="flex-1 min-w-0 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  {lang === 'ta' ? 'கிடைக்கும் சேவைகள்' : 'Available Services'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {services.length} {lang === 'ta' ? 'வல்லுநர்கள் பட்டியலில் உள்ளனர்' : 'professionals available across Chennai'}
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[#9A7818] hover:underline"
                >
                  {lang === 'ta' ? 'அனைத்து வடிகட்டிகளையும் நீக்குக' : 'Clear Filters'}
                </button>
              )}
            </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#EFE8D8] p-5 shadow-xs animate-pulse space-y-3"
              >
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
                <div className="h-8 bg-gray-100 rounded w-full mt-4" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EFE8D8] p-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center font-bold text-2xl mx-auto mb-4">
              🔧
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              {lang === 'ta' ? 'சேவைகள் எதுவும் கிடைக்கவில்லை' : 'No service providers found'}
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              {hasActiveFilters
                ? lang === 'ta'
                  ? 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளுக்கு சேவைகள் இல்லை. வேறு பகுதியை தேர்வு செய்யவும் அல்லது வடிகட்டிகளை மீட்டமைக்கவும்.'
                  : 'Try clearing your filters or changing the locality to discover more providers.'
                : lang === 'ta'
                ? 'உங்கள் சேவையை முதலில் பட்டியலிடுங்கள்!'
                : 'Be the first registered owner or verified service partner to list your service here!'}
            </p>
            <div className="flex gap-3 justify-center">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 border border-[#E8DFC8] bg-white text-gray-700 font-semibold rounded-xl text-xs sm:text-sm hover:bg-gray-50 transition"
                >
                  {lang === 'ta' ? 'வடிகட்டிகளை மீட்டமைக்க' : 'Reset Filters'}
                </button>
              )}
              <button
                type="button"
                onClick={handleListServiceClick}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md hover:brightness-105 transition"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'ta' ? 'சேவையை சேர்க்கவும்' : 'List Your Service'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {services.map((service) => {
              const catMeta =
                CATEGORIES.find((c) => c.id === service.category) || CATEGORIES[0];
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-[#EFE8D8] shadow-xs hover:border-[#C5A059] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Category Strip */}
                    <div className="px-4 py-2.5 bg-[#FAF7F0] border-b border-[#F0E8D5] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[#9A7818]">
                        {catMeta.icon}
                        <span className="text-[11px] font-bold uppercase tracking-wide">
                          {lang === 'ta' ? catMeta.labelTa : catMeta.label}
                        </span>
                      </div>
                      {service.subcategory && (
                        <span className="text-[10px] bg-white text-gray-600 px-2 py-0.5 rounded-md border border-[#E8DFC8] font-medium">
                          {service.subcategory}
                        </span>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 space-y-3">
                      {/* Provider Name + Experience */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-gray-900 text-base leading-tight group-hover:text-[#9A7818] transition">
                            {service.providerName}
                          </h3>
                          <p className="text-xs font-semibold text-gray-700 mt-0.5">{service.title}</p>
                        </div>
                        {service.experience && (
                          <span className="shrink-0 bg-[#FAF4E6] text-[#9A7818] text-[10px] font-bold px-2 py-1 rounded-lg border border-[#E8DFC8]">
                            {service.experience}
                          </span>
                        )}
                      </div>

                      {/* Locality & Service Coverage */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                        <span className="font-semibold text-gray-800">{service.locality}</span>
                        {service.serviceAreas && service.serviceAreas.length > 0 && (
                          <span className="text-[11px] text-gray-500 truncate">
                            · {service.serviceAreas.slice(0, 2).join(', ')}
                            {service.serviceAreas.length > 2 ? '...' : ''}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                        {service.description}
                      </p>

                      {/* Feature Chips */}
                      {service.features && service.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {service.features.slice(0, 3).map((f, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-[#FAF7F0] border border-[#E8DFC8] text-gray-700 px-2 py-0.5 rounded-md font-medium"
                            >
                              ✓ {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="p-4 sm:p-5 pt-0">
                    <div className="flex items-center justify-between py-2 border-t border-[#F0E8D5] mb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                          Starting Price
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-[#9A7818]">
                          {service.pricing}
                        </span>
                      </div>
                      {service.workingHours && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{service.workingHours}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${service.phone}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] text-xs font-bold rounded-xl hover:bg-[#F5EDD8] transition shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{lang === 'ta' ? 'அழைக்க' : 'Call'}</span>
                      </a>
                      {service.whatsapp ? (
                        <a
                          href={`https://wa.me/91${service.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <div className="flex items-center justify-center py-2.5 px-3 text-gray-400 text-xs font-semibold bg-gray-50 rounded-xl border border-gray-100">
                          Direct Owner
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

          </div>{/* end flex-1 right column */}
        </div>{/* end flex-col lg:flex-row */}

        {/* ─── Bottom CTA Banner (Matching White & Lite Gold Theme) ─── */}
        <section className="mt-8 bg-gradient-to-b from-[#FCFAF6] via-white to-[#F8F5EE] border border-[#E8DFC8] rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden shadow-sm">
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.12) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="inline-block px-3 py-1 bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] rounded-full text-xs font-bold uppercase tracking-wider">
              {lang === 'ta' ? 'சேவை வழங்குநர்களுக்கு' : 'For Property & Business Owners'}
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold text-gray-900">
              {lang === 'ta'
                ? 'உங்கள் சேவையை VeeduVadagaiKu-வில் பட்டியலிடுங்கள்!'
                : 'Grow Your Business with VeeduVadagaiKu!'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {lang === 'ta'
                ? 'சென்னை வாடகையாளர்களை நேரடியாக அடையுங்கள். இடைத்தரகர் இல்லை, கட்டணமில்லா பட்டியல்.'
                : 'Reach thousands of Chennai tenants and property seekers directly. Zero commission.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleListServiceClick}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md hover:brightness-105 transition"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'ta' ? 'சேவையை சேர்க்க (உரிமையாளர்கள்)' : 'List Your Service (Owners)'}</span>
              </button>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white border border-[#E8DFC8] text-gray-700 font-semibold px-5 py-3 rounded-xl text-xs sm:text-sm hover:bg-[#FAF7F0] transition"
              >
                {lang === 'ta' ? 'உதவிக்கு தொடர்பு கொள்ள' : 'Contact Support'}
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ─── Owner Access Gate Modal ─── */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#E8DFC8] shadow-2xl space-y-5 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-7 h-7 text-[#C5A059]" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                {lang === 'ta' ? 'உரிமையாளர் கணக்கு தேவை' : 'Owner Account Required'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {isAuthenticated
                  ? lang === 'ta'
                    ? 'நீங்கள் வாடகை பயனர் கணக்கில் உள்ளீர்கள். சரிபார்க்கப்பட்ட சொத்து மற்றும் தொழில் உரிமையாளர்கள் மட்டுமே சேவைகளை பதிவேற்ற முடியும்.'
                    : 'You are currently signed in with a Tenant account. Only registered Property and Business Owners can list home services.'
                  : lang === 'ta'
                  ? 'சரிபார்க்கப்பட்ட உரிமையாளர்கள் மற்றும் சேவை வழங்குநர்கள் மட்டுமே சேவைகளை பதிவேற்ற முடியும். தொடர உள்நுழையவும் அல்லது பதிவு செய்யவும்.'
                  : 'Only verified property owners and business partners can post services. Please log in or register as an Owner to proceed.'}
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login?role=OWNER&redirect=/home-services/list"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold rounded-xl text-sm shadow-md hover:brightness-105 transition"
                  >
                    <span>{lang === 'ta' ? 'உரிமையாளராக உள்நுழைக' : 'Log In as Owner'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/register?role=OWNER&redirect=/home-services/list"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#FAF7F0] border border-[#E8DFC8] text-gray-800 font-semibold rounded-xl text-sm hover:bg-[#F5EDD8] transition"
                  >
                    <span>{lang === 'ta' ? 'புதிய உரிமையாளர் கணக்கு பதிவு' : 'Register as Owner'}</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/login?role=OWNER&redirect=/home-services/list"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold rounded-xl text-sm shadow-md hover:brightness-105 transition"
                >
                  <span>{lang === 'ta' ? 'உரிமையாளர் கணக்கிற்கு மாறுக' : 'Switch to Owner Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setShowOwnerModal(false)}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-800 font-medium transition"
              >
                {lang === 'ta' ? 'மூடுக' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Home Services Platform Disclaimer Modal ─── */}
      <HomeServicesDisclaimerModal
        isOpen={showDisclaimerModal}
        onClose={() => setShowDisclaimerModal(false)}
      />
    </div>
  );
};
