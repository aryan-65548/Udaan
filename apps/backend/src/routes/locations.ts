import { Router } from 'express';
import { db } from '../db';
import { locations } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import {
  locationIdParamSchema,
  stateIdParamSchema,
  districtIdParamSchema,
  blockIdParamSchema,
} from '../schemas/locations';

const router = Router();

// GET /locations/states
router.get('/states', async (_req, res, next) => {
  try {
    const states = await db
      .select()
      .from(locations)
      .where(eq(locations.type, 'STATE'));
    return res.json({ data: states });
  } catch (error) {
    next(error);
  }
});

// GET /locations/:stateId/districts
router.get('/:stateId/districts', async (req, res, next) => {
  try {
    const { stateId } = stateIdParamSchema.parse(req.params);
    const districts = await db
      .select()
      .from(locations)
      .where(and(eq(locations.parentId, stateId), eq(locations.type, 'DISTRICT')));
    return res.json({ data: districts });
  } catch (error) {
    next(error);
  }
});

// GET /locations/:districtId/blocks
router.get('/:districtId/blocks', async (req, res, next) => {
  try {
    const { districtId } = districtIdParamSchema.parse(req.params);
    const blocks = await db
      .select()
      .from(locations)
      .where(and(eq(locations.parentId, districtId), eq(locations.type, 'BLOCK')));
    return res.json({ data: blocks });
  } catch (error) {
    next(error);
  }
});

// GET /locations/:blockId/villages
router.get('/:blockId/villages', async (req, res, next) => {
  try {
    const { blockId } = blockIdParamSchema.parse(req.params);
    const villages = await db
      .select()
      .from(locations)
      .where(and(eq(locations.parentId, blockId), eq(locations.type, 'VILLAGE')));
    return res.json({ data: villages });
  } catch (error) {
    next(error);
  }
});

// GET /locations/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = locationIdParamSchema.parse(req.params);
    const result = await db
      .select()
      .from(locations)
      .where(eq(locations.id, id))
      .limit(1);

    if (!result.length) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Location not found',
        },
      });
    }

    const location = result[0];
    const hierarchy: Array<typeof locations.$inferSelect> = [];
    let currentParentId = location.parentId;

    while (currentParentId) {
      const parentResult = await db
        .select()
        .from(locations)
        .where(eq(locations.id, currentParentId))
        .limit(1);

      if (parentResult.length > 0) {
        hierarchy.push(parentResult[0]);
        currentParentId = parentResult[0].parentId;
      } else {
        break;
      }
    }

    return res.json({
      data: {
        ...location,
        hierarchy,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
