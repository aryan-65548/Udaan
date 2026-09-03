import request from 'supertest';
import app from '../../src/app';
import { db, pool } from '../../src/db';
import { sql } from 'drizzle-orm';
import { seedBusinessCategories } from '../../src/db/seeds/business-categories';

describe('Business Categories Integration Tests (Live DB)', () => {
  beforeAll(async () => {
    await db.execute(sql`TRUNCATE TABLE business_categories CASCADE`);
    await seedBusinessCategories(db);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('GET /api/business-categories returns active sorted categories', async () => {
    const res = await request(app).get('/api/business-categories');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].code).toBe('DAIRY_FARMING');
  });
});
