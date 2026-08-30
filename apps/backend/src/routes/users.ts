import { Router } from 'express';
import { db } from '../db';
import { users, consents } from '../db/schema';
import { eq } from 'drizzle-orm';
import { consentSchema } from '../schemas/auth';
import { updateProfileSchema } from '../schemas/users';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

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
    }).from(users).where(eq(users.id, req.user!.id)).limit(1);

    if (!userResult.length) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    return res.json({ data: userResult[0] });
  } catch (error) {
    next(error);
  }
});

router.patch('/me', async (req: AuthenticatedRequest, res, next) => {
  try {
    const updates = updateProfileSchema.parse(req.body);
    
    try {
      const result = await db.update(users).set({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.phone !== undefined && { phone: updates.phone }),
        ...(updates.preferredLanguage !== undefined && { preferredLanguage: updates.preferredLanguage }),
        updatedAt: new Date(),
      }).where(eq(users.id, req.user!.id)).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        preferredLanguage: users.preferredLanguage,
      });

      return res.json({ data: result[0] });
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

export default router;
