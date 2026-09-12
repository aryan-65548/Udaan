import request from 'supertest';
import app from '../../src/app';
import { db } from '../../src/db';
import { users, locations, businessCategories, assessments } from '../../src/db/schema';
import jwt from 'jsonwebtoken';
import { AiGatewayService } from '../../src/services/ai-gateway';
import { eq } from 'drizzle-orm';

jest.mock('../../src/services/ai-gateway');

describe('AI Gateway API', () => {
  let userToken: string;
  let userId: string;
  let assessmentId: string;

  beforeAll(async () => {
    // 1. Create a user
    const userRes = await db.insert(users).values({
      name: 'AI Test User',
      phone: '+919999999902',
      passwordHash: 'hash',
      role: 'ENTREPRENEUR',
      preferredLanguage: 'en',
    }).returning();
    userId = userRes[0].id;

    // 2. Generate token
    userToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'test_secret');

    const state = await db.insert(locations).values({ name: 'MH', type: 'STATE' }).returning();
    const cat = await db.insert(businessCategories).values({ name: 'Retail', code: 'RETAIL_1' }).returning();

    // 3. Create Assessment
    const ast = await db.insert(assessments).values({
      userId,
      locationId: state[0].id,
      businessCategoryId: cat[0].id,
      language: 'en',
    }).returning();
    assessmentId = ast[0].id;
  });

  afterAll(async () => {
    await db.delete(assessments).where(eq(assessments.userId, userId));
    await db.delete(businessCategories).where(eq(businessCategories.name, 'Retail'));
    await db.delete(locations).where(eq(locations.name, 'MH'));
    await db.delete(users).where(eq(users.id, userId));
  });

  it('should start AI session successfully', async () => {
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

  it('should send a message to AI session', async () => {
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
});
