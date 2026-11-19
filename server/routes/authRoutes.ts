import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { UserAccount } from '../models/UserAccount';
import { isMongoConnected } from '../db/connectMongo';
import { UserBrainProfile } from '../models/UserBrainProfile';
import { INITIAL_BRAIN_PROFILE } from '../seed/cognitiveSeed';

const router = express.Router();

// Supabase remains the identity provider and session authority for PatternForge.
// This route verifies the current Supabase user and idempotently provisions the
// app-specific learning account/profile, just as Pharma's /auth/me resolves its
// application profile from the authenticated identity.
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.authUser) return res.status(401).json({ code: 'AUTH_REQUIRED', message: 'Authentication required.' });
    if (!isMongoConnected()) {
      return res.status(503).json({
        code: 'DATABASE_UNAVAILABLE',
        message: 'MongoDB must be configured to persist user accounts and learning profiles.',
      });
    }

    const user = req.authUser;
    const metadata = user.userMetadata ?? {};
    const account = await UserAccount.findOneAndUpdate(
      { supabaseUserId: user.id },
      {
        $set: {
          email: user.email ?? '',
          fullName: String(metadata.full_name ?? metadata.name ?? ''),
          avatarUrl: String(metadata.avatar_url ?? metadata.picture ?? ''),
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
          masteredProblemSlugs: [],
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
  } catch (error) {
    console.error('[auth/me] Failed to provision learning account:', error instanceof Error ? error.name : 'UNKNOWN_ERROR');
    return res.status(500).json({
      code: 'ACCOUNT_INITIALIZATION_FAILED',
      message: 'Your account could not be initialized. Please retry.',
    });
  }
});

export default router;
