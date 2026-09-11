import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'testsecretkey';
process.env.JWT_SECRET = JWT_SECRET;

const testUserId = 'a0000000-0000-0000-0000-000000000001';
const otherUserId = 'a0000000-0000-0000-0000-000000000002';
const assessmentId = 'c1000000-0000-0000-0000-000000000001';
const otherAssessmentId = 'c1000000-0000-0000-0000-000000000002';
const taskId = 'd1000000-0000-0000-0000-000000000001';
const otherTaskId = 'd1000000-0000-0000-0000-000000000002';

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

import validationRoutes from '../../src/routes/validation';
import assessmentRoutes from '../../src/routes/assessments';
import { db } from '../../src/db';
import { errorHandler } from '../../src/middleware/error';
import { DEFAULT_VALIDATION_TASKS } from '../../src/schemas/validation';

function createMockQuery(resolvedValue: unknown) {
  const queryObj: Record<string, unknown> = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockImplementation(() => Promise.resolve(resolvedValue)),
    limit: jest.fn().mockResolvedValue(resolvedValue),
    then: (resolve: (v: unknown) => void) => Promise.resolve(resolvedValue).then(resolve),
  };
  return queryObj;
}

describe('Field Validation Unit Tests', () => {
  let app: express.Express;
  let validToken: string;
  let otherUserToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/assessments', validationRoutes);
    app.use('/api/assessments', assessmentRoutes);
    app.use(errorHandler);

    validToken = jwt.sign({ userId: testUserId }, JWT_SECRET);
    otherUserToken = jwt.sign({ userId: otherUserId }, JWT_SECRET);
  });

  const mockAssessmentOwner = {
    id: assessmentId,
    userId: testUserId,
    status: 'IN_PROGRESS',
  };

  const mockOtherAssessment = {
    id: otherAssessmentId,
    userId: otherUserId,
    status: 'IN_PROGRESS',
  };

  describe('1. GET /api/assessments/:id/validation', () => {
    it('1. authenticated user can retrieve validation tasks', async () => {
      const existingTasks = [
        {
          id: taskId,
          assessmentId,
          taskKey: 'CUSTOMER_DEMAND',
          taskText: 'Verify local customer demand and target market size',
          status: 'PENDING',
          notes: null,
          completedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessmentOwner])) // getAuthorizedAssessment
        .mockReturnValueOnce(createMockQuery(existingTasks)); // query existing tasks

      const res = await request(app)
        .get(`/api/assessments/${assessmentId}/validation`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].taskKey).toBe('CUSTOMER_DEMAND');
    });

    it('2. validation tasks are created deterministically when none exist', async () => {
      const seededTasks = DEFAULT_VALIDATION_TASKS.map((t, idx) => ({
        id: `d1000000-0000-0000-0000-00000000000${idx + 1}`,
        assessmentId,
        taskKey: t.taskKey,
        taskText: t.taskText,
        status: 'PENDING',
        notes: null,
        completedAt: null,
      }));

      const mockOnConflict = jest.fn().mockResolvedValue([]);
      const mockValues = jest.fn().mockReturnValue({ onConflictDoNothing: mockOnConflict });
      (db.insert as jest.Mock).mockReturnValue({ values: mockValues });

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessmentOwner])) // auth check
        .mockReturnValueOnce(createMockQuery([])) // first query: empty
        .mockReturnValueOnce(createMockQuery(seededTasks)); // second query: seeded

      const res = await request(app)
        .get(`/api/assessments/${assessmentId}/validation`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(mockValues).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ taskKey: 'CUSTOMER_DEMAND', status: 'PENDING' }),
          expect.objectContaining({ taskKey: 'COMPETITOR_CHECK', status: 'PENDING' }),
          expect.objectContaining({ taskKey: 'SUPPLIER_CHECK', status: 'PENDING' }),
          expect.objectContaining({ taskKey: 'LOCAL_PRICE_CHECK', status: 'PENDING' }),
          expect.objectContaining({ taskKey: 'EQUIPMENT_CHECK', status: 'PENDING' }),
          expect.objectContaining({ taskKey: 'OPERATING_COST_CHECK', status: 'PENDING' }),
        ])
      );
      expect(res.body.data).toHaveLength(6);
    });

    it('3. repeated retrieval does not duplicate tasks', async () => {
      const existingTasks = DEFAULT_VALIDATION_TASKS.map((t, idx) => ({
        id: `d1000000-0000-0000-0000-00000000000${idx + 1}`,
        assessmentId,
        taskKey: t.taskKey,
        taskText: t.taskText,
        status: 'PENDING',
      }));

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessmentOwner]))
        .mockReturnValueOnce(createMockQuery(existingTasks));

      const res = await request(app)
        .get(`/api/assessments/${assessmentId}/validation`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(6);
      expect(db.insert).not.toHaveBeenCalled();
    });

    it('4. unauthenticated request is rejected with 401', async () => {
      const res = await request(app).get(`/api/assessments/${assessmentId}/validation`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it("5. User A cannot access User B's assessment validation (403)", async () => {
      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockOtherAssessment]));

      const res = await request(app)
        .get(`/api/assessments/${otherAssessmentId}/validation`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('2. PATCH /api/assessments/:id/validation/:taskId', () => {
    it("6. User A cannot update User B's validation task (403)", async () => {
      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockOtherAssessment]));

      const res = await request(app)
        .patch(`/api/assessments/${otherAssessmentId}/validation/${taskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('7. valid task update works (status and notes)', async () => {
      const existingTask = {
        id: taskId,
        assessmentId,
        taskKey: 'CUSTOMER_DEMAND',
        taskText: 'Verify demand',
        status: 'PENDING',
        notes: null,
        completedAt: null,
      };

      const updatedTask = {
        ...existingTask,
        status: 'COMPLETED',
        notes: 'Verified 25 shopkeepers',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessmentOwner])) // auth check
        .mockReturnValueOnce(createMockQuery([existingTask])); // task find

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedTask]),
          }),
        }),
      });

      const res = await request(app)
        .patch(`/api/assessments/${assessmentId}/validation/${taskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'COMPLETED', notes: 'Verified 25 shopkeepers' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.notes).toBe('Verified 25 shopkeepers');
      expect(res.body.data.completedAt).toBeDefined();
    });

    it('8. COMPLETED sets completed_at timestamp', async () => {
      const existingTask = {
        id: taskId,
        assessmentId,
        status: 'PENDING',
        notes: null,
        completedAt: null,
      };

      let capturedSetValues: Record<string, unknown> = {};
      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessmentOwner]))
        .mockReturnValueOnce(createMockQuery([existingTask]));

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockImplementation((vals) => {
          capturedSetValues = vals;
          return {
            where: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{ ...existingTask, ...vals }]),
            }),
          };
        }),
      });

      const res = await request(app)
        .patch(`/api/assessments/${assessmentId}/validation/${taskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(200);
      expect(capturedSetValues.completedAt).toBeInstanceOf(Date);
      expect(capturedSetValues.status).toBe('COMPLETED');
    });

    it('9. SKIPPED works and clears completed_at', async () => {
      const existingTask = {
        id: taskId,
        assessmentId,
        status: 'COMPLETED',
        notes: 'Previously completed',
        completedAt: new Date(),
      };

      let capturedSetValues: Record<string, unknown> = {};
      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessmentOwner]))
        .mockReturnValueOnce(createMockQuery([existingTask]));

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockImplementation((vals) => {
          capturedSetValues = vals;
          return {
            where: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{ ...existingTask, ...vals }]),
            }),
          };
        }),
      });

      const res = await request(app)
        .patch(`/api/assessments/${assessmentId}/validation/${taskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'SKIPPED' });

      expect(res.status).toBe(200);
      expect(capturedSetValues.status).toBe('SKIPPED');
      expect(capturedSetValues.completedAt).toBeNull();
    });

    it('10. notes persist exactly as supplied', async () => {
      const existingTask = {
        id: taskId,
        assessmentId,
        status: 'PENDING',
        notes: null,
        completedAt: null,
      };

      let capturedSetValues: Record<string, unknown> = {};
      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessmentOwner]))
        .mockReturnValueOnce(createMockQuery([existingTask]));

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockImplementation((vals) => {
          capturedSetValues = vals;
          return {
            where: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{ ...existingTask, ...vals }]),
            }),
          };
        }),
      });

      const res = await request(app)
        .patch(`/api/assessments/${assessmentId}/validation/${taskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ notes: 'Detailed supplier quotes received: ₹15,000/ton' });

      expect(res.status).toBe(200);
      expect(capturedSetValues.notes).toBe('Detailed supplier quotes received: ₹15,000/ton');
      expect(capturedSetValues.status).toBeUndefined();
    });

    it('10b. preserves existing completedAt timestamp when updating only notes on a COMPLETED task', async () => {
      const existingCompletedDate = new Date('2026-01-01T12:00:00.000Z');
      const existingTask = {
        id: taskId,
        assessmentId,
        status: 'COMPLETED',
        notes: 'Initial notes',
        completedAt: existingCompletedDate,
      };

      let capturedSetValues: Record<string, unknown> = {};
      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessmentOwner]))
        .mockReturnValueOnce(createMockQuery([existingTask]));

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockImplementation((vals) => {
          capturedSetValues = vals;
          return {
            where: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{ ...existingTask, ...vals }]),
            }),
          };
        }),
      });

      const res = await request(app)
        .patch(`/api/assessments/${assessmentId}/validation/${taskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ notes: 'Updated notes only' });

      expect(res.status).toBe(200);
      expect(capturedSetValues.completedAt).toEqual(existingCompletedDate);
      expect(capturedSetValues.notes).toBe('Updated notes only');
      expect(capturedSetValues.status).toBeUndefined();
    });

    it('11. invalid status is rejected with 400', async () => {
      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockAssessmentOwner]));

      const res = await request(app)
        .patch(`/api/assessments/${assessmentId}/validation/${taskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'NOT_A_VALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('11b. rejects unauthorized user with 403 before body validation', async () => {
      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([mockOtherAssessment]));

      const res = await request(app)
        .patch(`/api/assessments/${otherAssessmentId}/validation/${taskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'NOT_A_VALID_STATUS' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('12. task belonging to another assessment cannot be updated (404)', async () => {
      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessmentOwner])) // auth owner passes
        .mockReturnValueOnce(createMockQuery([])); // task not found under this assessment

      const res = await request(app)
        .patch(`/api/assessments/${assessmentId}/validation/${otherTaskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('3. Completion behavior respects validation rule', () => {
    it('13a. rejects completion when validation tasks are PENDING (400 VALIDATION_INCOMPLETE)', async () => {
      const pendingTask = { id: taskId, assessmentId, status: 'PENDING' };

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessmentOwner])) // auth check
        .mockReturnValueOnce(createMockQuery([pendingTask])); // pending tasks check: found 1

      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/complete`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_INCOMPLETE');
      expect(db.update).not.toHaveBeenCalled();
    });

    it('13b. allows completion when actual validation tasks exist and all are COMPLETED or SKIPPED', async () => {
      const existingValidationTasks = [
        { id: taskId, assessmentId, status: 'COMPLETED' },
        { id: otherTaskId, assessmentId, status: 'SKIPPED' },
      ];

      const mockCompleted = {
        ...mockAssessmentOwner,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessmentOwner])) // auth check
        .mockReturnValueOnce(createMockQuery(existingValidationTasks)); // tasks query: 1 COMPLETED, 1 SKIPPED

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
      expect(res.body.data.completedAt).toBeDefined();
    });

    it('13c. allows completion when zero validation tasks exist (uninitiated validation)', async () => {
      const mockCompleted = {
        ...mockAssessmentOwner,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessmentOwner])) // auth check
        .mockReturnValueOnce(createMockQuery([])); // 0 tasks

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
      expect(res.body.data.completedAt).toBeDefined();
    });
  });
});
