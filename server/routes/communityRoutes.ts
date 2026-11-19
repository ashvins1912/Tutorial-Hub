import crypto from 'crypto';
import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { isMongoConnected } from '../db/connectMongo';
import { UserAccount } from '../models/UserAccount';
import { UserBrainProfile } from '../models/UserBrainProfile';
import { UserLearningState } from '../models/UserLearningState';
import { CommunityInvite, CommunityInviteStatus } from '../models/CommunityInvite';
import { CommunityPost, CommunityPostType, CommunityDifficulty } from '../models/CommunityPost';
import { appendActivity, getAllDevCognitiveUserIds, getDevCognitiveExtras } from './cognitiveRoutes';
import { getAllDevAccounts, upsertDevAccount } from './authRoutes';
import { getAllUserLearningStates } from './userStateRoutes';
import { computeUserProgressSummary } from '../services/userStatsService';
import { parsePlatformUrl } from '../../src/utils/platformUrlParser';

const router = express.Router();
router.use(requireAuth);
router.use((_req: Request, res: Response, next: import('express').NextFunction) => {
  if (process.env.NODE_ENV === 'production' && !isMongoConnected()) {
    return res.status(503).json({
      code: 'DATABASE_UNAVAILABLE',
      message: 'Community database is temporarily unavailable. Please retry shortly.',
    });
  }
  return next();
});

// Dev-memory fallback stores (used only when MONGODB_URI is not configured locally)
interface DevInvite {
  id: string;
  inviteCode: string;
  inviterUserId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  personalMessage: string;
  status: CommunityInviteStatus;
  acceptedByUserId?: string;
  acceptedByName?: string;
  acceptedByEmail?: string;
  acceptedAt?: string;
  createdAt: string;
}

interface DevPost {
  id: string;
  authorUserId: string;
  authorName: string;
  authorEmail: string;
  authorTier: string;
  postType: CommunityPostType;
  title: string;
  description: string;
  topicTag: string;
  difficulty: CommunityDifficulty;
  problemRef?: string;
  externalUrl?: string;
  sourcePlatform?: string;
  targetTimeMinutes?: number;
  upvotedBy: string[];
  completedBy: string[];
  comments: { userId: string; authorName: string; body: string; createdAt: string }[];
  createdAt: string;
}

const devInvites: DevInvite[] = [];
const devPosts: DevPost[] = [];

function derivePersonalInviteCode(userId: string): string {
  const hash = crypto.createHash('sha256').update(`pf-community-${userId}`).digest('hex').slice(0, 8).toUpperCase();
  return `PF-${hash}`;
}

