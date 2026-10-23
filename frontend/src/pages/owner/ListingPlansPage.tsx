import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../../components/common/SEOHead';
import { Check, Sparkles, Building2, Store, PartyPopper, Wrench, ArrowRight } from 'lucide-react';

const DEEPAVALI_DATE = '8 Nov 2026';

const topPlans = [
  {
    id: 'deepavali_free',
    badge: 'Live now · till Deepavali',
    badgeStyle: 'bg-amber-500 text-white',
    name: 'Deepavali Free Listing',
    price: 0,
    period: null as string | null,
    features: [
      'Houses, flats, shops, halls and home services',
      'Listed across all Chennai pincodes',
      `Post on or before ${DEEPAVALI_DATE}`,
    ],
    ctaLabel: 'Start free listing',
    ctaLink: '/owner/properties/add',
    highlight: true,
  },
  {
    id: 'residential',
    badge: 'After the offer',
    badgeStyle: 'bg-gray-100 text-gray-600',
    name: 'Residential Listing',
    price: 99,
    period: '60 days' as string | null,
    features: [
      'Houses, flats and independent floors',
      'Listed across all Chennai pincodes',
      'Your listing stays live for 60 days',
    ],
    ctaLabel: 'List a home',
    ctaLink: '/owner/properties/add',
    highlight: false,
  },
  {
    id: 'shops_commercial',
    badge: 'After the offer',
    badgeStyle: 'bg-gray-100 text-gray-600',
    name: 'Shops & Commercial',
    price: 555,
    period: '60 days' as string | null,
    features: [
      'Shops and other commercial spaces',
      'Your listing stays live for 60 days',
      'Listed across all Chennai pincodes',
    ],
    ctaLabel: 'List a shop',
    ctaLink: '/owner/properties/add',
    highlight: false,
  },
];

const additionalPlans = [
  {
    id: 'marriage_hall',
    tag: 'Wedding & event venues',
    tagStyle: 'bg-[#FAF4E6] text-[#9A7818] border border-[#E8DFC8]',
    name: 'Kalyana Mandapam & Convention Hall',
    nameTa: 'கல்யாண மண்டபம் · மாநாட்டு அரங்கம்',
    price: 1000,
    period: '31 days',
    features: [
      'Marriage halls, mandapams and convention halls',
      'Listed across all Chennai pincodes, live for 31 days',
    ],
    ctaLabel: 'List a hall',
    ctaLink: '/owner/properties/add',
  },
  {
    id: 'home_services',
    tag: 'For advertisers',
    tagStyle: 'bg-rose-50 text-rose-700 border border-rose-200',
    name: 'Home Services',
    nameTa: 'வீட்டு சேவைகள்',
    price: 444,
    period: '60 days',
    features: [
      'Advertise your home service to Chennai home seekers and owners',
      'Listed across all Chennai pincodes, live for 60 days',
    ],
    ctaLabel: 'Advertise a service',
    ctaLink: '/home-services/list',
  },
];

const steps = [
  {
    num: 1,
    title: 'Add your property',
    desc: 'Enter the area, pincode, rent and photos of your house or shop.',
  },
  {
    num: 2,
    title: 'Go live in Chennai',
    desc: 'Your listing shows up for home seekers searching your pincode.',
  },
  {
    num: 3,
    title: 'Get enquiries',
    desc: 'Seekers find your listing and get in touch with you.',
  },
];

