import request from 'supertest';
import app from '../../src/app';
import { db, pool } from '../../src/db';
import { sql } from 'drizzle-orm';
import { seedLocations } from '../../src/db/seeds/locations';
import { seedBusinessCategories } from '../../src/db/seeds/business-categories';
import { seedSchemes } from '../../src/db/seeds/schemes';
import { seedQuestionnaireQuestions } from '../../src/db/seeds/questionnaire';
import { locations, businessCategories, questionnaireQuestions } from '../../src/db/schema';

describe('Sahayak Questionnaire & Feasibility Report Integration Tests', () => {
  let user1Token: string;
  let user2Token: string;
  let testLocationId: string;
  let testCategoryId: string;
  let assessmentId: string;

  beforeAll(async () => {
    await db.execute(
      sql`TRUNCATE TABLE users, locations, business_categories, assessments, assessment_inputs, validation_tasks, scheme_configs, financial_runs, repayment_schedule_items, questionnaire_questions, questionnaire_responses CASCADE`
    );

    await seedLocations(db);
    await seedBusinessCategories(db);
    await seedSchemes(db);
    await seedQuestionnaireQuestions(db);

    // Register User 1
    const reg1 = await request(app).post('/api/auth/register').send({
      name: 'Owner User',
      email: 'owner_user@example.com',
      password: 'password123',
    });
    user1Token = reg1.body.data.accessToken;

    // Register User 2
    const reg2 = await request(app).post('/api/auth/register').send({
      name: 'Other User',
      email: 'other_user@example.com',
      password: 'password123',
    });
    user2Token = reg2.body.data.accessToken;

    const [loc] = await db.select().from(locations).limit(1);
    testLocationId = loc.id;

    const [cat] = await db.select().from(businessCategories).limit(1);
    testCategoryId = cat.id;

    // Create assessment for User 1
    const createRes = await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        locationId: testLocationId,
        businessCategoryId: testCategoryId,
        language: 'en',
      });
    assessmentId = createRes.body.data.id;

    // Save inputs & run finance calculation for this assessment
    await request(app)
      .post(`/api/assessments/${assessmentId}/finance/calculate`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        project_cost: 100000,
        own_contribution: 15000,
        available_cash_funds: 25000,
        expected_monthly_revenue: 35000,
        expected_monthly_operating_cost: 20000,
        requested_moratorium_interest_treatment: 'CAPITALIZE',
      });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('verifies questionnaire seed idempotency and exactly 6 active top-level questions', async () => {
    // Run seed again
    await seedQuestionnaireQuestions(db);

    const questions = await db.select().from(questionnaireQuestions);
    expect(questions.length).toBe(6);

    const codes = questions.map((q) => q.code).sort();
    expect(codes).toEqual([
      'BUSINESS_RISKS',
      'COMPETITORS',
      'CUSTOMERS_MARKET',
      'INFRASTRUCTURE',
      'LOCAL_DEMAND',
      'SEASONAL_CONSTRAINTS',
    ]);
  });

  it('GET /api/assessments/:id/questionnaire enforces authentication and ownership', async () => {
    // Unauthenticated
    const unauth = await request(app).get(`/api/assessments/${assessmentId}/questionnaire`);
    expect(unauth.status).toBe(401);

    // Other user forbidden (HTTP 403)
    const forbidden = await request(app)
      .get(`/api/assessments/${assessmentId}/questionnaire`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(forbidden.status).toBe(403);

    // Authorized user
    const ok = await request(app)
      .get(`/api/assessments/${assessmentId}/questionnaire`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.totalQuestions).toBe(6);
    expect(ok.body.data.completedCount).toBe(0);
    expect(ok.body.data.isComplete).toBe(false);
  });

  it('PUT /api/assessments/:id/questionnaire/responses validates malformed responses and rejects invalid options', async () => {
    // Missing required matrix field in INFRASTRUCTURE
    const invalidInfra = await request(app)
      .put(`/api/assessments/${assessmentId}/questionnaire/responses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        responses: [
          {
            questionCode: 'INFRASTRUCTURE',
            response: {
              road_transport: 'GOOD',
              // missing electricity, water, connectivity
            },
          },
        ],
      });
    expect(invalidInfra.status).toBe(400);

    // Invalid competitor response (empty list and hasNoCompetitors false)
    const invalidComp = await request(app)
      .put(`/api/assessments/${assessmentId}/questionnaire/responses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        responses: [
          {
            questionCode: 'COMPETITORS',
            response: {
              hasNoCompetitors: false,
              competitors: [],
            },
          },
        ],
      });
    expect(invalidComp.status).toBe(400);
  });

  it('saves partial responses, resumes state, and tracks completion progress', async () => {
    // Save Question 1 (Infrastructure) & Question 2 (Competitors)
    const partialSave = await request(app)
      .put(`/api/assessments/${assessmentId}/questionnaire/responses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        responses: [
          {
            questionCode: 'INFRASTRUCTURE',
            response: {
              road_transport: 'GOOD',
              electricity: 'AVERAGE',
              water: 'GOOD',
              connectivity: 'GOOD',
            },
          },
          {
            questionCode: 'COMPETITORS',
            response: {
              hasNoCompetitors: true,
            },
          },
        ],
      });
    expect(partialSave.status).toBe(200);
    expect(partialSave.body.data.savedCount).toBe(2);

    // Fetch questionnaire to resume
    const resumed = await request(app)
      .get(`/api/assessments/${assessmentId}/questionnaire`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(resumed.status).toBe(200);
    expect(resumed.body.data.completedCount).toBe(2);
    expect(resumed.body.data.isComplete).toBe(false);

    const q1 = resumed.body.data.questions.find((q: any) => q.code === 'INFRASTRUCTURE');
    expect(q1.savedResponse.road_transport).toBe('GOOD');
  });

  it('POST /api/assessments/:id/questionnaire/submit rejects incomplete questionnaires', async () => {
    const incompleteSubmit = await request(app)
      .post(`/api/assessments/${assessmentId}/questionnaire/submit`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(incompleteSubmit.status).toBe(400);
    expect(incompleteSubmit.body.error.code).toBe('INCOMPLETE_QUESTIONNAIRE');
  });

  it('saves all 6 question responses and successfully finalizes the questionnaire', async () => {
    // Save remaining 4 questions
    const saveRemaining = await request(app)
      .put(`/api/assessments/${assessmentId}/questionnaire/responses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        responses: [
          {
            questionCode: 'SEASONAL_CONSTRAINTS',
            response: {
              constraints: ['monsoon_flooding'],
              affectedMonths: ['July', 'August'],
              explanation: 'Heavy rains cause slight slowdown in customer footfall.',
            },
          },
          {
            questionCode: 'LOCAL_DEMAND',
            response: {
              demandLevel: 'HIGH',
              rationale: 'High local population and no other dedicated service provider.',
            },
          },
          {
            questionCode: 'CUSTOMERS_MARKET',
            response: {
              customerGroups: ['local_households', 'nearby_businesses'],
              salesChannels: 'Direct shop sales and doorstep delivery on request.',
            },
          },
          {
            questionCode: 'BUSINESS_RISKS',
            response: {
              challenges: ['raw_materials', 'skilled_labour'],
              supportNeeded: 'Initial training and bulk purchasing tie-ups.',
            },
          },
        ],
      });
    expect(saveRemaining.status).toBe(200);

    // Submit questionnaire
    const finalSubmit = await request(app)
      .post(`/api/assessments/${assessmentId}/questionnaire/submit`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(finalSubmit.status).toBe(200);
    expect(finalSubmit.body.data.aiStatus).toBe('COMPLETED');
  });

  it('GET /api/assessments/:id/questionnaire/feasibility-report returns consolidated feasibility report with financial engine & Sahayak insights', async () => {
    const reportRes = await request(app)
      .get(`/api/assessments/${assessmentId}/questionnaire/feasibility-report`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(reportRes.status).toBe(200);
    const report = reportRes.body.data;

    // 1. Assessment Identity
    expect(report.assessment.id).toBe(assessmentId);

    // 2. Financial Feasibility Engine Results
    expect(report.financialFeasibility).toBeDefined();
    expect(report.financialFeasibility.scheme.schemeCode).toBe('MICRO_FINANCE');
    expect(Number(report.financialFeasibility.run.projectCost)).toBe(100000);
    expect(Number(report.financialFeasibility.run.loanAmount)).toBe(90000);
    expect(report.financialFeasibility.schedule.length).toBe(12);

    // 3. Sahayak Business Context Insights
    expect(report.sahayakBusinessContext).toBeDefined();
    expect(report.sahayakBusinessContext.isComplete).toBe(true);
    expect(report.sahayakBusinessContext.completedCount).toBe(6);
    expect(report.sahayakBusinessContext.insights.infrastructureReadiness).toBeDefined();
    expect(report.sahayakBusinessContext.insights.competitionLandscape).toContain('First-mover advantage');
    expect(report.sahayakBusinessContext.insights.marketDemandOutlook).toContain('HIGH');
  });
});
