import React from 'react';
import { SEOHead } from '../../components/common/SEOHead';
import { DeepavaliPlansShowcase } from '../../components/plans/DeepavaliPlansShowcase';

export const OffersPage: React.FC = () => {
  return (
    <div>
      <SEOHead
        title="Deepavali Offers & Owner Plans | Veedu Vadagaikku Chennai"
        description="List your Chennai house, flat, shop, marriage hall or home service free till Deepavali, 8 Nov 2026. Zero brokerage, 100% free posting."
      />
      <DeepavaliPlansShowcase />
    </div>
  );
};
