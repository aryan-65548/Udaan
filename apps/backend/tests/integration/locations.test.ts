import request from 'supertest';
import app from '../../src/app';
import { db, pool } from '../../src/db';
import { sql } from 'drizzle-orm';
import { seedLocations } from '../../src/db/seeds/locations';
import { seedBusinessCategories } from '../../src/db/seeds/business-categories';
import { seedSchemes } from '../../src/db/seeds/schemes';
import { seedQuestionnaireQuestions } from '../../src/db/seeds/questionnaire';

describe('Locations Integration Tests (Live DB)', () => {
  beforeAll(async () => {
    await db.execute(sql`TRUNCATE TABLE locations CASCADE`);
    await seedLocations(db);
  });

  afterAll(async () => {
    // Restore all seeds for live dev environment
    await seedLocations(db);
    await seedBusinessCategories(db);
    await seedSchemes(db);
    await seedQuestionnaireQuestions(db);
    await pool.end();
  });

  it('GET /api/locations/states returns all states and UTs', async () => {
    const res = await request(app).get('/api/locations/states');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(36);
    expect(res.body.data[0].type).toBe('STATE');
  });

  it('GET /api/locations/:stateId/districts returns districts for Gujarat', async () => {
    const statesRes = await request(app).get('/api/locations/states');
    const gujarat = statesRes.body.data.find((s: any) => s.name === 'Gujarat');
    expect(gujarat).toBeDefined();

    const districtsRes = await request(app).get(`/api/locations/${gujarat.id}/districts`);
    expect(districtsRes.status).toBe(200);
    expect(districtsRes.body.data.length).toBeGreaterThanOrEqual(5);
    expect(districtsRes.body.data.every((d: any) => d.parentId === gujarat.id)).toBe(true);
  });

  it('GET /api/locations/:districtId/blocks returns blocks for a district', async () => {
    const statesRes = await request(app).get('/api/locations/states');
    const gujarat = statesRes.body.data.find((s: any) => s.name === 'Gujarat');
    const districtsRes = await request(app).get(`/api/locations/${gujarat.id}/districts`);
    const dahod = districtsRes.body.data.find((d: any) => d.name === 'Dahod');
    expect(dahod).toBeDefined();

    const blocksRes = await request(app).get(`/api/locations/${dahod.id}/blocks`);
    expect(blocksRes.status).toBe(200);
    expect(blocksRes.body.data.length).toBeGreaterThan(0);
    expect(blocksRes.body.data.every((b: any) => b.parentId === dahod.id)).toBe(true);
  });

  it('GET /api/locations/:blockId/villages supports pagination', async () => {
    const statesRes = await request(app).get('/api/locations/states');
    const gujarat = statesRes.body.data.find((s: any) => s.name === 'Gujarat');
    const districtsRes = await request(app).get(`/api/locations/${gujarat.id}/districts`);
    const dahod = districtsRes.body.data.find((d: any) => d.name === 'Dahod');
    const blocksRes = await request(app).get(`/api/locations/${dahod.id}/blocks`);
    const garbada = blocksRes.body.data.find((b: any) => b.name === 'Garbada');
    expect(garbada).toBeDefined();

    const villagesRes = await request(app).get(`/api/locations/${garbada.id}/villages?page=1&limit=2`);
    expect(villagesRes.status).toBe(200);
    expect(villagesRes.body.data.length).toBeLessThanOrEqual(2);
  });

  it('GET /api/locations/search finds locations matching query string', async () => {
    const res = await request(app).get('/api/locations/search?q=Pune');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.some((l: any) => l.name.toLowerCase().includes('pune'))).toBe(true);
  });

  it('POST /api/locations/manual creates a verified manual location entry', async () => {
    const res = await request(app).post('/api/locations/manual').send({
      stateName: 'Maharashtra',
      districtName: 'Pune',
      blockName: 'Haveli',
      villageName: 'Custom Village Alpha',
      latitude: 18.5204,
      longitude: 73.8567,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe('Custom Village Alpha');
    expect(Number(res.body.data.latitude)).toBeCloseTo(18.5204);
  });

  it('seedLocations is idempotent and does not create duplicate entries', async () => {
    // Run seed twice
    await seedLocations(db);
    await seedLocations(db);

    const statesRes = await request(app).get('/api/locations/states');
    expect(statesRes.status).toBe(200);
    // Should still have exactly 36 states/UTs
    const stateNames = statesRes.body.data.map((s: any) => s.name);
    const uniqueStateNames = new Set(stateNames);
    expect(stateNames.length).toBe(uniqueStateNames.size);
  });
});
