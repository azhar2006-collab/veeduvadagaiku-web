import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { successResponse, ApiError } from '../utils/response';
import { createEnquirySchema } from '../utils/validators';

export async function createEnquiry(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createEnquirySchema.parse(req.body);
    const property = await prisma.property.findFirst({
      where: { id: data.propertyId, status: 'PUBLISHED' },
      include: { owner: true },
    });
    if (!property) throw new ApiError(404, 'Property not found');

    // Prevent duplicate enquiries from same user on same property
    const existing = await prisma.enquiry.findFirst({
      where: { propertyId: data.propertyId, userId: req.user!.id },
    });
    if (existing) throw new ApiError(409, 'You have already sent an enquiry for this property');

    const enquiry = await prisma.enquiry.create({
      data: {
        propertyId: data.propertyId,
        userId: req.user!.id,
        ownerId: property.ownerId,
        message: data.message,
        phone: data.phone,
      },
    });
    res.status(201).json(successResponse(enquiry, 'Enquiry submitted successfully'));
  } catch (error) {
    next(error);
  }
}

export async function updateEnquiryStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['READ', 'REPLIED', 'CLOSED'];
    if (!validStatuses.includes(status)) throw new ApiError(400, 'Invalid status');

    const owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) throw new ApiError(403, 'Owner profile not found');

    const enquiry = await prisma.enquiry.findFirst({ where: { id, ownerId: owner.id } });
    if (!enquiry) throw new ApiError(404, 'Enquiry not found or not authorized');

    const updated = await prisma.enquiry.update({ where: { id }, data: { status } });
    res.json(successResponse(updated, 'Enquiry status updated'));
  } catch (error) {
    next(error);
  }
}
