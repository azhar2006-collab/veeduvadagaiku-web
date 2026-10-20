import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Store,
  Users,
  Sparkles,
  Wrench,
  Gift,
  Phone,
  MessageCircle,
  MapPin,
  Truck,
  Wind,
  FileText,
  Plus,
  Clock,
  Shield,
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
    icon: <Sparkles className="w-5 h-5" />,
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
    icon: <Truck className="w-5 h-5" />,
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
    icon: <Wrench className="w-5 h-5" />,
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
    icon: <Sparkles className="w-5 h-5" />,
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
    icon: <Wind className="w-5 h-5" />,
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
    icon: <FileText className="w-5 h-5" />,
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
  }, [activeCategory, selectedSubcategory, selectedLocality]);

  const handleResetFilters = () => {
    setActiveCategory('ALL');
    setSelectedLocality('');
    setSelectedSubcategory('');
  };

  const handleListServiceClick = () => {
    if (isAuthenticated && (isOwner || isAdmin)) {
      navigate('/home-services/list');
    } else {
      setShowOwnerModal(true);
    }
  };

  const hasActiveFilters = !!(activeCategory !== 'ALL' || selectedLocality || selectedSubcategory);

  return (
    <div className="space-y-10 sm:space-y-16 pb-16 bg-[#FCFAF6] min-h-screen">
      <SEOHead
        title={
          lang === 'ta'
            ? 'சென்னை வீட்டு சேவைகள் | VeeduVadagaikkuChennai'
            : 'Chennai Home Services | VeeduVadagaikkuChennai'
        }
        description="Verified movers, renovation, deep cleaning, AC care & legal documentation across Chennai."
      />

      {/* ─── Hero Section (Exact HomePage White & Lite Gold Theme, Matching Image) ─── */}
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
                <span>{lang === 'ta' ? 'நேரடி உரிமையாளர் தொடர்பு' : 'Direct Owner Connect'}</span>
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
              {lang === 'ta' ? 'சென்னையின் பிரத்யேக' : "Chennai's Exclusive"}{' '}
              <span className="text-[#C5A059]">
                {lang === 'ta' ? 'ஒரே இட வீட்டு சேவைகள்' : 'One-Stop Home Services Webapp'}
              </span>
            </h1>

            <p className="max-w-xl mx-auto text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              {lang === 'ta'
                ? 'சென்னையில் சரிபார்க்கப்பட்ட மூவர்ஸ், புதுப்பித்தல், துப்புரவு, ஏசி பராமரிப்பு மற்றும் சட்ட ஆவண சேவைகள்.'
                : 'Verified movers, renovation, deep cleaning, AC care & legal documentation across Chennai.'}
            </p>
            <p className="max-w-xl mx-auto text-[11px] sm:text-xs text-[#9A7818] font-medium leading-relaxed">
              {t('hero.descSub')}
            </p>
          </div>

          {/* Quick Categories Bar (Matching Image Exactly) */}
          <div className="w-full overflow-x-auto no-scrollbar py-3 px-3 sm:px-6">
            <div
              className="flex items-center gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 shrink-0 w-max min-w-full justify-start min-[1200px]:justify-center px-1"
              style={{ justifyContent: 'safe center' }}
            >
              <Link
                to="/houses"
                className="text-xs sm:text-sm lg:text-[15px] font-bold text-gray-800 hover:text-[#B08B40] transition flex items-center gap-1.5 sm:gap-2 group shrink-0 whitespace-nowrap"
              >
                <Building2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-[#C5A059] group-hover:scale-110 transition-transform shrink-0" />
                <span>{t('nav.houses')}</span>
              </Link>

              <Link
                to="/hostels"
                className="text-xs sm:text-sm lg:text-[15px] font-bold text-gray-800 hover:text-[#B08B40] transition flex items-center gap-1.5 sm:gap-2 group shrink-0 text-left"
              >
                <Users className="w-4 h-4 sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-[#C5A059] group-hover:scale-110 transition-transform shrink-0" />
                <div className="flex flex-col leading-tight">
                  <span className="whitespace-nowrap">{lang === 'ta' ? 'விடுதிகள் & PG' : 'Hostels & PG'}</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 group-hover:text-[#B08B40] transition-colors whitespace-nowrap">
                    Accommodation
                  </span>
                </div>
              </Link>

              <Link
                to="/shops"
                className="text-xs sm:text-sm lg:text-[15px] font-bold text-gray-800 hover:text-[#B08B40] transition flex items-center gap-1.5 sm:gap-2 group shrink-0 whitespace-nowrap"
              >
                <Store className="w-4 h-4 sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-[#C5A059] group-hover:scale-110 transition-transform shrink-0" />
                <span>{t('nav.shops')}</span>
              </Link>

              <Link
                to="/marriage-halls"
                className="text-xs sm:text-sm lg:text-[15px] font-bold text-gray-800 hover:text-[#B08B40] transition flex items-center gap-1.5 sm:gap-2 group shrink-0 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-[#C5A059] group-hover:scale-110 transition-transform shrink-0" />
                <span>{t('nav.marriageHalls')}</span>
              </Link>

              <Link
                to="/home-services"
                className="text-xs sm:text-sm lg:text-[15px] font-bold text-[#9A7818] bg-[#FAF4E6] border border-[#E8DFC8] px-2.5 py-1 rounded-xl transition flex items-center gap-1.5 sm:gap-2 group shrink-0 whitespace-nowrap shadow-2xs"
              >
                <Wrench className="w-4 h-4 sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-[#C5A059] group-hover:scale-110 transition-transform shrink-0" />
                <span>{t('nav.homeServices')}</span>
              </Link>

              <Link
                to="/offers"
                className="text-xs sm:text-sm lg:text-[15px] font-bold text-[#9A7818] hover:text-[#B08B40] transition flex items-center gap-1.5 sm:gap-2 group shrink-0 whitespace-nowrap"
              >
                <Gift className="w-4 h-4 sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-[#D4AF37] group-hover:scale-110 transition-transform shrink-0" />
                <span>{lang === 'ta' ? 'சலுகைகள்' : 'Offers'}</span>
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-red-500 text-white text-[9px] font-black rounded-full uppercase tracking-wider animate-pulse">
                  Free
                </span>
              </Link>
            </div>
          </div>

          {/* Trust Guarantee Badges (Matching Image Exactly) */}
          <div className="pt-1 sm:pt-3 grid grid-cols-3 gap-1.5 sm:gap-3 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-[#EFE8D8] shadow-2xs">
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">
                  {lang === 'ta' ? 'நேரடி உரிமையாளர் தொடர்பு' : 'Direct Owner Connect'}
                </p>
                <p className="text-[9px] sm:text-[11px] text-gray-500 hidden sm:block">
                  {lang === 'ta' ? 'உரிமையாளர்களுடன் நேரடி தொடர்பு' : 'Connect directly with verified owners'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-[#EFE8D8] shadow-2xs">
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">
                  {lang === 'ta' ? 'சரிபார்க்கப்பட்ட பட்டியல்கள்' : 'Verified Listings'}
                </p>
                <p className="text-[9px] sm:text-[11px] text-gray-500 hidden sm:block">
                  {lang === 'ta' ? 'நிர்வாகியால் சரிபார்க்கப்பட்ட புகைப்படங்கள்' : 'Admin-checked photos & real locations'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-[#EFE8D8] shadow-2xs">
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight">
                  {lang === 'ta' ? 'நேரடி தொலைபேசி & வாட்ஸ்அப்' : 'Direct Phone & WhatsApp'}
                </p>
                <p className="text-[9px] sm:text-[11px] text-gray-500 hidden sm:block">
                  {lang === 'ta' ? 'உரிமையாளர்களுடன் நேரடி உரையாடல்' : 'Direct conversation with owners'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Browse By Service Category Section (Matching HomePage Category Cards) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES.filter((c) => c.id !== 'ALL').map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(isActive ? 'ALL' : cat.id);
                  setSelectedSubcategory('');
                }}
                className={`group bg-white rounded-2xl p-3.5 sm:p-5 border shadow-xs hover:shadow-xl transition-all flex flex-col justify-between text-left ${
                  isActive
                    ? 'border-[#C5A059] ring-2 ring-[#C5A059]/20 bg-[#FCFAF5]'
                    : 'border-[#EFE8D8] hover:border-[#C5A059]'
                }`}
              >
                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${
                      isActive
                        ? 'bg-[#FAF4E6] text-[#9A7818] border-[#E8DFC8]'
                        : 'bg-[#FAF7F0] text-[#C5A059] border-[#EFE8D8] group-hover:scale-110'
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#B08B40] transition leading-tight">
                    {lang === 'ta' ? cat.labelTa : cat.label}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed hidden sm:block">
                    {cat.subcategories.slice(0, 2).join(', ')}...
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C5A059] group-hover:text-[#9A7818] pt-2 sm:pt-3">
                  <span>
                    {isActive
                      ? lang === 'ta'
                        ? 'தேர்ந்தெடுக்கப்பட்டது'
                        : 'Active'
                      : lang === 'ta'
                      ? 'காண்க'
                      : 'Explore'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── Available Verified Home Services (Matching HomePage Showcase Grid) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9A7818] bg-[#FAF4E6] border border-[#E8DFC8] px-3 py-1 rounded-full mb-1">
              <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{lang === 'ta' ? 'சரிபார்க்கப்பட்ட சேவைகள்' : 'Verified Professionals'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {activeCategory === 'ALL'
                ? lang === 'ta'
                  ? 'சென்னை வீட்டு சேவைகள்'
                  : 'Chennai Home Services'
                : lang === 'ta'
                ? activeCategoryMeta.labelTa
                : activeCategoryMeta.label}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {services.length}{' '}
              {lang === 'ta'
                ? 'வல்லுநர்கள் பட்டியலில் உள்ளனர்'
                : 'verified professionals ready to serve across Chennai'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Locality Quick Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-[#E8DFC8] rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-xs"
              >
                <option value="">{lang === 'ta' ? 'அனைத்து பகுதிகள்' : 'All Localities'}</option>
                {localities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory selector if active category has subcategories */}
            {activeCategoryMeta.subcategories.length > 0 && activeCategory !== 'ALL' && (
              <div className="flex items-center gap-1.5 bg-white border border-[#E8DFC8] rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs">
                <Wrench className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer text-xs"
                >
                  <option value="">{lang === 'ta' ? 'அனைத்து வகைகள்' : 'All Types'}</option>
                  {activeCategoryMeta.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] rounded-xl text-xs font-bold hover:bg-[#F5EDD8] transition"
              >
                {lang === 'ta' ? 'மீட்டமைக்க' : 'Clear'}
              </button>
            )}

            <button
              type="button"
              onClick={handleListServiceClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#D4AF37] to-[#C5A059] shadow-xs hover:brightness-105 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'சேவை சேர்க்க' : 'List Service'}</span>
            </button>
          </div>
        </div>

        {/* Services Cards Grid */}
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
          <div className="text-center py-16 bg-white rounded-3xl border border-[#EFE8D8] p-8 shadow-xs max-w-2xl mx-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
      </section>

      {/* ─── Popular Chennai Areas Grid (Matching HomePage) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {t('hero.popularLocalities')}
          </h2>
          <p className="text-sm text-gray-600 font-normal">
            {lang === 'ta'
              ? 'சென்னையின் முக்கிய பகுதிகளில் நம்பகமான வீட்டு சேவைகளை கண்டறியுங்கள்.'
              : 'Find trusted home services and repair professionals across Chennai neighborhoods.'}
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {localities.slice(0, 12).map((loc) => {
            const isSelected = selectedLocality === loc;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => setSelectedLocality(isSelected ? '' : loc)}
                className={`p-2.5 sm:p-4 rounded-2xl border transition text-center group ${
                  isSelected
                    ? 'bg-[#FAF4E6] border-[#C5A059] shadow-md scale-[1.02]'
                    : 'bg-white border-[#EFE8D8] hover:border-[#C5A059] hover:shadow-md'
                }`}
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059] mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition" />
                <h4 className="text-[10px] sm:text-sm font-semibold text-gray-800 group-hover:text-[#9A7818] transition leading-tight">
                  {loc}
                </h4>
                <span className="hidden sm:block text-[11px] text-gray-500 font-normal">
                  {isSelected ? (lang === 'ta' ? 'தேர்வு செய்யப்பட்டது' : 'Selected') : (lang === 'ta' ? 'சேவைகள்' : 'Find Services')}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── Simple 3-Step Process (Matching HomePage How It Works) ─── */}
      <section className="bg-[#FAF8F4] text-gray-900 py-16 border-y border-[#EFE8D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-block px-3 py-1 bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] rounded-full text-xs font-bold uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900">
              {lang === 'ta' ? 'வீட்டு சேவைகள் எவ்வாறு செயல்படுகின்றன' : 'How Home Services Work'}
            </h2>
            <p className="text-sm text-gray-600 font-normal">
              {lang === 'ta'
                ? 'இடைத்தரகர் இல்லை, கூடுதல் கட்டணம் இல்லை — சென்னை வல்லுநர்களுடன் நேரடி தொடர்பு.'
                : 'Direct connection to verified service providers with zero commission and upfront pricing.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-3xl border border-[#EFE8D8] shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center font-bold text-lg mx-auto shadow-xs">
                1
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {lang === 'ta' ? 'சேவை வகையைத் தேர்ந்தெடுக்கவும்' : 'Choose Service Category'}
              </h3>
              <p className="text-sm text-gray-600 font-normal">
                {lang === 'ta'
                  ? 'மூவர்ஸ், பெயிண்டிங், பிளம்பிங், ஏசி பழுது அல்லது சட்ட ஆவண சேவைகளை கண்டறியுங்கள்.'
                  : 'Select from Movers & Packers, Renovation, Deep Cleaning, AC Care, or Legal Agreement services.'}
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-[#EFE8D8] shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center font-bold text-lg mx-auto shadow-xs">
                2
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {lang === 'ta' ? 'விலை மற்றும் விவரங்களைச் சரிபார்க்கவும்' : 'Check Verified Rates & Coverage'}
              </h3>
              <p className="text-sm text-gray-600 font-normal">
                {lang === 'ta'
                  ? 'தொடக்க விலை, சேவை பகுதிகள், அனுபவம் மற்றும் கூடுதல் அம்சங்களை எளிதாக பார்க்கவும்.'
                  : 'Review starting prices, service coverage, experience, and working hours with complete transparency.'}
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-[#EFE8D8] shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center font-bold text-lg mx-auto shadow-xs">
                3
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {lang === 'ta' ? 'தொலைபேசி அல்லது வாட்ஸ்அப் மூலம் நேரடி தொடர்பு' : 'Call or WhatsApp Directly'}
              </h3>
              <p className="text-sm text-gray-600 font-normal">
                {lang === 'ta'
                  ? 'உடனடியாக போன் செய்து அல்லது வாட்ஸ்அப் மெசேஜ் அனுப்பி உங்கள் தேவையைப் பேசி முடிக்கவும்.'
                  : 'Directly dial the provider or send a WhatsApp message instantly to book and get work done.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── For Service Providers CTA (Matching HomePage Property Owners CTA) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#FAF4E6] via-[#F8F1E0] to-[#F4E8D0] rounded-3xl p-8 sm:p-12 text-gray-900 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-[#E5DAC4]">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <span className="inline-block px-3.5 py-1 bg-white border border-[#E8DFC8] text-[#9A7818] rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
              {lang === 'ta' ? 'சேவை வழங்குநர்களுக்கு' : 'Service Partners & Property Owners'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight text-gray-900">
              {lang === 'ta'
                ? 'சென்னையில் உங்கள் சேவையை வழங்க விரும்புகிறீர்களா?'
                : 'Offer Home Services in Chennai? Grow Your Business!'}
            </h2>
            <p className="text-sm sm:text-base text-gray-700 font-normal">
              {lang === 'ta'
                ? 'ஆயிரக்கணக்கான வாடகை மற்றும் சொத்து தேடுபவர்களை நேரடியாக அடையுங்கள். இடைத்தரகர் இல்லை, நேரடி வாடிக்கையாளர் தொடர்பு.'
                : 'Connect with thousands of tenants and property owners seeking verified home services. Zero commission, direct leads.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleListServiceClick}
              className="px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#D4AF37]/25 text-center transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{lang === 'ta' ? 'சேவையை சேர்க்க (உரிமையாளர்கள்)' : 'List Your Service'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
            <Link
              to="/contact"
              className="px-6 py-3.5 bg-white hover:bg-[#FAF7F0] border border-[#E8DFC8] text-gray-800 font-bold text-sm rounded-2xl text-center transition shadow-xs flex items-center justify-center"
            >
              {lang === 'ta' ? 'உதவிக்கு தொடர்பு கொள்ள' : 'Contact Support'}
            </Link>
          </div>
        </div>
      </section>

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
