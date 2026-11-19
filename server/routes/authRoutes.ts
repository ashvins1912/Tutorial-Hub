import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { UserAccount } from '../models/UserAccount';
import { isMongoConnected } from '../db/connectMongo';
import { UserBrainProfile } from '../models/UserBrainProfile';
import { INITIAL_BRAIN_PROFILE } from '../seed/cognitiveSeed';

const router = express.Router();

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  if (!req.authUser) return res.status(401).json({ error: 'Authentication required' });
  if (!isMongoConnected()) {
    return res.status(503).json({ code: 'DATABASE_UNAVAILABLE', message: 'MongoDB must be configured to persist user accounts and learning profiles.' });
  }

  const user = req.authUser;
  const metadata = user.userMetadata ?? {};
  const account = await UserAccount.findOneAndUpdate(
    { supabaseUserId: user.id },
    {
      $set: {
        email: user.email ?? '',
        fullName: String(metadata.full_name ?? metadata.name ?? ''),
        avatarUrl: String(metadata.avatar_url ?? ''),
        lastSignInAt: new Date(),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await UserBrainProfile.updateOne(
    { userId: user.id },
    {
      $setOnInsert: {
        userId: user.id,
        currentTier: INITIAL_BRAIN_PROFILE.currentTier,
        cognitiveMetrics: INITIAL_BRAIN_PROFILE.cognitiveMetrics,
        passedTopicQuizzes: [],
        completedProblemIds: [],
        completedWarmupDrills: [],
        spacedRepetitionQueue: [],
      },
    },
    { upsert: true }
  );

  return res.json({
    user: {
      id: account.supabaseUserId,
      email: account.email,
      fullName: account.fullName,
      avatarUrl: account.avatarUrl,
    },
  });
});

export default router;
