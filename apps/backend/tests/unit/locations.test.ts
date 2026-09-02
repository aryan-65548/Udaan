import request from 'supertest';
import express from 'express';
import locationRoutes from '../../src/routes/locations';
import { db } from '../../src/db';
import { initialLocations, seedLocations } from '../../src/db/seeds/locations';
import { errorHandler } from '../../src/middleware/error';

// Mock DB
jest.mock('../../src/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

describe('Locations Unit & Seed Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/locations', locationRoutes);
    app.use(errorHandler);
  });

  describe('GET /api/locations/states', () => {
    it('returns all state locations', async () => {
      const mockStates = [
        { id: 'a1000000-0000-0000-0000-000000000001', name: 'Gujarat', type: 'STATE' },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockStates),
        }),
      });

      const res = await request(app).get('/api/locations/states');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockStates);
    });

    it('handles database failure with 500 error', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      const res = await request(app).get('/api/locations/states');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('GET /api/locations/:stateId/districts', () => {
    it('returns districts for a valid stateId', async () => {
      const stateId = 'a1000000-0000-0000-0000-000000000001';
      const mockDistricts = [
        { id: 'a1000000-0000-0000-0000-000000000002', name: 'Dahod', type: 'DISTRICT', parentId: stateId },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockDistricts),
        }),
      });

      const res = await request(app).get(`/api/locations/${stateId}/districts`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockDistricts);
    });

    it('rejects invalid stateId format with 400', async () => {
      const res = await request(app).get('/api/locations/not-a-uuid/districts');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/locations/:districtId/blocks', () => {
    it('returns blocks for a valid districtId', async () => {
      const districtId = 'a1000000-0000-0000-0000-000000000002';
      const mockBlocks = [
        { id: 'a1000000-0000-0000-0000-000000000004', name: 'Garbada', type: 'BLOCK', parentId: districtId },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockBlocks),
        }),
      });

      const res = await request(app).get(`/api/locations/${districtId}/blocks`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockBlocks);
    });
  });

  describe('GET /api/locations/:blockId/villages', () => {
    it('returns villages for a valid blockId', async () => {
      const blockId = 'a1000000-0000-0000-0000-000000000004';
      const mockVillages = [
        { id: 'a1000000-0000-0000-0000-000000000007', name: 'Gangardi', type: 'VILLAGE', parentId: blockId },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockVillages),
        }),
      });

      const res = await request(app).get(`/api/locations/${blockId}/villages`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockVillages);
    });
  });

  describe('GET /api/locations/:id (hierarchy resolution)', () => {
    it('returns location and full parent hierarchy', async () => {
      const villageId = 'a1000000-0000-0000-0000-000000000007';
      const blockId = 'a1000000-0000-0000-0000-000000000004';
      const districtId = 'a1000000-0000-0000-0000-000000000002';
      const stateId = 'a1000000-0000-0000-0000-000000000001';

      const village = { id: villageId, name: 'Gangardi', type: 'VILLAGE', parentId: blockId };
      const block = { id: blockId, name: 'Garbada', type: 'BLOCK', parentId: districtId };
      const district = { id: districtId, name: 'Dahod', type: 'DISTRICT', parentId: stateId };
      const state = { id: stateId, name: 'Gujarat', type: 'STATE', parentId: null };

      const mockSelect = db.select as jest.Mock;
      mockSelect
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([village]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([block]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([district]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([state]),
            }),
          }),
        });

      const res = await request(app).get(`/api/locations/${villageId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Gangardi');
      expect(res.body.data.hierarchy).toHaveLength(3);
      expect(res.body.data.hierarchy[0].name).toBe('Garbada');
      expect(res.body.data.hierarchy[1].name).toBe('Dahod');
      expect(res.body.data.hierarchy[2].name).toBe('Gujarat');
    });

    it('returns 404 for nonexistent location', async () => {
      const nonexistentId = '00000000-0000-0000-0000-000000000000';
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const res = await request(app).get(`/api/locations/${nonexistentId}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Seed Locations Idempotency & Structure', () => {
    it('seeds correct hierarchy and supports idempotency', async () => {
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

      await seedLocations(mockDb);

      expect(mockDb.insert).toHaveBeenCalledTimes(initialLocations.length);
      expect(mockOnConflictDoNothing).toHaveBeenCalled();
    });
  });
});
