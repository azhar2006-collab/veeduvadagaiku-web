import { Cashfree, CFEnvironment } from 'cashfree-pg';

const environment =
  process.env.CASHFREE_ENV === 'production'
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

const clientId = process.env.CASHFREE_APP_ID || '';
const clientSecret = process.env.CASHFREE_SECRET_KEY || '';

const cashfree = new Cashfree(environment, clientId, clientSecret);

/** Returns true only if Cashfree API keys are actually configured */
export function isCashfreeConfigured(): boolean {
  return !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
}

export default cashfree;
