import request from 'supertest';
import app from '../../src/app';
import { db, pool } from '../../src/db';
import { sql } from 'drizzle-orm';
import { seedLocations } from '../../src/db/seeds/locations';
import { seedBusinessCategories } from '../../src/db/seeds/business-categories';

describe('Assessments Integration Tests (Live DB)', () => {
  beforeAll(async () => {
    await db.execute(sql`TRUNCATE TABLE users, locations, business_categories, assessments, assessment_inputs CASCADE`);
    await seedLocations(db);
    await seedBusinessCategories(db);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('GET /api/assessments rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/assessments');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
