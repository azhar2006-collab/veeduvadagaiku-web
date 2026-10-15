import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

export const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
export const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

export const isRazorpayConfigured = (): boolean => {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
};

export function createRazorpayInstance(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_placeholder';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';
  return new Razorpay({
    key_id,
    key_secret,
  });
}

// Lazy proxy so it never throws on module import if keys are missing
export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    if (!isRazorpayConfigured()) {
      console.warn('[Razorpay] Attempted to use Razorpay client but RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not configured.');
    }
    const client = createRazorpayInstance() as any;
    const val = client[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});

export default razorpay;