function generateUniqueInviteCode(): string {
  return `PF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function getDisplayName(fullName?: string, email?: string): string {
  const trimmed = (fullName ?? '').trim();
  if (trimmed) return trimmed;
  if (email && email.includes('@')) return email.split('@')[0];
  return 'Learner';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function parseAndSanitizeExternalUrl(
  raw?: unknown
): { url: string; platform: string } | null {
  if (typeof raw !== 'string' || !raw.trim()) return { url: '', platform: '' };
  const parsed = parsePlatformUrl(raw);
  if (!parsed) return null;
  return { url: parsed.normalizedUrl, platform: parsed.platform };
}

async function resolveCurrentUserIdentity(req: Request) {
  const userId = req.authUser!.id;
  const email = (req.authUser!.email ?? '').trim().toLowerCase();
  const meta = req.authUser!.userMetadata ?? {};
  const metaName = String(meta.full_name ?? meta.name ?? '').trim();
  const metaAvatar = String(meta.avatar_url ?? meta.picture ?? '').trim();

  if (isMongoConnected()) {
    const [account, profile] = await Promise.all([
      UserAccount.findOne({ supabaseUserId: userId }).lean(),
      UserBrainProfile.findOne({ userId }).select('currentTier').lean(),
    ]);
    return {
      userId,
      email: account?.email || email,
      displayName: getDisplayName(account?.fullName || metaName, account?.email || email),
      tier: profile?.currentTier || 'Noob',
    };
  }

  const { account } = upsertDevAccount({
    id: userId,
    email,
    fullName: metaName,
    avatarUrl: metaAvatar,
  });
  const extras = getDevCognitiveExtras(userId);
  return {
    userId,
    email: account.email,
    displayName: getDisplayName(account.fullName, account.email),
    tier: extras.profile.currentTier,
  };
}

// ============================================================================
// 1. COMMUNITY LEADERBOARD
// ============================================================================
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const currentUserId = req.authUser!.id;
    const filter = String(req.query.filter ?? 'all'); // all | active | network
    const search = String(req.query.search ?? '').trim().toLowerCase();

    // Ensure dev mode registers current user
    if (!isMongoConnected()) {
      await resolveCurrentUserIdentity(req);
    }

    // Determine invited network user IDs (inviters + invitees connected to current user)
    const networkUserIds = new Set<string>([currentUserId]);

    interface RawEntry {
      userId: string;
      displayName: string;
      avatarUrl: string;
      memberSince: string;
      currentTier: string;
      totalXp: number;
      uniqueProblemsSolved: number;
      completedLabsCount: number;
      compositeAccuracy: number;
      streak: number;
      challengesSolved: number;
      hasProgress: boolean;
      isCurrentUser: boolean;
      inYourNetwork: boolean;
    }

    const entries: RawEntry[] = [];

    if (isMongoConnected()) {
      const [accounts, profiles, allStates, acceptedInvites, posts] = await Promise.all([
        UserAccount.find().select('supabaseUserId email fullName avatarUrl createdAt').lean(),
        UserBrainProfile.find().lean(),
        UserLearningState.find().select('userId stateKey payload').lean(),
        CommunityInvite.find({
          status: 'accepted',
          $or: [{ inviterUserId: currentUserId }, { acceptedByUserId: currentUserId }],
        })
          .select('inviterUserId acceptedByUserId')
          .lean(),
        CommunityPost.find().select('completedBy').lean(),
      ]);

      for (const inv of acceptedInvites) {
        if (inv.inviterUserId) networkUserIds.add(inv.inviterUserId);
        if (inv.acceptedByUserId) networkUserIds.add(inv.acceptedByUserId);
      }

      const profileByUser = new Map<string, any>();
      for (const p of profiles) profileByUser.set(p.userId, p);

      const statesByUser = new Map<string, Record<string, unknown>>();
      for (const st of allStates) {
        let bucket = statesByUser.get(st.userId);
        if (!bucket) {
          bucket = {};
          statesByUser.set(st.userId, bucket);
        }
        bucket[st.stateKey] = st.payload;
      }

      const challengeCounts = new Map<string, number>();
      for (const post of posts) {
        for (const uid of post.completedBy ?? []) {
          challengeCounts.set(uid, (challengeCounts.get(uid) ?? 0) + 1);
        }
      }

      for (const acc of accounts) {
        const uid = acc.supabaseUserId;
        const prof = profileByUser.get(uid);
        const userStates = statesByUser.get(uid) ?? {};
        const challengesSolved = challengeCounts.get(uid) ?? 0;
        const summary = computeUserProgressSummary(prof, userStates, challengesSolved);

        entries.push({
          userId: uid,
          displayName: getDisplayName(acc.fullName, acc.email),
          avatarUrl: acc.avatarUrl ?? '',
          memberSince: acc.createdAt ? new Date(acc.createdAt).toISOString() : new Date().toISOString(),
          currentTier: summary.currentTier,
          totalXp: summary.totalXp,
          uniqueProblemsSolved: summary.uniqueProblemsSolved,
          completedLabsCount: summary.completedLabsCount,
          compositeAccuracy: summary.compositeAccuracy,
          streak: summary.streak,
          challengesSolved,
          hasProgress: summary.hasProgress,
          isCurrentUser: uid === currentUserId,
          inYourNetwork: networkUserIds.has(uid),
        });
      }
    } else {
      for (const inv of devInvites) {
        if (inv.status === 'accepted') {
          if (inv.inviterUserId === currentUserId && inv.acceptedByUserId) {
            networkUserIds.add(inv.acceptedByUserId);
          }
          if (inv.acceptedByUserId === currentUserId) {
            networkUserIds.add(inv.inviterUserId);
          }
        }
      }

      const challengeCounts = new Map<string, number>();
      for (const p of devPosts) {
        for (const uid of p.completedBy) {
          challengeCounts.set(uid, (challengeCounts.get(uid) ?? 0) + 1);
        }
      }

      const accountMap = new Map(getAllDevAccounts().map((a) => [a.supabaseUserId, a]));
      const allIds = new Set<string>([
        ...accountMap.keys(),
        ...getAllDevCognitiveUserIds(),
        currentUserId,
      ]);

      for (const uid of allIds) {
        const acc = accountMap.get(uid);
        const extras = getDevCognitiveExtras(uid);
        const { states } = await getAllUserLearningStates(uid);
        const challengesSolved = challengeCounts.get(uid) ?? 0;
        const summary = computeUserProgressSummary(
          {
            ...extras.profile,
            completedWarmupDrills: extras.completedWarmupDrills,
            masteredProblemSlugs: extras.masteredProblemSlugs,
            notes: extras.notes,
            activityLog: extras.activityLog,
          },
          states,
          challengesSolved
        );
        entries.push({
          userId: uid,
          displayName: getDisplayName(acc?.fullName, acc?.email),
          avatarUrl: acc?.avatarUrl ?? '',
          memberSince: acc?.createdAt ?? new Date().toISOString(),
          currentTier: summary.currentTier,
          totalXp: summary.totalXp,
          uniqueProblemsSolved: summary.uniqueProblemsSolved,
          completedLabsCount: summary.completedLabsCount,
          compositeAccuracy: summary.compositeAccuracy,
          streak: summary.streak,
          challengesSolved,
          hasProgress: summary.hasProgress,
          isCurrentUser: uid === currentUserId,
          inYourNetwork: networkUserIds.has(uid),
        });
      }
    }

    // Sort globally: Total XP DESC -> Unique Problems Solved DESC -> Composite Accuracy DESC -> Member Since ASC
    entries.sort(
      (a, b) =>
        b.totalXp - a.totalXp ||
        b.uniqueProblemsSolved - a.uniqueProblemsSolved ||
        b.compositeAccuracy - a.compositeAccuracy ||
        a.memberSince.localeCompare(b.memberSince)
    );

    const globallyRanked = entries.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

    const currentUserEntry = globallyRanked.find((e) => e.isCurrentUser) ?? null;

    let filtered = globallyRanked;
    if (filter === 'active') {
      filtered = filtered.filter((e) => e.hasProgress);
    } else if (filter === 'network') {
      filtered = filtered.filter((e) => e.inYourNetwork);
    }
    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.displayName.toLowerCase().includes(search) ||
          e.currentTier.toLowerCase().includes(search)
      );
    }

    return res.json({
      summary: {
        totalMembers: globallyRanked.length,
        activeMembers: globallyRanked.filter((e) => e.hasProgress).length,
        networkMembers: Math.max(0, networkUserIds.size - 1),
        currentUserRank: currentUserEntry?.rank ?? null,
        currentUserXp: currentUserEntry?.totalXp ?? 0,
        currentUserSolved: currentUserEntry?.uniqueProblemsSolved ?? 0,
        currentUserHasProgress: currentUserEntry?.hasProgress ?? false,
      },
      entries: filtered.slice(0, 100),
    });
  } catch (error) {
    console.error('[community/leaderboard] Error:', error);
    return res.status(500).json({ error: 'Unable to load community leaderboard.' });
  }
});

// ============================================================================
// 2. COMMUNITY INVITES (Email + Shareable Invite Code/Link)
// ============================================================================
router.get('/invites', async (req: Request, res: Response) => {
  try {
    const me = await resolveCurrentUserIdentity(req);
    const personalCode = derivePersonalInviteCode(me.userId);

    if (isMongoConnected()) {
      const [sentDocs, receivedDocs] = await Promise.all([
        CommunityInvite.find({ inviterUserId: me.userId }).sort({ createdAt: -1 }).lean(),
        CommunityInvite.find({
          $or: [
            ...(me.email ? [{ inviteeEmail: me.email }] : []),
            { acceptedByUserId: me.userId },
          ],
          inviterUserId: { $ne: me.userId },
        })
          .sort({ createdAt: -1 })
          .lean(),
      ]);

      return res.json({
        personalInviteCode: personalCode,
        sent: sentDocs.map((d: any) => ({
          id: String(d._id),
          inviteCode: d.inviteCode,
          inviteeEmail: d.inviteeEmail,
          personalMessage: d.personalMessage,
          status: d.status,
          acceptedByName: d.acceptedByName || '',
          acceptedAt: d.acceptedAt ? new Date(d.acceptedAt).toISOString() : null,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        })),
        received: receivedDocs.map((d: any) => ({
          id: String(d._id),
          inviteCode: d.inviteCode,
          inviterName: d.inviterName,
          inviterEmail: d.inviterEmail,
          personalMessage: d.personalMessage,
          status: d.status,
          acceptedAt: d.acceptedAt ? new Date(d.acceptedAt).toISOString() : null,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        })),
      });
    }

    return res.json({
      personalInviteCode: personalCode,
      sent: devInvites
        .filter((i) => i.inviterUserId === me.userId)
        .map((d) => ({
          id: d.id,
          inviteCode: d.inviteCode,
          inviteeEmail: d.inviteeEmail,
          personalMessage: d.personalMessage,
          status: d.status,
          acceptedByName: d.acceptedByName || '',
          acceptedAt: d.acceptedAt ?? null,
          createdAt: d.createdAt,
        })),
      received: devInvites
        .filter(
          (i) =>
            i.inviterUserId !== me.userId &&
            ((me.email && i.inviteeEmail === me.email) || i.acceptedByUserId === me.userId)
        )
        .map((d) => ({
          id: d.id,
          inviteCode: d.inviteCode,
          inviterName: d.inviterName,
          inviterEmail: d.inviterEmail,
          personalMessage: d.personalMessage,
          status: d.status,
          acceptedAt: d.acceptedAt ?? null,
          createdAt: d.createdAt,
        })),
    });
  } catch (error) {
    console.error('[community/invites GET] Error:', error);
    return res.status(500).json({ error: 'Unable to load community invites.' });
  }
});

router.post('/invites', async (req: Request, res: Response) => {
  try {
    const me = await resolveCurrentUserIdentity(req);
    const rawEmail = typeof req.body?.inviteeEmail === 'string' ? req.body.inviteeEmail.trim().toLowerCase() : '';
    const rawMessage = typeof req.body?.personalMessage === 'string' ? req.body.personalMessage.trim().slice(0, 280) : '';

    if (rawEmail && !isValidEmail(rawEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (rawEmail && me.email && rawEmail === me.email) {
      return res.status(400).json({ error: 'You cannot invite your own email address.' });
    }

    const inviteCode = generateUniqueInviteCode();

    if (isMongoConnected()) {
      // Check if email already has a pending invite from this user
      if (rawEmail) {
        const duplicate = await CommunityInvite.findOne({
          inviterUserId: me.userId,
          inviteeEmail: rawEmail,
          status: 'pending',
        }).lean();
        if (duplicate) {
          return res.status(409).json({
            error: `An active invitation for ${rawEmail} is already pending (Code: ${duplicate.inviteCode}).`,
          });
        }
      }

      const created = await CommunityInvite.create({
        inviteCode,
        inviterUserId: me.userId,
        inviterName: me.displayName,
        inviterEmail: me.email,
        inviteeEmail: rawEmail,
        personalMessage: rawMessage,
        status: 'pending',
      });

      return res.status(201).json({
        invite: {
          id: String(created._id),
          inviteCode: created.inviteCode,
          inviteeEmail: created.inviteeEmail,
          personalMessage: created.personalMessage,
          status: created.status,
          createdAt: created.createdAt.toISOString(),
        },
      });
    }

    const created: DevInvite = {
      id: crypto.randomUUID(),
      inviteCode,
      inviterUserId: me.userId,
      inviterName: me.displayName,
      inviterEmail: me.email,
      inviteeEmail: rawEmail,
      personalMessage: rawMessage,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    devInvites.unshift(created);
    return res.status(201).json({ invite: created });
  } catch (error) {
    console.error('[community/invites POST] Error:', error);
    return res.status(500).json({ error: 'Unable to create community invitation.' });
  }
});

router.post('/invites/accept', async (req: Request, res: Response) => {
  try {
    const me = await resolveCurrentUserIdentity(req);
    const code = typeof req.body?.inviteCode === 'string' ? req.body.inviteCode.trim().toUpperCase() : '';
    if (!code || code.length < 4) {
      return res.status(400).json({ error: 'A valid invite code is required.' });
    }

    if (code === derivePersonalInviteCode(me.userId)) {
      return res.status(400).json({ error: 'You cannot accept your own personal invite link.' });
    }

    if (isMongoConnected()) {
      // 1. Check explicit CommunityInvite by inviteCode
      const invite = await CommunityInvite.findOne({ inviteCode: code });
      if (invite) {
        if (invite.inviterUserId === me.userId) {
          return res.status(400).json({ error: 'You cannot accept your own invitation.' });
        }
        if (invite.status === 'revoked') {
          return res.status(410).json({ error: 'This invitation has been revoked.' });
        }
        if (invite.status === 'accepted') {
          if (invite.acceptedByUserId === me.userId) {
            return res.json({
              ok: true,
              alreadyAccepted: true,
              message: `You are already connected with ${invite.inviterName} in the community.`,
            });
          }
          return res.status(409).json({ error: 'This single-use invite code has already been redeemed.' });
        }

        invite.status = 'accepted';
        invite.acceptedByUserId = me.userId;
        invite.acceptedByName = me.displayName;
        invite.acceptedByEmail = me.email;
        invite.acceptedAt = new Date();
        await invite.save();

        return res.json({
          ok: true,
          inviterName: invite.inviterName,
          message: `Joined ${invite.inviterName}'s community network!`,
        });
      }

      // 2. Fallback: Match against any member's personal reusable invite code
      const accounts = await UserAccount.find().select('supabaseUserId email fullName').lean();
      const matchedInviter = accounts.find((acc) => derivePersonalInviteCode(acc.supabaseUserId) === code);
      if (!matchedInviter) {
        return res.status(404).json({ error: 'Invite code not found. Please check the code and try again.' });
      }

      const existingLink = await CommunityInvite.findOne({
        inviterUserId: matchedInviter.supabaseUserId,
        acceptedByUserId: me.userId,
        status: 'accepted',
      }).lean();

      const inviterName = getDisplayName(matchedInviter.fullName, matchedInviter.email);
      if (existingLink) {
        return res.json({
          ok: true,
          alreadyAccepted: true,
          inviterName,
          message: `You are already connected with ${inviterName} in the community.`,
        });
      }

      await CommunityInvite.create({
        inviteCode: generateUniqueInviteCode(),
        inviterUserId: matchedInviter.supabaseUserId,
        inviterName,
        inviterEmail: matchedInviter.email,
        inviteeEmail: me.email,
        personalMessage: 'Joined via personal community invite link',
        status: 'accepted',
        acceptedByUserId: me.userId,
        acceptedByName: me.displayName,
        acceptedByEmail: me.email,
        acceptedAt: new Date(),
      });

      return res.json({
        ok: true,
        inviterName,
        message: `Connected with ${inviterName} in the community!`,
      });
    }

    // Dev-memory fallback
    const devInv = devInvites.find((i) => i.inviteCode === code);
    if (!devInv) {
      return res.status(404).json({ error: 'Invite code not found.' });
    }
    if (devInv.inviterUserId === me.userId) {
      return res.status(400).json({ error: 'You cannot accept your own invitation.' });
    }
    if (devInv.status === 'revoked') {
      return res.status(410).json({ error: 'This invitation has been revoked.' });
    }
    devInv.status = 'accepted';
    devInv.acceptedByUserId = me.userId;
    devInv.acceptedByName = me.displayName;
    devInv.acceptedByEmail = me.email;
    devInv.acceptedAt = new Date().toISOString();
    return res.json({
      ok: true,
      inviterName: devInv.inviterName,
      message: `Joined ${devInv.inviterName}'s community network!`,
    });
  } catch (error) {
    console.error('[community/invites/accept] Error:', error);
    return res.status(500).json({ error: 'Unable to accept invitation.' });
  }
});

