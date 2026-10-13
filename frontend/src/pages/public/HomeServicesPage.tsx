import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, Star, Wrench, Truck, Sparkles, Wind, FileText, ChevronRight, Plus, Clock, Shield } from 'lucide-react';
import { SEOHead } from '../../components/common/SEOHead';
import { useLanguage } from '../../context/LanguageContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

const CATEGORIES: { id: ServiceCategory; label: string; labelTa: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { id: 'ALL', label: 'All Services', labelTa: 'அனைத்து சேவைகளும்', icon: <Sparkles className="w-4 h-4" />, color: 'text-gray-700', bg: 'bg-gray-100' },
  { id: 'MOVERS', label: 'Movers & Packers', labelTa: 'மூவர்ஸ் & பேக்கர்ஸ்', icon: <Truck className="w-4 h-4" />, color: 'text-blue-700', bg: 'bg-blue-50' },
  { id: 'RENOVATION', label: 'Renovation & Repairs', labelTa: 'புதுப்பித்தல் & பழுது', icon: <Wrench className="w-4 h-4" />, color: 'text-orange-700', bg: 'bg-orange-50' },
  { id: 'CLEANING', label: 'Cleaning & Pest Control', labelTa: 'துப்புரவு & பூச்சி கட்டுப்பாடு', icon: <Sparkles className="w-4 h-4" />, color: 'text-green-700', bg: 'bg-green-50' },
  { id: 'AC_SERVICE', label: 'AC Service & Cleaning', labelTa: 'AC சேவை & துப்புரவு', icon: <Wind className="w-4 h-4" />, color: 'text-cyan-700', bg: 'bg-cyan-50' },
  { id: 'LEGAL', label: 'Legal Documentation', labelTa: 'சட்ட ஆவணங்கள்', icon: <FileText className="w-4 h-4" />, color: 'text-purple-700', bg: 'bg-purple-50' },
];

const getCategoryMeta = (cat: string) => CATEGORIES.find(c => c.id === cat) || CATEGORIES[0];

