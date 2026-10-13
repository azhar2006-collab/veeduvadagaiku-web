import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Wrench, Sparkles, Wind, FileText, CheckCircle, AlertCircle, Upload, X, Plus, MapPin } from 'lucide-react';
import { SEOHead } from '../../components/common/SEOHead';
import { useLanguage } from '../../context/LanguageContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type Category = 'MOVERS' | 'RENOVATION' | 'CLEANING' | 'AC_SERVICE' | 'LEGAL';

interface CategoryConfig {
  id: Category;
  label: string;
  labelTa: string;
  icon: React.ReactNode;
  color: string;
  subcategories: string[];
  featuresPlaceholder: string[];
  pricingHint: string;
  specificFields: React.ReactNode | null;
}

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

const CATEGORY_CONFIGS: Record<Category, { label: string; labelTa: string; icon: React.ReactNode; color: string; subcategories: string[]; featuresPlaceholder: string[]; pricingHint: string }> = {
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
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    category: '' as Category | '',
    subcategory: '',
    title: '',
    description: '',
    providerName: '',
    phone: '',
    whatsapp: '',
    email: '',
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

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));
  const cfg = form.category ? CATEGORY_CONFIGS[form.category] : null;

  const toggleFeature = (f: string) => {
    if (form.features.includes(f)) set('features', form.features.filter(x => x !== f));
    else set('features', [...form.features, f]);
  };

  const toggleArea = (a: string) => {
    if (form.serviceAreas.includes(a)) set('serviceAreas', form.serviceAreas.filter(x => x !== a));
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
      const res = await fetch(`${API}/home-services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
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
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Submission failed');
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAFAF8]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            {lang === 'ta' ? 'சமர்ப்பிக்கப்பட்டது!' : 'Service Submitted!'}
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            {lang === 'ta'
              ? 'நன்றி! 24 மணி நேரத்திற்குள் உங்கள் சேவை வெளியிடப்படும்.'
              : 'Thank you! Your service listing will be reviewed and published within 24 hours.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/home-services" className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold rounded-xl text-sm">
              {lang === 'ta' ? 'சேவைகளை காண்க' : 'Browse Services'}
            </Link>
            <button onClick={() => { setSubmitted(false); setStep(0); setForm({ category: '', subcategory: '', title: '', description: '', providerName: '', phone: '', whatsapp: '', email: '', locality: '', serviceAreas: [], pricing: '', priceFrom: '', features: [], customFeature: '', imageUrl: '', experience: '', licenseNo: '', gstin: '', workingHours: '' }); }} className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm">
              {lang === 'ta' ? 'மேலும் சேர்க்க' : 'Add Another'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={lang === 'ta' ? 'சேவையை பட்டியலிடுங்கள் | VeeduVadagaiKu' : 'List Your Service | VeeduVadagaiKu'}
        description="List your home service on VeeduVadagaiKu — Movers, Renovation, Cleaning, AC Service, Legal Documentation"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1209] to-[#2d1f0a] px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {lang === 'ta' ? 'உங்கள் சேவையை பட்டியலிடுங்கள்' : 'List Your Service — FREE'}
          </h1>
          <p className="text-[#C5A059] text-sm">
            {lang === 'ta' ? 'சென்னை வாடகையாளர்களை நேரடியாக அடையுங்கள்' : 'Reach Chennai customers directly. 100% Free listing.'}
          </p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition ${
                  i < step ? 'bg-[#D4AF37] border-[#D4AF37] text-white'
                  : i === step ? 'border-[#D4AF37] text-[#9A7818] bg-[#FAF4E6]'
                  : 'border-gray-200 text-gray-400'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`hidden sm:block ml-2 text-xs font-semibold ${
                  i === step ? 'text-[#9A7818]' : i < step ? 'text-gray-700' : 'text-gray-400'
                }`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`mx-2 sm:mx-4 h-0.5 w-6 sm:w-10 ${
                  i < step ? 'bg-[#D4AF37]' : 'bg-gray-200'
                }`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* STEP 0: Choose Category */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 mb-1">{lang === 'ta' ? 'சேவை வகையை தேர்வு செய்யுங்கள்' : 'Choose Your Service Category'}</h2>
            <p className="text-gray-500 text-sm mb-6">{lang === 'ta' ? 'நீங்கள் வழங்கும் சேவையை தேர்வு செய்யுங்கள்' : 'Select the type of service you provide'}</p>
            <div className="space-y-3">
              {(Object.entries(CATEGORY_CONFIGS) as [Category, typeof CATEGORY_CONFIGS[Category]][]).map(([id, c]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => set('category', id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition ${
                    form.category === id
                      ? 'border-[#C5A059] bg-[#FAF4E6] shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl bg-white border border-gray-100 shadow-xs ${c.color}`}>
                    {c.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">{lang === 'ta' ? c.labelTa : c.label}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{c.subcategories.slice(0, 3).join(' · ')}</div>
                  </div>
                  {form.category === id && <div className="text-[#D4AF37] font-bold text-lg">✓</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Service Details */}
        {step === 1 && cfg && (
          <div className="space-y-5">
            <h2 className="text-lg font-extrabold text-gray-900">{lang === 'ta' ? 'சேவை விவரங்கள்' : 'Service Details'}</h2>

            {/* Subcategory */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">{lang === 'ta' ? 'உட்பிரிவு (விரும்பினால்)' : 'Subcategory (optional)'}</label>
              <div className="flex flex-wrap gap-2">
                {cfg.subcategories.map(s => (
                  <button key={s} type="button" onClick={() => set('subcategory', form.subcategory === s ? '' : s)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition ${
                      form.subcategory === s ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'ta' ? 'சேவை தலைப்பு *' : 'Service Title *'}</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder={lang === 'ta' ? 'எ.கா: KSR Movers & Packers Chennai' : 'e.g. KSR Movers & Packers Chennai'}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#D4AF37]/30" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'ta' ? 'விவரம் *' : 'Description *'}</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4}
                placeholder={lang === 'ta' ? 'உங்கள் சேவை பற்றி விரிவாக எழுதுங்கள்...' : 'Describe your service in detail — years of experience, what you offer, why customers should choose you...'}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059] resize-none" />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'ta' ? 'விலை விவரம் *' : 'Pricing Info *'}</label>
                <input type="text" value={form.pricing} onChange={e => set('pricing', e.target.value)}
                  placeholder={cfg.pricingHint}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059]" />
                <p className="text-[10px] text-gray-400 mt-1">{lang === 'ta' ? 'தொடக்க விலை அல்லது விலை விவரம்' : 'Starting price or pricing info for customers'}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'ta' ? 'தொடக்க விலை ₹' : 'Starting Price ₹'}</label>
                <input type="number" value={form.priceFrom} onChange={e => set('priceFrom', e.target.value)}
                  placeholder="e.g. 999"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059]" />
              </div>
            </div>

            {/* Locality */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'ta' ? 'முக்கிய இடம் *' : 'Your Base Locality *'}</label>
              <select value={form.locality} onChange={e => set('locality', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059] bg-white">
                <option value="">{lang === 'ta' ? 'இடத்தை தேர்வு செய்யுங்கள்' : 'Select your base locality'}</option>
                {CHENNAI_AREAS.map(a => <option key={a} value={a}>{a}, Chennai</option>)}
              </select>
            </div>

            {/* Service Areas */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">{lang === 'ta' ? 'சேவை செய்யும் பகுதிகள்' : 'Areas You Serve (select all)'}</label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {CHENNAI_AREAS.map(a => (
                  <button key={a} type="button" onClick={() => toggleArea(a)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                      form.serviceAreas.includes(a) ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>{a}</button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">{lang === 'ta' ? 'சிறப்பு அம்சங்கள்' : 'Key Features / USPs'}</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {cfg.featuresPlaceholder.map(f => (
                  <button key={f} type="button" onClick={() => toggleFeature(f)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition ${
                      form.features.includes(f) ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>{f}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={form.customFeature} onChange={e => set('customFeature', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                  placeholder={lang === 'ta' ? 'சொந்த அம்சம் சேர்க்க...' : 'Add custom feature...'}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#C5A059]" />
                <button type="button" onClick={addCustomFeature} className="px-3 py-2 bg-[#D4AF37] text-white rounded-xl text-xs font-bold">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.features.filter(f => !cfg.featuresPlaceholder.includes(f)).map(f => (
                <span key={f} className="inline-flex items-center gap-1 bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] text-xs px-2 py-1 rounded-lg mt-1.5 mr-1.5">
                  {f}
                  <button type="button" onClick={() => toggleFeature(f)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>

            {/* Working Hours */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'ta' ? 'செயல்பாட்டு நேரம்' : 'Working Hours'}</label>
              <input type="text" value={form.workingHours} onChange={e => set('workingHours', e.target.value)}
                placeholder="e.g. 8 AM – 8 PM, Mon–Sat"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059]" />
            </div>

            {/* Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'ta' ? 'அனுபவம்' : 'Years of Experience'}</label>
                <input type="text" value={form.experience} onChange={e => set('experience', e.target.value)}
                  placeholder="e.g. 5+ Years"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'ta' ? 'தொழில் உரிம எண்' : 'License / Reg. No. (optional)'}</label>
                <input type="text" value={form.licenseNo} onChange={e => set('licenseNo', e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059]" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Contact Info */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-extrabold text-gray-900">{lang === 'ta' ? 'தொடர்பு தகவல்' : 'Your Contact Information'}</h2>
            <p className="text-gray-500 text-sm">{lang === 'ta' ? 'வாடகையாளர்கள் உங்களை நேரடியாக தொடர்பு கொள்வார்கள்' : 'Customers will contact you directly through these details'}</p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'ta' ? 'உங்கள் பெயர் / நிறுவனம் *' : 'Your Name / Business Name *'}</label>
              <input type="text" value={form.providerName} onChange={e => set('providerName', e.target.value)}
                placeholder="e.g. KSR Movers / Ravi Kumar"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'ta' ? 'தொலைபேசி *' : 'Phone Number *'}</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">WhatsApp</label>
                <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
                  placeholder="9876543210 (optional)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'ta' ? 'மின்னஞ்சல்' : 'Email (optional)'}</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="yourservice@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">GSTIN (optional)</label>
              <input type="text" value={form.gstin} onChange={e => set('gstin', e.target.value)}
                placeholder="22AAAAA0000A1Z5"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A059]" />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
              <p className="font-bold mb-1">📋 {lang === 'ta' ? 'தனியுரிமை குறிப்பு' : 'Privacy Note'}</p>
              <p>{lang === 'ta' ? 'உங்கள் தொடர்பு தகவல் பார்வையாளர்களுக்கு தெரியும். GSTIN விவரங்கள் வெளியிடப்படாது.' : 'Your contact info will be visible to customers. GSTIN is kept private for verification only.'}</p>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && cfg && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-gray-900">{lang === 'ta' ? 'சமர்ப்பிப்பதற்கு முன் சரிபார்க்கவும்' : 'Review Before Submitting'}</h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-[#FAF4E6] px-5 py-3 border-b border-[#E8DFC8] flex items-center gap-2">
                <span className={cfg.color}>{cfg.icon}</span>
                <span className="font-bold text-gray-800 text-sm">{lang === 'ta' ? cfg.labelTa : cfg.label}</span>
                {form.subcategory && <span className="text-[11px] text-gray-500 ml-auto">{form.subcategory}</span>}
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div><span className="font-bold text-gray-700">Title:</span> <span className="text-gray-600">{form.title}</span></div>
                <div><span className="font-bold text-gray-700">Description:</span> <span className="text-gray-600 line-clamp-3">{form.description}</span></div>
                <div><span className="font-bold text-gray-700">Pricing:</span> <span className="text-[#9A7818] font-semibold">{form.pricing}</span></div>
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-500" /><span className="text-gray-600">{form.locality}, Chennai</span></div>
                {form.serviceAreas.length > 0 && <div><span className="font-bold text-gray-700">Service Areas:</span> <span className="text-gray-600">{form.serviceAreas.join(', ')}</span></div>}
                {form.features.length > 0 && (
                  <div>
                    <span className="font-bold text-gray-700">Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.features.map(f => <span key={f} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg">{f}</span>)}
                    </div>
                  </div>
                )}
                <hr className="border-gray-100" />
                <div><span className="font-bold text-gray-700">Provider:</span> <span className="text-gray-600">{form.providerName}</span></div>
                <div><span className="font-bold text-gray-700">Phone:</span> <span className="text-gray-600">{form.phone}</span></div>
                {form.whatsapp && <div><span className="font-bold text-gray-700">WhatsApp:</span> <span className="text-gray-600">{form.whatsapp}</span></div>}
                {form.experience && <div><span className="font-bold text-gray-700">Experience:</span> <span className="text-gray-600">{form.experience}</span></div>}
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <p className="text-[11px] text-gray-400">
              {lang === 'ta' ? '* சமர்ப்பித்த பின் 24 மணி நேரத்திற்குள் நாங்கள் சரிபார்த்து வெளியிடுவோம்.' : '* After submission, our team will review and publish your listing within 24 hours.'}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/home-services')}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
          >
            {step === 0 ? (lang === 'ta' ? 'ரத்து செய்' : 'Cancel') : (lang === 'ta' ? 'முந்தையது' : 'Back')}
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 transition"
            >
              {lang === 'ta' ? 'அடுத்தது →' : 'Next →'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold rounded-xl text-sm disabled:opacity-50 hover:brightness-105 transition"
            >
              {submitting ? '⏳ Submitting...' : (lang === 'ta' ? '✓ சமர்ப்பிக்க' : '✓ Submit Listing')}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
