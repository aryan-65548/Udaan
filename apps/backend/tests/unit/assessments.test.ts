import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'testsecretkey';
process.env.JWT_SECRET = JWT_SECRET;

const testUserId = 'a0000000-0000-0000-0000-000000000001';
const otherUserId = 'a0000000-0000-0000-0000-000000000002';
const locationId = 'a1000000-0000-0000-0000-000000000007';
const categoryId = 'b1000000-0000-0000-0000-000000000001';
const assessmentId = 'c1000000-0000-0000-0000-000000000001';

// Mock DB
jest.mock('../../src/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock Authenticate Middleware
jest.mock('../../src/middleware/auth', () => ({
  authenticate: (req: Request & { user?: unknown }, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
    }

    const token = authHeader.split(' ')[1];
    if (token === 'invalid-token') {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      req.user = {
        id: decoded.userId,
        role: 'ENTREPRENEUR',
        preferredLanguage: 'en',
      };
      next();
    } catch {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token payload',
        },
      });
    }
  },
}));

import assessmentRoutes from '../../src/routes/assessments';
import { db } from '../../src/db';
import { errorHandler } from '../../src/middleware/error';

function createMockQuery(resolvedValue: unknown) {
  return {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(resolvedValue),
    then: (resolve: (v: unknown) => void) => Promise.resolve(resolvedValue).then(resolve),
  };
}

