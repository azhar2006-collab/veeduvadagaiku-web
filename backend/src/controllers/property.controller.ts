import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { successResponse, paginatedResponse, ApiError } from '../utils/response';
import { createPropertySchema, updatePropertySchema } from '../utils/validators';
import { parsePaginationParams, CHENNAI_LOCALITIES } from '../utils/helpers';
import cloudinary from '../config/cloudinary';
import streamifier from 'streamifier';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// ─── Public Endpoints ───────────────────────────────────────────────

export async function listProperties(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      propertyType, locality, minRent, maxRent,
      bedrooms, furnishing, minSize, maxSize,
      sortBy = 'newest', availability,
    } = req.query;

    const { page, limit, skip } = parsePaginationParams(req.query as Record<string, unknown>);

    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (propertyType) where.propertyType = propertyType;
    if (locality) where.locality = { contains: locality as string, mode: 'insensitive' };
    if (minRent || maxRent) {
      where.rent = {};
      if (minRent) (where.rent as Record<string, unknown>).gte = parseFloat(minRent as string);
      if (maxRent) (where.rent as Record<string, unknown>).lte = parseFloat(maxRent as string);
    }
    if (bedrooms) where.bedrooms = parseInt(bedrooms as string);
    if (furnishing) where.furnishing = furnishing;
    if (minSize || maxSize) {
      where.propertySize = {};
      if (minSize) (where.propertySize as Record<string, unknown>).gte = parseFloat(minSize as string);
      if (maxSize) (where.propertySize as Record<string, unknown>).lte = parseFloat(maxSize as string);
    }
    if (availability === 'available') where.availability = { lte: new Date() };

    const orderBy: Record<string, string> =
      sortBy === 'rent_asc' ? { rent: 'asc' }
      : sortBy === 'rent_desc' ? { rent: 'desc' }
      : { createdAt: 'desc' };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { enquiries: true } },
        },
      }),
      prisma.property.count({ where }),
    ]);

    res.json(paginatedResponse(properties, total, page, limit));
  } catch (error) {
    next(error);
  }
}

export async function getProperty(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = (req as AuthRequest).user;

    const property = await prisma.property.findFirst({
      where: {
        id,
        OR: [
          { status: 'PUBLISHED' },
          ...(user ? [{ owner: { userId: user.id } }, ...(user.role === 'ADMIN' ? [{}] : [])] : []),
        ],
      },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        owner: {
          include: {
            user: { select: { id: true, name: true, mobile: true, email: true, profileImage: true } },
          },
        },
      },
    });
    if (!property) throw new ApiError(404, 'Property not found');

    // Increment view count
    await prisma.property.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    res.json(successResponse(property));
  } catch (error) {
    next(error);
  }
}

export async function getLocalities(req: Request, res: Response) {
  res.json(successResponse(CHENNAI_LOCALITIES));
}

// ─── Owner Endpoints ─────────────────────────────────────────────────

export async function createProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) {
      owner = await prisma.owner.create({
        data: {
          userId: req.user!.id,
          isVerified: req.user!.role === 'ADMIN',
        },
      });
      if (req.user!.role === 'USER') {
        await prisma.user.update({
          where: { id: req.user!.id },
          data: { role: 'OWNER' },
        });
      }
    }

    const data = createPropertySchema.parse(req.body);
    const property = await prisma.property.create({
      data: {
        ...data,
        amenities: data.amenities || [],
        availability: new Date(data.availability),
        ownerId: owner.id,
        status: 'DRAFT',
      },
    });
    res.status(201).json(successResponse(property, 'Property created as draft'));
  } catch (error) {
    next(error);
  }
}

export async function updateProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) throw new ApiError(403, 'Owner profile not found');

    const property = await prisma.property.findFirst({ where: { id, ownerId: owner.id } });
    if (!property) throw new ApiError(404, 'Property not found or not authorized');

    // Can only edit DRAFT or REJECTED properties
    if (!['DRAFT', 'REJECTED'].includes(property.status)) {
      throw new ApiError(400, 'Only draft or rejected properties can be edited');
    }

    const data = updatePropertySchema.parse(req.body);
    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...data,
        availability: data.availability ? new Date(data.availability) : undefined,
        status: 'DRAFT',
      },
    });
    res.json(successResponse(updated, 'Property updated'));
  } catch (error) {
    next(error);
  }
}

