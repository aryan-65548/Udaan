import request from 'supertest';
import app from '../../src/app';
import { db, pool } from '../../src/db';
import { sql } from 'drizzle-orm';
import { seedLocations } from '../../src/db/seeds/locations';
import { seedBusinessCategories } from '../../src/db/seeds/business-categories';
import { seedSchemes } from '../../src/db/seeds/schemes';
import { users, assessments, assessmentInputs } from '../../src/db/schema';
import * as bcrypt from 'bcryptjs';

describe('Finance Integration Tests', () => {
  let userToken: string;
  let otherUserToken: string;
  let userId: string;
  let otherUserId: string;
  let assessmentId: string;

  beforeAll(async () => {
    await db.execute(sql`TRUNCATE TABLE users, locations, business_categories, scheme_configs, assessments, assessment_inputs, financial_runs, repayment_schedule_items CASCADE`);
    await seedLocations(db);
    await seedBusinessCategories(db);
    await seedSchemes(db);

    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Create user 1
    const [u1] = await db.insert(users).values({
      name: 'User 1',
      email: 'user1@example.com',
      passwordHash,
      role: 'ENTREPRENEUR',
      preferredLanguage: 'en'
    }).returning();
    userId = u1.id;

    // Create user 2
    const [u2] = await db.insert(users).values({
      name: 'User 2',
      email: 'user2@example.com',
      passwordHash,
      role: 'ENTREPRENEUR',
      preferredLanguage: 'en'
    }).returning();
    otherUserId = u2.id;

    // Login user 1
    const res1 = await request(app).post('/api/auth/login').send({ email: 'user1@example.com', password: 'password123' });
    if (!res1.body.data?.accessToken) console.log('Login 1 Failed:', res1.body);
    userToken = res1.body.data.accessToken;

    // Login user 2
    const res2 = await request(app).post('/api/auth/login').send({ email: 'user2@example.com', password: 'password123' });
    if (!res2.body.data?.accessToken) console.log('Login 2 Failed:', res2.body);
    otherUserToken = res2.body.data.accessToken;

    // Get location and category
    const locRes = await request(app).get('/api/locations/states');
    const locationId = locRes.body.data[0].id;
    const catRes = await request(app).get('/api/business-categories');
    const categoryId = catRes.body.data[0].id;

    // Create assessment for user 1
    const createRes = await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ locationId, businessCategoryId: categoryId, language: 'en' });
    
    assessmentId = createRes.body.data.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('PUT /api/assessments/:id/finance/inputs - validates ownership', async () => {
    const res = await request(app)
      .put(`/api/assessments/${assessmentId}/finance/inputs`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ available_margin_capital: 10000 });
    
    expect(res.status).toBe(403);
  });

  it('PUT /api/assessments/:id/finance/inputs - succeeds for owner', async () => {
    const res = await request(app)
      .put(`/api/assessments/${assessmentId}/finance/inputs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ 
        available_margin_capital: 14000, // 14,000 * 10 = 140,000 (Micro Finance)
        expected_monthly_revenue: 50000,
        expected_monthly_operating_cost: 30000,
        requested_moratorium_interest_treatment: 'CAPITALIZE'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
  });

  it('POST /api/assessments/:id/finance/calculate - requires availableMarginCapital', async () => {
    // Delete the margin capital input to test validation
    await db.delete(assessmentInputs).where(sql`${assessmentInputs.inputKey} = 'available_margin_capital'`);

    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/finance/calculate`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');

    // Restore it
    await request(app)
      .put(`/api/assessments/${assessmentId}/finance/inputs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ 
        available_margin_capital: 14000,
        requested_moratorium_interest_treatment: 'CAPITALIZE'
      });
  });

  it('POST /api/assessments/:id/finance/calculate - runs successfully and creates Micro Finance schedule', async () => {
    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/finance/calculate`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(201);
    const data = res.body.data;
    expect(data.status).toBe('SUCCESS');
    expect(data.schemeCode).toBe('MICRO_FINANCE');
    expect(data.financeResult.loanStructure.projectCost).toBe('140000'); // 14k * 10
    expect(data.financeResult.schedule.length).toBeGreaterThan(0);

    // Verify chronological dates and quarterly frequency
    const schedule = data.financeResult.schedule;
    const firstPeriod = schedule[0];
    const secondPeriod = schedule[1];
    expect(firstPeriod.periodStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(firstPeriod.periodEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(firstPeriod.dueDate).toEqual(firstPeriod.periodEnd);
    
    // First period end should be second period start
    expect(firstPeriod.periodEnd).toEqual(secondPeriod.periodStart);

    // 1st period should be moratorium for Micro Finance (3 months moratorium / quarterly = 1 period)
    expect(firstPeriod.isMoratorium).toBe(true);
    // 2nd period should NOT be moratorium
    expect(secondPeriod.isMoratorium).toBe(false);
  });

  it('PUT /api/assessments/:id/finance/inputs - validates fields strictly', async () => {
    // Attempt invalid/unknown fields
    const resInvalid = await request(app)
      .put(`/api/assessments/${assessmentId}/finance/inputs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        available_margin_capital: 'invalid_number_string',
        unknown_hacker_field: true,
      });

    expect(resInvalid.status).toBe(400);
    expect(resInvalid.body.error.code).toBe('VALIDATION_ERROR');

    // Valid fields
    const resValid = await request(app)
      .put(`/api/assessments/${assessmentId}/finance/inputs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        available_margin_capital: 14000,
        expected_monthly_revenue: 0, // test explicit zero
      });

    expect(resValid.status).toBe(200);
  });

  it('POST /api/assessments/:id/finance/calculate - routes to Term Loan', async () => {
    await request(app)
      .put(`/api/assessments/${assessmentId}/finance/inputs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ 
        available_margin_capital: 200000, // 200k * 10 = 2,000,000 (Term Loan)
        requested_moratorium_interest_treatment: 'CAPITALIZE'
      });

    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/finance/calculate`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(201);
    expect(res.body.data.schemeCode).toBe('TERM_LOAN');
    expect(res.body.data.financeResult.loanStructure.projectCost).toBe('2000000');
  });

  it('POST /api/assessments/:id/finance/calculate - rejects NOT_ELIGIBLE', async () => {
    await request(app)
      .put(`/api/assessments/${assessmentId}/finance/inputs`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ available_margin_capital: 600000 }); // 600k * 10 = 6,000,000 > 5M limit

    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/finance/calculate`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('NOT_ELIGIBLE');
  });

  it('GET /api/assessments/:id/finance - returns latest run', async () => {
    const res = await request(app)
      .get(`/api/assessments/${assessmentId}/finance`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.run.projectCost).toBe('2000000.00');
    expect(res.body.data.schedule).toBeDefined();
    expect(res.body.data.scheme).toBeDefined();
  });

  it('GET /api/assessments/:id/finance/runs - returns run history', async () => {
    const res = await request(app)
      .get(`/api/assessments/${assessmentId}/finance/runs`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2); // Micro and Term
  });

  it('GET /api/schemes - lists active schemes', async () => {
    const res = await request(app)
      .get('/api/schemes')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });
});
