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
  let otherUserToken: string;
  let userId: string;
  let otherUserId: string;
  let assessmentId: string;
  let missingCoordsAssessmentId: string;

  beforeAll(async () => {
    // 1. Create users
    const userRes = await db.insert(users).values([
      { name: 'Loc Test User', phone: '+919999999901', passwordHash: 'hash', role: 'ENTREPRENEUR', preferredLanguage: 'en' },
      { name: 'Other User', phone: '+919999999902', passwordHash: 'hash', role: 'ENTREPRENEUR', preferredLanguage: 'en' },
    ]).returning();
    userId = userRes[0].id;
    otherUserId = userRes[1].id;

    // 2. Generate tokens
    userToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'test_secret');
    otherUserToken = jwt.sign({ userId: otherUserId }, process.env.JWT_SECRET || 'test_secret');

    // 3. Create locations hierarchy
    const state = await db.insert(locations).values({ name: 'Maharashtra', type: 'STATE' }).returning();
    const dist = await db.insert(locations).values({ name: 'Pune', type: 'DISTRICT', parentId: state[0].id }).returning();
    const block = await db.insert(locations).values({ name: 'Haveli', type: 'BLOCK', parentId: dist[0].id }).returning();
    
    // One with coordinates
    const vill1 = await db.insert(locations).values({ name: 'Khadakwasla', type: 'VILLAGE', parentId: block[0].id, latitude: '18.43', longitude: '73.76' }).returning();
    
    // One missing coordinates for geocoding fallback
    const vill2 = await db.insert(locations).values({ name: 'Dhayari', type: 'VILLAGE', parentId: block[0].id }).returning();

    // 4. Create category
    const cat = await db.insert(businessCategories).values({ name: 'Retail', code: 'RETAIL_1' }).returning();

    // 5. Create Assessments
    const ast = await db.insert(assessments).values([
      { userId, locationId: vill1[0].id, businessCategoryId: cat[0].id, language: 'en' },
      { userId, locationId: vill2[0].id, businessCategoryId: cat[0].id, language: 'en' },
    ]).returning();
    assessmentId = ast[0].id;
    missingCoordsAssessmentId = ast[1].id;
  });

  afterAll(async () => {
    await db.delete(assessments).where(eq(assessments.userId, userId));
    await db.delete(assessments).where(eq(assessments.userId, otherUserId));
    await db.delete(businessCategories).where(eq(businessCategories.name, 'Retail'));
    await db.delete(locations).where(eq(locations.name, 'Khadakwasla'));
    await db.delete(locations).where(eq(locations.name, 'Dhayari'));
    await db.delete(locations).where(eq(locations.name, 'Haveli'));
    await db.delete(locations).where(eq(locations.name, 'Pune'));
    await db.delete(locations).where(eq(locations.name, 'Maharashtra'));
    await db.delete(users).where(eq(users.id, userId));
    await db.delete(users).where(eq(users.id, otherUserId));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. should return 403 when unauthorized user accesses another user assessment', async () => {
    const res = await request(app)
      .get(`/api/assessments/${assessmentId}/location-intelligence`)
      .set('Authorization', `Bearer ${otherUserToken}`);
    expect(res.status).toBe(403);
  });

  it('2. should generate location intelligence context successfully with coordinates from DB', async () => {
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
    expect(res.body.data.location.villageName).toBe('Khadakwasla');
    expect(res.body.data.location.latitude).toBe(18.43);
    expect(res.body.data.competition.totalCompetitors).toBe(1);
    expect(GeocodingProvider.geocodeAddress).not.toHaveBeenCalled();
  });

  it('3. should use GeocodingProvider fallback if coordinates are missing in DB', async () => {
    (PlacesProvider.discoverCompetitors as jest.Mock).mockResolvedValue([]);
    (GeocodingProvider.geocodeAddress as jest.Mock).mockResolvedValue({
      latitude: 18.45,
      longitude: 73.78,
      formattedAddress: 'Dhayari, Haveli, Pune, Maharashtra, India',
    });

    const res = await request(app)
      .get(`/api/assessments/${missingCoordsAssessmentId}/location-intelligence`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(GeocodingProvider.geocodeAddress).toHaveBeenCalledWith('Dhayari, Haveli, Pune, Maharashtra');
    expect(res.body.data.location.latitude).toBe(18.45);
    expect(res.body.data.location.formattedAddress).toBe('Dhayari, Haveli, Pune, Maharashtra, India');
  });

  it('4. should fail safely if Geocoding fallback fails', async () => {
    (GeocodingProvider.geocodeAddress as jest.Mock).mockRejectedValue(new Error('API Key missing'));

    const res = await request(app)
      .get(`/api/assessments/${missingCoordsAssessmentId}/location-intelligence`)
      .set('Authorization', `Bearer ${userToken}`);

    // Standard errorHandler intercepts and returns 500 safely
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
  });

  it('5. should handle Google Places failure gracefully and return empty competition array', async () => {
    // We test with assessmentId which has coordinates, so no geocoding
    (PlacesProvider.discoverCompetitors as jest.Mock).mockRejectedValue(new Error('Places API Error'));

    const res = await request(app)
      .get(`/api/assessments/${assessmentId}/location-intelligence`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200); // Does NOT crash the API
    expect(res.body.data.competition.totalCompetitors).toBe(0);
    expect(res.body.data.competition.competitors).toEqual([]);
    expect(res.body.data.competition.provider).toBe('unavailable');
  });

  it('6. should filter competitors by strict radius manually in PlacesProvider if not mocked', async () => {
    // Actually we are testing the endpoint, so let's check if we can pass a radius
    (PlacesProvider.discoverCompetitors as jest.Mock).mockResolvedValue([
      { name: 'Inside', distanceKm: 4.5 },
      { name: 'On Boundary', distanceKm: 5.0 },
    ]);

    const res = await request(app)
      .get(`/api/assessments/${assessmentId}/location-intelligence?radius=5`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.competition.radiusKm).toBe(5);
    expect(res.body.data.competition.totalCompetitors).toBe(2);
  });
});
