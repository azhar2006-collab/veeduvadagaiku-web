import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Check,
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building2,
  Store,
  PartyPopper,
  Flame,
  ChevronDown,
  ChevronUp,
  Tag,
  PhoneCall,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { DEEPAVALI_PLANS, StandardPlan } from '../../config/offersConfig';

interface DeepavaliPlansShowcaseProps {
  isOwnerView?: boolean;
  hideHeroBrandBar?: boolean;
}

export const DeepavaliPlansShowcase: React.FC<DeepavaliPlansShowcaseProps> = ({
  isOwnerView = false,
  hideHeroBrandBar = false,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | 'FREE_OFFER' | 'RESIDENTIAL' | 'COMMERCIAL' | 'HALL' | 'SERVICE'>('ALL');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Live countdown to Deepavali 2026 (Nov 8, 2026 23:59:59 IST)
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 16, hours: 3, minutes: 22, seconds: 40 });

  useEffect(() => {
    const targetDate = new Date('2026-11-08T23:59:59+05:30').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const filteredPlans = activeTab === 'ALL'
    ? DEEPAVALI_PLANS
    : DEEPAVALI_PLANS.filter((p) => p.category === activeTab || p.category === 'FREE_OFFER');

  const faqs = [
    {
      q: 'Is property posting really ₹0 till Deepavali?',
      a: 'Yes, 100%! All rental listings (Houses, Flats, Shops, Commercial Spaces, Kalyana Mandapams and Home Services) posted on or before Deepavali, 8 Nov 2026 carry absolutely zero posting fee. No payment gateway or credit card required.',
    },
    {
      q: 'How long will my free listing remain active?',
      a: 'Any property posted during the Deepavali promotional period will remain live and visible to home seekers across all Chennai pincodes for full 60 days (31 days for Kalyana Mandapams) at ₹0.',
    },
    {
      q: 'What prices will apply after the offer ends?',
      a: 'After the Deepavali offer concludes on 8 Nov 2026, standard low-cost pricing takes effect: ₹99 for Residential (60 days), ₹555 for Commercial & Shops (60 days), ₹1,000 for Kalyana Mandapams (31 days), and ₹444 for Home Services (60 days).',
    },
    {
      q: 'How will tenants get in touch with me?',
      a: 'Tenants browse your property by pincode and locality in Chennai, and contact you directly via direct phone calls and WhatsApp messages. Zero intermediary, zero commission.',
    },
  ];

  return (
    <div id="listing-plans" className="w-full bg-[#FAF6EF] text-[#240a15] font-sans scroll-mt-20">
      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION: Deep Maroon / Wine Background (#240a15)
          with Golden Highlights (#f59e0b)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1b0610] via-[#240a15] to-[#2d0c1b] text-white pt-8 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#3d1323]">
        {/* Festive background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12 relative z-10">
          {/* Top Brand Bar (hidden if embedded on homepage with main navbar) */}
          {!hideHeroBrandBar && (
            <div className="flex items-center justify-between border-b border-[#3f1525]/60 pb-5">
              <div>
                <Link to="/" className="inline-block group">
                  <span className="text-[#f59e0b] font-black text-xl sm:text-2xl tracking-tight leading-none group-hover:brightness-110 transition">
                    veeduvadagaikku chennai
                  </span>
                  <span className="block text-[#edd8de] text-xs sm:text-sm font-normal mt-0.5 tracking-wide">
                    வீடு வாடகைக்கு · சென்னை
                  </span>
                </Link>
              </div>
              <div>
                <Link
                  to="/owner/properties/add"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-[#1b0610] text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm active:scale-95"
                >
                  <span>List your property</span>
                </Link>
              </div>
            </div>
          )}

          {/* Main Hero Content (2 Columns: Copy & Floating Card) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Heading, Subheading & CTA */}
            <div className="lg:col-span-7 space-y-6">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#391121] border border-[#5a1b34] text-[#fcd34d] text-xs sm:text-[13px] font-semibold shadow-xs">
                <Flame className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>For owners & advertisers only • உரிமையாளர்கள், விளம்பரதாரர்களுக்கு மட்டும்</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-white leading-[1.12] tracking-tight">
                List your property &amp; services{' '}
                <span className="text-[#f59e0b] underline decoration-[#f59e0b]/50 decoration-wavy decoration-2">
                  free
                </span>{' '}
                till Deepavali
              </h1>

              {/* Tamil Subheading */}
              <p className="text-base sm:text-xl font-medium text-[#edd8de] leading-relaxed">
                தீபாவளி வரை உங்கள் சொத்தையும் சேவைகளையும் இலவசமாக பதிவு செய்யுங்கள்
              </p>

              {/* Supporting Description */}
              <p className="text-sm sm:text-base text-[#d4bac6] max-w-xl font-normal leading-relaxed">
                Put your house, shop, hall or home service in front of Chennai across every pincode. No listing fee on anything posted on or before Deepavali.
              </p>

              {/* CTA Button & Expiry Note */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                <Link
                  to="/owner/properties/add"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#f59e0b] hover:bg-[#eab308] text-[#1b0610] text-sm sm:text-base font-black tracking-wide shadow-xl shadow-amber-500/25 transition-all active:scale-95 text-center group"
                >
                  <Sparkles className="w-4 h-4 text-[#1b0610]" />
                  <span>Post my free listing</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#edd8de] font-semibold">
                  <Clock className="w-4 h-4 text-[#f59e0b] shrink-0" />
                  <span>Offer ends Deepavali, 8 Nov 2026</span>
                </div>
              </div>

              {/* Festive Live Countdown Pill Bar */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-[#320e1e]/90 border border-[#52192f] shadow-inner text-xs">
                  <span className="text-[#fcd34d] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Deepavali Countdown:
                  </span>
                  <div className="flex items-center gap-2 text-white font-mono font-black">
                    <span className="px-2 py-0.5 bg-[#441329] rounded-md text-[#f59e0b]">
                      {timeLeft.days}d
                    </span>
                    <span>:</span>
                    <span className="px-2 py-0.5 bg-[#441329] rounded-md text-[#f59e0b]">
                      {String(timeLeft.hours).padStart(2, '0')}h
                    </span>
                    <span>:</span>
                    <span className="px-2 py-0.5 bg-[#441329] rounded-md text-[#f59e0b]">
                      {String(timeLeft.minutes).padStart(2, '0')}m
                    </span>
                    <span>:</span>
                    <span className="px-2 py-0.5 bg-[#441329] rounded-md text-[#f59e0b]">
                      {String(timeLeft.seconds).padStart(2, '0')}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Floating White Hero Card */}
            <div className="lg:col-span-5">
              <div className="bg-white text-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-300/40 relative overflow-hidden transition-transform hover:scale-[1.01]">
                {/* Subtle gold ribbon top-right */}
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-[#1b0610] text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-bl-xl shadow-xs">
                  100% Free
                </div>

                <div className="space-y-4">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#92400e] block">
                    DEEPAVALI OFFER
                  </span>

                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                      ₹0
                    </span>
                    <span className="text-xs sm:text-sm text-gray-400 line-through font-semibold">
                      Instead of ₹99 to ₹1,000
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                    Listing fee for properties and home services
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                    Applies to every listing posted on or before Deepavali, 8 Nov 2026. <span className="font-semibold text-gray-900">இலவச விளம்பரம்.</span>
                  </p>

                  <div className="pt-3 border-t border-gray-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Valid across all 150+ Chennai pincodes</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Full 60-day validity at zero extra cost</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct phone calls & WhatsApp tenant leads</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/owner/properties/add"
                      className="w-full py-3 px-4 rounded-full bg-[#240a15] hover:bg-[#320e1e] text-[#f59e0b] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md"
                    >
                      <span>Claim ₹0 Free Listing</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PLANS SECTION: Warm Cream Background (#FAF6EF)
          "Simple pricing for owners"
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-10 sm:space-y-12">
        {/* Section Header as shown in Image 1 */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#8b263e] block">
            OWNER ADVERTISING PLANS • விளம்பரத் திட்டங்கள்
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#240a15] tracking-tight">
            Simple pricing for owners
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-normal">
            One price per listing. Free right now, and low after the offer ends.
          </p>

          {/* Quick Category Switcher Tabs */}
          <div className="flex flex-wrap gap-2 pt-4">
            {[
              { id: 'ALL', label: 'All Plans' },
              { id: 'RESIDENTIAL', label: 'Residential (₹99)' },
              { id: 'COMMERCIAL', label: 'Shops & Commercial (₹555)' },
              { id: 'HALL', label: 'Marriage Halls (₹1,000)' },
              { id: 'SERVICE', label: 'Home Services (₹444)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#240a15] text-[#f59e0b] shadow-md shadow-[#240a15]/20 scale-105'
                    : 'bg-white text-gray-700 hover:bg-[#f2e7db] border border-[#e8d5cb]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── 3 PRIMARY CARDS GRID (Deepavali Free, Residential, Shops) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {/* Card 1: Deepavali Free Listing (Featured - Dark Maroon with Golden Border) */}
          {(activeTab === 'ALL' || activeTab === 'FREE_OFFER') && (
            <div className="bg-[#240a15] text-white rounded-3xl p-7 border-2 border-[#f59e0b] shadow-2xl shadow-amber-950/20 flex flex-col justify-between relative overflow-hidden transition-transform hover:-translate-y-1">
              <div className="space-y-6">
                <div>
                  <span className="inline-block px-3.5 py-1 rounded-full bg-[#f59e0b] text-[#1b0610] text-[11px] font-black uppercase tracking-wider">
                    Live now • till Deepavali
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-3.5 tracking-tight">
                    Deepavali Free Listing
                  </h3>
                </div>

                <div className="pt-1 pb-3 border-b border-[#3e1425]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-[#f59e0b] tracking-tight">
                      ₹0
                    </span>
                    <span className="text-xs sm:text-sm text-[#edd8de] font-semibold">
                      per listing
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-300/90 block mt-1">
                    🎉 100% free posting across all categories
                  </span>
                </div>

                {/* Checklist with Golden Yellow Checkmarks */}
                <ul className="space-y-3.5 text-xs sm:text-sm text-[#edd8de]">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Houses, flats, shops, halls and home services</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Listed across all Chennai pincodes</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Post on or before 8 Nov 2026</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Direct WhatsApp &amp; phone calls from seekers</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  to="/owner/properties/add"
                  className="w-full py-3.5 px-6 rounded-full bg-[#f59e0b] hover:bg-[#eab308] text-[#1b0610] font-black text-xs sm:text-sm tracking-wide text-center flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start free listing</span>
                </Link>
              </div>
            </div>
          )}

          {/* Card 2: Residential Listing (White Card - After the offer) */}
          {(activeTab === 'ALL' || activeTab === 'RESIDENTIAL') && (
            <div className="bg-white rounded-3xl p-7 border border-[#e8d5cb] shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-[11px] font-bold">
                    After the offer
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#240a15] mt-3.5 tracking-tight">
                    Residential Listing
                  </h3>
                </div>

                <div className="pt-1 pb-3 border-b border-gray-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-[#240a15] tracking-tight">
                      ₹99
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      per listing · 60 days
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 block mt-1">
                    Free right now during Deepavali!
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Houses, flats and independent floors</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Listed across all Chennai pincodes</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Your listing stays live for 60 days</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Up to 10 HD photos &amp; verified badge</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  to="/owner/properties/add?type=HOUSE"
                  className="w-full py-3.5 px-6 rounded-full border-2 border-[#240a15] text-[#240a15] hover:bg-[#240a15] hover:text-white font-black text-xs sm:text-sm tracking-wide text-center flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>List a home</span>
                </Link>
              </div>
            </div>
          )}

          {/* Card 3: Shops & Commercial (White Card - After the offer) */}
          {(activeTab === 'ALL' || activeTab === 'COMMERCIAL') && (
            <div className="bg-white rounded-3xl p-7 border border-[#e8d5cb] shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-[11px] font-bold">
                    After the offer
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#240a15] mt-3.5 tracking-tight">
                    Shops &amp; Commercial
                  </h3>
                </div>

                <div className="pt-1 pb-3 border-b border-gray-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-[#240a15] tracking-tight">
                      ₹555
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      per listing · 60 days
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 block mt-1">
                    Free right now during Deepavali!
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Shops and other commercial spaces</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Your listing stays live for 60 days</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Listed across all Chennai pincodes</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Commercial showcase for business seekers</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  to="/owner/properties/add?type=SHOP"
                  className="w-full py-3.5 px-6 rounded-full border-2 border-[#240a15] text-[#240a15] hover:bg-[#240a15] hover:text-white font-black text-xs sm:text-sm tracking-wide text-center flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>List a shop</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ─── 2 WIDE / HORIZONTAL CARDS (Kalyana Mandapam & Home Services) ─── */}
        <div className="space-y-6">
          {/* Card 4: Kalyana Mandapam & Convention Hall (as shown in Image 2) */}
          {(activeTab === 'ALL' || activeTab === 'HALL') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8d5cb] shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="inline-block px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-[11px] font-bold">
                  Wedding &amp; event venues
                </span>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#240a15] tracking-tight">
                    Kalyana Mandapam &amp; Convention Hall
                  </h3>
                  <span className="text-xs sm:text-sm text-gray-500 font-medium block mt-0.5">
                    கல்யாண மண்டபம் · மாநாட்டு அரங்கம்
                  </span>
                </div>

                <ul className="space-y-2 pt-1 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Marriage halls, mandapams and convention halls</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Listed across all Chennai pincodes, live for 31 days</span>
                  </li>
                </ul>
              </div>

              {/* Price & Action */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row sm:items-center md:items-end lg:items-center gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                <div className="text-left md:text-right">
                  <div className="flex items-baseline md:justify-end gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-[#240a15] tracking-tight">
                      ₹1,000
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      per listing · 31 days
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 block">
                    Free till Deepavali (₹0)
                  </span>
                </div>

                <Link
                  to="/owner/properties/add?type=MARRIAGE_HALL"
                  className="px-6 py-3 rounded-full border-2 border-[#240a15] text-[#240a15] hover:bg-[#240a15] hover:text-white font-black text-xs sm:text-sm tracking-wide text-center transition-all active:scale-95 whitespace-nowrap"
                >
                  <span>List a hall</span>
                </Link>
              </div>
            </div>
          )}

          {/* Card 5: Home Services (as shown in Image 2) */}
          {(activeTab === 'ALL' || activeTab === 'SERVICE') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8d5cb] shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="inline-block px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-[11px] font-bold">
                  For advertisers
                </span>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#240a15] tracking-tight">
                    Home Services
                  </h3>
                  <span className="text-xs sm:text-sm text-gray-500 font-medium block mt-0.5">
                    வீட்டு சேவைகள்
                  </span>
                </div>

                <ul className="space-y-2 pt-1 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Advertise your home service to Chennai home seekers and owners</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Listed across all Chennai pincodes, live for 60 days</span>
                  </li>
                </ul>
              </div>

              {/* Price & Action */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row sm:items-center md:items-end lg:items-center gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                <div className="text-left md:text-right">
                  <div className="flex items-baseline md:justify-end gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-[#240a15] tracking-tight">
                      ₹444
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      per listing · 60 days
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 block">
                    Free till Deepavali (₹0)
                  </span>
                </div>

                <Link
                  to="/home-services/list"
                  className="px-6 py-3 rounded-full border-2 border-[#240a15] text-[#240a15] hover:bg-[#240a15] hover:text-white font-black text-xs sm:text-sm tracking-wide text-center transition-all active:scale-95 whitespace-nowrap"
                >
                  <span>Advertise a service</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ─── THREE STEPS TO LIST SECTION (Image 2) ─── */}
        <div className="space-y-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-black text-[#240a15] tracking-tight">
            Three steps to list
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8d5cb] shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#240a15] text-[#f59e0b] font-black text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#240a15]">
                Add your property
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Enter the area, pincode, rent and photos of your house or shop.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8d5cb] shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#240a15] text-[#f59e0b] font-black text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#240a15]">
                Go live in Chennai
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Your listing shows up for home seekers searching your pincode.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8d5cb] shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#240a15] text-[#f59e0b] font-black text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#240a15]">
                Get enquiries
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Seekers find your listing and get in touch with you.
              </p>
            </div>
          </div>
        </div>

        {/* ─── OFFER DETAILS CALLOUT CONTAINER (Image 2) ─── */}
        <div className="bg-[#fff5e6] rounded-3xl p-6 sm:p-8 border border-[#fde2b8] space-y-2">
          <h3 className="text-base font-black text-[#240a15]">
            Offer details
          </h3>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
            This page is for property owners and home service advertisers. All listings, properties and home services, posted on or before Deepavali, 8 Nov 2026 carry no listing fee. From then on the listing prices above apply: ₹99 per residential listing (live for 60 days), ₹555 per shop or commercial listing (live for 60 days), ₹1,000 per kalyana mandapam or convention hall listing (live for 31 days), and ₹444 per home service listing (live for 60 days).
          </p>
        </div>

        {/* ─── FAQ ACCORDION (Attractive Interactive Bonus) ─── */}
        <div className="space-y-4 pt-4 max-w-4xl mx-auto">
          <div className="text-center space-y-1 pb-2">
            <h3 className="text-xl sm:text-2xl font-black text-[#240a15] tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Everything you need to know about Chennai’s ₹0 Deepavali festive offer
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#e8d5cb] shadow-xs overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#240a15]"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#f59e0b] shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Bottom CTA Strip ─── */}
        <div className="bg-gradient-to-r from-[#1b0610] via-[#240a15] to-[#2d0c1b] rounded-3xl p-8 sm:p-10 text-white text-center space-y-4 shadow-xl">
          <span className="inline-block px-3 py-1 rounded-full bg-[#3f1525] text-[#fcd34d] text-xs font-bold uppercase tracking-wider">
            🪔 Celebrate Deepavali 2026 With Zero Brokerage &amp; Free Listings
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight max-w-xl mx-auto">
            Ready to list your rental property or home service in Chennai?
          </h3>
          <p className="text-xs sm:text-sm text-[#d4bac6] max-w-md mx-auto">
            Takes less than 2 minutes. No payment required until Deepavali, 8 Nov 2026.
          </p>
          <div className="pt-2">
            <Link
              to="/owner/properties/add"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#f59e0b] hover:bg-[#eab308] text-[#1b0610] font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Post My Free Listing Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
