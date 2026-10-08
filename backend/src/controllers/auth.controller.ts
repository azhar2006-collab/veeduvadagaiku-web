import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getFirebaseAdmin } from '../config/firebase';
import { prisma } from '../config/database';
import { signToken } from '../utils/jwt';
import { firebaseLoginSchema } from '../utils/validators';
import { successResponse, ApiError } from '../utils/response';

// List of designated administrator emails
const ADMIN_EMAILS = [
  'srinandhinihall@gmail.com',
  'azhar12082006@gmail.com',
  'admin@veeduvadagaiku.com',
  ...(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()) : []),
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export async function firebaseLogin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { idToken, role, name } = firebaseLoginSchema.parse(req.body);

    // Verify Firebase token server-side
    const decodedToken = await getFirebaseAdmin().verifyIdToken(idToken);
    const { uid, email, phone_number, name: fbName, picture } = decodedToken;

    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    const isTargetAdmin = isAdminEmail(normalizedEmail);

    // Find user by firebaseUid
    let user = await prisma.user.findUnique({ where: { firebaseUid: uid } });

    // If not found by firebaseUid, look up by email (handles pre-provisioned or admin emails)
    if (!user && normalizedEmail) {
      user = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      });
      if (user) {
        // Link firebaseUid to existing user record
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: uid },
        });
      }
    }

    if (!user) {
      // Determine role: Designated admin emails always become ADMIN
      const newRole = isTargetAdmin ? 'ADMIN' : (role === 'OWNER' ? 'OWNER' : 'USER');
      const displayName = name || fbName || (normalizedEmail ? normalizedEmail.split('@')[0] : phone_number ? `User ${phone_number.slice(-4)}` : 'New User');

      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          name: displayName,
          email: normalizedEmail,
          mobile: phone_number || null,
          role: newRole,
          profileImage: picture || null,
        },
      });

      // If registering as OWNER (and not ADMIN), create Owner profile
      if (newRole === 'OWNER') {
        await prisma.owner.create({ data: { userId: user.id } });
      }
    } else {
      // User exists. Update email/phone and promote to ADMIN if email is in administrator list
      const shouldBeAdmin = isTargetAdmin || (user.email && isAdminEmail(user.email));
      const targetRole = shouldBeAdmin ? 'ADMIN' : user.role;

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: normalizedEmail || user.email,
          mobile: phone_number || user.mobile,
          role: targetRole,
          profileImage: picture || user.profileImage,
        },
      });
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Your account has been suspended. Contact support.');
    }

    const token = signToken({ userId: user.id, role: user.role });

    res.status(200).json(
      successResponse(
        {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            profileImage: user.profileImage,
          },
        },
        'Login successful'
      )
    );
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, email: true, mobile: true,
        role: true, profileImage: true, status: true, createdAt: true,
        owner: { select: { id: true, isVerified: true, bio: true } },
      },
    });
    if (!user) throw new ApiError(404, 'User not found');
    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
}
