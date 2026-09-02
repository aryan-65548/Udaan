import request from 'supertest';
import app from '../../src/app';
import { db, pool } from '../../src/db';
import { sql } from 'drizzle-orm';
import { seedLocations } from '../../src/db/seeds/locations';

describe('Locations Integration Tests (Live DB)', () => {
  beforeAll(async () => {
    await db.execute(sql`TRUNCATE TABLE locations CASCADE`);
    await seedLocations(db);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('GET /api/locations/states returns states', async () => {
    const res = await request(app).get('/api/locations/states');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].type).toBe('STATE');
  });
});
