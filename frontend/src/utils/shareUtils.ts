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
    message = `🏡 *${property.title}*\n📍 இடம்: ${property.locality}, சென்னை\n💰 மாத வாடகை: ${formattedRent}${
      formattedDeposit ? ` | முன்பணம்: ${formattedDeposit}` : ''
    }\n\n✨ முழு விவரங்கள் மற்றும் புகைப்படங்கள் காண இங்கே கிளிக் செய்யவும்:\n👉 ${url}\n\n(வீடு வாடகைக்கு - நேரடி உரிமையாளர் தொடர்பு | இடைத்தரகர் கட்டணம் இல்லை)`;
  } else {
    message = `🏡 *${property.title}*\n📍 Location: ${property.locality}, Chennai\n💰 Rent: ${formattedRent}/month${
      formattedDeposit ? ` | Deposit: ${formattedDeposit}` : ''
    }\n\n✨ View photos & full details on Veedu Vadagaiku:\n👉 ${url}\n\n(Direct Landlord Contact - Zero Brokerage)`;
  }

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
};
