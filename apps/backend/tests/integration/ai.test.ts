import request from 'supertest';
import app from '../../src/app';
import { db } from '../../src/db';
import { users, locations, businessCategories, assessments } from '../../src/db/schema';
import jwt from 'jsonwebtoken';
import { AiGatewayService } from '../../src/services/ai-gateway';
import { eq } from 'drizzle-orm';

// We mock AiGatewayService completely
jest.mock('../../src/services/ai-gateway');

describe('AI Gateway API', () => {
  let userToken: string;
  let otherUserToken: string;
  let userId: string;
  let otherUserId: string;
  let assessmentId: string;
  let otherAssessmentId: string;

  beforeAll(async () => {
    // 1. Create users
    const userRes = await db.insert(users).values([
      { name: 'AI Test User', phone: '+919999999902', passwordHash: 'hash', role: 'ENTREPRENEUR', preferredLanguage: 'en' },
      { name: 'Other User', phone: '+919999999903', passwordHash: 'hash', role: 'ENTREPRENEUR', preferredLanguage: 'en' },
    ]).returning();
    userId = userRes[0].id;
    otherUserId = userRes[1].id;

    // 2. Generate tokens
    userToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'test_secret');
    otherUserToken = jwt.sign({ userId: otherUserId }, process.env.JWT_SECRET || 'test_secret');

    const state = await db.insert(locations).values({ name: 'MH', type: 'STATE' }).returning();
    const cat = await db.insert(businessCategories).values({ name: 'Retail', code: 'RETAIL_1' }).returning();

    // 3. Create Assessment
    const ast = await db.insert(assessments).values([
      { userId, locationId: state[0].id, businessCategoryId: cat[0].id, language: 'en' },
      { userId: otherUserId, locationId: state[0].id, businessCategoryId: cat[0].id, language: 'en' }
    ]).returning();
    assessmentId = ast[0].id;
    otherAssessmentId = ast[1].id;
  });

  afterAll(async () => {
    await db.delete(assessments).where(eq(assessments.userId, userId));
    await db.delete(assessments).where(eq(assessments.userId, otherUserId));
    await db.delete(businessCategories).where(eq(businessCategories.name, 'Retail'));
    await db.delete(locations).where(eq(locations.name, 'MH'));
    await db.delete(users).where(eq(users.id, userId));
    await db.delete(users).where(eq(users.id, otherUserId));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. should return 403 when unauthorized user accesses another users session', async () => {
    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/ai/start`)
      .set('Authorization', `Bearer ${otherUserToken}`);
    expect(res.status).toBe(403);
  });

  it('2. should start AI session successfully', async () => {
    (AiGatewayService.startSession as jest.Mock).mockResolvedValue({
      sessionId: 'sess_123',
      status: 'QUESTIONING',
      message: 'Hello, I am AI'
    });

    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/ai/start`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.sessionId).toBe('sess_123');
    expect(res.body.data.status).toBe('QUESTIONING');

    // Verify DB update
    const updated = await db.select().from(assessments).where(eq(assessments.id, assessmentId));
    expect(updated[0].aiStatus).toBe('QUESTIONING');
    expect(updated[0].aiSessionId).toBe('sess_123');
  });

  it('3. should send a message to AI session', async () => {
    (AiGatewayService.sendMessage as jest.Mock).mockResolvedValue({
      sessionId: 'sess_123',
      status: 'COMPLETED',
      message: 'Done!'
    });

    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/ai/message`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'My final answer' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');

    // Verify DB update
    const updated = await db.select().from(assessments).where(eq(assessments.id, assessmentId));
    expect(updated[0].aiStatus).toBe('COMPLETED');
  });

  it('4. should handle AI service timeout gracefully and return generic 500 without leaking stack traces', async () => {
    (AiGatewayService.startSession as jest.Mock).mockRejectedValue(new Error('AI Gateway Failure: AI Service request timed out'));

    const res = await request(app)
      .post(`/api/assessments/${otherAssessmentId}/ai/start`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    // Express errorHandler should intercept the thrown error and emit standard JSON
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(res.body.error.message).toBe('An unexpected error occurred');
    // Ensure no stack traces or explicit Python URL info are leaked
    expect(res.body.error.details).toBeUndefined();
  });

  it('5. should handle AI service malformed data gracefully and return generic 500', async () => {
    (AiGatewayService.getReport as jest.Mock).mockRejectedValue(new Error('AI Gateway Failure: AI Service error: 500 - {"detail": "Internal Server Error"}'));

    // We must ensure the otherAssessmentId is in COMPLETED state to pass the report's first check
    await db.update(assessments).set({ aiStatus: 'COMPLETED' }).where(eq(assessments.id, otherAssessmentId));

    const res = await request(app)
      .get(`/api/assessments/${otherAssessmentId}/ai/report`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(res.body.error.message).toBe('An unexpected error occurred');
  });
});
