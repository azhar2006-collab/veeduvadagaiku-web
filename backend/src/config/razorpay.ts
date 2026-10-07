import Razorpay from 'razorpay';

export const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
export const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

export const isRazorpayConfigured = (): boolean => {
  return Boolean(razorpayKeyId && razorpayKeySecret);
};

export const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

export default razorpay;
