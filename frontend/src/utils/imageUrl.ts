/**
 * Returns a fully-qualified absolute URL for property and service images.
 * Handles relative /uploads/... paths by pointing them to the backend server.
 * Handles existing full URLs (Cloudinary, external CDNs) without modification.
 * Returns a fallback placeholder if no image URL is provided.
 */
export const getImageUrl = (url?: string | null, fallback = ''): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }

  // Strip all leading/trailing whitespace, tabs, and newlines
  const trimmed = url.trim().replace(/^[\t\r\n]+/, '').replace(/[\t\r\n]+$/, '');
  if (!trimmed) {
    return fallback;
  }

  // Data URLs (e.g. data:image/png;base64,...)
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Resolve backend base URL
  const backendBase = (
    import.meta.env.VITE_API_URL ||
    'https://veeduvadagaiku-web-production.up.railway.app'
  ).replace(/\/$/, '');

  // Missing https:// protocol on domain strings (e.g. veeduvadagaiku-web-production.up.railway.app/uploads/...)
  if (
    trimmed.startsWith('veeduvadagaiku-') ||
    trimmed.includes('.railway.app') ||
    /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\/(uploads|properties)/.test(trimmed)
  ) {
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed.replace(/^\/+/, '')}`;
    }
  }

  // Already an absolute HTTP/HTTPS URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it points to localhost and we are NOT in a local browser environment, remap to production backend
    if (
      trimmed.includes('localhost:5000') &&
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      return trimmed.replace(/http:\/\/localhost:5000/, backendBase);
    }
    return trimmed;
  }

  // Static assets located in the frontend public directory
  if (
    trimmed.startsWith('/properties/') ||
    trimmed.startsWith('/indian-properties/') ||
    trimmed.startsWith('/logo') ||
    trimmed.startsWith('/favicon')
  ) {
    return trimmed;
  }

  // Uploaded media files hosted on the backend server (e.g. /uploads/...)
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendBase}${cleanPath}`;
};

/**
 * Returns a high-quality, local Chennai property photo based on property category & ID.
 * Used as a deterministic fallback whenever an image URL is missing, invalid, or 404s.
 */
export const getPropertyFallbackImage = (propertyType?: string, id?: string): string => {
  const houseImages = [
    '/indian-properties/house1.jpg',
    '/indian-properties/house2.jpg',
    '/indian-properties/house3.jpg',
    '/indian-properties/house4.jpg',
    '/indian-properties/house5.jpg',
    '/indian-properties/house6.jpg',
  ];
  const shopImages = [
    '/indian-properties/shop1.jpg',
    '/indian-properties/shop2.jpg',
    '/indian-properties/shop3.jpg',
    '/indian-properties/shop4.jpg',
  ];

  const type = (propertyType || '').toUpperCase();
  const isCommercial =
    type === 'SHOP' ||
    type === 'COMMERCIAL' ||
    type === 'OFFICE' ||
    type.includes('COMMERCIAL') ||
    type.includes('SHOP');

  const pool = isCommercial ? shopImages : houseImages;
  if (!id) return pool[0];

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return pool[Math.abs(hash) % pool.length];
};
