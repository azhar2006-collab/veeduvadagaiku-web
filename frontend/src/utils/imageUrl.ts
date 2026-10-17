/**
 * Returns a fully-qualified absolute URL for property and service images.
 * Handles relative /uploads/... paths by pointing them to the backend server.
 * Handles existing full URLs (Cloudinary, external CDNs) without modification.
 * Returns a fallback placeholder if no image URL is provided.
 */
export const getImageUrl = (url?: string | null, fallback = '/properties/property-1.png'): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }

  const trimmed = url.trim();

  // Already an absolute HTTP/HTTPS URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
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
  const backendBase = (
    import.meta.env.VITE_API_URL ||
    'https://veeduvadagaiku-web-production.up.railway.app'
  ).replace(/\/$/, '');

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendBase}${cleanPath}`;
};
