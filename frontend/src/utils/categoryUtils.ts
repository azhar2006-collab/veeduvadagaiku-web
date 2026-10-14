import React from 'react';
import { Building2, Building, Store, Users, Sparkles } from 'lucide-react';
import { Property } from '../types';

export type ExtendedCategory = 'ALL' | 'HOUSE' | 'APARTMENT' | 'SHOP' | 'COMMERCIAL_BUILDING' | 'HOSTEL' | 'MARRIAGE_HALL';

/**
 * Determines whether a property is a House, Apartment/Flat, Shop, Commercial Building, Hostel/PG, or Marriage Hall/Mandapam.
 * Seamlessly backwards-compatible with backend HOUSE/SHOP enums without database schema changes.
 */
export function getPropertyCategory(property: Partial<Property>): 'HOUSE' | 'APARTMENT' | 'SHOP' | 'COMMERCIAL_BUILDING' | 'HOSTEL' | 'MARRIAGE_HALL' {
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

  // Check for Commercial Building
  if (
    combined.includes('[category:commercial_building]') ||
    combined.includes('commercial building') ||
    combined.includes('industrial building') ||
    combined.includes('office building') ||
    combined.includes('standalone commercial') ||
    combined.includes('full building') ||
    combined.includes('commercial complex') ||
    combined.includes('வணிக கட்டிடம்')
  ) {
    return 'COMMERCIAL_BUILDING';
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
export function getCategoryBadgeInfo(category: 'HOUSE' | 'APARTMENT' | 'SHOP' | 'COMMERCIAL_BUILDING' | 'HOSTEL' | 'MARRIAGE_HALL', lang: 'en' | 'ta' = 'en') {
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
    case 'COMMERCIAL_BUILDING':
      return {
        label: lang === 'ta' ? 'வணிக கட்டிடம்' : 'Commercial Building',
        Icon: Building2,
        badgeBg: 'bg-[#FCFAF5]',
        badgeText: 'text-[#9A7818]',
        badgeBorder: 'border-[#E8DFC8]',
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
  { id: 'Commercial Building', label: 'Commercial Building', labelTa: 'வணிக கட்டிடம் (Commercial Building)' },
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
      if (type.includes('commercial building') || type.includes('complex')) {
        return text.includes('commercial building') || text.includes('commercial complex') || text.includes('office building') || text.includes('complex') || text.includes('[commercial:commercial_building]') || text.includes('[category:commercial_building]');
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

  const tokens = str.split(',').map((s) => s.trim().toUpperCase());
  const has1RK = tokens.includes('1RK');
  const has4Plus = tokens.some((t) => t.endsWith('+') || t === '4+');
  const numericList = tokens.map((t) => parseInt(t, 10)).filter((n) => !isNaN(n));

  return properties.filter((p) => {
    if (p.propertyType === 'SHOP') return false;
    const b = p.bedrooms ?? (p.rooms ?? 0);
    const text = `${p.title || ''} ${p.description || ''}`.toUpperCase();

    if (has1RK) {
      const isExplicit1RK = text.includes('1RK') || text.includes('1 RK');
      if (isExplicit1RK || b === 1 || (p.rooms === 1 && !p.bedrooms)) {
        if (tokens.length === 1) return true;
      }
    }

    if (has4Plus && b >= 4) return true;
    return numericList.includes(b);
  });
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
  { id: '1', label: 'Single (1 Member)', labelTa: 'தனி நபர் (Single Room)' },
  { id: '2', label: '2 Sharing (2 Members)', labelTa: '2 பேர் பகிர்வு (2 Sharing)' },
  { id: '3', label: '3 Sharing (3 Members)', labelTa: '3 பேர் பகிர்வு (3 Sharing)' },
  { id: '4+', label: '4+ Sharing (4+ Members)', labelTa: '4+ பேர் பகிர்வு (Dormitory)' },
] as const;

/**
 * Hostel Total Capacity / Members Options
 */
export const HOSTEL_TOTAL_MEMBERS = [
  { id: '1-10', label: 'Up to 10 Members', labelTa: '10 பேர் வரை (சிறிய PG)' },
  { id: '11-25', label: '11 – 25 Members', labelTa: '11 – 25 பேர்' },
  { id: '26-50', label: '26 – 50 Members', labelTa: '26 – 50 பேர்' },
  { id: '50+', label: '50+ Members', labelTa: '50+ பேர் (பெரிய விடுதி)' },
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
 * Marriage Hall Dining Seating Capacity Ranges
 */
export const MARRIAGE_HALL_DINING = [
  { id: 'UP_TO_150', label: 'Up to 150 Seater', labelSub: 'Mini Dining Hall', labelTa: '150 இலைகள் வரை (மினி பந்தி)' },
  { id: '150_TO_350', label: '150 – 350 Seater', labelSub: 'Standard Dining Hall', labelTa: '150 – 350 இலைகள்' },
  { id: '350_TO_600', label: '350 – 600 Seater', labelSub: 'Large Dining Hall', labelTa: '350 – 600 இலைகள்' },
  { id: '600_PLUS', label: '600+ Seater', labelSub: 'Grand Dining / Mega Feast', labelTa: '600+ இலைகள் (பிரம்மாண்ட பந்தி)' },
] as const;

/**
 * Marriage Hall Air Conditioning Types
 */
export const MARRIAGE_HALL_AC_TYPES = [
  { id: 'AC', label: '❄️ Centralized AC Hall', labelTa: '❄️ முழு ஏசி அரங்கம் (AC Hall)' },
  { id: 'NON_AC', label: '🍃 Non-AC Hall', labelTa: '🍃 ஏசி அல்லாதது (Non-AC)' },
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
 * Filter properties by Hostel Room Sharing / Members
 */
export function filterByHostelSharing(properties: Property[], sharing: string): Property[] {
  if (!sharing) return properties;
  const s = String(sharing).trim();

  return properties.filter((p) => {
    const text = `${p.title || ''} ${p.description || ''} ${(p.amenities || []).join(' ')}`.toLowerCase();
    const b = p.bedrooms ?? (p.rooms ?? 0);

    if (s === '1') {
      return (
        text.includes('single room') ||
        text.includes('single sharing') ||
        text.includes('1 sharing') ||
        text.includes('private room') ||
        text.includes('1 bed') ||
        text.includes('தனி அறை') ||
        b === 1
      );
    }
    if (s === '2') {
      return (
        text.includes('2 sharing') ||
        text.includes('two sharing') ||
        text.includes('double sharing') ||
        text.includes('twin sharing') ||
        text.includes('2 bed') ||
        text.includes('2 பேர்') ||
        b === 2
      );
    }
    if (s === '3') {
      return (
        text.includes('3 sharing') ||
        text.includes('three sharing') ||
        text.includes('triple sharing') ||
        text.includes('3 bed') ||
        text.includes('3 பேர்') ||
        b === 3
      );
    }
    if (s === '4+' || s === '4') {
      return (
        text.includes('4 sharing') ||
        text.includes('four sharing') ||
        text.includes('4+ sharing') ||
        text.includes('dormitory') ||
        text.includes('dorm') ||
        text.includes('4 bed') ||
        text.includes('5 sharing') ||
        text.includes('6 sharing') ||
        text.includes('4+ பேர்') ||
        b >= 4
      );
    }
    return text.includes(s);
  });
}

/**
 * Filter properties by Hostel Total Members / Capacity
 */
export function filterByHostelTotalMembers(properties: Property[], totalMembers: string): Property[] {
  if (!totalMembers) return properties;
  const tm = String(totalMembers).trim();

  return properties.filter((p) => {
    const text = `${p.title || ''} ${p.description || ''} ${(p.amenities || []).join(' ')}`.toLowerCase();

    if (tm === '1-10') {
      return (
        text.includes('10 member') ||
        text.includes('10 bed') ||
        text.includes('small pg') ||
        text.includes('home pg') ||
        text.includes('5 bed') ||
        text.includes('6 bed') ||
        text.includes('8 bed') ||
        text.includes('[capacity:1-10]')
      );
    }
    if (tm === '11-25') {
      return (
        text.includes('15 member') ||
        text.includes('20 member') ||
        text.includes('25 member') ||
        text.includes('15 bed') ||
        text.includes('20 bed') ||
        text.includes('25 bed') ||
        text.includes('[capacity:11-25]')
      );
    }
    if (tm === '26-50') {
      return (
        text.includes('30 member') ||
        text.includes('40 member') ||
        text.includes('50 member') ||
        text.includes('30 bed') ||
        text.includes('40 bed') ||
        text.includes('50 bed') ||
        text.includes('[capacity:26-50]')
      );
    }
    if (tm === '50+') {
      return (
        text.includes('50+') ||
        text.includes('60 member') ||
        text.includes('100 member') ||
        text.includes('large hostel') ||
        text.includes('mansion') ||
        text.includes('[capacity:50+]')
      );
    }
    return text.includes(tm);
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
 * Filter properties by Marriage Hall Dining Seating Capacity
 */
export function filterByHallDining(properties: Property[], dining: string): Property[] {
  if (!dining) return properties;

  return properties.filter((p) => {
    const text = `${p.title} ${p.description} ${(p.amenities || []).join(' ')}`.toLowerCase();

    if (dining === 'UP_TO_150') {
      return (
        text.includes('100') ||
        text.includes('150') ||
        text.includes('mini dining') ||
        text.includes('small dining') ||
        text.includes('[dining:up_to_150]')
      );
    }
    if (dining === '150_TO_350') {
      return (
        text.includes('200') ||
        text.includes('250') ||
        text.includes('300') ||
        text.includes('350') ||
        text.includes('[dining:150_to_350]')
      );
    }
    if (dining === '350_TO_600') {
      return (
        text.includes('400') ||
        text.includes('500') ||
        text.includes('600') ||
        text.includes('[dining:350_to_600]')
      );
    }
    if (dining === '600_PLUS') {
      return (
        text.includes('600+') ||
        text.includes('700') ||
        text.includes('800') ||
        text.includes('1000') ||
        text.includes('grand dining') ||
        text.includes('mega dining') ||
        text.includes('[dining:600_plus]')
      );
    }
    return true;
  });
}

/**
 * Filter properties by Marriage Hall Air Conditioning (AC)
 */
export function filterByHallAc(properties: Property[], acType: string): Property[] {
  if (!acType) return properties;

  return properties.filter((p) => {
    const text = `${p.title} ${p.description} ${(p.amenities || []).join(' ')}`.toLowerCase();

    if (acType === 'AC') {
      return (
        text.includes('centralized ac') ||
        text.includes('central ac') ||
        text.includes('air conditioned') ||
        text.includes('air-conditioned') ||
        text.includes('ac hall') ||
        text.includes('a/c') ||
        text.includes('ஏசி') ||
        text.includes('[amenity:ac]')
      );
    }
    if (acType === 'NON_AC') {
      return (
        text.includes('non-ac') ||
        text.includes('non ac') ||
        text.includes('natural ventilation') ||
        text.includes('open hall') ||
        (!text.includes('centralized ac') && !text.includes('air conditioned') && !text.includes('a/c hall'))
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

/**
 * Filter properties by Floor (Ground, 1st - 3rd, 4th+)
 */
export function filterByFloor(properties: Property[], floor: string): Property[] {
  if (!floor || floor === 'all' || floor === '') return properties;
  const f = floor.toLowerCase().trim();

  return properties.filter((p) => {
    const text = `${p.title} ${p.description} ${(p.amenities || []).join(' ')}`.toLowerCase();

    if (f === 'ground' || f === '0') {
      return (
        text.includes('ground floor') ||
        text.includes('ground') ||
        text.includes('gf') ||
        text.includes('g floor') ||
        text.includes('தரை தளம்')
      );
    }
    if (f === '1-3') {
      return (
        text.includes('1st floor') ||
        text.includes('2nd floor') ||
        text.includes('3rd floor') ||
        text.includes('first floor') ||
        text.includes('second floor') ||
        text.includes('third floor') ||
        text.includes('1st') ||
        text.includes('2nd') ||
        text.includes('3rd') ||
        text.includes('1 வது தளம்') ||
        text.includes('2 வது தளம்') ||
        text.includes('3 வது தளம்')
      );
    }
    if (f === '4+' || f === '4') {
      return (
        text.includes('4th floor') ||
        text.includes('5th floor') ||
        text.includes('6th floor') ||
        text.includes('fourth floor') ||
        text.includes('fifth floor') ||
        text.includes('4th') ||
        text.includes('5th') ||
        text.includes('4+ floor')
      );
    }
    return text.includes(f);
  });
}

/**
 * Filter properties by Parking (Car, Covered Parking)
 */
export function filterByParking(properties: Property[], parking: string | boolean): Property[] {
  if (!parking || parking === 'all' || parking === '') return properties;
  const pStr = String(parking).toLowerCase().trim();

  return properties.filter((p) => {
    const text = `${p.title} ${p.description} ${(p.amenities || []).join(' ')}`.toLowerCase();

    if (pStr === 'covered') {
      return (
        text.includes('covered parking') ||
        text.includes('covered car parking') ||
        text.includes('covered') ||
        text.includes('🛡️')
      );
    }
    if (pStr === 'car' || pStr === 'true' || pStr === 'yes') {
      return (
        text.includes('car parking') ||
        text.includes('car park') ||
        text.includes('four wheeler') ||
        text.includes('covered parking') ||
        text.includes('parking') ||
        text.includes('🚗')
      );
    }
    return text.includes('parking');
  });
}

/**
 * Filter properties by built-up size (Square Feet)
 */
export function filterBySize(
  properties: Property[],
  minSize?: number | string | '',
  maxSize?: number | string | ''
): Property[] {
  const hasMin = minSize !== '' && minSize !== undefined && minSize !== null && !isNaN(Number(minSize));
  const hasMax = maxSize !== '' && maxSize !== undefined && maxSize !== null && !isNaN(Number(maxSize));

  if (!hasMin && !hasMax) return properties;

  const min = hasMin ? Number(minSize) : 0;
  const max = hasMax ? Number(maxSize) : Infinity;

  return properties.filter((p) => {
    const size = p.propertySize || 0;
    return size >= min && size <= max;
  });
}

