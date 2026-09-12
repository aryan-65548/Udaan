import request from 'supertest';
import app from '../../src/app';
import { db, pool } from '../../src/db';
import { sql } from 'drizzle-orm';
import { locations, businessCategories, validationTasks } from '../../src/db/schema';
import { seedLocations } from '../../src/db/seeds/locations';
import { seedBusinessCategories } from '../../src/db/seeds/business-categories';

describe('Assessments Integration Tests (Live DB)', () => {
  let authToken: string;
  let testLocationId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    await db.execute(sql`TRUNCATE TABLE users, locations, business_categories, assessments, assessment_inputs, validation_tasks CASCADE`);
    await seedLocations(db);
    await seedBusinessCategories(db);

    // Register test user
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Integration Test User',
      email: 'val_integration@example.com',
      password: 'password123',
    });
    authToken = regRes.body.data.accessToken;

    // Get a seeded location and category
    const [loc] = await db.select().from(locations).limit(1);
    testLocationId = loc.id;

    const [cat] = await db.select().from(businessCategories).limit(1);
    testCategoryId = cat.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('GET /api/assessments rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/assessments');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('runs complete field validation lifecycle and completion guard against live DB', async () => {
    // 1. Create assessment
    const createRes = await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        locationId: testLocationId,
        businessCategoryId: testCategoryId,
        language: 'en',
      });

    expect(createRes.status).toBe(201);
    const assessmentId = createRes.body.data.id;

    // 2. GET /api/assessments/:id/validation seeds standard checklist
    const valRes = await request(app)
      .get(`/api/assessments/${assessmentId}/validation`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(valRes.status).toBe(200);
    expect(valRes.body.data).toHaveLength(6);
    const tasks: Array<{ id: string; taskKey: string; status: string }> = valRes.body.data;

    // 3. Attempting completion while tasks are PENDING should fail with 400
    const failCompleteRes = await request(app)
      .post(`/api/assessments/${assessmentId}/complete`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(failCompleteRes.status).toBe(400);
    expect(failCompleteRes.body.error.code).toBe('VALIDATION_INCOMPLETE');

    // 4. Update task 1 to COMPLETED with notes
    const task1 = tasks[0];
    const patchRes = await request(app)
      .patch(`/api/assessments/${assessmentId}/validation/${task1.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'COMPLETED',
        notes: 'Verified local demand in live integration test',
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.status).toBe('COMPLETED');
    expect(patchRes.body.data.completedAt).toBeDefined();
    expect(patchRes.body.data.notes).toBe('Verified local demand in live integration test');

    // 5. Update remaining tasks: some COMPLETED, some SKIPPED
    for (let i = 1; i < tasks.length; i++) {
      const nextStatus = i % 2 === 0 ? 'SKIPPED' : 'COMPLETED';
      const pRes = await request(app)
        .patch(`/api/assessments/${assessmentId}/validation/${tasks[i].id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: nextStatus });
      expect(pRes.status).toBe(200);
      expect(pRes.body.data.status).toBe(nextStatus);
    }

    // 6. Now completion should succeed
    const completeRes = await request(app)
      .post(`/api/assessments/${assessmentId}/complete`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.status).toBe('COMPLETED');
    expect(completeRes.body.data.completedAt).toBeDefined();
  });
});
