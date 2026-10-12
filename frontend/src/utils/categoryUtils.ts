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
