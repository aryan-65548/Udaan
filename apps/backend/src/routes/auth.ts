import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, randomUUID } from 'crypto';
import { z } from 'zod';
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

    if (data.email) {
      const existingEmail = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, data.email.toLowerCase().trim()))
        .limit(1);

      if (existingEmail.length > 0) {
        return res.status(409).json({
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'An account with this email address already exists. Please sign in instead.',
          },
        });
      }
    }

    if (data.phone) {
      const existingPhone = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.phone, data.phone.trim()))
        .limit(1);

      if (existingPhone.length > 0) {
        return res.status(409).json({
          error: {
            code: 'PHONE_ALREADY_EXISTS',
            message: 'An account with this phone number already exists.',
          },
        });
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userRole = 'ENTREPRENEUR'; // Default role

    let result;
    try {
      result = await db.insert(users).values({
        name: data.name.trim(),
        email: data.email ? data.email.toLowerCase().trim() : undefined,
        phone: data.phone ? data.phone.trim() : undefined,
        passwordHash: hashedPassword,
        role: userRole,
        preferredLanguage: data.preferredLanguage,
      }).returning();
    } catch (dbError: any) {
      if (dbError.code === '23505') {
        const detail = dbError.detail || '';
        const isEmail = detail.includes('email') || dbError.constraint?.includes('email');
        return res.status(409).json({
          error: {
            code: isEmail ? 'EMAIL_ALREADY_EXISTS' : 'CONFLICT',
            message: isEmail
              ? 'An account with this email address already exists. Please sign in instead.'
              : 'A user with this email or phone already exists.',
          },
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
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = z.object({ idToken: z.string().min(1) }).parse(req.body);

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({
        error: {
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Google OAuth is not configured on this server.',
        },
      });
    }

    // Verify Google ID Token using Google tokeninfo endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!response.ok) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired Google token',
        },
      });
    }

    const payload = (await response.json()) as {
      sub?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      picture?: string;
      aud?: string;
      iss?: string;
    };

    if (!payload.sub || !payload.email) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Incomplete Google token payload',
        },
      });
    }

    if (payload.aud !== clientId) {
      return res.status(401).json({
        error: {
          code: 'INVALID_AUDIENCE',
          message: 'Google token audience mismatch',
        },
      });
    }

    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
      return res.status(401).json({
        error: {
          code: 'INVALID_ISSUER',
          message: 'Google token issuer is invalid',
        },
      });
    }

    const isEmailVerified = payload.email_verified === 'true' || payload.email_verified === true;
    if (!isEmailVerified) {
      return res.status(400).json({
        error: {
          code: 'UNVERIFIED_EMAIL',
          message: 'Google account email is not verified',
        },
      });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split('@')[0];

    // Check if user already exists by googleId
    const userResult = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
    let user = userResult[0];

    if (!user) {
      // Check if user exists by verified email
      const emailUserResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const emailUser = emailUserResult[0];

      if (emailUser) {
        // Link Google ID securely
        const updated = await db
          .update(users)
          .set({ googleId, updatedAt: new Date() })
          .where(eq(users.id, emailUser.id))
          .returning();
        user = updated[0];
      } else {
        // Create new account
        const randomPass = randomBytes(24).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPass, 10);
        const inserted = await db
          .insert(users)
          .values({
            name,
            email,
            googleId,
            passwordHash: hashedPassword,
            role: 'ENTREPRENEUR',
            preferredLanguage: 'en',
          })
          .returning();
        user = inserted[0];
      }
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User account is inactive',
        },
      });
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
          businessName: user.businessName,
          businessCategory: user.businessCategory,
          operatingState: user.operatingState,
          operatingDistrict: user.operatingDistrict,
          experienceLevel: user.experienceLevel,
          businessBackground: user.businessBackground,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      },
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
