import { Router, Request, Response } from 'express';
import { PROMOTIONAL_OFFERS, getActiveOffers, isOfferActive } from '../config/offerConfig';
import { successResponse } from '../utils/response';

const router = Router();

/**
 * GET /api/offers
 * Returns active offers and metadata
 */
router.get('/', (req: Request, res: Response) => {
  const activeOffers = getActiveOffers();
  const allOffersWithStatus = PROMOTIONAL_OFFERS.map((offer) => ({
    ...offer,
    isCurrentlyActive: isOfferActive(offer),
  }));

  res.json(
    successResponse({
      activeOffers,
      allOffers: allOffersWithStatus,
    })
  );
});

export default router;
