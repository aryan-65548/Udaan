import { Router } from 'express';
import { db } from '../db';
import { locations } from '../db/schema';
import { eq, and, ilike, asc, sql } from 'drizzle-orm';
import {
  locationIdParamSchema,
  stateIdParamSchema,
  districtIdParamSchema,
  blockIdParamSchema,
} from '../schemas/locations';

const router = Router();

// GET /locations/states - List all states with optional search
router.get('/states', async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const query = db
      .select()
      .from(locations)
      .where(
        search
          ? and(eq(locations.type, 'STATE'), ilike(locations.name, `%${search}%`))
          : eq(locations.type, 'STATE')
      )
      .orderBy(asc(locations.name));

    const states = await query;
    return res.json({ data: states });
  } catch (error) {
    next(error);
  }
});

// GET /locations/:stateId/districts - List districts under state
router.get('/:stateId/districts', async (req, res, next) => {
  try {
    const { stateId } = stateIdParamSchema.parse(req.params);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const query = db
      .select()
      .from(locations)
      .where(
        search
          ? and(
              eq(locations.parentId, stateId),
              eq(locations.type, 'DISTRICT'),
              ilike(locations.name, `%${search}%`)
            )
          : and(eq(locations.parentId, stateId), eq(locations.type, 'DISTRICT'))
      )
      .orderBy(asc(locations.name));

    const districts = await query;
    return res.json({ data: districts });
  } catch (error) {
    next(error);
  }
});

// GET /locations/:districtId/blocks - List blocks under district
router.get('/:districtId/blocks', async (req, res, next) => {
  try {
    const { districtId } = districtIdParamSchema.parse(req.params);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const query = db
      .select()
      .from(locations)
      .where(
        search
          ? and(
              eq(locations.parentId, districtId),
              eq(locations.type, 'BLOCK'),
              ilike(locations.name, `%${search}%`)
            )
          : and(eq(locations.parentId, districtId), eq(locations.type, 'BLOCK'))
      )
      .orderBy(asc(locations.name));

    const blocks = await query;
    return res.json({ data: blocks });
  } catch (error) {
    next(error);
  }
});

// GET /locations/:blockId/villages - List villages under block (supports search and pagination)
router.get('/:blockId/villages', async (req, res, next) => {
  try {
    const { blockId } = blockIdParamSchema.parse(req.params);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
    const offset = (page - 1) * limit;

    const whereClause = search
      ? and(
          eq(locations.parentId, blockId),
          eq(locations.type, 'VILLAGE'),
          ilike(locations.name, `%${search}%`)
        )
      : and(eq(locations.parentId, blockId), eq(locations.type, 'VILLAGE'));

    const [villages, totalResult] = await Promise.all([
      db
        .select()
        .from(locations)
        .where(whereClause)
        .orderBy(asc(locations.name))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(locations)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;

    return res.json({
      data: villages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /locations/search - Global search across administrative hierarchy
router.get('/search', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q || q.length < 2) {
      return res.json({ data: [] });
    }

    const matches = await db
      .select()
      .from(locations)
      .where(ilike(locations.name, `%${q}%`))
      .orderBy(asc(locations.name))
      .limit(30);

    return res.json({ data: matches });
  } catch (error) {
    next(error);
  }
});

// GET /locations/:id - Get location details and full parent hierarchy
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

// POST /locations/manual - Create or find manual location hierarchy
router.post('/manual', async (req, res, next) => {
  try {
    const {
      stateName,
      districtName,
      blockName,
      villageName,
      latitude,
      longitude,
      stateCode,
    } = req.body;

    if (!stateName || !districtName) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'State and District names are required',
        },
      });
    }

    // Find or create State
    const allStates = await db.select().from(locations).where(eq(locations.type, 'STATE'));
    let state = allStates.find((s) => s.name.toLowerCase() === stateName.trim().toLowerCase());
    if (!state) {
      const [newState] = await db
        .insert(locations)
        .values({
          name: stateName.trim(),
          type: 'STATE',
          parentId: null,
          stateCode: stateCode || null,
        })
        .returning();
      state = newState;
    }

    // Find or create District
    const allDistricts = await db
      .select()
      .from(locations)
      .where(and(eq(locations.type, 'DISTRICT'), eq(locations.parentId, state.id)));
    let district = allDistricts.find((d) => d.name.toLowerCase() === districtName.trim().toLowerCase());
    if (!district) {
      const [newDistrict] = await db
        .insert(locations)
        .values({
          name: districtName.trim(),
          type: 'DISTRICT',
          parentId: state.id,
          stateCode: state.stateCode,
        })
        .returning();
      district = newDistrict;
    }

    let targetLocation = district;

    if (blockName && blockName.trim()) {
      const allBlocks = await db
        .select()
        .from(locations)
        .where(and(eq(locations.type, 'BLOCK'), eq(locations.parentId, district.id)));
      let block = allBlocks.find((b) => b.name.toLowerCase() === blockName.trim().toLowerCase());
      if (!block) {
        const [newBlock] = await db
          .insert(locations)
          .values({
            name: blockName.trim(),
            type: 'BLOCK',
            parentId: district.id,
            stateCode: state.stateCode,
            districtCode: district.districtCode,
          })
          .returning();
        block = newBlock;
      }
      targetLocation = block;

      if (villageName && villageName.trim()) {
        const allVillages = await db
          .select()
          .from(locations)
          .where(and(eq(locations.type, 'VILLAGE'), eq(locations.parentId, block.id)));
        let village = allVillages.find((v) => v.name.toLowerCase() === villageName.trim().toLowerCase());
        if (!village) {
          const [newVillage] = await db
            .insert(locations)
            .values({
              name: villageName.trim(),
              type: 'VILLAGE',
              parentId: block.id,
              stateCode: state.stateCode,
              districtCode: district.districtCode,
              blockCode: block.blockCode,
              latitude: latitude ? String(latitude) : null,
              longitude: longitude ? String(longitude) : null,
            })
            .returning();
          village = newVillage;
        }
        targetLocation = village;
      }
    }

    return res.status(201).json({ data: targetLocation });
  } catch (error) {
    next(error);
  }
});

export default router;
