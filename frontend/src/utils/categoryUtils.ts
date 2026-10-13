import React from 'react';
import { Building2, Building, Store, Users, Sparkles } from 'lucide-react';
import { Property } from '../types';

export type ExtendedCategory = 'ALL' | 'HOUSE' | 'APARTMENT' | 'SHOP' | 'HOSTEL' | 'MARRIAGE_HALL';

/**
 * Determines whether a property is a House, Apartment/Flat, Shop, Hostel/PG, or Marriage Hall/Mandapam.
 * Seamlessly backwards-compatible with backend HOUSE/SHOP enums without database schema changes.
 */
export function getPropertyCategory(property: Partial<Property>): 'HOUSE' | 'APARTMENT' | 'SHOP' | 'HOSTEL' | 'MARRIAGE_HALL' {
  const desc = (property.description || '').toLowerCase();
  const title = (property.title || '').toLowerCase();
  const amenities = (property.amenities || []).join(' ').toLowerCase();
  const combined = `${title} ${desc} ${amenities}`;

  // Check for Hostel / PG
  if (
    combined.includes('[category:hostel]') ||
    combined.includes('hostel') ||
    combined.includes('mansion') ||
    combined.includes('pg for') ||
    combined.includes('paying guest') ||
    combined.includes('விடுதி') ||
    combined.includes('மேன்ஷன்')
  ) {
    return 'HOSTEL';
  }

  // Check for Marriage Hall / Kalyana Mandapam
  if (
    combined.includes('[category:marriage_hall]') ||
    combined.includes('marriage hall') ||
    combined.includes('kalyana mandapam') ||
    combined.includes('wedding hall') ||
    combined.includes('party hall') ||
    combined.includes('mandapam') ||
    combined.includes('மண்டபம்') ||
    combined.includes('திருமண மண்டபம்')
  ) {
    return 'MARRIAGE_HALL';
  }

  // Check for Commercial Shop
  if (property.propertyType === 'SHOP' || combined.includes('[category:shop]')) {
    return 'SHOP';
  }

  // Check for Apartment / Flat
  if (
    combined.includes('[category:apartment]') ||
    combined.includes('apartment') ||
    combined.includes('flat') ||
    combined.includes('flats') ||
    combined.includes('gated community') ||
    combined.includes('அபார்ட்மெண்ட்') ||
    combined.includes('பிளாட்') ||
    combined.includes('குடியிருப்பு')
  ) {
    return 'APARTMENT';
  }

  // Fallback to basic House
  return 'HOUSE';
}

/**
 * Filter a list of properties based on the extended category.
 */
export function filterByExtendedCategory(
  properties: Property[],
  category: ExtendedCategory | ''
): Property[] {
  if (!category || category === 'ALL') return properties;
  return properties.filter((p) => getPropertyCategory(p) === category);
}

/**
 * Category metadata for badges and UI cards.
 */
export function getCategoryBadgeInfo(category: 'HOUSE' | 'APARTMENT' | 'SHOP' | 'HOSTEL' | 'MARRIAGE_HALL', lang: 'en' | 'ta' = 'en') {
  switch (category) {
    case 'APARTMENT':
      return {
        label: lang === 'ta' ? 'அபார்ட்மெண்ட்' : 'Apartment / Flat',
        Icon: Building,
        badgeBg: 'bg-gray-900/80',
        badgeText: 'text-white',
        badgeBorder: 'border-transparent',
      };
    case 'HOSTEL':
      return {
        label: lang === 'ta' ? 'விடுதி / PG' : 'Hostel & PG',
        Icon: Users,
        badgeBg: 'bg-[#FCFAF5]',
        badgeText: 'text-[#9A7818]',
        badgeBorder: 'border-[#E8DFC8]',
      };
    case 'MARRIAGE_HALL':
      return {
        label: lang === 'ta' ? 'கல்யாண மண்டபம்' : 'Kalyana Mandapam',
        Icon: Sparkles,
        badgeBg: 'bg-[#FCFAF5]',
        badgeText: 'text-[#9A7818]',
        badgeBorder: 'border-[#E8DFC8]',
      };
    case 'SHOP':
      return {
        label: lang === 'ta' ? 'வணிக கடை' : 'Shop',
        Icon: Store,
        badgeBg: 'bg-gray-900/80',
        badgeText: 'text-white',
        badgeBorder: 'border-transparent',
      };
    case 'HOUSE':
    default:
      return {
        label: lang === 'ta' ? 'வீடு' : 'House',
        Icon: Building2,
        badgeBg: 'bg-gray-900/80',
        badgeText: 'text-white',
        badgeBorder: 'border-transparent',
      };
  }
}

/**
 * Commercial Property Subtypes (Matching NoBroker & OLX checklist)
 */
