import { Cashfree, CFEnvironment } from 'cashfree-pg';
import dotenv from 'dotenv';
dotenv.config();

export const getCashfreeAppId = (): string => process.env.CASHFREE_APP_ID || '';
export const getCashfreeSecretKey = (): string => process.env.CASHFREE_SECRET_KEY || '';

const getEnvironment = (): CFEnvironment =>
  process.env.CASHFREE_ENV === 'production'
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

/** Returns true only if Cashfree API keys are actually configured in environment variables */
export function isCashfreeConfigured(): boolean {
  return Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
}

/** Create and return Cashfree instance on demand with latest environment variables */
export function createCashfreeInstance(): Cashfree {
  return new Cashfree(getEnvironment(), getCashfreeAppId(), getCashfreeSecretKey());
}

export const cashfree = new Proxy({} as Cashfree, {
  get(_target, prop) {
    const client = createCashfreeInstance() as any;
    const val = client[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});

export default cashfree;
