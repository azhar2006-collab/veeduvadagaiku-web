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

/**
 * Resilient multi-tier resolver for a property's primary photo.
 * 1. Checks device localStorage (if uploaded in this browser).
 * 2. Checks PostgreSQL database amenities array ([IMG_PRIMARY:data:image/...]).
 * 3. Checks server images array (filtering out fake stock photos).
 */
export const getPropertyPrimaryImage = (property?: {
  id?: string;
  images?: Array<{ imageUrl?: string; isPrimary?: boolean }>;
  amenities?: string[];
}): string => {
  if (!property) return '';

  // 1. Check local storage if owner uploaded photo in this browser
  if (typeof window !== 'undefined' && property.id) {
    try {
      const local = localStorage.getItem(`owner_prop_img_${property.id}`);
      if (local && local.startsWith('data:image/')) return local;
    } catch {}
  }

  // 2. Check embedded base64 in amenities (persisted directly in PostgreSQL database)
  if (property.amenities && Array.isArray(property.amenities)) {
    const primary = property.amenities.find(
      (a) => a.startsWith('[IMG_PRIMARY:') && a.endsWith(']')
    );
    if (primary) {
      const b64 = primary.slice('[IMG_PRIMARY:'.length, -1);
      if (b64.startsWith('data:image/')) return b64;
    }
    const extra = property.amenities.find(
      (a) => a.startsWith('[IMG_EXTRA:') && a.endsWith(']')
    );
    if (extra) {
      const b64 = extra.slice('[IMG_EXTRA:'.length, -1);
      if (b64.startsWith('data:image/')) return b64;
    }
  }

  // 3. Check server-stored images table
  if (property.images && Array.isArray(property.images)) {
    const raw =
      property.images.find((img) => img.isPrimary)?.imageUrl ||
      property.images[0]?.imageUrl;
    if (raw && !raw.includes('indian-properties')) {
      if (raw.startsWith('data:image/')) return raw;
      return getImageUrl(raw);
    }
  }

  return '';
};
