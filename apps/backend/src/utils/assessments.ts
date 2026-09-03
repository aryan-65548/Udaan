import { Response } from 'express';
import { db } from '../db';
import { assessments } from '../db/schema';
import { eq } from 'drizzle-orm';

// Helper function to verify assessment existence and ownership
export async function getAuthorizedAssessment(assessmentId: string, userId: string, res: Response) {
  const result = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  if (!result.length) {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Assessment not found',
      },
    });
    return null;
  }

  const assessment = result[0];
  if (assessment.userId !== userId) {
    res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied: you do not own this assessment',
      },
    });
    return null;
  }

  return assessment;
}