router.delete('/invites/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.authUser!.id;
    const { id } = req.params;

    if (isMongoConnected()) {
      const updated = await CommunityInvite.findOneAndUpdate(
        { _id: id, inviterUserId: userId, status: 'pending' },
        { $set: { status: 'revoked' } },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ error: 'Pending invitation not found.' });
      }
      return res.json({ ok: true, id });
    }

    const idx = devInvites.findIndex((i) => i.id === id && i.inviterUserId === userId && i.status === 'pending');
    if (idx === -1) return res.status(404).json({ error: 'Pending invitation not found.' });
    devInvites[idx].status = 'revoked';
    return res.json({ ok: true, id });
  } catch (error) {
    console.error('[community/invites DELETE] Error:', error);
    return res.status(500).json({ error: 'Unable to revoke invitation.' });
  }
});

// ============================================================================
// 3. SHARED PROBLEMS, CHALLENGES TO SOLVE & RECOMMENDED READS
// ============================================================================
function serializePost(doc: any, currentUserId: string) {
  const upvotedBy: string[] = Array.isArray(doc.upvotedBy) ? doc.upvotedBy : [];
  const completedBy: string[] = Array.isArray(doc.completedBy) ? doc.completedBy : [];
  const comments = Array.isArray(doc.comments) ? doc.comments : [];
  return {
    id: String(doc._id ?? doc.id),
    authorUserId: doc.authorUserId,
    authorName: doc.authorName,
    authorTier: doc.authorTier || 'Noob',
    postType: doc.postType as CommunityPostType,
    title: doc.title,
    description: doc.description,
    topicTag: doc.topicTag || 'General DSA',
    difficulty: (doc.difficulty || 'Medium') as CommunityDifficulty,
    problemRef: doc.problemRef || '',
    externalUrl: doc.externalUrl || '',
    sourcePlatform:
      doc.sourcePlatform ||
      (doc.externalUrl ? parsePlatformUrl(doc.externalUrl)?.platform ?? 'External' : doc.problemRef ? 'PatternForge Lab' : 'Community'),
    targetTimeMinutes: doc.targetTimeMinutes ?? null,
    upvoteCount: upvotedBy.length,
    completedCount: completedBy.length,
    hasUpvoted: upvotedBy.includes(currentUserId),
    hasCompleted: completedBy.includes(currentUserId),
    isAuthor: doc.authorUserId === currentUserId,
    comments: comments.map((c: any) => ({
      userId: c.userId,
      authorName: c.authorName,
      body: c.body,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    })),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

router.get('/posts', async (req: Request, res: Response) => {
  try {
    const userId = req.authUser!.id;
    const typeFilter = String(req.query.type ?? 'all'); // all | problem | challenge | read
    const platformFilter = String(req.query.platform ?? 'all').trim().toLowerCase();
    const topic = String(req.query.topic ?? '').trim().toLowerCase();
    const q = String(req.query.q ?? '').trim().toLowerCase();
    const sort = String(req.query.sort ?? 'recent'); // recent | top

    let rawPosts: any[] = [];
    if (isMongoConnected()) {
      const query: Record<string, unknown> = {};
      if (typeFilter === 'problem' || typeFilter === 'challenge' || typeFilter === 'read') {
        query.postType = typeFilter;
      }
      rawPosts = await CommunityPost.find(query).sort({ createdAt: -1 }).limit(150).lean();
    } else {
      rawPosts =
        typeFilter === 'problem' || typeFilter === 'challenge' || typeFilter === 'read'
          ? devPosts.filter((p) => p.postType === typeFilter)
          : [...devPosts];
    }

    let serialized = rawPosts.map((d) => serializePost(d, userId));

    if (platformFilter && platformFilter !== 'all') {
      if (platformFilter === 'other') {
        const major = new Set([
          'leetcode',
          'geeksforgeeks',
          'codeforces',
          'hackerrank',
          'patternforge lab',
        ]);
        serialized = serialized.filter((p) => !major.has(p.sourcePlatform.toLowerCase()));
      } else {
        serialized = serialized.filter(
          (p) => p.sourcePlatform.toLowerCase() === platformFilter
        );
      }
    }

    if (topic) {
      serialized = serialized.filter((p) => p.topicTag.toLowerCase().includes(topic));
    }
    if (q) {
      serialized = serialized.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.topicTag.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.sourcePlatform.toLowerCase().includes(q) ||
          p.externalUrl.toLowerCase().includes(q)
      );
    }

    if (sort === 'top') {
      serialized.sort(
        (a, b) =>
          b.upvoteCount - a.upvoteCount ||
          b.completedCount - a.completedCount ||
          b.createdAt.localeCompare(a.createdAt)
      );
    }

    return res.json({ posts: serialized });
  } catch (error) {
    console.error('[community/posts GET] Error:', error);
    return res.status(500).json({ error: 'Unable to load community feed.' });
  }
});

router.post('/posts', async (req: Request, res: Response) => {
  try {
    const me = await resolveCurrentUserIdentity(req);
    const {
      postType,
      title,
      description,
      topicTag,
      difficulty,
      problemRef,
      externalUrl,
      targetTimeMinutes,
    } = req.body ?? {};

    const validTypes: CommunityPostType[] = ['problem', 'challenge', 'read'];
    if (!validTypes.includes(postType)) {
      return res.status(400).json({ error: 'postType must be problem, challenge, or read.' });
    }
    if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 140) {
      return res.status(400).json({ error: 'Title must be between 3 and 140 characters.' });
    }
    if (typeof description !== 'string' || description.trim().length < 5 || description.trim().length > 2000) {
      return res.status(400).json({ error: 'Description must be between 5 and 2,000 characters.' });
    }

    const parsedUrl = parseAndSanitizeExternalUrl(externalUrl);
    if (parsedUrl === null) {
      return res
        .status(400)
        .json({ error: 'Please provide a valid URL (e.g. https://leetcode.com/problems/... or https://geeksforgeeks.org/...).' });
    }

    const validDiffs: CommunityDifficulty[] = ['Easy', 'Medium', 'Hard', 'All'];
    const cleanDifficulty: CommunityDifficulty = validDiffs.includes(difficulty)
      ? difficulty
      : postType === 'read'
        ? 'All'
        : 'Medium';

    const cleanTopic =
      typeof topicTag === 'string' && topicTag.trim() ? topicTag.trim().slice(0, 60) : 'General DSA';
    const cleanProblemRef =
      typeof problemRef === 'string' ? problemRef.trim().slice(0, 120) : '';
    const sourcePlatform =
      parsedUrl.platform || (cleanProblemRef ? 'PatternForge Lab' : 'Community');
    const parsedMinutes =
      targetTimeMinutes !== undefined && targetTimeMinutes !== null && targetTimeMinutes !== ''
        ? Math.min(180, Math.max(5, Math.round(Number(targetTimeMinutes))))
        : undefined;

    if (isMongoConnected()) {
      const created = await CommunityPost.create({
        authorUserId: me.userId,
        authorName: me.displayName,
        authorEmail: me.email,
        authorTier: me.tier,
        postType,
        title: title.trim(),
        description: description.trim(),
        topicTag: cleanTopic,
        difficulty: cleanDifficulty,
        problemRef: cleanProblemRef,
        externalUrl: parsedUrl.url,
        sourcePlatform,
        targetTimeMinutes: Number.isFinite(parsedMinutes) ? parsedMinutes : undefined,
        upvotedBy: [me.userId],
        completedBy: [],
        comments: [],
      });

      return res.status(201).json({ post: serializePost(created.toObject(), me.userId) });
    }

    const created: DevPost = {
      id: crypto.randomUUID(),
      authorUserId: me.userId,
      authorName: me.displayName,
      authorEmail: me.email,
      authorTier: me.tier,
      postType,
      title: title.trim(),
      description: description.trim(),
      topicTag: cleanTopic,
      difficulty: cleanDifficulty,
      problemRef: cleanProblemRef,
      externalUrl: parsedUrl.url,
      sourcePlatform,
      targetTimeMinutes: Number.isFinite(parsedMinutes) ? parsedMinutes : undefined,
      upvotedBy: [me.userId],
      completedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    devPosts.unshift(created);
    return res.status(201).json({ post: serializePost(created, me.userId) });
  } catch (error) {
    console.error('[community/posts POST] Error:', error);
    return res.status(500).json({ error: 'Unable to publish to community.' });
  }
});

router.post('/posts/:id/upvote', async (req: Request, res: Response) => {
  try {
    const userId = req.authUser!.id;
    const { id } = req.params;

    if (isMongoConnected()) {
      const post = await CommunityPost.findById(id);
      if (!post) return res.status(404).json({ error: 'Post not found.' });
      const idx = post.upvotedBy.indexOf(userId);
      if (idx >= 0) post.upvotedBy.splice(idx, 1);
      else post.upvotedBy.push(userId);
      await post.save();
      return res.json({ post: serializePost(post.toObject(), userId) });
    }

    const post = devPosts.find((p) => p.id === id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    const idx = post.upvotedBy.indexOf(userId);
    if (idx >= 0) post.upvotedBy.splice(idx, 1);
    else post.upvotedBy.push(userId);
    return res.json({ post: serializePost(post, userId) });
  } catch (error) {
    console.error('[community/posts/upvote] Error:', error);
    return res.status(500).json({ error: 'Unable to toggle upvote.' });
  }
});

router.post('/posts/:id/complete', async (req: Request, res: Response) => {
  try {
    const userId = req.authUser!.id;
    const { id } = req.params;

    if (isMongoConnected()) {
      const post = await CommunityPost.findById(id);
      if (!post) return res.status(404).json({ error: 'Post not found.' });
      const idx = post.completedBy.indexOf(userId);
      let newlyCompleted = false;
      if (idx >= 0) {
        post.completedBy.splice(idx, 1);
      } else {
        post.completedBy.push(userId);
        newlyCompleted = true;
      }
      await post.save();

      if (newlyCompleted) {
        const labelPrefix =
          post.postType === 'challenge'
            ? 'Solved Community Challenge'
            : post.postType === 'problem'
              ? 'Solved Shared Problem'
              : 'Finished Recommended Read';
        await appendActivity(userId, {
          kind: 'community-challenge',
          label: `${labelPrefix}: ${post.title}`,
          xp: 50,
        });
      }

      return res.json({ post: serializePost(post.toObject(), userId), newlyCompleted });
    }

    const post = devPosts.find((p) => p.id === id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    const idx = post.completedBy.indexOf(userId);
    let newlyCompleted = false;
    if (idx >= 0) {
      post.completedBy.splice(idx, 1);
    } else {
      post.completedBy.push(userId);
      newlyCompleted = true;
    }
    if (newlyCompleted) {
      await appendActivity(userId, {
        kind: 'community-challenge',
        label: `Completed Community ${post.postType}: ${post.title}`,
        xp: 50,
      });
    }
    return res.json({ post: serializePost(post, userId), newlyCompleted });
  } catch (error) {
    console.error('[community/posts/complete] Error:', error);
    return res.status(500).json({ error: 'Unable to update completion status.' });
  }
});

router.post('/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const me = await resolveCurrentUserIdentity(req);
    const { id } = req.params;
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
    if (body.length < 2 || body.length > 1000) {
      return res.status(400).json({ error: 'Comment must be between 2 and 1,000 characters.' });
    }

    if (isMongoConnected()) {
      const post = await CommunityPost.findById(id);
      if (!post) return res.status(404).json({ error: 'Post not found.' });
      post.comments.push({
        userId: me.userId,
        authorName: me.displayName,
        body,
        createdAt: new Date(),
      });
      if (post.comments.length > 100) {
        post.comments.splice(0, post.comments.length - 100);
      }
      await post.save();
      return res.status(201).json({ post: serializePost(post.toObject(), me.userId) });
    }

    const post = devPosts.find((p) => p.id === id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    post.comments.push({
      userId: me.userId,
      authorName: me.displayName,
      body,
      createdAt: new Date().toISOString(),
    });
    return res.status(201).json({ post: serializePost(post, me.userId) });
  } catch (error) {
    console.error('[community/posts/comments] Error:', error);
    return res.status(500).json({ error: 'Unable to add comment.' });
  }
});

router.delete('/posts/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.authUser!.id;
    const { id } = req.params;

    if (isMongoConnected()) {
      const deleted = await CommunityPost.findOneAndDelete({ _id: id, authorUserId: userId });
      if (!deleted) return res.status(404).json({ error: 'Post not found or unauthorized.' });
      return res.json({ ok: true, id });
    }

    const idx = devPosts.findIndex((p) => p.id === id && p.authorUserId === userId);
    if (idx === -1) return res.status(404).json({ error: 'Post not found or unauthorized.' });
    devPosts.splice(idx, 1);
    return res.json({ ok: true, id });
  } catch (error) {
    console.error('[community/posts DELETE] Error:', error);
    return res.status(500).json({ error: 'Unable to delete post.' });
  }
});

export default router;
