import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  Wrench,
  Sparkles,
  Wind,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  MapPin,
  Lock,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { SEOHead } from '../../components/common/SEOHead';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { homeServiceApi } from '../../services/homeService.service';
import toast from 'react-hot-toast';

type Category = 'MOVERS' | 'RENOVATION' | 'CLEANING' | 'AC_SERVICE' | 'LEGAL';

const CHENNAI_AREAS = [
  'Anna Nagar', 'T. Nagar', 'Velachery', 'Adyar', 'Tambaram', 'Porur',
  'Chromepet', 'Perambur', 'Egmore', 'Nungambakkam', 'Kodambakkam', 'Mylapore',
  'Besant Nagar', 'Medavakkam', 'Pallavaram', 'Guduvanchery', 'Sholinganallur',
  'Perungudi', 'Thoraipakkam', 'Kelambakkam', 'Navalur', 'Siruseri', 'Ambattur',
  'Avadi', 'Poonamallee', 'Sriperumbudur', 'Koyambedu', 'Vadapalani', 'Ashok Nagar',
  'Virugambakkam', 'Saligramam', 'Valasaravakkam', 'Mogappair', 'Kolathur',
  'Villivakkam', 'Thiruvottiyur', 'Manali', 'Ennore', 'Tondiarpet', 'Royapuram',
  'Broadway', 'Washermanpet', 'Choolai', 'Vepery', 'Kilpauk', 'Chetpet',
  'Purasaiwalkam', 'Ayanavaram', 'Pattabiram', 'Selaiyur', 'Chitlapakkam',
];

const CATEGORY_CONFIGS: Record<
  Category,
  {
    label: string;
    labelTa: string;
    icon: React.ReactNode;
    color: string;
    subcategories: string[];
    featuresPlaceholder: string[];
    pricingHint: string;
  }
> = {
  MOVERS: {
    label: 'Movers & Packers',
    labelTa: 'மூவர்ஸ் & பேக்கர்ஸ்',
    icon: <Truck className="w-5 h-5" />,
    color: 'text-blue-600',
    subcategories: ['Local Shifting', 'Intercity Shifting', 'Office Relocation', 'Vehicle Transport', 'Storage & Warehousing'],
    featuresPlaceholder: ['Packing Material Provided', 'GPS Tracking', 'Insurance Covered', 'Same-day Available', 'Heavy Furniture', 'Door-to-Door'],
    pricingHint: 'e.g. Starting ₹2,000 for 1BHK / Contact for quote',
  },
  RENOVATION: {
    label: 'Renovation & Repairs',
    labelTa: 'புதுப்பித்தல் & பழுது',
    icon: <Wrench className="w-5 h-5" />,
    color: 'text-orange-600',
    subcategories: ['Electrical Work', 'Plumbing', 'Painting', 'Flooring & Tiles', 'Carpentry & Woodwork', 'Civil & Masonry', 'False Ceiling', 'Full Home Renovation', 'Waterproofing'],
    featuresPlaceholder: ['Licensed Electrician', 'Material Supply Included', 'Free Inspection', 'Warranty Provided', 'Skilled Workers', 'Timely Completion'],
    pricingHint: 'e.g. Painting ₹8/sqft | Electrical ₹500/point | Contact for quote',
  },
  CLEANING: {
    label: 'Cleaning & Pest Control',
    labelTa: 'துப்புரவு & பூச்சி கட்டுப்பாடு',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-green-600',
    subcategories: ['Deep Home Cleaning', 'Sofa & Carpet Cleaning', 'Kitchen Deep Clean', 'Bathroom Cleaning', 'Cockroach Treatment', 'Mosquito Treatment', 'Termite Treatment', 'Rodent Control', 'General Pest Control'],
    featuresPlaceholder: ['Eco-friendly Products', 'Licensed Technicians', 'AMC Available', 'Odorless Treatment', 'Post-Service Guarantee', 'Chemical-free Option'],
    pricingHint: 'e.g. Home cleaning ₹1,500 | Pest control ₹999 per visit',
  },
  AC_SERVICE: {
    label: 'AC Service & Cleaning',
    labelTa: 'AC சேவை & துப்புரவு',
    icon: <Wind className="w-5 h-5" />,
    color: 'text-cyan-600',
    subcategories: ['AC Service & Gas Refill', 'AC Deep Cleaning', 'AC Installation', 'AC Uninstallation', 'AC Repair', 'Split AC', 'Window AC', 'Cassette AC'],
    featuresPlaceholder: ['All Brands Serviced', 'Gas Refill Available', 'Annual Maintenance Contract', 'Same-day Service', 'Warranty on Parts', 'OEM Spare Parts'],
    pricingHint: 'e.g. AC Service ₹599 | Installation ₹999 | Gas Refill ₹1,200',
  },
  LEGAL: {
    label: 'Legal Documentation & Services',
    labelTa: 'சட்ட ஆவண சேவைகள்',
    icon: <FileText className="w-5 h-5" />,
    color: 'text-purple-600',
    subcategories: ['Rental Agreement', 'Property Registration', 'Sale Deed', 'Legal Notice', 'Lease Agreement', 'Power of Attorney', 'Will Drafting', 'Property Valuation', 'Tenant Police Verification'],
    featuresPlaceholder: ['Notary Available', 'Home Visit Service', 'Online Documentation', 'Fast Processing', 'Stamp Paper Provided', 'Registration Assistance'],
    pricingHint: 'e.g. Rental Agreement ₹500 | Registration assistance ₹2,000',
  },
};