export const ListingPlansPage: React.FC = () => {
  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-16 px-4 sm:px-6">
      <SEOHead title="Listing Plans & Pricing | Veedu Vadagaikku Chennai" />

      {/* Header */}
      <div className="space-y-1 pt-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[#9A7818]">
          Owner Advertising Plans · விளம்பரத் திட்டங்கள்
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Simple pricing for owners
        </h1>
        <p className="text-sm text-gray-500 font-normal">
          One price per listing. Free right now, and low after the offer ends.
        </p>
      </div>

      {/* Top 3 plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {topPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border flex flex-col justify-between transition-all ${
              plan.highlight
                ? 'bg-[#1E1208] text-white border-[#3B2410] shadow-xl'
                : 'bg-white border-[#E8DFC8] shadow-sm hover:border-[#C5A059] hover:shadow-md'
            }`}
          >
            <div className="px-5 pt-5">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${plan.badgeStyle}`}
              >
                {plan.badge}
              </span>
            </div>

            <div className="px-5 pt-3 pb-5 flex flex-col flex-1 gap-4">
              <h2
                className={`text-lg font-extrabold leading-tight ${
                  plan.highlight ? 'text-white' : 'text-gray-900'
                }`}
              >
                {plan.name}
              </h2>

              <div className="flex items-baseline gap-1 flex-wrap">
                <span
                  className={`font-black tracking-tight ${
                    plan.highlight ? 'text-amber-400 text-5xl' : 'text-gray-900 text-4xl'
                  }`}
                >
                  ₹{plan.price.toLocaleString('en-IN')}
                </span>
                {plan.period && (
                  <span
                    className={`text-xs font-semibold ${
                      plan.highlight ? 'text-amber-200/70' : 'text-gray-500'
                    }`}
                  >
                    per listing · {plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        plan.highlight ? 'text-amber-400' : 'text-emerald-500'
                      }`}
                    />
                    <span className={plan.highlight ? 'text-amber-100/80' : 'text-gray-600'}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.ctaLink}
                className={`mt-2 w-full py-3 rounded-xl text-xs font-extrabold text-center transition active:scale-95 flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 text-white shadow-md shadow-amber-600/30'
                    : 'border border-[#D4AF37] text-gray-800 hover:bg-[#FAF4E6] bg-white'
                }`}
              >
                {plan.ctaLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Additional plans — full-width rows */}
      <div className="space-y-4">
        {additionalPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-2xl border border-[#EFE8D8] shadow-sm hover:border-[#C5A059] hover:shadow-md transition p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 space-y-2">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${plan.tagStyle}`}
                >
                  {plan.tag}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-normal">{plan.nameTa}</p>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <Check className="w-3.5 h-3.5 mt-0.5 text-emerald-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-3xl font-black text-gray-900">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-500 block font-semibold">
                    per listing · {plan.period}
                  </span>
                </div>
                <Link
                  to={plan.ctaLink}
                  className="shrink-0 px-5 py-2.5 border border-[#D4AF37] bg-white hover:bg-[#FAF4E6] text-gray-800 font-extrabold text-xs rounded-xl transition active:scale-95"
                >
                  {plan.ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Three steps to list */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Three steps to list</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-2xl border border-[#EFE8D8] p-5 space-y-2 shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-[#1E1208] text-amber-400 flex items-center justify-center font-black text-sm shrink-0">
                {step.num}
              </div>
              <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
              <p className="text-xs text-gray-500 font-normal leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Offer details note */}
      <div className="bg-[#FAF8F2] rounded-2xl border border-[#E8DFC8] p-5 sm:p-6 space-y-2">
        <h3 className="text-sm font-bold text-gray-900">Offer details</h3>
        <p className="text-xs text-gray-600 font-normal leading-relaxed">
          This page is for property owners and home service advertisers. All listings — properties
          and home services — posted on or before Deepavali, {DEEPAVALI_DATE} carry no listing fee.
          From then on the listing prices above apply: ₹99 per residential listing (live for 60
          days), ₹555 per shop or commercial listing (live for 60 days), ₹1,000 per kalyana
          mandapam or convention hall listing (live for 31 days), and ₹444 per home service listing
          (live for 60 days).
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/owner/properties/add"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#D4AF37]/25 hover:brightness-105 active:scale-95 transition"
        >
          <Sparkles className="w-4 h-4" />
          Post your free listing before Deepavali
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
