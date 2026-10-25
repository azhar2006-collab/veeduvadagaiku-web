export interface PromotionalOffer {
  id: string;
  planId: string;
  name: string;
  planName: string;
  badge: string;
  tagline: string;
  subheading: string;
  headline: string;
  price: number;
  originalPrice: number;
  commercialOriginalPrice: number;
  currency: string;
  startDate: string;
  endDate: string;
  expiryDisplay: string;
  isActive: boolean;
  durationDays: number;
  description: string;
  ctaText: string;
  ctaLink: string;
  bulletPoints: string[];
  features: string[];
}

export interface StandardPlan {
  id: string;
  category: 'FREE_OFFER' | 'RESIDENTIAL' | 'COMMERCIAL' | 'HALL' | 'SERVICE';
  badge: string;
  badgeType: 'promo' | 'after_offer' | 'tag';
  title: string;
  tamilTitle?: string;
  price: number;
  priceDisplay: string;
  billingPeriod: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  isFeatured?: boolean;
}

export const DEEPAVALI_PLANS: StandardPlan[] = [
  {
    id: 'plan_deepavali_free',
    category: 'FREE_OFFER',
    badge: 'Live now • till Deepavali',
    badgeType: 'promo',
    title: 'Deepavali Free Listing',
    price: 0,
    priceDisplay: '₹0',
    billingPeriod: 'per listing',
    features: [
      'Houses, flats, shops, halls and home services',
      'Listed in all Chennai pincodes',
      'Post on or before 8 Nov 2026',
    ],
    ctaText: 'Start free listing',
    ctaLink: '/owner/properties/add',
    isFeatured: true,
  },
  {
    id: 'plan_residential_single',
    category: 'RESIDENTIAL',
    badge: 'After the offer',
    badgeType: 'after_offer',
    title: 'Residential Listing',
    price: 99,
    priceDisplay: '₹99',
    billingPeriod: 'per listing · 30 days',
    features: [
      'Houses, flats and independent floors',
      'Listed in all Chennai pincodes',
      'Your listing stays live for 30 days',
    ],
    ctaText: 'List a home',
    ctaLink: '/owner/properties/add?type=HOUSE',
  },
  {
    id: 'plan_commercial_single',
    category: 'COMMERCIAL',
    badge: 'After the offer',
    badgeType: 'after_offer',
    title: 'Shops & Commercial',
    price: 555,
    priceDisplay: '₹555',
    billingPeriod: 'per listing · 60 days',
    features: [
      'Shops and other commercial spaces',
      'Your listing stays live for 60 days',
      'Listed in all Chennai pincodes',
    ],
    ctaText: 'List a shop',
    ctaLink: '/owner/properties/add?type=SHOP',
  },
  {
    id: 'plan_mandapam_single',
    category: 'HALL',
    badge: 'Wedding & event venues',
    badgeType: 'tag',
    title: 'Kalyana Mandapam & Convention Hall',
    tamilTitle: 'கல்யாண மண்டபம் · மாநாட்டு அரங்கம்',
    price: 2500,
    priceDisplay: '₹2,500',
    billingPeriod: 'per listing · 60 days',
    features: [
      'Marriage halls, mandapams and convention halls',
      'Listed in all Chennai pincodes, live for 60 days',
    ],
    ctaText: 'List a hall',
    ctaLink: '/owner/properties/add?type=MARRIAGE_HALL',
  },
  {
    id: 'plan_service_single',
    category: 'SERVICE',
    badge: 'For advertisers',
    badgeType: 'tag',
    title: 'Home Services',
    tamilTitle: 'வீட்டு சேவைகள்',
    price: 444,
    priceDisplay: '₹444',
    billingPeriod: 'per listing · 60 days',
    features: [
      'Advertise your home service to Chennai home seekers and owners',
      'Listed in all Chennai pincodes, live for 60 days',
    ],
    ctaText: 'Advertise a service',
    ctaLink: '/home-services/list',
  },
];

export const PROMOTIONAL_OFFERS: PromotionalOffer[] = [
  {
    id: 'deepavali_free_posting_2026',
    planId: 'plan_deepavali_free',
    name: 'Deepavali Special – Free Listing for Properties & Services',
    planName: 'Deepavali Free Listing',
    badge: 'Live now • till Deepavali',
    tagline: 'DEEPAVALI SPECIAL OFFER',
    subheading: 'தீபாவளி வரை உங்கள் வீடு, கடை, மண்டபம் அனைத்தையும் கட்டணமின்றி பதிவு செய்யுங்கள்!\nஇந்த தீபாவளிக்கு உங்கள் சொத்து சென்னை முழுவதும் தெரியட்டும் – பதிவு முற்றிலும் இலவசம்!',
    headline: 'List your property & services free till Deepavali',
    price: 0,
    originalPrice: 99,
    commercialOriginalPrice: 2500,
    currency: 'INR',
    startDate: '2026-10-01T00:00:00+05:30',
    endDate: '2026-11-08T23:59:59+05:30',
    expiryDisplay: 'Deepavali, 8 Nov 2026',
    isActive: true,
    durationDays: 60,
    description: 'Put your house, shop, hall or home service in front of Chennai across every pincode. No listing fee on anything posted on or before Deepavali.',
    ctaText: 'Post your property for free',
    ctaLink: '/owner/properties/add',
    bulletPoints: [
      'Houses, flats, shops, halls and home services',
      'Listed in all Chennai pincodes',
      'Post on or before 8 Nov 2026',
    ],
    features: [
      'Houses, flats, shops, halls and home services',
      'Listed in all Chennai pincodes',
      'Post on or before 8 Nov 2026',
      'Direct tenant phone calls & WhatsApp enquiries',
      'Up to 10 HD photos with cloud hosting',
    ],
  },
];

export function isOfferActive(offer: PromotionalOffer): boolean {
  if (!offer.isActive) return false;
  const now = new Date();
  const start = new Date(offer.startDate);
  const end = new Date(offer.endDate);
  return now >= start && now <= end;
}

export function getDeepavaliOffer(): PromotionalOffer {
  return PROMOTIONAL_OFFERS[0];
}

// Backward-compatibility alias
export function getNavaratriOffer(): PromotionalOffer {
  return PROMOTIONAL_OFFERS[0];
}

export function getActiveOffers(): PromotionalOffer[] {
  return PROMOTIONAL_OFFERS.filter(isOfferActive);
}

