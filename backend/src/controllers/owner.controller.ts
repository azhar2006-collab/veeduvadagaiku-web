import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { successResponse, ApiError } from '../utils/response';
import { updateProfileSchema } from '../utils/validators';

export async function registerOwner(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    // Check if already owner
    const existing = await prisma.owner.findUnique({ where: { userId } });
    if (existing) throw new ApiError(409, 'You are already registered as an owner');

    // Update user role and create owner profile
    const [user] = await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { role: 'OWNER' } }),
      prisma.owner.create({ data: { userId } }),
    ]);

    res.status(201).json(successResponse({ role: 'OWNER' }, 'Owner registration successful'));
  } catch (error) {
    next(error);
  }
}

export async function getOwnerProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const owner = await prisma.owner.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: { select: { id: true, name: true, email: true, mobile: true, profileImage: true, createdAt: true } },
        _count: { select: { properties: true, enquiries: true } },
      },
    });
    if (!owner) throw new ApiError(404, 'Owner profile not found');
    res.json(successResponse(owner));
  } catch (error) {
    next(error);
  }
}

export async function updateOwnerProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateProfileSchema.parse(req.body);
    const owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) throw new ApiError(404, 'Owner profile not found');

    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user!.id },
        data: { name: data.name, profileImage: data.profileImage ?? undefined },
      }),
      prisma.owner.update({
        where: { id: owner.id },
        data: { bio: data.bio ?? undefined },
      }),
    ]);

    res.json(successResponse(null, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
}

export async function getOwnerDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) throw new ApiError(404, 'Owner profile not found');

    const [propertyCounts, recentEnquiries, recentPayments] = await Promise.all([
      prisma.property.groupBy({
        by: ['status'],
        where: { ownerId: owner.id },
        _count: true,
      }),
      prisma.enquiry.findMany({
        where: { ownerId: owner.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          property: { select: { id: true, title: true } },
          user: { select: { name: true, mobile: true } },
        },
      }),
      prisma.payment.findMany({
        where: { ownerId: owner.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { plan: { select: { name: true } }, property: { select: { title: true } } },
      }),
    ]);

    const stats: Record<string, number> = {};
    propertyCounts.forEach((pc) => { stats[pc.status] = pc._count; });

    res.json(successResponse({ stats, recentEnquiries, recentPayments }));
  } catch (error) {
    next(error);
  }
}

export async function getOwnerEnquiries(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) throw new ApiError(404, 'Owner profile not found');

    const enquiries = await prisma.enquiry.findMany({
      where: { ownerId: owner.id },
      include: {
        property: { select: { id: true, title: true, locality: true } },
        user: { select: { id: true, name: true, mobile: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(successResponse(enquiries));
  } catch (error) {
    next(error);
  }
}