describe('Assessments Unit Tests', () => {
  let app: express.Express;
  let validToken: string;
  let otherUserToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/assessments', assessmentRoutes);
    app.use(errorHandler);

    validToken = jwt.sign({ userId: testUserId }, JWT_SECRET);
    otherUserToken = jwt.sign({ userId: otherUserId }, JWT_SECRET);
  });

  describe('1. Authorization & Authentication', () => {
    it('rejects unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/assessments');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects invalid token with 401', async () => {
      const res = await request(app)
        .get('/api/assessments')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });

  describe('2. POST /api/assessments (Create)', () => {
    it('creates an assessment owned by authenticated user', async () => {
      const mockSelect = db.select as jest.Mock;
      mockSelect
        .mockReturnValueOnce(createMockQuery([{ id: locationId }]))
        .mockReturnValueOnce(createMockQuery([{ id: categoryId }]));

      const mockCreated = {
        id: assessmentId,
        userId: testUserId,
        locationId,
        businessCategoryId: categoryId,
        language: 'gu',
        status: 'IN_PROGRESS',
        aiStatus: 'NOT_STARTED',
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockCreated]),
        }),
      });

      const res = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          locationId,
          businessCategoryId: categoryId,
          language: 'gu',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe(assessmentId);
      expect(res.body.data.status).toBe('IN_PROGRESS');
      expect(res.body.data.aiStatus).toBe('NOT_STARTED');
    });

    it('rejects creation with nonexistent location ID', async () => {
      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([]));

      const res = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          locationId,
          businessCategoryId: categoryId,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/location does not exist/i);
    });

    it('rejects creation with missing required fields', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${validToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid location UUID format with 400', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          locationId: 'invalid-uuid',
          businessCategoryId: categoryId,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('3. GET /api/assessments (List)', () => {
    it('lists only assessments belonging to the user', async () => {
      const mockList = [
        { id: assessmentId, userId: testUserId, status: 'IN_PROGRESS' },
      ];

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery(mockList));

      const res = await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockList);
    });
  });

  describe('4. GET /api/assessments/:id (Read single & ownership)', () => {
    it('returns assessment details for the owner', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId: testUserId,
        locationId,
        businessCategoryId: categoryId,
        status: 'IN_PROGRESS',
      };
      const mockLocation = { id: locationId, name: 'Gangardi' };
      const mockCategory = { id: categoryId, name: 'Dairy Farming' };

      const mockSelect = db.select as jest.Mock;
      mockSelect
        .mockReturnValueOnce(createMockQuery([mockAssessment]))
        .mockReturnValueOnce(createMockQuery([mockLocation]))
        .mockReturnValueOnce(createMockQuery([mockCategory]))
        .mockReturnValueOnce(createMockQuery([]));

      const res = await request(app)
        .get(`/api/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(assessmentId);
      expect(res.body.data.location.name).toBe('Gangardi');
      expect(res.body.data.businessCategory.name).toBe('Dairy Farming');
    });

    it('returns 403 Forbidden when user B accesses user A assessment', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId: testUserId,
        status: 'IN_PROGRESS',
      };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));

      const res = await request(app)
        .get(`/api/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 404 when assessment does not exist', async () => {
      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([]));

      const res = await request(app)
        .get(`/api/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('5. PATCH /api/assessments/:id (Update)', () => {
    it('updates assessment attributes for the owner', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId: testUserId,
        language: 'en',
      };

      const mockUpdated = {
        ...mockAssessment,
        language: 'hi',
      };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdated]),
          }),
        }),
      });

      const res = await request(app)
        .patch(`/api/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ language: 'hi' });

      expect(res.status).toBe(200);
      expect(res.body.data.language).toBe('hi');
    });

    it('returns 403 when user B updates user A assessment', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId: testUserId,
      };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));

      const res = await request(app)
        .patch(`/api/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ language: 'hi' });

      expect(res.status).toBe(403);
    });

    it('rejects empty update payload with 400', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId: testUserId,
      };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));

      const res = await request(app)
        .patch(`/api/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('6. POST /api/assessments/:id/complete (Complete)', () => {
    it('marks assessment completed and sets completedAt for the owner', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId: testUserId,
        status: 'IN_PROGRESS',
      };

      const completedTime = new Date().toISOString();
      const mockCompleted = {
        ...mockAssessment,
        status: 'COMPLETED',
        completedAt: completedTime,
      };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockCompleted]),
          }),
        }),
      });

      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/complete`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.completedAt).toBe(completedTime);
    });

    it('returns 403 when user B completes user A assessment', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId: testUserId,
        status: 'IN_PROGRESS',
      };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));

      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/complete`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('7. Assessment Inputs (Dynamic & Profile)', () => {
    it('PUT /inputs/:inputKey upserts NUMBER input', async () => {
      const mockAssessment = { id: assessmentId, userId: testUserId };
      const mockInput = {
        id: 'i1000000-0000-0000-0000-000000000001',
        assessmentId,
        inputKey: 'available_margin_capital',
        questionText: 'How much own capital do you have?',
        inputType: 'NUMBER',
        valueNumber: '10000.00',
        source: 'USER',
      };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockInput]),
          }),
        }),
      });

      const res = await request(app)
        .put(`/api/assessments/${assessmentId}/inputs/available_margin_capital`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          questionText: 'How much own capital do you have?',
          inputType: 'NUMBER',
          valueNumber: 10000,
          source: 'USER',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.inputKey).toBe('available_margin_capital');
      expect(res.body.data.valueNumber).toBe('10000.00');
    });

    it('PUT /inputs/:inputKey upserts TEXT input', async () => {
      const mockAssessment = { id: assessmentId, userId: testUserId };
      const mockInput = {
        id: 'i1000000-0000-0000-0000-000000000002',
        assessmentId,
        inputKey: 'business_location_address',
        inputType: 'TEXT',
        valueText: 'Main Market Road',
        source: 'USER',
      };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockInput]),
          }),
        }),
      });

      const res = await request(app)
        .put(`/api/assessments/${assessmentId}/inputs/business_location_address`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          inputType: 'TEXT',
          valueText: 'Main Market Road',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.valueText).toBe('Main Market Road');
    });

    it('PUT /inputs/:inputKey upserts BOOLEAN input', async () => {
      const mockAssessment = { id: assessmentId, userId: testUserId };
      const mockInput = {
        id: 'i1000000-0000-0000-0000-000000000003',
        assessmentId,
        inputKey: 'has_prior_experience',
        inputType: 'BOOLEAN',
        valueBoolean: true,
        source: 'USER',
      };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockInput]),
          }),
        }),
      });

      const res = await request(app)
        .put(`/api/assessments/${assessmentId}/inputs/has_prior_experience`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          inputType: 'BOOLEAN',
          valueBoolean: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.valueBoolean).toBe(true);
    });

    it('PUT /inputs/:inputKey upserts JSON input', async () => {
      const mockAssessment = { id: assessmentId, userId: testUserId };
      const mockInput = {
        id: 'i1000000-0000-0000-0000-000000000004',
        assessmentId,
        inputKey: 'equipment_list',
        inputType: 'JSON',
        valueJson: { items: ['cutter', 'stitcher'] },
        source: 'USER',
      };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockInput]),
          }),
        }),
      });

      const res = await request(app)
        .put(`/api/assessments/${assessmentId}/inputs/equipment_list`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          inputType: 'JSON',
          valueJson: { items: ['cutter', 'stitcher'] },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.valueJson).toEqual({ items: ['cutter', 'stitcher'] });
    });

    it('returns 403 when user B puts input on user A assessment', async () => {
      const mockAssessment = { id: assessmentId, userId: testUserId };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));

      const res = await request(app)
        .put(`/api/assessments/${assessmentId}/inputs/any_key`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          inputType: 'TEXT',
          valueText: 'test',
        });

      expect(res.status).toBe(403);
    });

    it('returns 403 when user B reads inputs of user A assessment', async () => {
      const mockAssessment = { id: assessmentId, userId: testUserId };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));

      const res = await request(app)
        .get(`/api/assessments/${assessmentId}/inputs`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
    });

    it('returns 403 when user B calls patch profile on user A assessment', async () => {
      const mockAssessment = { id: assessmentId, userId: testUserId };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));

      const res = await request(app)
        .patch(`/api/assessments/${assessmentId}/profile`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ has_land: true });

      expect(res.status).toBe(403);
    });

    it('rejects invalid inputType enum with 400', async () => {
      const mockAssessment = { id: assessmentId, userId: testUserId };
      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));

      const res = await request(app)
        .put(`/api/assessments/${assessmentId}/inputs/test_key`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          inputType: 'INVALID_TYPE',
          valueText: 'hello',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('GET /inputs retrieves all inputs for assessment', async () => {
      const mockAssessment = { id: assessmentId, userId: testUserId };
      const mockInputs = [
        { inputKey: 'experience_years', inputType: 'NUMBER', valueNumber: '3.00' },
        { inputKey: 'has_land', inputType: 'BOOLEAN', valueBoolean: true },
      ];

      const mockSelect = db.select as jest.Mock;
      mockSelect
        .mockReturnValueOnce(createMockQuery([mockAssessment]))
        .mockReturnValueOnce(createMockQuery(mockInputs));

      const res = await request(app)
        .get(`/api/assessments/${assessmentId}/inputs`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('PATCH /profile batch updates entrepreneur profile inputs', async () => {
      const mockAssessment = { id: assessmentId, userId: testUserId };

      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessment]));
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ inputKey: 'has_land', valueBoolean: true }]),
          }),
        }),
      });

      const res = await request(app)
        .patch(`/api/assessments/${assessmentId}/profile`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          has_land: true,
          experience_years: 5,
          shop_available: 'Yes, on main road',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });
  });
});
