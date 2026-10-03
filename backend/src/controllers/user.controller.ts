import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { successResponse, ApiError } from '../utils/response';
import { updateProfileSchema } from '../utils/validators';

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, email: true, mobile: true,
        role: true, profileImage: true, status: true, createdAt: true,
      },
    });
    if (!user) throw new ApiError(404, 'User not found');
    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name: data.name, profileImage: data.profileImage ?? undefined },
      select: { id: true, name: true, email: true, mobile: true, role: true, profileImage: true },
    });
    res.json(successResponse(user, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
}

export async function getUserFavourites(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const favourites = await prisma.favourite.findMany({
      where: { userId: req.user!.id },
      include: {
        property: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const properties = favourites
      .filter((f) => f.property.status === 'PUBLISHED')
      .map((f) => ({ ...f.property, isFavourite: true }));
    res.json(successResponse(properties));
  } catch (error) {
    next(error);
  }
}

export async function getUserEnquiries(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const enquiries = await prisma.enquiry.findMany({
      where: { userId: req.user!.id },
      include: {
        property: {
          select: { id: true, title: true, locality: true, rent: true, images: { where: { isPrimary: true }, take: 1 } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(successResponse(enquiries));
  } catch (error) {
    next(error);
  }
}
