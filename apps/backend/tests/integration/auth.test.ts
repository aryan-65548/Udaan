import request from 'supertest';
import app from '../../src/app';
import { db, pool } from '../../src/db';
import { sql } from 'drizzle-orm';
import { refreshTokens, users } from '../../src/db/schema';
import { randomBytes, randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

describe('Auth & Users Integration Tests', () => {
  beforeAll(async () => {
    // Clear tables before tests run
    await db.execute(sql`TRUNCATE TABLE users CASCADE`);
  });

  afterAll(async () => {
    await db.execute(sql`TRUNCATE TABLE users CASCADE`);
    await pool.end();
  });

  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  describe('1. Registration', () => {
    it('should register with valid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Email User',
        email: 'email@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe('email@example.com');
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
      userId = res.body.data.user.id;
    });

    it('should register with valid phone', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Phone User',
        phone: '9999999999',
        password: 'password123',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.phone).toBe('9999999999');
    });

    it('should fail with missing both email and phone', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Missing Contact User',
        password: 'password123',
      });
      expect(res.status).toBe(400);
    });

    it('should fail with invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Invalid Email User',
        email: 'invalid-email',
        password: 'password123',
      });
      expect(res.status).toBe(400);
    });

    it('should fail with invalid phone', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Invalid Phone User',
        phone: '123',
        password: 'password123',
      });
      expect(res.status).toBe(400);
    });

    it('should fail with invalid password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Invalid Password User',
        email: 'pass@example.com',
        password: '',
      });
      expect(res.status).toBe(400);
    });

    it('should fail with duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Duplicate Email User',
        email: 'email@example.com', // registered above
        password: 'password123',
      });
      expect(res.status).toBe(409);
    });

    it('should fail with duplicate phone', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Duplicate Phone User',
        phone: '9999999999', // registered above
        password: 'password123',
      });
      expect(res.status).toBe(409);
    });
  });

  describe('2. Login', () => {
    it('should login with valid email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'email@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should login with valid phone', async () => {
      const res = await request(app).post('/api/auth/login').send({
        phone: '9999999999',
        password: 'password123',
      });
      expect(res.status).toBe(200);
    });

    it('should fail with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'email@example.com',
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });

    it('should fail with nonexistent user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'doesnotexist@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(401);
    });

    it('should fail with inactive user', async () => {
      const inactiveRes = await request(app).post('/api/auth/register').send({
        name: 'Inactive User',
        email: 'inactive@example.com',
        password: 'password123',
      });
      await db.execute(sql`UPDATE users SET is_active = false WHERE email = 'inactive@example.com'`);

      const res = await request(app).post('/api/auth/login').send({
        email: 'inactive@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('3. Access Token', () => {
    it('should access protected route with valid token', async () => {
      const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app).get('/api/users/me').set('Authorization', `Bearer invalid.token.here`);
      expect(res.status).toBe(401);
    });

    it('should fail with missing Authorization header', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('4. Refresh Token', () => {
    let newRefreshToken: string;
    
    it('should verify token hashing behavior', async () => {
      const [tokenId, rawString] = refreshToken.split('.');
      expect(tokenId).toBeDefined();
      expect(rawString).toBeDefined();

      const tokens = await db.select().from(refreshTokens);
      const token = tokens.find(t => t.id === tokenId);
      expect(token).toBeDefined();
      expect(token!.tokenHash).not.toBe(rawString);
      
      const isMatch = await bcrypt.compare(rawString, token!.tokenHash);
      expect(isMatch).toBe(true);
    });

    it('should succeed with valid refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      newRefreshToken = res.body.data.refreshToken;
    });

    it('should fail with revoked refresh token', async () => {
      // The old token should now be revoked
      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken, // old token
      });
      expect(res.status).toBe(401);
      expect(res.body.error.message).toMatch(/revoked/i);
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken: 'invalid.format',
      });
      expect(res.status).toBe(401);
    });

    it('should fail with expired refresh token', async () => {
      // Create an expired token in DB
      const expiredId = randomUUID();
      const rawString = 'some-raw-string';
      const hash = await bcrypt.hash(rawString, 10);
      const pastDate = new Date();
      pastDate.setFullYear(2000);
      
      await db.insert(refreshTokens).values({
        id: expiredId,
        userId,
        tokenHash: hash,
        expiresAt: pastDate,
      });

      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken: `${expiredId}.${rawString}`,
      });
      expect(res.status).toBe(401);
      expect(res.body.error.message).toMatch(/expired/i);
    });
  });

  describe('5. Profile', () => {
    it('should GET /api/users/me', async () => {
      const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('email@example.com');
    });

    it('should succeed valid PATCH /api/users/me', async () => {
      const res = await request(app).patch('/api/users/me').set('Authorization', `Bearer ${accessToken}`).send({
        name: 'Updated Name',
        preferredLanguage: 'hi',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.preferredLanguage).toBe('hi');
    });

    it('should fail invalid PATCH (empty payload)', async () => {
      const res = await request(app).patch('/api/users/me').set('Authorization', `Bearer ${accessToken}`).send({});
      expect(res.status).toBe(400);
    });

    it('should ignore protected fields during PATCH', async () => {
      const res = await request(app).patch('/api/users/me').set('Authorization', `Bearer ${accessToken}`).send({
        name: 'Name 2',
        role: 'ADMIN', // Should be ignored by schema
      });
      
      // Still OK, but role is not changed. We should verify role is still ENTREPRENEUR
      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('ENTREPRENEUR');
    });
  });

  describe('6. Consents', () => {
    it('should create consent', async () => {
      const res = await request(app).post('/api/users/me/consents').set('Authorization', `Bearer ${accessToken}`).send({
        consentType: 'TERMS',
        version: 'v1',
        granted: true,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.consentType).toBe('TERMS');
    });

    it('should retrieve consents', async () => {
      const res = await request(app).get('/api/users/me/consents').set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].consentType).toBe('TERMS');
    });

    it('should fail invalid consent payload', async () => {
      const res = await request(app).post('/api/users/me/consents').set('Authorization', `Bearer ${accessToken}`).send({
        consentType: 'UNKNOWN',
        granted: true,
      });
      expect(res.status).toBe(400);
    });
  });

  describe('7. Logout', () => {
    it('should perform valid logout', async () => {
      // Login to get a fresh token to logout
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'email@example.com',
        password: 'password123',
      });
      const localRefreshToken = loginRes.body.data.refreshToken;
      const [tokenId, rawString] = localRefreshToken.split('.');

      const res = await request(app).post('/api/auth/logout').send({
        refreshToken: localRefreshToken,
      });
      expect(res.status).toBe(200);

      // Verify db state
      const token = (await db.select().from(refreshTokens).where(sql`id = ${tokenId}`))[0];
      expect(token.revokedAt).not.toBeNull();

      // Verify it cannot be used to refresh
      const refreshRes = await request(app).post('/api/auth/refresh').send({
        refreshToken: localRefreshToken,
      });
      expect(refreshRes.status).toBe(401);
    });
  });

  describe('8. 404 Endpoint Fallback', () => {
    it('should return 404 JSON response for unmatched routes', async () => {
      const res = await request(app).get('/api/unknown/route');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found',
        },
      });
    });
  });
});
