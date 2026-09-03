import { Router } from 'express';
import { db } from '../db';
import { schemeConfigs } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authenticate } from '../middleware/auth';

const router = Router();

// Schemes can be read-only for authenticated users
router.use(authenticate);

// GET /schemes - List all active schemes
router.get('/', async (req, res, next) => {
  try {
    const schemes = await db
      .select()
      .from(schemeConfigs)
      .where(eq(schemeConfigs.isActive, true));

    return res.json({ data: schemes });
  } catch (error) {
    next(error);
  }
});

// GET /schemes/:id - Get a specific scheme
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const schemes = await db
      .select()
      .from(schemeConfigs)
      .where(eq(schemeConfigs.id, id))
      .limit(1);

    if (!schemes.length) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Scheme not found',
        },
      });
    }

    return res.json({ data: schemes[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
