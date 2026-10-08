/**
 * Generates WhatsApp share URL with prefilled rich message
 */
export const getWhatsAppShareUrl = (
  property: {
    id: string;
    title: string;
    rent: number;
    deposit?: number;
    locality: string;
    propertyType?: string;
    bedrooms?: number | null;
  },
  lang: 'en' | 'ta' = 'en'
): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://veeduvadagaiku.com';
  const url = `${origin}/property/${property.id}`;

  const formattedRent = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(property.rent);

  const formattedDeposit = property.deposit
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(property.deposit)
    : '';

  let message = '';
  if (lang === 'ta') {
    message = `*${property.title}*\nஇடம்: ${property.locality}, சென்னை\nமாத வாடகை: ${formattedRent}${
      formattedDeposit ? ` | முன்பணம்: ${formattedDeposit}` : ''
    }\n\nமுழு விவரங்கள் மற்றும் புகைப்படங்கள் காண இங்கே கிளிக் செய்யவும்:\n${url}\n\n(வீடு வாடகைக்கு - நேரடி உரிமையாளர் தொடர்பு)`;
  } else {
    message = `*${property.title}*\nLocation: ${property.locality}, Chennai\nRent: ${formattedRent}/month${
      formattedDeposit ? ` | Deposit: ${formattedDeposit}` : ''
    }\n\nView photos & full details on Veedu Vadagaiku:\n${url}\n\n(Direct Landlord Contact - Verified Listings)`;
  }

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
};
