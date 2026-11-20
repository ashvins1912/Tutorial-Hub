import { Router } from 'express';
import {
  pullPlatformContentFromDb,
  pushPlatformContentToDb,
} from '../db/seedPlatformContent';

const router = Router();

/**
 * GET /api/content-bootstrap
 * Pulls synchronized platform content from MongoDB (or dev snapshot store)
 * when ENABLE_DB_CONTENT_PULL is enabled.
 * Query params:
 *   - summaryOnly=1 : omits large payloads and returns collection counts & sync status
 *   - pull=0|1      : optional client flag override
 */
router.get('/', async (req, res) => {
  try {
    const summaryOnly = req.query.summaryOnly === '1' || req.query.summaryOnly === 'true';
    const pullParam = typeof req.query.pull === 'string' ? req.query.pull.toLowerCase() : undefined;
    const overrideFlag =
      pullParam === '1' || pullParam === 'true'
        ? true
        : pullParam === '0' || pullParam === 'false'
          ? false
          : undefined;

    const payload = await pullPlatformContentFromDb({
      includePayload: !summaryOnly,
      overrideFlag,
    });

    res.json(payload);
  } catch (err) {
    console.error('[ContentBootstrap] GET /api/content-bootstrap failed:', err);
    res.status(500).json({
      error: 'Failed to pull platform content bootstrap from database.',
    });
  }
});

/**
 * POST /api/content-bootstrap/push
 * Pushes all canonical platform collections (94 Algorithms, 73 Blueprint,
 * 16 Power Combos, 22 Curriculum Topics, Curated Interview Bank, Solver Strategies)
 * into MongoDB (or in-memory store in dev).
 */
router.post('/push', async (req, res) => {
  try {
    const force = Boolean(req.body?.force);
    const report = await pushPlatformContentToDb({ force });
    res.json(report);
  } catch (err) {
    console.error('[ContentBootstrap] POST /api/content-bootstrap/push failed:', err);
    res.status(500).json({
      error: 'Failed to push platform content into database.',
    });
  }
});

export default router;
