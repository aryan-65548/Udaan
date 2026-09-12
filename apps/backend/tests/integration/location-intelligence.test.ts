import request from 'supertest';
import app from '../../src/app';
import { db } from '../../src/db';
import { users, locations, businessCategories, assessments } from '../../src/db/schema';
import jwt from 'jsonwebtoken';
import { GeocodingProvider } from '../../src/modules/location-intelligence/providers/google-geocoding';
import { PlacesProvider } from '../../src/modules/location-intelligence/providers/google-places';
import { eq } from 'drizzle-orm';

// Mock Providers
jest.mock('../../src/modules/location-intelligence/providers/google-geocoding');
jest.mock('../../src/modules/location-intelligence/providers/google-places');

describe('Location Intelligence API', () => {
  let userToken: string;
  let userId: string;
  let assessmentId: string;

  beforeAll(async () => {
    // 1. Create a user
    const userRes = await db.insert(users).values({
      name: 'Loc Test User',
      phone: '+919999999901',
      passwordHash: 'hash',
      role: 'ENTREPRENEUR',
      preferredLanguage: 'en',
    }).returning();
    userId = userRes[0].id;

    // 2. Generate token
    userToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'test_secret');

    // 3. Create locations hierarchy
    const state = await db.insert(locations).values({ name: 'Maharashtra', type: 'STATE' }).returning();
    const dist = await db.insert(locations).values({ name: 'Pune', type: 'DISTRICT', parentId: state[0].id }).returning();
    const block = await db.insert(locations).values({ name: 'Haveli', type: 'BLOCK', parentId: dist[0].id }).returning();
    const vill = await db.insert(locations).values({ name: 'Khadakwasla', type: 'VILLAGE', parentId: block[0].id, latitude: '18.43', longitude: '73.76' }).returning();

    // 4. Create category
    const cat = await db.insert(businessCategories).values({ name: 'Retail', code: 'RETAIL_1' }).returning();

    // 5. Create Assessment
    const ast = await db.insert(assessments).values({
      userId,
      locationId: vill[0].id,
      businessCategoryId: cat[0].id,
      language: 'en',
    }).returning();
    assessmentId = ast[0].id;
  });

  afterAll(async () => {
    await db.delete(assessments).where(eq(assessments.userId, userId));
    await db.delete(businessCategories).where(eq(businessCategories.name, 'Retail'));
    await db.delete(locations).where(eq(locations.name, 'Khadakwasla'));
    await db.delete(users).where(eq(users.id, userId));
  });

  it('should generate location intelligence context successfully', async () => {
    (PlacesProvider.discoverCompetitors as jest.Mock).mockResolvedValue([
      {
        providerPlaceId: 'place123',
        name: 'Local Grocery',
        category: 'store',
        latitude: 18.435,
        longitude: 73.765,
        distanceKm: 0.8,
        formattedAddress: 'Main St, Khadakwasla',
        source: 'google_places'
      }
    ]);

    const res = await request(app)
      .get(`/api/assessments/${assessmentId}/location-intelligence`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.location).toBeDefined();
    expect(res.body.data.location.villageName).toBe('Khadakwasla');
    expect(res.body.data.location.latitude).toBe(18.43);
    expect(res.body.data.competition.totalCompetitors).toBe(1);
    expect(res.body.data.competition.competitors[0].name).toBe('Local Grocery');
    expect(res.body.data.population.source).toBe('unavailable'); // because no real key provided
  });
});
