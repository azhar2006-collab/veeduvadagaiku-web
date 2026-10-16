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
    id: 'navaratri_free_posting_2026',
    planId: 'plan_navaratri_free',
    name: 'Navaratri Special – Free Property Posting',
    planName: 'Navaratri Free Posting Plan',
    badge: 'Limited-Time Festive Offer',
    tagline: '🎉 NAVARATRI SPECIAL OFFER 🎉',
    subheading: 'Grab the Opportunity!',
    headline: 'Post your property for FREE during this Navaratri season!',
    price: 0,
    originalPrice: 222,
    commercialOriginalPrice: 555,
    currency: 'INR',
    startDate: '2026-10-10T00:00:00+05:30',
    endDate: '2026-10-25T23:59:59+05:30',
    expiryDisplay: 'End of Navaratri (October 25, 2026)',
    isActive: true,
    durationDays: 30,
    description: 'Post your property without any posting fee during the promotional period.',
    ctaText: 'Post Your Property for FREE',
    ctaLink: '/owner/properties/add',
    bulletPoints: [
      '₹0 Posting Fee',
      'No Payment Required to Post a Property',
      'Limited-Time Festive Offer',
    ],
    features: [
      '100% Free Property Listing (₹0 Posting Fee)',
      '30 Days Active Listing across Chennai',
      'Direct Tenant Phone Calls & WhatsApp Messages',
      'Up to 10 HD Photos with Cloud Hosting',
      'Priority Admin Review & Listing Verification',
      'Valid for Residential Houses, Flats & Commercial Shops',
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

export function getNavaratriOffer(): PromotionalOffer {
  return PROMOTIONAL_OFFERS[0];
}

export function getActiveOffers(): PromotionalOffer[] {
  return PROMOTIONAL_OFFERS.filter(isOfferActive);
}