export const HomeServicesPage: React.FC = () => {
  const { lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('ALL');
  const [services, setServices] = useState<HomeService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = activeCategory === 'ALL'
      ? `${API}/home-services?limit=50`
      : `${API}/home-services?category=${activeCategory}&limit=50`;
    fetch(url)
      .then(r => r.json())
      .then(d => setServices(d.services || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <>
      <SEOHead
        title={lang === 'ta' ? 'சென்னை வீட்டு சேவைகள் | VeeduVadagaiKu' : 'Chennai Home Services | VeeduVadagaiKu'}
        description="Find trusted movers, renovation experts, AC service, cleaning, pest control, and legal services in Chennai"
      />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1a1209] via-[#2d1f0a] to-[#1a1209] py-12 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 50%), radial-gradient(circle at 80% 20%, #C5A059 0%, transparent 40%)' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>{lang === 'ta' ? 'சரிபார்க்கப்பட்ட வல்லுநர்கள்' : 'Verified Professionals'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            {lang === 'ta' ? 'சென்னை வீட்டு சேவைகள்' : 'Chennai Home Services'}
          </h1>
          <p className="text-[#C5A059] text-sm sm:text-base font-medium mb-6">
            {lang === 'ta' ? 'நம்பகமான வல்லுநர்கள் — மூவர்ஸ், புதுப்பித்தல், AC, துப்புரவு, சட்ட ஆவணங்கள்' : 'Trusted professionals for Movers, Renovation, AC, Cleaning & Legal needs'}
          </p>
          <Link
            to="/home-services/list"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold px-6 py-3 rounded-xl text-sm shadow-lg hover:brightness-105 transition"
          >
            <Plus className="w-4 h-4" />
            {lang === 'ta' ? 'உங்கள் சேவையை பட்டியலிடுங்கள்' : 'List Your Service — FREE'}
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                activeCategory === cat.id
                  ? 'bg-[#FAF4E6] border-[#C5A059] text-[#9A7818] shadow-xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.icon}
              {lang === 'ta' ? cat.labelTa : cat.label}
            </button>
          ))}
        </div>

        {/* Service Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔧</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">
              {lang === 'ta' ? 'இன்னும் சேவைகள் வரவில்லை' : 'No services listed yet'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {lang === 'ta' ? 'முதலில் உங்கள் சேவையை பட்டியலிடுங்கள்!' : 'Be the first to list your service in this category!'}
            </p>
            <Link
              to="/home-services/list"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold px-6 py-3 rounded-xl text-sm"
            >
              <Plus className="w-4 h-4" />
              {lang === 'ta' ? 'சேவையை சேர்க்கவும்' : 'Add Your Service'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(service => {
              const catMeta = getCategoryMeta(service.category);
              return (
                <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden group">
                  {/* Category Badge strip */}
                  <div className={`px-4 py-2 flex items-center gap-1.5 ${catMeta.bg}`}>
                    <span className={catMeta.color}>{catMeta.icon}</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wide ${catMeta.color}`}>
                      {lang === 'ta' ? catMeta.labelTa : catMeta.label}
                    </span>
                    {service.subcategory && (
                      <span className="ml-auto text-[10px] text-gray-500 font-medium">{service.subcategory}</span>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Provider name + experience */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-extrabold text-gray-900 text-sm leading-tight">{service.providerName}</h3>
                      {service.experience && (
                        <span className="flex-shrink-0 bg-[#FAF4E6] text-[#9A7818] text-[10px] font-bold px-2 py-0.5 rounded-lg border border-[#E8DFC8]">
                          {service.experience}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 text-xs font-semibold mb-1">{service.title}</p>

                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-3">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>{service.locality}</span>
                      {service.serviceAreas.length > 0 && (
                        <span className="text-[10px] text-gray-400">· {service.serviceAreas.slice(0, 2).join(', ')}{service.serviceAreas.length > 2 ? '...' : ''}</span>
                      )}
                    </div>

                    <p className="text-gray-600 text-[11px] leading-relaxed line-clamp-2 mb-3">{service.description}</p>

                    {/* Features chips */}
                    {service.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {service.features.slice(0, 3).map((f, i) => (
                          <span key={i} className="text-[10px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-lg">{f}</span>
                        ))}
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-[10px] text-gray-400 font-medium">Starting Price</div>
                        <div className="text-sm font-extrabold text-[#9A7818]">{service.pricing}</div>
                      </div>
                      {service.workingHours && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{service.workingHours}</span>
                        </div>
                      )}
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex gap-2">
                      <a
                        href={`tel:${service.phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] text-xs font-bold rounded-xl hover:bg-[#F5EDD8] transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {lang === 'ta' ? 'அழைக்க' : 'Call'}
                      </a>
                      {service.whatsapp && (
                        <a
                          href={`https://wa.me/91${service.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl hover:bg-green-100 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#1a1209] via-[#2d1f0a] to-[#1a1209] rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #D4AF37 0%, transparent 60%)' }} />
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold text-white mb-2">
              {lang === 'ta' ? 'உங்கள் சேவையை இங்கே பட்டியலிடுங்கள்!' : 'Grow Your Business with VeeduVadagaiKu!'}
            </h3>
            <p className="text-[#C5A059] text-sm mb-5">
              {lang === 'ta' ? 'சென்னை வாடகையாளர்களை நேரடியாக அடையுங்கள் — முற்றிலும் இலவசம்' : 'Reach Chennai customers directly — completely FREE listing'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/home-services/list"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold px-6 py-3 rounded-xl text-sm shadow-lg hover:brightness-105 transition"
              >
                <Plus className="w-4 h-4" />
                {lang === 'ta' ? 'சேவையை சேர்க்கவும்' : 'List My Service — FREE'}
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-5 py-3 rounded-xl text-sm hover:bg-white/20 transition"
              >
                {lang === 'ta' ? 'தொடர்பு கொள்ளுங்கள்' : 'Contact Support'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
