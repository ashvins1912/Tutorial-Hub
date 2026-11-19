import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { isMongoConnected } from '../db/connectMongo';
import { UserLearningState } from '../models/UserLearningState';

const router = express.Router();
router.use(requireAuth);
router.use((_req: Request, res: Response, next: import('express').NextFunction) => {
  if (!isMongoConnected()) {
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

router.get('/:stateKey', async (req: Request, res: Response) => {
  const { stateKey } = req.params;
  if (!validKey(stateKey)) return res.status(400).json({ error: 'Invalid state key' });
  const record = await UserLearningState.findOne({
    userId: req.authUser!.id,
    stateKey,
  }).select('payload');
  return res.json({ value: record?.payload ?? null });
});

router.put('/:stateKey', async (req: Request, res: Response) => {
  const { stateKey } = req.params;
  if (!validKey(stateKey)) return res.status(400).json({ error: 'Invalid state key' });
  const value = req.body?.value;
  if (value === undefined) return res.status(400).json({ error: 'value is required' });
  let encoded: string;
  try { encoded = JSON.stringify(value); } catch {
    return res.status(400).json({ error: 'value must be valid JSON data' });
  }
  if (encoded.length > 100_000) {
    return res.status(413).json({ error: 'Learning state exceeds the 100 KB limit' });
  }
  const record = await UserLearningState.findOneAndUpdate(
    { userId: req.authUser!.id, stateKey },
    { $set: { payload: value } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).select('stateKey updatedAt');
  return res.json({ ok: true, stateKey: record?.stateKey, updatedAt: record?.updatedAt });
});

export default router;
