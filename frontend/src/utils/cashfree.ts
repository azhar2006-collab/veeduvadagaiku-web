/**
 * Dynamically loads the Cashfree Web SDK (v3) script if not already loaded.
 */
export const loadCashfreeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Cashfree) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Returns an initialized Cashfree instance.
 * ALWAYS uses 'production' mode because we use live Production API keys.
 * Using 'sandbox' with production keys (or vice versa) causes payment_session_id_invalid.
 */
export const getCashfree = async () => {
  const loaded = await loadCashfreeScript();
  if (!loaded || !(window as any).Cashfree) {
    throw new Error('Cashfree SDK could not be loaded. Please check your network connection.');
  }

  // Check env var — default to 'production' because the backend uses production API keys.
  // Only use sandbox if EXPLICITLY set to 'sandbox'.
  const envVal = (import.meta.env.VITE_CASHFREE_ENV || 'production').toLowerCase().trim();
  const mode = envVal === 'sandbox' ? 'sandbox' : 'production';

  console.log('[Cashfree SDK] Initializing with mode:', mode);

  return (window as any).Cashfree({ mode });
};
