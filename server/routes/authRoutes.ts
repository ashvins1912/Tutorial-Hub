import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { UserAccount } from '../models/UserAccount';
import { isMongoConnected } from '../db/connectMongo';
import { UserBrainProfile } from '../models/UserBrainProfile';
import { UserLearningState } from '../models/UserLearningState';
import { CommunityInvite } from '../models/CommunityInvite';
import { INITIAL_BRAIN_PROFILE } from '../seed/cognitiveSeed';
import { computeUserProgressSummary } from '../services/userStatsService';

const router = express.Router();

export interface DevAccountRecord {
  supabaseUserId: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  createdAt: string;
  lastSignInAt: string;
}

const devAccountStore = new Map<string, DevAccountRecord>();

export function getAllDevAccounts(): DevAccountRecord[] {
  return Array.from(devAccountStore.values());
}

export function upsertDevAccount(user: {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}): { account: DevAccountRecord; isNewAccount: boolean } {
  const existing = devAccountStore.get(user.id);
  const now = new Date().toISOString();
  if (existing) {
    existing.email = (user.email ?? existing.email).toLowerCase();
    if (!existing.fullName && user.fullName) existing.fullName = user.fullName;
    if (user.avatarUrl) existing.avatarUrl = user.avatarUrl;
    existing.lastSignInAt = now;
    return { account: existing, isNewAccount: false };
  }
  const created: DevAccountRecord = {
    supabaseUserId: user.id,
    email: (user.email ?? '').toLowerCase(),
    fullName: user.fullName ?? '',
    avatarUrl: user.avatarUrl ?? '',
    createdAt: now,
    lastSignInAt: now,
  };
  devAccountStore.set(user.id, created);
  return { account: created, isNewAccount: true };
}

// Supabase remains the identity provider and session authority for PatternForge.
// This route verifies the current Supabase user, idempotently provisions a 100% fresh
// zero-progress learning profile for new sign-ups, and returns a fresh-account audit payload.
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ code: 'AUTH_REQUIRED', message: 'Authentication required.' });
    }

    const user = req.authUser;
    const metadata = user.userMetadata ?? {};
    const metaFullName = String(metadata.full_name ?? metadata.name ?? '').trim();
    const metaAvatarUrl = String(metadata.avatar_url ?? metadata.picture ?? '').trim();
    const cleanEmail = (user.email ?? '').trim().toLowerCase();

    if (!isMongoConnected()) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({
          code: 'DATABASE_UNAVAILABLE',
          message: 'MongoDB must be configured to persist user accounts and learning profiles.',
        });
      }
      const { account, isNewAccount } = upsertDevAccount({
        id: user.id,
        email: cleanEmail,
        fullName: metaFullName,
        avatarUrl: metaAvatarUrl,
      });
      return res.json({
        user: {
          id: account.supabaseUserId,
          email: account.email,
          fullName: account.fullName,
          avatarUrl: account.avatarUrl,
        },
        freshAccountCheck: {
          isNewAccount,
          hasProgress: false,
          persistedStateCount: 0,
          completedProblemsCount: 0,
          totalXp: 0,
        },
      });
    }

    const existingAccount = await UserAccount.findOne({ supabaseUserId: user.id }).lean();
    const isNewAccount = !existingAccount;

    const updateSet: Record<string, unknown> = {
      email: cleanEmail,
      lastSignInAt: new Date(),
    };
    if (metaAvatarUrl) {
      updateSet.avatarUrl = metaAvatarUrl;
    }
    // Preserve custom edited display name if the user already has one set
    if (!existingAccount?.fullName && metaFullName) {
      updateSet.fullName = metaFullName;
    }

    const account = await UserAccount.findOneAndUpdate(
      { supabaseUserId: user.id },
      {
        $set: updateSet,
        $setOnInsert: {
          supabaseUserId: user.id,
          fullName: metaFullName,
          avatarUrl: metaAvatarUrl,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Guarantee a brand-new user starts with strictly zero metrics, zero XP, empty queues/logs
    await UserBrainProfile.updateOne(
      { userId: user.id },
      {
        $setOnInsert: {
          userId: user.id,
          currentTier: INITIAL_BRAIN_PROFILE.currentTier,
          cognitiveMetrics: {
            signalRecognitionScore: 0,
            bottleneckDiagnosisScore: 0,
            logicAssemblyAccuracy: 0,
            paperDryRunStreak: 0,
          },
          activityLog: [],
          passedTopicQuizzes: [],
          completedProblemIds: [],
          completedWarmupDrills: [],
          masteredProblemSlugs: [],
          spacedRepetitionQueue: [],
        },
      },
      { upsert: true }
    );

    // Community invite processing is a best-effort side effect. A malformed or
    // unavailable invite record must not prevent an authenticated learner from signing in.
    let autoAcceptedInvites = 0;
    if (cleanEmail) {
      try {
        const displayName = account.fullName || cleanEmail.split('@')[0] || 'Learner';
        const inviteUpdate = await CommunityInvite.updateMany(
          {
            inviteeEmail: cleanEmail,
            status: 'pending',
            inviterUserId: { $ne: user.id },
          },
          {
            $set: {
              status: 'accepted',
              acceptedByUserId: user.id,
              acceptedByName: displayName,
              acceptedByEmail: cleanEmail,
              acceptedAt: new Date(),
            },
          }
        );
        autoAcceptedInvites = inviteUpdate.modifiedCount ?? 0;
      } catch (inviteError) {
        console.error('[auth/me] Community invite auto-accept failed:', inviteError instanceof Error ? inviteError.message : 'UNKNOWN_ERROR');
      }
    }

    // Progress is supplementary to successful account/profile provisioning. If a
    // legacy state document cannot be read, keep sign-in available and report a
    // conservative empty summary; the underlying learning data is not modified.
    let hasProgress = false;
    let persistedStateCount = 0;
    let completedProblemsCount = 0;
    let totalXp = 0;
    try {
      const [profileDoc, stateDocs] = await Promise.all([
        UserBrainProfile.findOne({ userId: user.id }).lean(),
        UserLearningState.find({ userId: user.id }).select('stateKey payload').lean(),
      ]);

      const statesMap: Record<string, unknown> = {};
      for (const s of stateDocs) {
        statesMap[s.stateKey] = s.payload;
      }

      const summary = computeUserProgressSummary(profileDoc as any, statesMap, 0);
      hasProgress = summary.hasProgress;
      persistedStateCount = stateDocs.filter((s) => s.stateKey !== 'ui-preferences').length;
      completedProblemsCount = summary.uniqueProblemsSolved;
      totalXp = summary.totalXp;
    } catch (progressError) {
      console.error('[auth/me] Progress summary read failed:', progressError instanceof Error ? progressError.message : 'UNKNOWN_ERROR');
    }

    return res.json({
      user: {
        id: account.supabaseUserId,
        email: account.email,
        fullName: account.fullName,
        avatarUrl: account.avatarUrl,
      },
      freshAccountCheck: {
        isNewAccount,
        hasProgress,
        persistedStateCount,
        completedProblemsCount,
        totalXp,
        autoAcceptedInvites,
      },
    });
  } catch (error) {
    // Log the server-side failure reason for diagnosis without exposing it to
    // the client (MongoDB errors may contain connection details).
    console.error(
      '[auth/me] Critical account/profile provisioning failed:',
      error instanceof Error ? error.message : String(error)
    );
    return res.status(500).json({
      code: 'ACCOUNT_INITIALIZATION_FAILED',
      message: 'Your account could not be initialized. Please retry.',
    });
  }
});

export default router;
