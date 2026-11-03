import api from '../lib/axios';
import { ApiResponse } from '../types';
import { PromotionalOffer, PROMOTIONAL_OFFERS, getActiveOffers, isOfferActive } from '../config/offersConfig';

export interface OffersResponseData {
  activeOffers: PromotionalOffer[];
  allOffers: (PromotionalOffer & { isCurrentlyActive?: boolean })[];
}

export const offerService = {
  getOffers: async (): Promise<OffersResponseData> => {
    try {
      const res = await api.get<ApiResponse<OffersResponseData>>('/api/offers');
      if (res.data?.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[offerService] API not reachable, falling back to local offersConfig:', err);
    }

    // Fallback to local config
    const active = getActiveOffers();
    const all = PROMOTIONAL_OFFERS.map((o) => ({
      ...o,
      isCurrentlyActive: isOfferActive(o),
    }));

    return {
      activeOffers: active,
      allOffers: all,
    };
  },
};
