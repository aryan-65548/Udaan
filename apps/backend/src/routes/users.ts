import { Router } from 'express';
import { db } from '../db';
import { users, consents } from '../db/schema';
import { eq } from 'drizzle-orm';
import { consentSchema } from '../schemas/auth';
import { updateProfileSchema } from '../schemas/users';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

import bcrypt from 'bcryptjs';

router.use(authenticate);

router.get('/me', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      preferredLanguage: users.preferredLanguage,
      businessName: users.businessName,
      businessCategory: users.businessCategory,
      operatingState: users.operatingState,
      operatingDistrict: users.operatingDistrict,
      experienceLevel: users.experienceLevel,
      businessBackground: users.businessBackground,
      googleId: users.googleId,
      passwordHash: users.passwordHash,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, req.user!.id)).limit(1);

    if (!userResult.length) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const { passwordHash, ...userData } = userResult[0];

    return res.json({
      data: {
        ...userData,
        hasPassword: Boolean(passwordHash && passwordHash.length > 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/me', async (req: AuthenticatedRequest, res, next) => {
  try {
    const updates = updateProfileSchema.parse(req.body);
    
    // Check if password change is requested
    let newPasswordHash: string | undefined;
    if (updates.newPassword) {
      const currentUserResult = await db.select({
        passwordHash: users.passwordHash,
        googleId: users.googleId,
      }).from(users).where(eq(users.id, req.user!.id)).limit(1);

      const currentUser = currentUserResult[0];
      // If user has an existing password and did not sign in only with Google without setting one
      if (currentUser && currentUser.passwordHash && !currentUser.googleId) {
        if (!updates.currentPassword) {
          return res.status(400).json({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Current password is required to set a new password',
            },
          });
        }
        const isMatch = await bcrypt.compare(updates.currentPassword, currentUser.passwordHash);
        if (!isMatch) {
          return res.status(400).json({
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Current password does not match',
            },
          });
        }
      } else if (currentUser && currentUser.passwordHash && currentUser.googleId && updates.currentPassword) {
        // If Google user has already set a password and supplied currentPassword, verify it
        const isMatch = await bcrypt.compare(updates.currentPassword, currentUser.passwordHash);
        if (!isMatch) {
          return res.status(400).json({
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Current password does not match',
            },
          });
        }
      }
      newPasswordHash = await bcrypt.hash(updates.newPassword, 10);
    }

    try {
      const result = await db.update(users).set({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.phone !== undefined && { phone: updates.phone || null }),
        ...(updates.preferredLanguage !== undefined && { preferredLanguage: updates.preferredLanguage }),
        ...(updates.businessName !== undefined && { businessName: updates.businessName || null }),
        ...(updates.businessCategory !== undefined && { businessCategory: updates.businessCategory || null }),
        ...(updates.operatingState !== undefined && { operatingState: updates.operatingState || null }),
        ...(updates.operatingDistrict !== undefined && { operatingDistrict: updates.operatingDistrict || null }),
        ...(updates.experienceLevel !== undefined && { experienceLevel: updates.experienceLevel || null }),
        ...(updates.businessBackground !== undefined && { businessBackground: updates.businessBackground || null }),
        ...(newPasswordHash !== undefined && { passwordHash: newPasswordHash }),
        updatedAt: new Date(),
      }).where(eq(users.id, req.user!.id)).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        preferredLanguage: users.preferredLanguage,
        businessName: users.businessName,
        businessCategory: users.businessCategory,
        operatingState: users.operatingState,
        operatingDistrict: users.operatingDistrict,
        experienceLevel: users.experienceLevel,
        businessBackground: users.businessBackground,
        googleId: users.googleId,
        passwordHash: users.passwordHash,
        createdAt: users.createdAt,
      });

      const { passwordHash, ...safeUserData } = result[0];

      return res.json({
        data: {
          ...safeUserData,
          hasPassword: Boolean(passwordHash && passwordHash.length > 0),
        },
      });
    } catch (dbError: any) {
      if (dbError.code === '23505') {
        return res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'This phone number is already in use by another account',
          }
        });
      }
      throw dbError;
    }
  } catch (error) {
    next(error);
  }
});

router.post('/me/consents', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = consentSchema.parse(req.body);

    const result = await db.insert(consents).values({
      userId: req.user!.id,
      consentType: data.consentType,
      version: data.version,
      granted: data.granted,
      grantedAt: data.granted ? new Date() : null,
      revokedAt: !data.granted ? new Date() : null,
      ipAddress: req.ip,
    }).returning();

    return res.status(201).json({ data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.get('/me/consents', async (req: AuthenticatedRequest, res, next) => {
  try {
    const results = await db.select().from(consents).where(eq(consents.userId, req.user!.id));
    return res.json({ data: results });
  } catch (error) {
    next(error);
  }
});

router.delete('/me', async (req: AuthenticatedRequest, res, next) => {
  try {
    await db.delete(users).where(eq(users.id, req.user!.id));
    return res.json({
      data: {
        success: true,
        message: 'Account deleted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

