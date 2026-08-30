import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, randomUUID } from 'crypto';
import { db } from '../db';
import { users, refreshTokens } from '../db/schema';
import { eq } from 'drizzle-orm';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from '../schemas/auth';

const router = Router();
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

async function createRefreshToken(userId: string) {
  const tokenId = randomUUID();
  const rawTokenString = randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(rawTokenString, 10);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await db.insert(refreshTokens).values({
    id: tokenId,
    userId,
    tokenHash,
    expiresAt,
  });

  return `${tokenId}.${rawTokenString}`;
}

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userRole = 'ENTREPRENEUR'; // Default role

    let result;
    try {
      result = await db.insert(users).values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash: hashedPassword,
        role: userRole,
        preferredLanguage: data.preferredLanguage,
      }).returning();
    } catch (dbError: any) {
      if (dbError.code === '23505') {
        return res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'A user with this email or phone already exists',
          }
        });
      }
      throw dbError;
    }

    const user = result[0];
    const accessToken = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = await createRefreshToken(user.id);

    return res.status(201).json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          preferredLanguage: user.preferredLanguage,
        },
        accessToken,
        refreshToken,
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    let userResult;
    if (data.email) {
      userResult = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    } else if (data.phone) {
      userResult = await db.select().from(users).where(eq(users.phone, data.phone)).limit(1);
    }

    const user = userResult?.[0];
    if (!user || !user.isActive) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    const accessToken = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = await createRefreshToken(user.id);

    return res.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          preferredLanguage: user.preferredLanguage,
        },
        accessToken,
        refreshToken,
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const data = refreshSchema.parse(req.body);
    const [tokenId, rawTokenString] = data.refreshToken.split('.');

    if (!tokenId || !rawTokenString) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token format' } });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tokenId)) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token format' } });
    }

    const tokenResult = await db.select().from(refreshTokens).where(eq(refreshTokens.id, tokenId)).limit(1);
    const storedToken = tokenResult[0];

    if (!storedToken) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
    }

    if (storedToken.revokedAt) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Refresh token has been revoked' } });
    }

    if (new Date() > new Date(storedToken.expiresAt)) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Refresh token has expired' } });
    }

    const isMatch = await bcrypt.compare(rawTokenString, storedToken.tokenHash);
    if (!isMatch) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
    }

    const userResult = await db.select().from(users).where(eq(users.id, storedToken.userId)).limit(1);
    const user = userResult[0];

    if (!user || !user.isActive) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found or inactive' } });
    }

    // Revoke old token
    await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, storedToken.id));

    // Issue new tokens
    const accessToken = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
    const newRefreshToken = await createRefreshToken(user.id);

    return res.json({
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const data = logoutSchema.parse(req.body);
    const [tokenId, rawTokenString] = data.refreshToken.split('.');

    if (!tokenId || !rawTokenString) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid refresh token format' } });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tokenId)) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid refresh token format' } });
    }

    const tokenResult = await db.select().from(refreshTokens).where(eq(refreshTokens.id, tokenId)).limit(1);
    const storedToken = tokenResult[0];

    if (!storedToken || storedToken.revokedAt) {
      // Return success if already revoked or not found to avoid info leakage
      return res.json({ data: { success: true } });
    }

    const isMatch = await bcrypt.compare(rawTokenString, storedToken.tokenHash);
    if (isMatch) {
      await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, tokenId));
    }

    return res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

export default router;
