import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getFirebaseAdmin } from '../config/firebase';
import { prisma } from '../config/database';
import { signToken } from '../utils/jwt';
import { firebaseLoginSchema } from '../utils/validators';
import { successResponse, ApiError } from '../utils/response';

export async function firebaseLogin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { idToken, role, name } = firebaseLoginSchema.parse(req.body);

    // Verify Firebase token server-side
    const decodedToken = await getFirebaseAdmin().verifyIdToken(idToken);
    const { uid, email, phone_number, name: fbName, picture } = decodedToken;

    // Find or create user
    let user = await prisma.user.findUnique({ where: { firebaseUid: uid } });

    if (!user) {
      // Determine role (default USER, but can register as OWNER)
      const newRole = role === 'OWNER' ? 'OWNER' : 'USER';
      const displayName = name || fbName || (phone_number ? `User ${phone_number.slice(-4)}` : 'New User');

      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          name: displayName,
          email: email || null,
          mobile: phone_number || null,
          role: newRole,
          profileImage: picture || null,
        },
      });

      // If registering as OWNER, create Owner profile
      if (newRole === 'OWNER') {
        await prisma.owner.create({ data: { userId: user.id } });
      }
    } else {
      // Update email/phone if changed in Firebase
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: email || user.email,
          mobile: phone_number || user.mobile,
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
