import { db } from '../db';
import { assessments, assessmentInputs, financialRuns, users, businessCategories } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { LocationIntelligenceService, LocationIntelligenceContext } from './location-intelligence';

export interface AssessmentContext {
  assessmentId: string;
  user: {
    id: string;
    language: string;
  };
  locationIntelligence: LocationIntelligenceContext;
  business: {
    categoryId: string;
    categoryName: string;
  };
  answers: Record<string, any>;
  finance: any | null;
}

export class AiGatewayService {
  /**
   * Constructs the full Assessment Context for the AI engine.
   */
  static async buildAssessmentContext(assessmentId: string, userId: string): Promise<AssessmentContext> {
    const assessmentRes = await db.select().from(assessments).where(eq(assessments.id, assessmentId)).limit(1);
    if (!assessmentRes.length) throw new Error('Assessment not found');
    const assessment = assessmentRes[0];

    const userRes = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userRes[0];

    const categoryRes = await db.select().from(businessCategories).where(eq(businessCategories.id, assessment.businessCategoryId)).limit(1);
    const categoryName = categoryRes.length ? categoryRes[0].name : 'Unknown';

    // Get answers
    const inputs = await db.select().from(assessmentInputs).where(eq(assessmentInputs.assessmentId, assessmentId));
    const answers: Record<string, any> = {};
    for (const input of inputs) {
      if (input.inputType === 'NUMBER') answers[input.inputKey] = Number(input.valueNumber);
      else if (input.inputType === 'BOOLEAN') answers[input.inputKey] = input.valueBoolean;
      else if (input.inputType === 'JSON') answers[input.inputKey] = input.valueJson;
      else answers[input.inputKey] = input.valueText;
    }

    // Get finance
    const financeRes = await db.select().from(financialRuns).where(eq(financialRuns.assessmentId, assessmentId)).orderBy(desc(financialRuns.createdAt)).limit(1);
    const finance = financeRes.length ? financeRes[0] : null;

    // Get Location Intelligence
    const locationIntelligence = await LocationIntelligenceService.generateContext(assessmentId);

    return {
      assessmentId,
      user: {
        id: user.id,
        language: assessment.language,
      },
      business: {
        categoryId: assessment.businessCategoryId,
        categoryName,
      },
      answers,
      finance,
      locationIntelligence,
    };
  }

  /**
   * Starts a new AI session.
   */
  static async startSession(assessmentId: string, userId: string): Promise<any> {
    const context = await this.buildAssessmentContext(assessmentId, userId);
    return this.callAiService('/internal/ai/session/start', { context });
  }

  /**
   * Sends a message to an active AI session.
   */
  static async sendMessage(assessmentId: string, userId: string, message: string): Promise<any> {
    const context = await this.buildAssessmentContext(assessmentId, userId);
    return this.callAiService('/internal/ai/session/message', { assessmentId, message, context });
  }

  /**
   * Retrieves the final AI report if completed.
   */
  static async getReport(assessmentId: string): Promise<any> {
    return this.callAiService('/internal/ai/report', { assessmentId });
  }

  /**
   * Helper to make HTTP requests to the external Python AI engine.
   */
  private static async callAiService(endpoint: string, payload: any): Promise<any> {
    const baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let errBody = '';
        try { errBody = await response.text(); } catch(e) { console.warn('Failed to parse error body', e); }
        throw new Error(`AI Service error: ${response.status} - ${errBody}`);
      }

      return await response.json();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('AI Service request timed out');
      }
      throw new Error(`AI Gateway Failure: ${err.message}`);
    }
  }
}
