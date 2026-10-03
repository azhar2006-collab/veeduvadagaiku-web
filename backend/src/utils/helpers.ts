export const CHENNAI_LOCALITIES = [
  'Adyar', 'Alwarpet', 'Anna Nagar', 'Arumbakkam', 'Ashok Nagar',
  'Avadi', 'Besant Nagar', 'Chromepet', 'Egmore', 'Guindy',
  'Kattupakkam', 'Kelambakkam', 'Kilpauk', 'Kodambakkam', 'Korattur',
  'Kotturpuram', 'Koyambedu', 'Madipakkam', 'Maduravoyal', 'Manali',
  'Meenambakkam', 'Mogappair', 'Mylapore', 'Nandanam', 'Nungambakkam',
  'Pallavaram', 'Pattabiram', 'Perambur', 'Perungudi', 'Porur',
  'Purasaiwakkam', 'Royapettah', 'Saidapet', 'Sholinganallur', 'Tambaram',
  'T. Nagar', 'Thiruvanmiyur', 'Thoraipakkam', 'Tondiarpet', 'Vadapalani',
  'Valasaravakkam', 'Velachery', 'Villivakkam', 'West Mambalam', 'Zamin Pallavaram',
];

export function parsePaginationParams(query: Record<string, unknown>): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(String(query.page || 1)));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || 12))));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
