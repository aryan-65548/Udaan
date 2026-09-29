import request from 'supertest';
import app from '../../src/app';
import { db, pool } from '../../src/db';
import { sql } from 'drizzle-orm';
import { runAllSeeds } from '../../src/db/seed';

describe('Feasibility Report Engine Integration Tests (Live DB)', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;
  let assessmentId: string;

  beforeAll(async () => {
    // Truncate users and run all seeds
    await db.execute(sql`TRUNCATE TABLE users CASCADE`);
    await runAllSeeds();

    // Register User 1
    const reg1 = await request(app).post('/api/auth/register').send({
      name: 'Surat Entrepreneur',
      email: 'surat.retailer@example.com',
      password: 'password123',
    });
    user1Token = reg1.body.data.accessToken;
    user1Id = reg1.body.data.user.id;

    // Register User 2 (unauthorized attacker)
    const reg2 = await request(app).post('/api/auth/register').send({
      name: 'Other User',
      email: 'other.user@example.com',
      password: 'password123',
    });
    user2Token = reg2.body.data.accessToken;
    user2Id = reg2.body.data.user.id;

    // Get Gujarat state and Surat location
    const statesRes = await request(app).get('/api/locations/states');
    const gujarat = statesRes.body.data.find((s: any) => s.name === 'Gujarat');
    const categoriesRes = await request(app).get('/api/business-categories');
    const groceryCat = categoriesRes.body.data.find(
      (c: any) => c.code === 'RETAIL_GROCERY' || c.name.toLowerCase().includes('grocery')
    ) || categoriesRes.body.data[0];

    // Create Assessment for User 1
    const assRes = await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        locationId: gujarat?.id,
        businessCategoryId: groceryCat?.id,
        language: 'en',
        stateName: 'Gujarat',
        districtName: 'Surat',
        blockName: 'Surat City',
        villageName: 'Adajan / City Light',
        formattedAddress: 'Adajan / City Light area, Surat, Gujarat',
        locationSelectionMethod: 'ADMINISTRATIVE',
      });
    assessmentId = assRes.body.data.id;

    // Save Assessment Inputs (Idea & Financial contribution)
    await request(app)
      .put(`/api/assessments/${assessmentId}/inputs/business_idea`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        inputType: 'TEXT',
        valueText: 'Small neighbourhood grocery store catering to residential households in Adajan, Surat.',
      });

    await request(app)
      .put(`/api/assessments/${assessmentId}/inputs/project_cost`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        inputType: 'NUMBER',
        valueNumber: 500000,
      });

    await request(app)
      .put(`/api/assessments/${assessmentId}/inputs/own_contribution`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        inputType: 'NUMBER',
        valueNumber: 100000,
      });

    // Run financial calculation
    await request(app)
      .post(`/api/assessments/${assessmentId}/finance/calculate`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        project_cost: 500000,
        own_contribution: 100000,
        available_margin_capital: 100000,
      });

    // Save Sahayak Questionnaire Responses
    await request(app)
      .put(`/api/assessments/${assessmentId}/questionnaire/responses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        responses: [
          {
            questionCode: 'INFRASTRUCTURE',
            response: {
              road_transport: 'GOOD',
              electricity: 'GOOD',
              water: 'AVERAGE',
              connectivity: 'GOOD',
            },
          },
          {
            questionCode: 'COMPETITORS',
            response: {
              hasNoCompetitors: false,
              competitors: [
                { name: 'Local Kirana', distance: '200 meters', description: 'Small corner shop' },
              ],
            },
          },
          {
            questionCode: 'SEASONAL_CONSTRAINTS',
            response: {
              constraints: ['monsoon_flooding'],
              affectedMonths: ['July', 'August'],
              explanation: 'Waterlogging during heavy rainfall days',
            },
          },
          {
            questionCode: 'LOCAL_DEMAND',
            response: {
              demandLevel: 'HIGH',
              rationale: 'Dense residential housing society with young families',
            },
          },
          {
            questionCode: 'CUSTOMERS_MARKET',
            response: {
              customerGroups: ['local_households', 'nearby_shops'],
              salesChannels: 'Direct store walk-ins and phone home delivery',
            },
          },
          {
            questionCode: 'BUSINESS_RISKS',
            response: {
              challenges: ['competition', 'working_capital'],
              supportNeeded: 'Initial working capital credit support and supplier connections',
            },
          },
        ],
      });
  });

  afterAll(async () => {
    await runAllSeeds();
    await pool.end();
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get(
      `/api/assessments/${assessmentId}/questionnaire/feasibility-report`
    );
    expect(res.status).toBe(401);
  });

  it('rejects unauthorized access from other users with 403', async () => {
    const res = await request(app)
      .get(`/api/assessments/${assessmentId}/questionnaire/feasibility-report`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(res.status).toBe(403);
  });

  it('generates and retrieves complete 12-section feasibility report for owner', async () => {
    const res = await request(app)
      .get(`/api/assessments/${assessmentId}/questionnaire/feasibility-report`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    const report = res.body.data;

    // 1. Metadata
    expect(report.metadata).toBeDefined();
    expect(report.metadata.assessmentId).toBe(assessmentId);
    expect(report.metadata.businessName).toContain('Grocery');

    // 2. Section 1: Executive Summary
    expect(report.executiveSummary).toBeDefined();
    expect(report.executiveSummary.keyStrengths.length).toBeGreaterThan(0);
    expect(report.executiveSummary.criticalWatchpoints.length).toBeGreaterThan(0);

    // 3. Section 2: Market Analysis
    expect(report.marketAnalysis).toBeDefined();
    expect(report.marketAnalysis.targetCustomerSegments.length).toBeGreaterThan(0);

    // 4. Section 3: Competition Analysis
    expect(report.competitionAnalysis).toBeDefined();
    expect(report.competitionAnalysis.competitorProfiles.length).toBeGreaterThanOrEqual(3);

    // 5. Section 4: Pricing & Product Strategy
    expect(report.pricingProductStrategy).toBeDefined();
    expect(report.pricingProductStrategy.inventoryMix.length).toBeGreaterThan(0);

    // 6. Section 5: Financial Feasibility (real values)
    expect(report.financialFeasibility).toBeDefined();
    expect(report.financialFeasibility.projectCost).toBe(500000);
    expect(report.financialFeasibility.ownContribution).toBe(100000);
    expect(report.financialFeasibility.baseLoanAmount).toBe(450000); // 90% of 500k
    expect(report.financialFeasibility.requestedFundingGap).toBe(400000); // 500k - 100k
    expect(report.financialFeasibility.schemeName).toBeDefined();
    expect(report.financialFeasibility.disclaimer).toBeDefined();

    // 7. Section 6: SWOT Analysis
    expect(report.swotAnalysis.strengths.length).toBeGreaterThan(0);
    expect(report.swotAnalysis.weaknesses.length).toBeGreaterThan(0);

    // 8. Section 7: Risk Analysis
    expect(report.riskAnalysis.length).toBeGreaterThanOrEqual(5);
    expect(report.riskAnalysis[0].mitigationStrategy).toBeDefined();

    // 9. Section 8: Infrastructure (from Sahayak)
    expect(report.infrastructureAssessment).toBeDefined();
    expect(report.infrastructureAssessment.roadTransport).toBe('GOOD');
    expect(report.infrastructureAssessment.localDemandLevel).toBe('HIGH');

    // 10. Section 9: Support Organizations (3 fixed DB records)
    expect(report.supportOrganizations).toBeDefined();
    expect(report.supportOrganizations.length).toBe(3);
    const orgNames = report.supportOrganizations.map((o: any) => o.name);
    expect(orgNames.some((n: string) => n.includes('NYCS'))).toBe(true);
    expect(orgNames.some((n: string) => n.includes('WICCI'))).toBe(true);
    expect(orgNames.some((n: string) => n.includes('SENA'))).toBe(true);

    // 11. Section 10: Curated Videos (3 fixed DB records)
    expect(report.curatedVideos).toBeDefined();
    expect(report.curatedVideos.length).toBe(3);
    const videoUrls = report.curatedVideos.map((v: any) => v.url);
    expect(videoUrls).toContain('https://www.youtube.com/watch?v=UlB6VAD78kM');
    expect(videoUrls).toContain('https://www.youtube.com/watch?v=3soVHA-f1zQ');
    expect(videoUrls).toContain('https://www.youtube.com/watch?v=JABjvOCl4Mg');

    // 12. Section 11: Action Plan
    expect(report.actionPlan.length).toBeGreaterThanOrEqual(5);

    // 13. Section 12: Conclusion & Limitations
    expect(report.conclusionAndLimitations.conclusion).toBeDefined();
    expect(report.conclusionAndLimitations.limitations.length).toBeGreaterThan(0);
  });

  it('records PDF download and transitions assessment to COMPLETED', async () => {
    const dlRes = await request(app)
      .post(`/api/assessments/${assessmentId}/questionnaire/feasibility-report/download`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(dlRes.status).toBe(200);
    expect(dlRes.body.data.status).toBe('COMPLETED');
    expect(dlRes.body.data.downloadedAt).toBeDefined();

    // Verify assessment status is now COMPLETED
    const assRes = await request(app)
      .get(`/api/assessments/${assessmentId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(assRes.status).toBe(200);
    expect(assRes.body.data.status).toBe('COMPLETED');
    expect(assRes.body.data.completedAt).toBeDefined();
  });
});
