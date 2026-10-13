import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── GET /api/home-services  ─────────────────────────────────────────────────
export const getHomeServices = async (req: Request, res: Response) => {
  try {
    const { category, subcategory, locality, maxPrice, status = 'PUBLISHED', limit = '50', page = '1' } = req.query as Record<string, string>;

    const take = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (parseInt(page, 10) - 1) * take;

    const where: any = { status };
    if (category && category !== 'ALL') where.category = category.toUpperCase();
    if (subcategory) where.subcategory = { contains: subcategory, mode: 'insensitive' };
    if (maxPrice) {
      const num = parseFloat(maxPrice);
      if (!isNaN(num)) {
        where.priceFrom = { lte: num };
      }
    }
    if (locality) {
      where.OR = [
        { locality: { contains: locality, mode: 'insensitive' } },
        { serviceAreas: { has: locality } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.homeService.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip }),
      prisma.homeService.count({ where }),
    ]);

    res.json({ services, total, page: parseInt(page, 10), totalPages: Math.ceil(total / take) });
  } catch (err) {
    console.error('getHomeServices error:', err);
    res.status(500).json({ error: 'Failed to fetch home services' });
  }
};

// ── GET /api/home-services/:id  ─────────────────────────────────────────────
export const getHomeServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await prisma.homeService.findUnique({ where: { id } });
    if (!service) return res.status(404).json({ error: 'Service not found' });

    // increment view count
    await prisma.homeService.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
};

// ── POST /api/home-services  ─────────────────────────────────────────────────
export const createHomeService = async (req: Request, res: Response) => {
  try {
    const {
      category, subcategory, title, description, providerName,
      phone, whatsapp, email, locality, serviceAreas, pricing, priceFrom,
      features, imageUrl, experience, licenseNo, gstin, workingHours,
    } = req.body;

    if (!category || !title || !description || !providerName || !phone || !locality || !pricing) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validCategories = ['MOVERS', 'RENOVATION', 'CLEANING', 'AC_SERVICE', 'LEGAL'];
    if (!validCategories.includes(String(category).toUpperCase())) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const service = await prisma.homeService.create({
      data: {
        category: String(category).toUpperCase() as any,
        subcategory: subcategory || null,
        title: String(title).trim(),
        description: String(description).trim(),
        providerName: String(providerName).trim(),
        phone: String(phone).trim(),
        whatsapp: whatsapp ? String(whatsapp).trim() : null,
        email: email ? String(email).trim() : null,
        locality: String(locality).trim(),
        serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : [],
        pricing: String(pricing).trim(),
        priceFrom: priceFrom ? parseFloat(priceFrom) : null,
        features: Array.isArray(features) ? features : [],
        imageUrl: imageUrl || null,
        experience: experience || null,
        licenseNo: licenseNo || null,
        gstin: gstin || null,
        workingHours: workingHours || null,
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Service submitted successfully! We will review and publish it within 24 hours.', service });
  } catch (err) {
    console.error('createHomeService error:', err);
    res.status(500).json({ error: 'Failed to submit service' });
  }
};

// ── PUT /api/home-services/:id/status  (admin) ──────────────────────────────
export const updateHomeServiceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['PENDING', 'PUBLISHED', 'REJECTED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const updated = await prisma.homeService.update({ where: { id }, data: { status } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// ── DELETE /api/home-services/:id  (admin) ──────────────────────────────────
export const deleteHomeService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.homeService.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
};