export const COMMERCIAL_SUBTYPES = [
  { id: 'Office Space', label: 'Office Space', labelTa: 'அலுவலக இடம் (Office Space)' },
  { id: 'Co-Working', label: 'Co-Working', labelTa: 'பகிர்வு அலுவலகம் (Co-Working)' },
  { id: 'Shop', label: 'Shop', labelTa: 'கடை (Shop)' },
  { id: 'Showroom', label: 'Showroom', labelTa: 'ஷோரூம் (Showroom)' },
  { id: 'Industrial Building', label: 'Industrial Building', labelTa: 'தொழிற்சாலை கட்டிடம்' },
  { id: 'Industrial Shed', label: 'Industrial Shed', labelTa: 'தொழிலக ஷெட் (Industrial Shed)' },
  { id: 'Godown/Warehouse', label: 'Godown/Warehouse', labelTa: 'கிடங்கு (Godown / Warehouse)' },
  { id: 'Other business', label: 'Other business', labelTa: 'பிற வணிக பயன்பாடு' },
] as const;

/**
 * Filter properties by commercial subtype(s)
 */
export function filterByCommercialType(properties: Property[], commercialType: string): Property[] {
  if (!commercialType) return properties;
  const types = commercialType.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (types.length === 0) return properties;

  return properties.filter((p) => {
    // Only commercial properties can match
    if (p.propertyType !== 'SHOP') return false;

    const text = `${p.title} ${p.description} ${(p.amenities || []).join(' ')}`.toLowerCase();

    return types.some((type) => {
      if (type.includes('office')) {
        return text.includes('office') || text.includes('corporate') || text.includes('[commercial:office]');
      }
      if (type.includes('co-working') || type.includes('coworking')) {
        return text.includes('co-working') || text.includes('coworking') || text.includes('shared office') || text.includes('[commercial:coworking]');
      }
      if (type.includes('showroom')) {
        return text.includes('showroom') || text.includes('display') || text.includes('[commercial:showroom]');
      }
      if (type.includes('shop')) {
        return text.includes('shop') || text.includes('retail') || text.includes('store') || text.includes('boutique') || text.includes('[commercial:shop]');
      }
      if (type.includes('godown') || type.includes('warehouse')) {
        return text.includes('godown') || text.includes('warehouse') || text.includes('storage') || text.includes('[commercial:godown]') || text.includes('[commercial:warehouse]');
      }
      if (type.includes('industrial building')) {
        return text.includes('industrial building') || text.includes('factory') || text.includes('[commercial:industrial_bldg]');
      }
      if (type.includes('industrial shed') || type.includes('shed')) {
        return text.includes('industrial shed') || text.includes('shed') || text.includes('[commercial:industrial_shed]');
      }
      if (type.includes('other')) {
        return text.includes('commercial') || text.includes('business') || text.includes('clinic') || text.includes('[commercial:other]');
      }
      return text.includes(type);
    });
  });
}

/**
 * Filter properties by multi-BHK string (e.g. "1", "2", "1,2", "3,4")
 */
export function filterByBedrooms(properties: Property[], bedroomsVal: number | string): Property[] {
  if (!bedroomsVal && bedroomsVal !== 0) return properties;
  const str = String(bedroomsVal);

  if (str.includes(',')) {
    const list = str.split(',').map((b) => parseInt(b.trim())).filter((b) => !isNaN(b));
    return properties.filter((p) => {
      if (p.propertyType === 'SHOP') return false;
      const b = p.bedrooms || 0;
      if (list.includes(4) && b >= 4) return true;
      return list.includes(b);
    });
  }

  if (str.endsWith('+')) {
    const num = parseInt(str);
    return properties.filter((p) => (p.bedrooms || 0) >= num);
  }

  const num = parseInt(str);
  if (isNaN(num)) return properties;
  return properties.filter((p) => p.bedrooms === num);
}

/**
 * Hostel Gender Types
 */
export const HOSTEL_GENDERS = [
  { id: 'MALE', label: "Men's / Gents", labelTa: 'ஆண்கள் விடுதி (Gents)' },
  { id: 'FEMALE', label: "Women's / Ladies", labelTa: 'பெண்கள் விடுதி (Ladies)' },
  { id: 'COLIVING', label: 'Co-Living / Any', labelTa: 'இருபாலர் / Co-Living' },
] as const;

/**
 * Hostel Sharing Options
 */
export const HOSTEL_SHARING_TYPES = [
  { id: '1', label: 'Single Room', labelTa: 'தனி அறை (Single)' },
  { id: '2', label: '2 Sharing', labelTa: '2 பேர் பகிர்வு' },
  { id: '3', label: '3 Sharing', labelTa: '3 பேர் பகிர்வு' },
  { id: '4+', label: '4+ Sharing', labelTa: '4+ பேர் பகிர்வு' },
] as const;

