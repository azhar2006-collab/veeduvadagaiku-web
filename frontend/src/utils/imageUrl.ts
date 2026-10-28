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

  // Resolve backend base URL — in production on Vercel, use relative paths so Vercel proxies with zero CORS!
  const backendBase = (
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' &&
     window.location.hostname !== 'localhost' &&
     window.location.hostname !== '127.0.0.1'
      ? ''
      : 'https://veeduvadagaiku-web-production.up.railway.app')
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

  // Filter out and reject fake stock photos — never treat them as real property images
  if (trimmed.startsWith('/indian-properties/') || trimmed.includes('indian-properties')) {
    return '';
  }

  // Static assets located in the frontend public directory
  if (
    trimmed.startsWith('/properties/') ||
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
 * Never return fake stock house photos as fallbacks.
 * Returns empty string so components render their clean native placeholder icons.
 */
export const getPropertyFallbackImage = (_propertyType?: string, _id?: string): string => {
  return '';
};
