import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import authRoutes from '../../src/routes/auth';
import userRoutes from '../../src/routes/users';
import { errorHandler } from '../../src/middleware/error';

const testUserId = 'a0000000-0000-0000-0000-000000000001';

// Mock DB
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../src/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: mockSelect,
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: mockInsert,
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: mockUpdate,
        }),
      }),
    }),
    delete: () => ({
      where: mockDelete,
    }),
  },
}));

// Mock Authenticate Middleware
jest.mock('../../src/middleware/auth', () => ({
  authenticate: (req: Request & { user?: unknown }, res: Response, next: NextFunction) => {
    req.user = {
      id: testUserId,
      role: 'ENTREPRENEUR',
      preferredLanguage: 'en',
    };
    next();
  },
  authorize: () => (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('Auth and Profile Improvements Unit Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
    app.use('/users', userRoutes);
    app.use(errorHandler);
  });

  describe('1. Registration Duplicate Email & Phone Handling', () => {
    it('should return 409 EMAIL_ALREADY_EXISTS when email is already registered', async () => {
      mockSelect.mockResolvedValueOnce([
        {
          id: 'existing-user-id',
          email: 'existing@example.com',
          phone: '+919876543210',
        },
      ]);

      const res = await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'existing@example.com',
        phone: '+919999999999',
        password: 'Password123!',
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
      expect(res.body.error.message).toContain('already exists');
    });

    it('should return 409 PHONE_ALREADY_EXISTS when phone is already registered', async () => {
      // Email check passes (no user found with email)
      mockSelect.mockResolvedValueOnce([]);
      // Phone check finds existing user
      mockSelect.mockResolvedValueOnce([
        {
          id: 'existing-user-id',
          phone: '+919876543210',
        },
      ]);

      const res = await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'new@example.com',
        phone: '+919876543210',
        password: 'Password123!',
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('PHONE_ALREADY_EXISTS');
    });
  });

  describe('2. Profile Updates and Business Profile Fields', () => {
    it('should update personal and business profile fields', async () => {
      mockUpdate.mockResolvedValueOnce([
        {
          id: testUserId,
          name: 'Updated Entrepreneur',
          email: 'test@example.com',
          phone: '+919876543210',
          role: 'ENTREPRENEUR',
          preferredLanguage: 'gu',
          businessName: 'Patel Agro Services',
          businessCategory: 'Agri-processing',
          operatingState: 'Gujarat',
          operatingDistrict: 'Anand',
          experienceLevel: 'SOME_EXPERIENCE',
          businessBackground: '5 years of farming and processing',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const res = await request(app)
        .patch('/users/me')
        .send({
          name: 'Updated Entrepreneur',
          preferredLanguage: 'gu',
          businessName: 'Patel Agro Services',
          businessCategory: 'Agri-processing',
          operatingState: 'Gujarat',
          operatingDistrict: 'Anand',
          experienceLevel: 'SOME_EXPERIENCE',
          businessBackground: '5 years of farming and processing',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.businessName).toBe('Patel Agro Services');
      expect(res.body.data.experienceLevel).toBe('SOME_EXPERIENCE');
    });

    it('should reject password change when current password is wrong', async () => {
      const hashedOldPassword = await bcrypt.hash('CorrectPassword123!', 10);
      mockSelect.mockResolvedValueOnce([
        {
          id: testUserId,
          passwordHash: hashedOldPassword,
        },
      ]);

      const res = await request(app)
        .patch('/users/me')
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('Current password does not match');
    });

    it('should allow Google OAuth user with no password to set a new password without currentPassword', async () => {
      // User has googleId and no passwordHash
      mockSelect.mockResolvedValueOnce([
        {
          id: testUserId,
          passwordHash: null,
          googleId: 'google-oauth-sub-12345',
        },
      ]);

      mockUpdate.mockResolvedValueOnce([
        {
          id: testUserId,
          name: 'Google User',
          email: 'googleuser@example.com',
          googleId: 'google-oauth-sub-12345',
          passwordHash: 'newHashedVal',
        },
      ]);

      const res = await request(app)
        .patch('/users/me')
        .send({
          newPassword: 'BrandNewSecurePassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.passwordHash).toBeUndefined();
      expect(res.body.data.hasPassword).toBe(true);
    });

    it('GET /users/me should not expose passwordHash and should return hasPassword and googleId', async () => {
      mockSelect.mockResolvedValueOnce([
        {
          id: testUserId,
          name: 'Secure User',
          email: 'user@example.com',
          passwordHash: '$2a$10$xyz...',
          googleId: null,
        },
      ]);

      const res = await request(app).get('/users/me');

      expect(res.status).toBe(200);
      expect(res.body.data.passwordHash).toBeUndefined();
      expect(res.body.data.hasPassword).toBe(true);
      expect(res.body.data.googleId).toBeNull();
    });
  });

  describe('3. Google OAuth Endpoint Validation', () => {
    it('should return 400 when idToken is missing in /auth/google', async () => {
      const res = await request(app).post('/auth/google').send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 503 OAUTH_NOT_CONFIGURED when credentials are not configured', async () => {
      delete process.env.GOOGLE_CLIENT_ID;
      const res = await request(app).post('/auth/google').send({
        idToken: 'invalid.google.jwt.token',
      });

      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('OAUTH_NOT_CONFIGURED');
    });
  });

  describe('4. Financial Input Schema Validation Boundaries', () => {
    const { putAssessmentInputSchema } = require('../../src/schemas/assessments');

    it('should accept valid positive monetary numbers', () => {
      const valid = putAssessmentInputSchema.safeParse({
        questionText: 'Own contribution',
        inputType: 'NUMBER',
        valueNumber: 50000,
        source: 'USER',
      });
      expect(valid.success).toBe(true);
    });

    it('should accept zero own contribution (boundary condition)', () => {
      const valid = putAssessmentInputSchema.safeParse({
        questionText: 'Own contribution',
        inputType: 'NUMBER',
        valueNumber: 0,
        source: 'USER',
      });
      expect(valid.success).toBe(true);
    });

    it('should accept large valid monetary values (boundary condition)', () => {
      const valid = putAssessmentInputSchema.safeParse({
        questionText: 'Own contribution',
        inputType: 'NUMBER',
        valueNumber: 10000000,
        source: 'USER',
      });
      expect(valid.success).toBe(true);
    });

    it('should reject negative monetary amounts', () => {
      const invalid = putAssessmentInputSchema.safeParse({
        questionText: 'Own contribution',
        inputType: 'NUMBER',
        valueNumber: -500,
        source: 'USER',
      });
      expect(invalid.success).toBe(false);
    });

    it('should reject non-finite monetary values (Infinity / NaN)', () => {
      const invalidInf = putAssessmentInputSchema.safeParse({
        questionText: 'Own contribution',
        inputType: 'NUMBER',
        valueNumber: Infinity,
        source: 'USER',
      });
      expect(invalidInf.success).toBe(false);

      const invalidNaN = putAssessmentInputSchema.safeParse({
        questionText: 'Own contribution',
        inputType: 'NUMBER',
        valueNumber: NaN,
        source: 'USER',
      });
      expect(invalidNaN.success).toBe(false);
    });

    it('should reject malformed non-numeric strings for NUMBER input type', () => {
      const invalid = putAssessmentInputSchema.safeParse({
        questionText: 'Own contribution',
        inputType: 'NUMBER',
        valueNumber: 'not-a-number',
        source: 'USER',
      });
      expect(invalid.success).toBe(false);
    });

    it('should allow null / optional blank income or fund values', () => {
      const validNull = putAssessmentInputSchema.safeParse({
        questionText: 'Optional Income',
        inputType: 'NUMBER',
        valueNumber: null,
        source: 'USER',
      });
      expect(validNull.success).toBe(true);
    });
  });
});
