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
