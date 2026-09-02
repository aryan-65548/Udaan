import request from 'supertest';
import express from 'express';
import businessCategoryRoutes from '../../src/routes/business-categories';
import { db } from '../../src/db';
import { initialBusinessCategories, seedBusinessCategories } from '../../src/db/seeds/business-categories';
import { businessCategories } from '../../src/db/schema/business-categories';
import { errorHandler } from '../../src/middleware/error';

// Mock DB
jest.mock('../../src/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

describe('Business Categories Unit & Seed Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/business-categories', businessCategoryRoutes);
    app.use(errorHandler);
  });

  describe('GET /api/business-categories', () => {
    it('returns active categories sorted by sortOrder', async () => {
      const mockCategories = [
        { id: 'b1000000-0000-0000-0000-000000000001', code: 'DAIRY_FARMING', name: 'Dairy Farming', sortOrder: 1 },
        { id: 'b1000000-0000-0000-0000-000000000002', code: 'GROCERY_RETAIL', name: 'Grocery Retail', sortOrder: 2 },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockCategories),
          }),
        }),
      });

      const res = await request(app).get('/api/business-categories');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockCategories);
    });

    it('handles database failure with 500 error', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockRejectedValue(new Error('DB failure')),
          }),
        }),
      });

      const res = await request(app).get('/api/business-categories');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('GET /api/business-categories/:id', () => {
    it('returns category for a valid ID', async () => {
      const categoryId = 'b1000000-0000-0000-0000-000000000001';
      const mockCategory = {
        id: categoryId,
        code: 'DAIRY_FARMING',
        name: 'Dairy Farming',
        isActive: true,
      };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockCategory]),
          }),
        }),
      });

      const res = await request(app).get(`/api/business-categories/${categoryId}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockCategory);
    });

    it('returns 404 for nonexistent category ID', async () => {
      const categoryId = 'b1000000-0000-0000-0000-000000000099';

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const res = await request(app).get(`/api/business-categories/${categoryId}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('rejects invalid UUID format with 400', async () => {
      const res = await request(app).get('/api/business-categories/invalid-uuid');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Seed Business Categories Contents & Idempotency', () => {
    it('contains all 8 authoritative business category codes', () => {
      const codes = initialBusinessCategories.map((c) => c.code);
      expect(codes).toEqual([
        'DAIRY_FARMING',
        'GROCERY_RETAIL',
        'TAILORING',
        'FOOD_PROCESSING',
        'MOBILE_REPAIR',
        'TRANSPORT',
        'SMALL_MANUFACTURING',
        'AGRICULTURE_SERVICE',
      ]);
    });

    it('targets businessCategories.code in onConflictDoNothing', async () => {
      const mockValues = jest.fn().mockReturnThis();
      const mockOnConflictDoNothing = jest.fn().mockResolvedValue(true);

      const mockDb = {
        insert: jest.fn().mockReturnValue({
          values: mockValues,
        }),
      };

      mockValues.mockReturnValue({
        onConflictDoNothing: mockOnConflictDoNothing,
      });

      await seedBusinessCategories(mockDb);

      expect(mockDb.insert).toHaveBeenCalledTimes(initialBusinessCategories.length);
      expect(mockOnConflictDoNothing).toHaveBeenCalledWith({
        target: businessCategories.code,
      });
    });
  });
});