export async function deleteProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) throw new ApiError(403, 'Owner profile not found');

    const property = await prisma.property.findFirst({
      where: { id, ownerId: owner.id },
      include: { images: true },
    });
    if (!property) throw new ApiError(404, 'Property not found or not authorized');

    // Delete images from Cloudinary
    for (const img of property.images) {
      try { await cloudinary.uploader.destroy(img.publicId); } catch {}
    }

    await prisma.property.update({ where: { id }, data: { status: 'REMOVED' } });
    res.json(successResponse(null, 'Property removed'));
  } catch (error) {
    next(error);
  }
}

export async function getOwnerProperties(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) throw new ApiError(403, 'Owner profile not found');

    const properties = await prisma.property.findMany({
      where: { ownerId: owner.id, status: { not: 'REMOVED' } },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { enquiries: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(successResponse(properties));
  } catch (error) {
    next(error);
  }
}

export async function uploadImages(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) throw new ApiError(403, 'Owner profile not found');

    const property = await prisma.property.findFirst({ where: { id, ownerId: owner.id } });
    if (!property) throw new ApiError(404, 'Property not found or not authorized');

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw new ApiError(400, 'No images provided');

    // Check existing image count
    const existingCount = await prisma.propertyImage.count({ where: { propertyId: id } });
    if (existingCount + files.length > 10) {
      throw new ApiError(400, `Cannot upload more than 10 images. Currently have ${existingCount}.`);
    }

    const uploadedImages = [];
    const isCloudinaryConfigured =
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_KEY !== 'your_cloudinary_api_key' &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let imageUrl = '';
      let publicId = `img_${uuidv4()}`;

      if (isCloudinaryConfigured) {
        try {
          const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: `veeduvadagaiku/properties/${id}`,
                transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto:good' }],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as { secure_url: string; public_id: string });
              }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });
          imageUrl = result.secure_url;
          publicId = result.public_id;
        } catch (cloudErr) {
          console.warn('[Upload] Cloudinary upload failed, falling back to local storage:', cloudErr);
        }
      }

      // If Cloudinary wasn't configured or failed, save locally
      if (!imageUrl) {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const ext = path.extname(file.originalname) || '.jpg';
        const fileName = `${id}_${Date.now()}_${i}${ext}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        imageUrl = `/uploads/${fileName}`;
      }

      const isPrimary = existingCount === 0 && i === 0;
      const img = await prisma.propertyImage.create({
        data: {
          propertyId: id,
          imageUrl,
          publicId,
          isPrimary,
          displayOrder: existingCount + i,
        },
      });
      uploadedImages.push(img);
    }

    res.status(201).json(successResponse(uploadedImages, 'Images uploaded successfully'));
  } catch (error) {
    next(error);
  }
}

export async function deleteImage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id, imageId } = req.params;
    const owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) throw new ApiError(403, 'Owner profile not found');

    const property = await prisma.property.findFirst({ where: { id, ownerId: owner.id } });
    if (!property) throw new ApiError(404, 'Property not found or not authorized');

    const image = await prisma.propertyImage.findFirst({ where: { id: imageId, propertyId: id } });
    if (!image) throw new ApiError(404, 'Image not found');

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);
    await prisma.propertyImage.delete({ where: { id: imageId } });

    // If deleted image was primary, set the first remaining as primary
    if (image.isPrimary) {
      const firstImage = await prisma.propertyImage.findFirst({
        where: { propertyId: id },
        orderBy: { displayOrder: 'asc' },
      });
      if (firstImage) {
        await prisma.propertyImage.update({ where: { id: firstImage.id }, data: { isPrimary: true } });
      }
    }

    res.json(successResponse(null, 'Image deleted'));
  } catch (error) {
    next(error);
  }
}

export async function reorderImages(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { imageOrders } = req.body as { imageOrders: Array<{ id: string; displayOrder: number; isPrimary?: boolean }> };

    const owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) throw new ApiError(403, 'Owner profile not found');

    const property = await prisma.property.findFirst({ where: { id, ownerId: owner.id } });
    if (!property) throw new ApiError(404, 'Property not found or not authorized');

    await prisma.$transaction(
      imageOrders.map((img) =>
        prisma.propertyImage.update({
          where: { id: img.id },
          data: { displayOrder: img.displayOrder, isPrimary: img.isPrimary || false },
        })
      )
    );

    res.json(successResponse(null, 'Images reordered'));
  } catch (error) {
    next(error);
  }
}
