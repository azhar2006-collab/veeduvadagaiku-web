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
 * Returns an initialized Cashfree instance configured for sandbox/production.
 */
export const getCashfree = async () => {
  const loaded = await loadCashfreeScript();
  if (!loaded || !(window as any).Cashfree) {
    throw new Error('Cashfree SDK could not be loaded. Please check your network connection.');
  }

  const isProduction = import.meta.env.VITE_CASHFREE_ENV === 'production';
  return (window as any).Cashfree({
    mode: isProduction ? 'production' : 'sandbox',
  });
};
