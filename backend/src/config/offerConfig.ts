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

export const PROMOTIONAL_OFFERS: PromotionalOffer[] = [
  {
    id: 'deepavali_free_posting_2026',
    planId: 'plan_deepavali_free',
    name: 'Deepavali Special – Free Property & Services Listing',
    planName: 'Deepavali Free Listing',
    badge: 'Live now • till Deepavali',
    tagline: 'DEEPAVALI SPECIAL OFFER',
    subheading: 'தீபாவளி வரை உங்கள் சொத்தையும் சேவைகளையும் இலவசமாக பதிவு செய்யுங்கள்',
    headline: 'List your property & services free till Deepavali',
    price: 0,
    originalPrice: 99,
    commercialOriginalPrice: 1000,
    currency: 'INR',
    startDate: process.env.OFFER_DEEPAVALI_START_DATE || '2026-10-01T00:00:00+05:30',
    endDate: process.env.OFFER_DEEPAVALI_END_DATE || '2026-11-08T23:59:59+05:30',
    expiryDisplay: 'Deepavali, 8 Nov 2026',
    isActive: process.env.OFFER_DEEPAVALI_IS_ACTIVE !== 'false',
    durationDays: 60,
    description: 'Put your house, shop, hall or home service in front of Chennai across every pincode. No listing fee on anything posted on or before Deepavali.',
    ctaText: 'Post my free listing',
    ctaLink: '/owner/properties/add',
    bulletPoints: [
      'Houses, flats, shops, halls and home services',
      'Listed across all Chennai pincodes',
      'Post on or before 8 Nov 2026',
    ],
    features: [
      'Houses, flats, shops, halls and home services',
      'Listed across all Chennai pincodes',
      'Post on or before 8 Nov 2026',
      'Direct tenant phone calls & WhatsApp enquiries',
      'Up to 10 HD photos with cloud hosting',
      'Verified listing badge upon admin review',
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