/**
 * Furnishing Options
 */
export const FURNISHING_OPTIONS = [
  { id: 'FURNISHED', label: 'Fully Furnished', labelTa: 'முழு மரச்சாமான்களுடன்' },
  { id: 'SEMI_FURNISHED', label: 'Semi-Furnished', labelTa: 'பாதி மரச்சாமான்கள்' },
  { id: 'UNFURNISHED', label: 'Unfurnished', labelTa: 'மரச்சாமான்கள் இன்றி' },
] as const;

/**
 * Marriage Hall Guest Capacity Ranges
 */
export const MARRIAGE_HALL_CAPACITIES = [
  { id: 'UP_TO_250', label: 'Up to 250 Guests', labelSub: 'Mini Party / Birthday Hall', labelTa: '250 பேர் வரை (மினி ஹால்)' },
  { id: '250_TO_500', label: '250 – 500 Guests', labelSub: 'Medium Mandapam', labelTa: '250 – 500 பேர் (மண்டபம்)' },
  { id: '500_TO_1000', label: '500 – 1000 Guests', labelSub: 'Grand Marriage Hall', labelTa: '500 – 1000 பேர் (திருமண மண்டபம்)' },
  { id: '1000_PLUS', label: '1000+ Guests', labelSub: 'Mega Convention Centre', labelTa: '1000+ பேர் (பிரம்மாண்ட மஹால்)' },
] as const;

/**
 * Filter properties by Hostel Gender
 */
export function filterByHostelGender(properties: Property[], gender: string): Property[] {
  if (!gender) return properties;
  const g = gender.toUpperCase();

  return properties.filter((p) => {
    const text = `${p.title} ${p.description} ${(p.amenities || []).join(' ')}`.toLowerCase();

    if (g === 'MALE') {
      return (
        text.includes('[hostel:male]') ||
        text.includes("men's") ||
        text.includes('mens') ||
        text.includes('gents') ||
        text.includes('male') ||
        text.includes('boys') ||
        text.includes('ஆண்கள்')
      );
    }
    if (g === 'FEMALE') {
      return (
        text.includes('[hostel:female]') ||
        text.includes("women's") ||
        text.includes('womens') ||
        text.includes('ladies') ||
        text.includes('female') ||
        text.includes('girls') ||
        text.includes('பெண்கள்')
      );
    }
    if (g === 'COLIVING') {
      return (
        text.includes('[hostel:coliving]') ||
        text.includes('coliving') ||
        text.includes('co-living') ||
        text.includes('unisex') ||
        text.includes('இருபாலர்')
      );
    }
    return true;
  });
}

/**
 * Filter properties by Marriage Hall Capacity
 */
export function filterByHallCapacity(properties: Property[], capacity: string): Property[] {
  if (!capacity) return properties;

  return properties.filter((p) => {
    const text = `${p.title} ${p.description} ${(p.amenities || []).join(' ')}`.toLowerCase();

    if (capacity === 'UP_TO_250') {
      return (
        text.includes('[capacity:up_to_250]') ||
        text.includes('mini hall') ||
        text.includes('party hall') ||
        text.includes('100') ||
        text.includes('150') ||
        text.includes('200') ||
        text.includes('250')
      );
    }
    if (capacity === '250_TO_500') {
      return (
        text.includes('[capacity:250_to_500]') ||
        text.includes('300') ||
        text.includes('400') ||
        text.includes('500')
      );
    }
    if (capacity === '500_TO_1000') {
      return (
        text.includes('[capacity:500_to_1000]') ||
        text.includes('600') ||
        text.includes('700') ||
        text.includes('800') ||
        text.includes('1000') ||
        text.includes('grand')
      );
    }
    if (capacity === '1000_PLUS') {
      return (
        text.includes('[capacity:1000_plus]') ||
        text.includes('1000+') ||
        text.includes('1500') ||
        text.includes('2000') ||
        text.includes('convention') ||
        text.includes('mega')
      );
    }
    return true;
  });
}

/**
 * Filter properties by Furnishing
 */
export function filterByFurnishing(properties: Property[], furnishing: string): Property[] {
  if (!furnishing) return properties;
  const f = furnishing.toUpperCase();
  return properties.filter((p) => {
    if (p.furnishing && p.furnishing.toUpperCase() === f) return true;
    const text = `${p.title} ${p.description} ${(p.amenities || []).join(' ')}`.toLowerCase();
    if (f === 'FURNISHED') return text.includes('fully furnished') || text.includes('furnished');
    if (f === 'SEMI_FURNISHED') return text.includes('semi furnished') || text.includes('semi-furnished');
    if (f === 'UNFURNISHED') return text.includes('unfurnished');
    return false;
  });
}

