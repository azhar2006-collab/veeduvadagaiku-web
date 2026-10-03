import { Cashfree, CFEnvironment } from 'cashfree-pg';

const environment =
  process.env.CASHFREE_ENV === 'production'
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

const clientId = process.env.CASHFREE_APP_ID || '';
const clientSecret = process.env.CASHFREE_SECRET_KEY || '';

const cashfree = new Cashfree(environment, clientId, clientSecret);

export default cashfree;
