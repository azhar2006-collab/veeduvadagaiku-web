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
      sortBy = 'newest', availability, category, commercialType,
      hostelGender, hallCapacity,
    } = req.query;

    const { page, limit, skip } = parsePaginationParams(req.query as Record<string, unknown>);

    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (propertyType) where.propertyType = propertyType;
    if (category) {
      const cat = String(category).toUpperCase();
      if (cat === 'APARTMENT') {
        where.propertyType = 'HOUSE';
        where.OR = [
          { title: { contains: 'apartment', mode: 'insensitive' } },
          { title: { contains: 'flat', mode: 'insensitive' } },
          { description: { contains: 'apartment', mode: 'insensitive' } },
          { description: { contains: 'flat', mode: 'insensitive' } },
          { description: { contains: '[category:apartment]', mode: 'insensitive' } },
          { description: { contains: 'பிளாட்', mode: 'insensitive' } },
          { description: { contains: 'அபார்ட்மெண்ட்', mode: 'insensitive' } },
        ];
      } else if (cat === 'HOUSE') {
        where.propertyType = 'HOUSE';
      } else if (cat === 'SHOP') {
        where.propertyType = 'SHOP';
      } else if (cat === 'HOSTEL') {
        where.OR = [
          { title: { contains: 'hostel', mode: 'insensitive' } },
          { title: { contains: 'pg', mode: 'insensitive' } },
          { title: { contains: 'mansion', mode: 'insensitive' } },
          { description: { contains: 'hostel', mode: 'insensitive' } },
          { description: { contains: 'mansion', mode: 'insensitive' } },
          { description: { contains: '[category:hostel]', mode: 'insensitive' } },
        ];
      } else if (cat === 'MARRIAGE_HALL') {
        where.OR = [
          { title: { contains: 'marriage', mode: 'insensitive' } },
          { title: { contains: 'mandapam', mode: 'insensitive' } },
          { title: { contains: 'hall', mode: 'insensitive' } },
          { description: { contains: 'marriage hall', mode: 'insensitive' } },
          { description: { contains: 'mandapam', mode: 'insensitive' } },
          { description: { contains: '[category:marriage_hall]', mode: 'insensitive' } },
        ];
      }
    }
    if (commercialType) {
      where.propertyType = 'SHOP';
      const cTypes = String(commercialType).split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      const orConditions: Array<Record<string, unknown>> = [];

      cTypes.forEach((t) => {
        if (t.includes('office')) {
          orConditions.push(
            { title: { contains: 'office', mode: 'insensitive' } },
            { description: { contains: 'office', mode: 'insensitive' } },
            { description: { contains: '[commercial:office]', mode: 'insensitive' } }
          );
        } else if (t.includes('co-working') || t.includes('coworking')) {
          orConditions.push(
            { title: { contains: 'coworking', mode: 'insensitive' } },
            { title: { contains: 'co-working', mode: 'insensitive' } },
            { description: { contains: 'coworking', mode: 'insensitive' } }
          );
        } else if (t.includes('showroom')) {
          orConditions.push(
            { title: { contains: 'showroom', mode: 'insensitive' } },
            { description: { contains: 'showroom', mode: 'insensitive' } }
          );
        } else if (t.includes('godown') || t.includes('warehouse')) {
          orConditions.push(
            { title: { contains: 'godown', mode: 'insensitive' } },
            { title: { contains: 'warehouse', mode: 'insensitive' } },
            { description: { contains: 'godown', mode: 'insensitive' } },
            { description: { contains: 'warehouse', mode: 'insensitive' } }
          );
        } else if (t.includes('industrial')) {
          orConditions.push(
            { title: { contains: 'industrial', mode: 'insensitive' } },
            { description: { contains: 'industrial', mode: 'insensitive' } },
            { description: { contains: 'shed', mode: 'insensitive' } }
          );
        } else if (t.includes('shop')) {
          orConditions.push(
            { title: { contains: 'shop', mode: 'insensitive' } },
            { description: { contains: 'shop', mode: 'insensitive' } },
            { description: { contains: 'retail', mode: 'insensitive' } }
          );
        } else {
          orConditions.push(
            { title: { contains: t, mode: 'insensitive' } },
            { description: { contains: t, mode: 'insensitive' } }
          );
        }
      });

      if (orConditions.length > 0) {
        where.AND = [
          ...(where.AND as Array<Record<string, unknown>> || []),
          { OR: orConditions },
        ];
      }
    }
    if (locality) {
      const locStr = String(locality).trim();
      // Extract clean area name (before any dash/hyphen) and any 6-digit pincode
      const cleanArea = locStr.replace(/\s*[-–—]\s*\d{6}.*$/, '').trim();
      const pincodeMatch = locStr.match(/\b\d{6}\b/);
      const pincode = pincodeMatch ? pincodeMatch[0] : null;

      const locConditions: Array<Record<string, unknown>> = [
        { locality: { contains: locStr, mode: 'insensitive' } },
        { locality: { contains: cleanArea, mode: 'insensitive' } },
        { address: { contains: cleanArea, mode: 'insensitive' } },
      ];
      if (pincode) {
        locConditions.push(
          { locality: { contains: pincode, mode: 'insensitive' } },
          { address: { contains: pincode, mode: 'insensitive' } }
        );
      }

      where.AND = [
        ...(where.AND as Array<Record<string, unknown>> || []),
        { OR: locConditions },
      ];
    }
    if (minRent || maxRent) {
      where.rent = {};
      const maxStr = String(maxRent || '');
      if (maxStr.includes('+')) {
        const minVal = parseFloat(maxStr.replace('+', '')) || 50000;
        (where.rent as Record<string, unknown>).gte = minVal;
      } else {
        if (minRent) (where.rent as Record<string, unknown>).gte = parseFloat(minRent as string);
        if (maxRent) (where.rent as Record<string, unknown>).lte = parseFloat(maxRent as string);
      }
    }
    if (hostelGender) {
      const g = String(hostelGender).toUpperCase();
      const gConditions: Array<Record<string, unknown>> = [];
      if (g === 'MALE') {
        gConditions.push(
          { title: { contains: "men's", mode: 'insensitive' } },
          { title: { contains: 'mens', mode: 'insensitive' } },
          { title: { contains: 'gents', mode: 'insensitive' } },
          { title: { contains: 'boys', mode: 'insensitive' } },
          { description: { contains: "men's", mode: 'insensitive' } },
          { description: { contains: 'gents', mode: 'insensitive' } },
          { description: { contains: '[hostel:male]', mode: 'insensitive' } }
        );
      } else if (g === 'FEMALE') {
        gConditions.push(
          { title: { contains: "women's", mode: 'insensitive' } },
          { title: { contains: 'womens', mode: 'insensitive' } },
          { title: { contains: 'ladies', mode: 'insensitive' } },
          { title: { contains: 'girls', mode: 'insensitive' } },
          { description: { contains: "women's", mode: 'insensitive' } },
          { description: { contains: 'ladies', mode: 'insensitive' } },
          { description: { contains: '[hostel:female]', mode: 'insensitive' } }
        );
      } else if (g === 'COLIVING') {
        gConditions.push(
          { title: { contains: 'coliving', mode: 'insensitive' } },
          { title: { contains: 'co-living', mode: 'insensitive' } },
          { description: { contains: 'coliving', mode: 'insensitive' } },
          { description: { contains: '[hostel:coliving]', mode: 'insensitive' } }
        );
      }
      if (gConditions.length > 0) {
        where.AND = [
          ...(where.AND as Array<Record<string, unknown>> || []),
          { OR: gConditions },
        ];
      }
    }
    if (hallCapacity) {
      const cap = String(hallCapacity).toUpperCase();
      const capConditions: Array<Record<string, unknown>> = [];
      if (cap === 'UP_TO_250') {
        capConditions.push(
          { title: { contains: 'mini hall', mode: 'insensitive' } },
          { title: { contains: 'party hall', mode: 'insensitive' } },
          { description: { contains: '[capacity:up_to_250]', mode: 'insensitive' } },
          { description: { contains: 'mini hall', mode: 'insensitive' } },
          { description: { contains: '250', mode: 'insensitive' } }
        );
      } else if (cap === '250_TO_500') {
        capConditions.push(
          { description: { contains: '[capacity:250_to_500]', mode: 'insensitive' } },
          { description: { contains: '500', mode: 'insensitive' } }
        );
      } else if (cap === '500_TO_1000') {
        capConditions.push(
          { description: { contains: '[capacity:500_to_1000]', mode: 'insensitive' } },
          { description: { contains: '1000', mode: 'insensitive' } }
        );
      } else if (cap === '1000_PLUS') {
        capConditions.push(
          { description: { contains: '[capacity:1000_plus]', mode: 'insensitive' } },
          { description: { contains: 'convention', mode: 'insensitive' } },
          { description: { contains: 'mega', mode: 'insensitive' } }
        );
      }
      if (capConditions.length > 0) {
        where.AND = [
          ...(where.AND as Array<Record<string, unknown>> || []),
          { OR: capConditions },
        ];
      }
    }
    if (bedrooms) {
      const bStr = String(bedrooms);
      if (bStr.includes(',')) {
        const bList = bStr.split(',').map((b) => parseInt(b.trim())).filter((b) => !isNaN(b));
        where.bedrooms = { in: bList };
      } else if (bStr.endsWith('+')) {
        const num = parseInt(bStr);
        where.bedrooms = { gte: num };
      } else {
        const num = parseInt(bStr);
        if (!isNaN(num)) where.bedrooms = num;
      }
    }
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
    const finalAddress = data.address?.trim() || `${data.locality}, Chennai`;
    const property = await prisma.property.create({
      data: {
        ...data,
        address: finalAddress,
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
    const finalAddress =
      data.address !== undefined
        ? data.address.trim() || `${data.locality || property.locality}, Chennai`
        : undefined;

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...data,
        ...(finalAddress ? { address: finalAddress } : {}),
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
