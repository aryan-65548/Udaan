import { Router } from 'express';
import { db } from '../db';
import { businessCategories } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { businessCategoryIdParamSchema } from '../schemas/business-categories';

const router = Router();

// GET /business-categories
router.get('/', async (_req, res, next) => {
  try {
    const categories = await db
      .select()
      .from(businessCategories)
      .where(eq(businessCategories.isActive, true))
      .orderBy(asc(businessCategories.sortOrder));

    return res.json({ data: categories });
  } catch (error) {
    next(error);
  }
});

// GET /business-categories/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = businessCategoryIdParamSchema.parse(req.params);
    const result = await db
      .select()
      .from(businessCategories)
      .where(eq(businessCategories.id, id))
      .limit(1);

    if (!result.length) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Business category not found',
        },
      });
    }

    return res.json({ data: result[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
