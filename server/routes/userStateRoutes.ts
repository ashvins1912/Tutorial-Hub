import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { isMongoConnected } from '../db/connectMongo';
import { UserLearningState } from '../models/UserLearningState';

const router = express.Router();

// Development-only fallback store when MONGODB_URI is not configured
const devStateStore = new Map<string, Map<string, { payload: unknown; updatedAt: string }>>();

export async function getAllUserLearningStates(
  userId: string
): Promise<{ states: Record<string, unknown>; updatedAtByKey: Record<string, string> }> {
  const states: Record<string, unknown> = {};
  const updatedAtByKey: Record<string, string> = {};

  if (isMongoConnected()) {
    const records = await UserLearningState.find({ userId })
      .select('stateKey payload updatedAt')
      .lean();
    for (const r of records) {
      states[r.stateKey] = r.payload;
      updatedAtByKey[r.stateKey] = r.updatedAt
        ? new Date(r.updatedAt).toISOString()
        : new Date().toISOString();
    }
    return { states, updatedAtByKey };
  }

  const userBucket = devStateStore.get(userId);
  if (userBucket) {
    for (const [k, v] of userBucket.entries()) {
      states[k] = v.payload;
      updatedAtByKey[k] = v.updatedAt;
    }
  }
  return { states, updatedAtByKey };
}

router.use(requireAuth);
router.use((_req: Request, res: Response, next: import('express').NextFunction) => {
  if (process.env.NODE_ENV === 'production' && !isMongoConnected()) {
    return res.status(503).json({
      code: 'DATABASE_UNAVAILABLE',
      message: 'Persistent learning storage is temporarily unavailable.',
    });
  }
  return next();
});

function validKey(key: string) {
  return /^[a-zA-Z0-9:_-]{1,100}$/.test(key);
}

// GET /api/user-state — bulk fetch all persisted state keys for the signed-in user
router.get('/', async (req: Request, res: Response) => {
  const result = await getAllUserLearningStates(req.authUser!.id);
  return res.json(result);
});

router.get('/:stateKey', async (req: Request, res: Response) => {
  const { stateKey } = req.params;
  if (!validKey(stateKey)) return res.status(400).json({ error: 'Invalid state key' });

  if (isMongoConnected()) {
    const record = await UserLearningState.findOne({
      userId: req.authUser!.id,
      stateKey,
    }).select('payload updatedAt');
    return res.json({
      value: record?.payload ?? null,
      updatedAt: record?.updatedAt ? new Date(record.updatedAt).toISOString() : null,
    });
  }

  const entry = devStateStore.get(req.authUser!.id)?.get(stateKey);
  return res.json({ value: entry?.payload ?? null, updatedAt: entry?.updatedAt ?? null });
});

router.put('/:stateKey', async (req: Request, res: Response) => {
  const { stateKey } = req.params;
  if (!validKey(stateKey)) return res.status(400).json({ error: 'Invalid state key' });
  const value = req.body?.value;
  if (value === undefined) return res.status(400).json({ error: 'value is required' });
  let encoded: string;
  try {
    encoded = JSON.stringify(value);
  } catch {
    return res.status(400).json({ error: 'value must be valid JSON data' });
  }
  if (encoded.length > 250_000) {
    return res.status(413).json({ error: 'Learning state exceeds the 250 KB limit' });
  }

  if (isMongoConnected()) {
    const record = await UserLearningState.findOneAndUpdate(
      { userId: req.authUser!.id, stateKey },
      { $set: { payload: value } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).select('stateKey updatedAt');
    return res.json({ ok: true, stateKey: record?.stateKey, updatedAt: record?.updatedAt });
  }

  let bucket = devStateStore.get(req.authUser!.id);
  if (!bucket) {
    bucket = new Map();
    devStateStore.set(req.authUser!.id, bucket);
  }
  const updatedAt = new Date().toISOString();
  bucket.set(stateKey, { payload: value, updatedAt });
  return res.json({ ok: true, stateKey, updatedAt });
});

export default router;
