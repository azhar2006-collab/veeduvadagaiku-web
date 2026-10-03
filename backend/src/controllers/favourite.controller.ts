import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { successResponse } from '../utils/response';

export async function toggleFavourite(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { propertyId } = req.params;
    const userId = req.user!.id;

    const existing = await prisma.favourite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });

    if (existing) {
      await prisma.favourite.delete({ where: { userId_propertyId: { userId, propertyId } } });
      res.json(successResponse({ isFavourite: false }, 'Removed from favourites'));
    } else {
      await prisma.favourite.create({ data: { userId, propertyId } });
      res.json(successResponse({ isFavourite: true }, 'Added to favourites'));
    }
  } catch (error) {
    next(error);
  }
}

export async function getFavouriteIds(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const favs = await prisma.favourite.findMany({
      where: { userId: req.user!.id },
      select: { propertyId: true },
    });
    res.json(successResponse(favs.map((f) => f.propertyId)));
  } catch (error) {
    next(error);
  }
}