const STEPS = ['Category', 'Service Details', 'Contact Info', 'Review & Submit'];

export const AddServicePage: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { user, token, isAuthenticated, isOwner, isAdmin } = useAuth();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    category: '' as Category | '',
    subcategory: '',
    title: '',
    description: '',
    providerName: user?.name || '',
    phone: user?.mobile || '',
    whatsapp: user?.mobile || '',
    email: user?.email || '',
    locality: '',
    serviceAreas: [] as string[],
    pricing: '',
    priceFrom: '',
    features: [] as string[],
    customFeature: '',
    imageUrl: '',
    experience: '',
    licenseNo: '',
    gstin: '',
    workingHours: '',
  });

  // Pre-fill user data when loaded
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        providerName: f.providerName || user.name || '',
        phone: f.phone || user.mobile || '',
        whatsapp: f.whatsapp || user.mobile || '',
        email: f.email || user.email || '',
      }));
    }
  }, [user]);

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const cfg = form.category ? CATEGORY_CONFIGS[form.category] : null;

  const toggleFeature = (f: string) => {
    if (form.features.includes(f)) set('features', form.features.filter((x) => x !== f));
    else set('features', [...form.features, f]);
  };

  const toggleArea = (a: string) => {
    if (form.serviceAreas.includes(a)) set('serviceAreas', form.serviceAreas.filter((x) => x !== a));
    else set('serviceAreas', [...form.serviceAreas, a]);
  };

  const addCustomFeature = () => {
    const f = form.customFeature.trim();
    if (f && !form.features.includes(f)) set('features', [...form.features, f]);
    set('customFeature', '');
  };

  const canNext = () => {
    if (step === 0) return !!form.category;
    if (step === 1) return !!(form.title && form.description && form.pricing && form.locality);
    if (step === 2) return !!(form.providerName && form.phone);
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await homeServiceApi.createService({
        category: form.category as any,
        subcategory: form.subcategory || undefined,
        title: form.title,
        description: form.description,
        providerName: form.providerName,
        phone: form.phone,
        whatsapp: form.whatsapp || undefined,
        email: form.email || undefined,
        locality: form.locality,
        serviceAreas: form.serviceAreas,
        pricing: form.pricing,
        priceFrom: form.priceFrom ? parseFloat(form.priceFrom) : undefined,
        features: form.features,
        imageUrl: form.imageUrl || undefined,
        experience: form.experience || undefined,
        licenseNo: form.licenseNo || undefined,
        gstin: form.gstin || undefined,
        workingHours: form.workingHours || undefined,
      });

      setSubmitted(true);
      toast.success('🎉 Service submitted for admin review!');
    } catch (e: any) {
      console.error('Home service submission error:', e);
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        'Submission failed. Please check your connection and try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Owner Access Gate ───
  if (!isAuthenticated || (!isOwner && !isAdmin)) {
    return (
      <div className="min-h-screen bg-[#FCFAF6] flex flex-col justify-center items-center px-4 py-16">
        <SEOHead
          title={lang === 'ta' ? 'உரிமையாளர் உள்நுழைவு | VeeduVadagaiKu' : 'Owner Login Required | VeeduVadagaiKu'}
          description="Owner access is required to list home services on VeeduVadagaiKu."
        />
        <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E8DFC8] shadow-xl text-center space-y-5 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8] flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8 text-[#C5A059]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] text-xs font-bold">
              <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{lang === 'ta' ? 'உரிமையாளர்களுக்கு மட்டும்' : 'Owner Access Only'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              {lang === 'ta' ? 'சேவையை பதிவேற்ற உரிமையாளர் கணக்கு தேவை' : 'Owner Account Required'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isAuthenticated
                ? lang === 'ta'
                  ? 'நீங்கள் வாடகை பயனர் கணக்கில் உள்நுழைந்துள்ளீர்கள். சரிபார்க்கப்பட்ட சொத்து மற்றும் தொழில் உரிமையாளர்கள் மட்டுமே சேவைகளை பதிவேற்ற முடியும்.'
                  : 'You are signed in with a Tenant account. Only registered Property and Business Owners can upload and post services.'
                : lang === 'ta'
                ? 'சரிபார்க்கப்பட்ட உரிமையாளர்கள் மற்றும் சேவை வழங்குநர்கள் மட்டுமே சேவைகளை பதிவேற்ற முடியும். தொடர உரிமையாளராக உள்நுழையவும்.'
                : 'Only verified Property and Business Owners can upload and post services. Please log in or register as an Owner.'}
            </p>
          </div>

          <div className="space-y-3 pt-2">
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

            <Link
              to="/home-services"
              className="inline-block text-xs text-gray-500 hover:text-gray-800 font-medium transition pt-1"
            >
              {lang === 'ta' ? '← வீட்டு சேவைகளுக்கு திரும்பு' : '← Back to Home Services'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Success Confirmation Screen ───
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#FCFAF6]">
        <div className="bg-white rounded-3xl border border-[#E8DFC8] p-8 max-w-md w-full text-center shadow-xl space-y-4 animate-scale-in">
          <div className="w-16 h-16 bg-[#FAF4E6] border border-[#E8DFC8] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
            <CheckCircle className="w-9 h-9 text-[#C5A059]" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            {lang === 'ta' ? 'சேவை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!' : 'Service Submitted Successfully!'}
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
            {lang === 'ta'
              ? 'நன்றி! எங்கள் நிர்வாக குழு உங்கள் சேவையை 24 மணி நேரத்திற்குள் சரிபார்த்து இணையதளத்தில் வெளியிடும்.'
              : 'Thank you! Your listing is under review and will be published live on the platform within 24 hours.'}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              to="/home-services"
              className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:brightness-105 transition"
            >
              {lang === 'ta' ? 'சேவைகளை காண்க' : 'Browse Services'}
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setStep(0);
                setForm({
                  category: '',
                  subcategory: '',
                  title: '',
                  description: '',
                  providerName: user?.name || '',
                  phone: user?.mobile || '',
                  whatsapp: user?.mobile || '',
                  email: user?.email || '',
                  locality: '',
                  serviceAreas: [],
                  pricing: '',
                  priceFrom: '',
                  features: [],
                  customFeature: '',
                  imageUrl: '',
                  experience: '',
                  licenseNo: '',
                  gstin: '',
                  workingHours: '',
                });
              }}
              className="px-5 py-2.5 border border-[#E8DFC8] bg-[#FAF7F0] text-gray-700 font-semibold rounded-xl text-xs sm:text-sm hover:bg-[#F5EDD8] transition"
            >
              {lang === 'ta' ? 'மற்றொரு சேவையை சேர்க்க' : 'Add Another Service'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF6] pb-16">
      <SEOHead
        title={lang === 'ta' ? 'சேவையை பட்டியலிடுங்கள் | VeeduVadagaiKu' : 'List Your Service | VeeduVadagaiKu'}
        description="List your home service on VeeduVadagaiKu — Movers, Renovation, Cleaning, AC Service, Legal Documentation"
      />

      {/* ─── Header (Matching HomePage White & Lite Gold Theme) ─── */}
      <div className="relative overflow-x-hidden pt-6 pb-6 sm:pb-8 px-4 sm:px-6 bg-gradient-to-b from-[#FCFAF6] via-white to-[#F8F5EE] border-b border-[#EFE8D8]">
        <div
          className="absolute -top-32 -right-32 w-[350px] h-[350px] rounded-full pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }}
        />
        <div className="max-w-2xl mx-auto text-center relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] text-[10px] sm:text-xs font-bold tracking-wide shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{lang === 'ta' ? 'உரிமையாளர் சேவை பட்டியல்' : 'Owner & Provider Listing Portal'}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-[#1E2329]">
            {lang === 'ta' ? 'உங்கள் சேவையை பட்டியலிடுங்கள்' : 'List Your Home Service'}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            {lang === 'ta'
              ? 'சென்னை வாடகையாளர்களை நேரடியாக அடையுங்கள் · 100% நேரடி வாடிக்கையாளர் தொடர்பு'
              : 'Reach thousands of Chennai tenants directly with zero commission.'}
          </p>
        </div>
      </div>

      {/* ─── Step Progress (Gold Accent) ─── */}
      <div className="bg-white border-b border-[#EFE8D8] px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition ${
                    i < step
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] border-[#C5A059] text-white shadow-xs'
                      : i === step
                      ? 'border-[#C5A059] text-[#9A7818] bg-[#FAF4E6] shadow-xs'
                      : 'border-gray-200 text-gray-400 bg-white'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span
                  className={`hidden sm:block ml-2 text-xs font-bold ${
                    i === step ? 'text-[#9A7818]' : i < step ? 'text-gray-800' : 'text-gray-400'
                  }`}
                >
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-2 sm:mx-4 h-0.5 w-6 sm:w-10 ${
                      i < step ? 'bg-[#D4AF37]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Form Body ─── */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* STEP 0: Choose Category */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 mb-1">
                {lang === 'ta' ? 'சேவை வகையை தேர்வு செய்யுங்கள்' : 'Choose Your Service Category'}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm">
                {lang === 'ta'
                  ? 'நீங்கள் வழங்கும் பிரதான சேவையை தேர்ந்தெடுக்கவும்'
                  : 'Select the primary category of service you provide in Chennai'}
              </p>
            </div>
            <div className="space-y-3">
              {(Object.entries(CATEGORY_CONFIGS) as [Category, typeof CATEGORY_CONFIGS[Category]][]).map(
                ([id, c]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => set('category', id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition ${
                      form.category === id
                        ? 'border-[#C5A059] bg-[#FAF4E6] shadow-md'
                        : 'border-[#E8DFC8] bg-white hover:border-[#C5A059] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl bg-white border border-[#E8DFC8] shadow-2xs ${c.color}`}>
                      {c.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-sm">{lang === 'ta' ? c.labelTa : c.label}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{c.subcategories.slice(0, 3).join(' · ')}</div>
                    </div>
                    {form.category === id && (
                      <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        ✓
                      </div>
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* STEP 1: Service Details */}
        {step === 1 && cfg && (
          <div className="bg-white rounded-3xl border border-[#E8DFC8] p-6 shadow-sm space-y-5">
            <div className="border-b border-[#F0E8D5] pb-3">
              <h2 className="text-lg font-extrabold text-gray-900">
                {lang === 'ta' ? 'சேவை விவரங்கள்' : 'Service Details'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'ta' ? 'உங்கள் சேவையின் முக்கிய அம்சங்கள்' : 'Provide details so customers can find and evaluate your service'}
              </p>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                {lang === 'ta' ? 'உட்பிரிவு (விரும்பினால்)' : 'Subcategory / Specialization'}
              </label>
              <div className="flex flex-wrap gap-2">
                {cfg.subcategories.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('subcategory', form.subcategory === s ? '' : s)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition ${
                      form.subcategory === s
                        ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818] shadow-2xs'
                        : 'border-[#E8DFC8] bg-white text-gray-600 hover:bg-[#FAF7F0]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                {lang === 'ta' ? 'சேவை தலைப்பு *' : 'Service Title *'}
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder={lang === 'ta' ? 'எ.கா: KSR Movers & Packers Chennai' : 'e.g. KSR Movers & Packers Chennai'}
                className="w-full px-4 py-3 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#D4AF37]/30"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                {lang === 'ta' ? 'விவரம் *' : 'Description *'}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                placeholder={
                  lang === 'ta'
                    ? 'உங்கள் சேவை பற்றி விரிவாக எழுதுங்கள்...'
                    : 'Describe your service in detail — experience, what is included, special equipment, guarantee...'
                }
                className="w-full px-4 py-3 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-sm focus:outline-none focus:border-[#C5A059] resize-none"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  {lang === 'ta' ? 'விலை விவரம் *' : 'Pricing Info *'}
                </label>
                <input
                  type="text"
                  value={form.pricing}
                  onChange={(e) => set('pricing', e.target.value)}
                  placeholder={cfg.pricingHint}
                  className="w-full px-4 py-3 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-sm focus:outline-none focus:border-[#C5A059]"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  {lang === 'ta' ? 'தொடக்க விலை அல்லது விலை விவரம்' : 'Starting price description for customers'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  {lang === 'ta' ? 'தொடக்க எண் விலை ₹' : 'Starting Price ₹ (Numerical)'}
                </label>
                <input
                  type="number"
                  value={form.priceFrom}
                  onChange={(e) => set('priceFrom', e.target.value)}
                  placeholder="e.g. 999"
                  className="w-full px-4 py-3 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-sm focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            {/* Base Locality */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                {lang === 'ta' ? 'முக்கிய இடம் *' : 'Your Base Locality *'}
              </label>
              <select
                value={form.locality}
                onChange={(e) => set('locality', e.target.value)}
                className="w-full px-4 py-3 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-sm focus:outline-none focus:border-[#C5A059]"
              >
                <option value="">{lang === 'ta' ? 'இடத்தை தேர்வு செய்யுங்கள்' : 'Select your base locality'}</option>
                {CHENNAI_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}, Chennai
                  </option>
                ))}
              </select>
            </div>

            {/* Service Areas */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                {lang === 'ta' ? 'சேவை செய்யும் பகுதிகள்' : 'Areas You Serve (Select All)'}
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-[#E8DFC8] rounded-xl bg-[#FCFAF5]">
                {CHENNAI_AREAS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleArea(a)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                      form.serviceAreas.includes(a)
                        ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818] font-bold'
                        : 'border-[#E8DFC8] bg-white text-gray-600 hover:bg-[#FAF7F0]'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                {lang === 'ta' ? 'சிறப்பு அம்சங்கள்' : 'Key Highlights & Guarantees'}
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {cfg.featuresPlaceholder.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFeature(f)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition ${
                      form.features.includes(f)
                        ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818]'
                        : 'border-[#E8DFC8] bg-white text-gray-600 hover:bg-[#FAF7F0]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.customFeature}
                  onChange={(e) => set('customFeature', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                  placeholder={lang === 'ta' ? 'சொந்த அம்சம் சேர்க்க...' : 'Add custom highlight...'}
                  className="flex-1 px-3 py-2 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-xs focus:outline-none focus:border-[#C5A059]"
                />
                <button
                  type="button"
                  onClick={addCustomFeature}
                  className="px-3 py-2 bg-[#D4AF37] text-white rounded-xl text-xs font-bold hover:brightness-105"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.features
                .filter((f) => !cfg.featuresPlaceholder.includes(f))
                .map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] text-xs px-2 py-1 rounded-lg mt-1.5 mr-1.5"
                  >
                    {f}
                    <button type="button" onClick={() => toggleFeature(f)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>

            {/* Working Hours & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  {lang === 'ta' ? 'அனுபவம்' : 'Years of Experience'}
                </label>
                <input
                  type="text"
                  value={form.experience}
                  onChange={(e) => set('experience', e.target.value)}
                  placeholder="e.g. 5+ Years"
                  className="w-full px-4 py-3 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-sm focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  {lang === 'ta' ? 'செயல்பாட்டு நேரம்' : 'Working Hours'}
                </label>
                <input
                  type="text"
                  value={form.workingHours}
                  onChange={(e) => set('workingHours', e.target.value)}
                  placeholder="e.g. 8 AM – 8 PM, Mon–Sat"
                  className="w-full px-4 py-3 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-sm focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Contact Info */}
        {step === 2 && (
          <div className="bg-white rounded-3xl border border-[#E8DFC8] p-6 shadow-sm space-y-5">
            <div className="border-b border-[#F0E8D5] pb-3">
              <h2 className="text-lg font-extrabold text-gray-900">
                {lang === 'ta' ? 'தொடர்பு தகவல்' : 'Your Contact Information'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'ta'
                  ? 'வாடிக்கையாளர்கள் உங்களை நேரடியாக தொடர்பு கொள்வார்கள்'
                  : 'Customers will contact you directly through these verified details'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                {lang === 'ta' ? 'உங்கள் பெயர் / வணிக பெயர் *' : 'Provider Name / Business Name *'}
              </label>
              <input
                type="text"
                value={form.providerName}
                onChange={(e) => set('providerName', e.target.value)}
                placeholder="e.g. KSR Movers / Ravi Kumar"
                className="w-full px-4 py-3 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-sm focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  {lang === 'ta' ? 'தொலைபேசி எண் *' : 'Phone Number *'}
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-sm focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => set('whatsapp', e.target.value)}
                  placeholder="9876543210 (optional)"
                  className="w-full px-4 py-3 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-sm focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  {lang === 'ta' ? 'மின்னஞ்சல்' : 'Email (Optional)'}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="yourservice@email.com"
                  className="w-full px-4 py-3 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-sm focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  GSTIN / License (Optional)
                </label>
                <input
                  type="text"
                  value={form.gstin}
                  onChange={(e) => set('gstin', e.target.value)}
                  placeholder="Optional verification"
                  className="w-full px-4 py-3 bg-[#FCFAF5] border border-[#E8DFC8] rounded-xl text-sm focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="bg-[#FAF4E6] border border-[#E8DFC8] rounded-2xl p-4 text-xs text-[#9A7818]">
              <p className="font-bold mb-1">📋 {lang === 'ta' ? 'பாதுகாப்பு & தனியுரிமை' : 'Verified Direct Connect'}</p>
              <p>
                {lang === 'ta'
                  ? 'உங்கள் தொலைபேசி மற்றும் வாட்ஸ்அப் எண்கள் வாடிக்கையாளர்களுக்கு நேரடியாக காண்பிக்கப்படும்.'
                  : 'Your phone and WhatsApp will be visible to potential tenants and buyers for instant direct contact.'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && cfg && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-gray-900">
              {lang === 'ta' ? 'சமர்ப்பிப்பதற்கு முன் சரிபார்க்கவும்' : 'Review Before Submitting'}
            </h2>
            <div className="bg-white border border-[#E8DFC8] rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-[#FAF4E6] px-5 py-3 border-b border-[#E8DFC8] flex items-center gap-2">
                <span className={cfg.color}>{cfg.icon}</span>
                <span className="font-bold text-gray-800 text-sm">
                  {lang === 'ta' ? cfg.labelTa : cfg.label}
                </span>
                {form.subcategory && (
                  <span className="text-[11px] text-gray-600 ml-auto bg-white px-2 py-0.5 rounded-md border border-[#E8DFC8]">
                    {form.subcategory}
                  </span>
                )}
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div>
                  <span className="font-bold text-gray-700">Title:</span>{' '}
                  <span className="text-gray-600">{form.title}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Description:</span>{' '}
                  <span className="text-gray-600 line-clamp-3">{form.description}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Pricing:</span>{' '}
                  <span className="text-[#9A7818] font-bold">{form.pricing}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-600">{form.locality}, Chennai</span>
                </div>
                {form.serviceAreas.length > 0 && (
                  <div>
                    <span className="font-bold text-gray-700">Service Coverage:</span>{' '}
                    <span className="text-gray-600">{form.serviceAreas.join(', ')}</span>
                  </div>
                )}
                {form.features.length > 0 && (
                  <div>
                    <span className="font-bold text-gray-700">Highlights:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.features.map((f) => (
                        <span key={f} className="text-[11px] bg-[#FAF7F0] border border-[#E8DFC8] text-gray-700 px-2 py-0.5 rounded-lg">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <hr className="border-gray-100" />
                <div>
                  <span className="font-bold text-gray-700">Provider:</span>{' '}
                  <span className="text-gray-600">{form.providerName}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Phone:</span>{' '}
                  <span className="text-gray-600">{form.phone}</span>
                </div>
                {form.whatsapp && (
                  <div>
                    <span className="font-bold text-gray-700">WhatsApp:</span>{' '}
                    <span className="text-gray-600">{form.whatsapp}</span>
                  </div>
                )}
                {form.experience && (
                  <div>
                    <span className="font-bold text-gray-700">Experience:</span>{' '}
                    <span className="text-gray-600">{form.experience}</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <p className="text-[11px] text-gray-500">
              {lang === 'ta'
                ? '* சமர்ப்பித்த பின் 24 மணி நேரத்திற்குள் எங்கள் குழு சரிபார்த்து பட்டியலிடும்.'
                : '* After submission, our verification team will review and approve your listing within 24 hours.'}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#EFE8D8]">
          <button
            type="button"
            onClick={() => (step > 0 ? setStep((s) => s - 1) : navigate('/home-services'))}
            className="px-5 py-2.5 border border-[#E8DFC8] bg-white text-gray-700 font-semibold rounded-xl text-sm hover:bg-[#FAF7F0] transition"
          >
            {step === 0 ? (lang === 'ta' ? 'ரத்து செய்' : 'Cancel') : (lang === 'ta' ? 'முந்தையது' : 'Back')}
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 transition shadow-sm"
            >
              {lang === 'ta' ? 'அடுத்தது →' : 'Next →'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold rounded-xl text-sm disabled:opacity-50 hover:brightness-105 transition shadow-md"
            >
              {submitting ? '⏳ Submitting...' : lang === 'ta' ? '✓ சமர்ப்பிக்க' : '✓ Submit Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
