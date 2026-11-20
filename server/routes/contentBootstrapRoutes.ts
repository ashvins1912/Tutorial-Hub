import { Router } from 'express';
import {
  pullPlatformContentFromDb,
  pullSingleContentBundleFromDb,
  pushPlatformContentToDb,
} from '../db/seedPlatformContent';
import {
  isValidContentBundleKey,
  type ContentBundleKey,
} from '../../src/data/canonicalDataRegistry';

const router = Router();

function parsePullOverride(raw: unknown): boolean | undefined {
  if (typeof raw !== 'string') return undefined;
  const normalized = raw.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true') return true;
  if (normalized === '0' || normalized === 'false') return false;
  return undefined;
}

/**
 * GET /api/content-bootstrap/index
 * Lightweight (<5 KB) manifest returning all 25 canonical bundle summaries,
 * record counts, byte sizes, checksums, and storage mode without payloads.
 */
router.get('/index', async (req, res) => {
  try {
    const overrideFlag = parsePullOverride(req.query.pull);
    const manifest = await pullPlatformContentFromDb({
      includePayload: false,
      overrideFlag,
    });
    res.json(manifest);
  } catch (err) {
    console.error('[ContentBootstrap] GET /api/content-bootstrap/index failed:', err);
    res.status(500).json({
      error: 'Failed to load platform content manifest.',
    });
  }
});

/**
 * GET /api/content-bootstrap
 * Pulls synchronized platform content from MongoDB (or server in-memory snapshot).
 * Query params:
 *   - summaryOnly=1 : omits payloads and returns manifest metadata
 *   - pull=0|1      : optional client flag override
 */
router.get('/', async (req, res) => {
  try {
    const summaryOnly = req.query.summaryOnly === '1' || req.query.summaryOnly === 'true';
    const overrideFlag = parsePullOverride(req.query.pull);

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
 * Pushes all 25 canonical platform collections (or optional `keys[]` subset)
 * into MongoDB (or server in-memory snapshot store).
 */
router.post('/push', async (req, res) => {
  try {
    const force = Boolean(req.body?.force);
    const rawKeys = Array.isArray(req.body?.keys) ? req.body.keys : undefined;
    const keys = rawKeys
      ?.filter((k: unknown): k is string => typeof k === 'string')
      .filter((k: string): k is ContentBundleKey => isValidContentBundleKey(k));

    const report = await pushPlatformContentToDb({ force, keys });
    res.json(report);
  } catch (err) {
    console.error('[ContentBootstrap] POST /api/content-bootstrap/push failed:', err);
    res.status(500).json({
      error: 'Failed to push platform content into database.',
    });
  }
});

/**
 * GET /api/content-bootstrap/:collectionKey
 * Lazily pulls a single canonical collection bundle on demand.
 */
router.get('/:collectionKey', async (req, res) => {
  try {
    const { collectionKey } = req.params;
    if (!isValidContentBundleKey(collectionKey)) {
      res.status(404).json({
        error: `Unknown content bundle key: ${collectionKey}`,
      });
      return;
    }

    const overrideFlag = parsePullOverride(req.query.pull);
    const result = await pullSingleContentBundleFromDb(collectionKey, {
      overrideFlag,
    });

    res.json(result);
  } catch (err) {
    console.error(
      `[ContentBootstrap] GET /api/content-bootstrap/${req.params.collectionKey} failed:`,
      err
    );
    res.status(500).json({
      error: 'Failed to pull requested content bundle from database.',
    });
  }
});

export default router;
