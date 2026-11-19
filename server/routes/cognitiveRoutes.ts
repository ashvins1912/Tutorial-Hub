import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { INITIAL_BRAIN_PROFILE, SEED_TOPIC_QUIZZES } from '../seed/cognitiveSeed';
import { RankTier, TopicQuiz as TopicQuizType, UserBrainProfile as UserBrainProfileType } from '../../src/types/dsa';
import { IActivityLogEntry, UserBrainProfile as UserBrainProfileModel } from '../models/UserBrainProfile';
import { TopicQuiz as TopicQuizModel } from '../models/TopicQuiz';
import { isMongoConnected } from '../db/connectMongo';

const router = express.Router();
router.use(requireAuth);
router.use((_req: Request, res: Response, next: import('express').NextFunction) => {
  if (process.env.NODE_ENV === 'production' && !isMongoConnected()) {
    return res.status(503).json({
      code: 'DATABASE_UNAVAILABLE',
      message: 'Persistent learning storage is temporarily unavailable. Please retry shortly.',
    });
  }
  return next();
});

const RANK_ORDER: RankTier[] = ['Noob', 'Apprentice', 'Practitioner', 'Strategist', 'Pro'];

const RANK_REQUIRED_QUIZZES: Record<RankTier, string> = {
  Noob: 'sliding-window',
  Apprentice: 'monotonic-stack',
  Practitioner: 'binary-search-answer',
  Strategist: 'graph-topo-sort',
  Pro: 'dp-1d',
};

const INTERVAL_PROGRESSION: (1 | 3 | 7 | 21)[] = [1, 3, 7, 21];

// In-memory store fallback when MONGODB_URI is not configured
const profileStore = new Map<string, UserBrainProfileType>();
const notesStore = new Map<string, Record<string, string>>();
const warmupStore = new Map<string, string[]>();
const masteredStore = new Map<string, string[]>();
const activityStore = new Map<string, IActivityLogEntry[]>();

export function getDevCognitiveExtras(userId: string) {
  return {
    profile: profileStore.get(userId) ?? cloneSeedProfile(userId),
    notes: notesStore.get(userId) ?? {},
    completedWarmupDrills: warmupStore.get(userId) ?? [],
    masteredProblemSlugs: masteredStore.get(userId) ?? [],
    activityLog: activityStore.get(userId) ?? [],
  };
}

async function appendActivity(userId: string, entry: Omit<IActivityLogEntry, 'date'>) {
  const fullEntry: IActivityLogEntry = { ...entry, date: new Date() };
  if (isMongoConnected()) {
    await UserBrainProfileModel.updateOne(
      { userId },
      { $push: { activityLog: { $each: [fullEntry], $slice: -200 } } }
    );
    return;
  }
  const list = activityStore.get(userId) ?? [];
  list.push(fullEntry);
  if (list.length > 200) list.splice(0, list.length - 200);
  activityStore.set(userId, list);
}

async function loadAllQuizzes(): Promise<TopicQuizType[]> {
  if (isMongoConnected()) {
    const docs = await TopicQuizModel.find().lean();
    if (docs.length > 0) {
      return docs.map((d) => ({
        topicId: d.topicId,
        topicTitle: d.topicTitle,
        tier: d.tier,
        questions: d.questions,
      })) as TopicQuizType[];
    }
  }
  return SEED_TOPIC_QUIZZES;
}

function cloneSeedProfile(userId: string): UserBrainProfileType {
  return {
    ...INITIAL_BRAIN_PROFILE,
    userId,
    cognitiveMetrics: { ...INITIAL_BRAIN_PROFILE.cognitiveMetrics },
    passedTopicQuizzes: [...INITIAL_BRAIN_PROFILE.passedTopicQuizzes],
    completedProblemIds: [...INITIAL_BRAIN_PROFILE.completedProblemIds],
    spacedRepetitionQueue: INITIAL_BRAIN_PROFILE.spacedRepetitionQueue.map((item) => ({ ...item })),
  };
}

async function getOrCreateProfile(userId: string): Promise<UserBrainProfileType> {
  if (isMongoConnected()) {
    let doc = await UserBrainProfileModel.findOne({ userId });
    if (!doc) {
      const seed = cloneSeedProfile(userId);
      doc = await UserBrainProfileModel.create({
        userId: seed.userId,
        currentTier: seed.currentTier,
        cognitiveMetrics: seed.cognitiveMetrics,
        passedTopicQuizzes: seed.passedTopicQuizzes,
        completedProblemIds: seed.completedProblemIds,
        spacedRepetitionQueue: seed.spacedRepetitionQueue.map((q) => ({
          problemId: q.problemId,
          problemTitle: q.problemTitle,
          patternTag: q.patternTag,
          intervalStage: q.intervalStage,
          nextReviewDate: new Date(q.nextReviewDate),
          isDueNow: q.isDueNow,
          twistConstraint: q.twistConstraint,
        })),
      });
    }
    return {
      userId: doc.userId,
      currentTier: doc.currentTier as RankTier,
      cognitiveMetrics: {
        signalRecognitionScore: doc.cognitiveMetrics.signalRecognitionScore,
        bottleneckDiagnosisScore: doc.cognitiveMetrics.bottleneckDiagnosisScore,
        logicAssemblyAccuracy: doc.cognitiveMetrics.logicAssemblyAccuracy,
        paperDryRunStreak: doc.cognitiveMetrics.paperDryRunStreak,
      },
      passedTopicQuizzes: [...doc.passedTopicQuizzes],
      completedProblemIds: [...doc.completedProblemIds],
      spacedRepetitionQueue: doc.spacedRepetitionQueue.map(
        (q: {
          problemId: unknown;
          problemTitle?: string;
          patternTag: string;
          intervalStage: 1 | 3 | 7 | 21;
          nextReviewDate: Date;
          isDueNow?: boolean;
          twistConstraint: string;
        }) => ({
          problemId: String(q.problemId),
          problemTitle: q.problemTitle || String(q.problemId),
          patternTag: q.patternTag,
          intervalStage: q.intervalStage,
          nextReviewDate: new Date(q.nextReviewDate).toISOString(),
          isDueNow: Boolean(q.isDueNow),
          twistConstraint: q.twistConstraint,
        })
      ),
    };
  }

  if (!profileStore.has(userId)) {
    profileStore.set(userId, cloneSeedProfile(userId));
  }
  return profileStore.get(userId)!;
}

async function saveProfile(profile: UserBrainProfileType): Promise<void> {
  if (isMongoConnected()) {
    await UserBrainProfileModel.findOneAndUpdate(
      { userId: profile.userId },
      {
        $set: {
          currentTier: profile.currentTier,
          cognitiveMetrics: profile.cognitiveMetrics,
          passedTopicQuizzes: profile.passedTopicQuizzes,
          completedProblemIds: profile.completedProblemIds,
          spacedRepetitionQueue: profile.spacedRepetitionQueue.map((q) => ({
            problemId: q.problemId,
            problemTitle: q.problemTitle,
            patternTag: q.patternTag,
            intervalStage: q.intervalStage,
            nextReviewDate: new Date(q.nextReviewDate),
            isDueNow: q.isDueNow,
            twistConstraint: q.twistConstraint,
          })),
        },
      },
      { upsert: true }
    );
    return;
  }
  profileStore.set(profile.userId, profile);
}

function evaluateRankPromotion(profile: UserBrainProfileType): boolean {
  const currentIdx = RANK_ORDER.indexOf(profile.currentTier);
  if (currentIdx === -1 || currentIdx >= RANK_ORDER.length - 1) return false;

  const requiredQuiz = RANK_REQUIRED_QUIZZES[profile.currentTier];
  const hasQuiz = profile.passedTopicQuizzes.includes(requiredQuiz);
  const meetsAccuracy = profile.cognitiveMetrics.logicAssemblyAccuracy >= 80;

  if (hasQuiz && meetsAccuracy) {
    profile.currentTier = RANK_ORDER[currentIdx + 1];
    return true;
  }
  return false;
}

// GET /api/cognitive/profile — identity comes from the verified access token
router.get('/profile', async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const profile = await getOrCreateProfile(userId);
  res.json({ profile });
});

// POST /api/cognitive/complete-problem
router.post('/complete-problem', async (req: Request, res: Response) => {
  const {

    problemId,
    problemTitle,
    patternTag,
    twistConstraint,
    dryRunCompleted = true,
    assemblyErrors = 0,
    bottleneckCorrect = true,
  } = req.body ?? {};
  const userId = req.authUser!.id;

  if (!problemId) {
    return res.status(400).json({ error: 'problemId is required' });
  }

  const profile = await getOrCreateProfile(userId);

  if (!profile.completedProblemIds.includes(problemId)) {
    profile.completedProblemIds.push(problemId);
  }

  const deltaAssembly = assemblyErrors === 0 ? 8 : Math.max(2, 6 - assemblyErrors * 2);
  profile.cognitiveMetrics.logicAssemblyAccuracy = Math.min(
    100,
    Math.round(
      profile.cognitiveMetrics.logicAssemblyAccuracy * 0.65 +
        (100 - assemblyErrors * 10) * 0.35 +
        (assemblyErrors === 0 ? 3 : 0)
    )
  );
  if (profile.cognitiveMetrics.logicAssemblyAccuracy < 80 && assemblyErrors === 0) {
    profile.cognitiveMetrics.logicAssemblyAccuracy = Math.min(
      100,
      profile.cognitiveMetrics.logicAssemblyAccuracy + deltaAssembly
    );
  }

  if (bottleneckCorrect) {
    profile.cognitiveMetrics.bottleneckDiagnosisScore = Math.min(
      100,
      profile.cognitiveMetrics.bottleneckDiagnosisScore + 5
    );
  }

  if (dryRunCompleted) {
    profile.cognitiveMetrics.paperDryRunStreak += 1;
  }

  const existingIdx = profile.spacedRepetitionQueue.findIndex((q) => q.problemId === problemId);
  if (existingIdx >= 0) {
    const existing = profile.spacedRepetitionQueue[existingIdx];
    const stageIdx = INTERVAL_PROGRESSION.indexOf(existing.intervalStage);
    const nextStage = INTERVAL_PROGRESSION[Math.min(stageIdx + 1, INTERVAL_PROGRESSION.length - 1)];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextStage);
    profile.spacedRepetitionQueue[existingIdx] = {
      ...existing,
      intervalStage: nextStage,
      nextReviewDate: nextDate.toISOString(),
      isDueNow: false,
      twistConstraint: twistConstraint || existing.twistConstraint,
    };
  } else {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    profile.spacedRepetitionQueue.unshift({
      problemId,
      problemTitle: problemTitle || problemId,
      patternTag: patternTag || 'Core Pattern',
      intervalStage: 1,
      nextReviewDate: nextDate.toISOString(),
      isDueNow: false,
      twistConstraint: twistConstraint || 'Re-solve with shuffled blocks and zero hints.',
    });
  }

  const promoted = evaluateRankPromotion(profile);
  await saveProfile(profile);
  await appendActivity(userId, {
    kind: 'lab-complete',
    label: `Completed 5-Stage Lab: ${problemTitle || problemId}`,
    xp: assemblyErrors === 0 ? 120 : 85,
    score: Math.max(0, 100 - assemblyErrors * 10),
  });

  return res.json({
    profile,
    promoted,
    nextIntervalDays:
      profile.spacedRepetitionQueue.find((q) => q.problemId === problemId)?.intervalStage ?? 1,
  });
});

// GET /api/cognitive/quiz/:topicId
router.get('/quiz/:topicId', async (req: Request, res: Response) => {
  const { topicId } = req.params;
  const quizzes = await loadAllQuizzes();
  const quiz = quizzes.find((q) => q.topicId === topicId);
  if (!quiz) {
    return res.status(404).json({ error: `Quiz for topic "${topicId}" not found` });
  }
  return res.json({ quiz });
});

// GET /api/cognitive/quizzes
router.get('/quizzes', async (_req: Request, res: Response) => {
  const quizzes = await loadAllQuizzes();
  return res.json({ quizzes });
});

// POST /api/cognitive/quiz/submit
router.post('/quiz/submit', async (req: Request, res: Response) => {
  const { topicId, answers } = req.body ?? {};
  const userId = req.authUser!.id;
  const quiz = SEED_TOPIC_QUIZZES.find((q) => q.topicId === topicId);
  if (!quiz) {
    return res.status(404).json({ error: `Quiz "${topicId}" not found` });
  }

  const profile = await getOrCreateProfile(userId);
  let correctCount = 0;
  const breakdown = quiz.questions.map((q) => {
    const selectedOptionId = answers?.[q.id];
    const chosen = q.options.find((o) => o.id === selectedOptionId);
    const isCorrect = Boolean(chosen?.isCorrect);
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      isCorrect,
      feedback: chosen?.cognitiveFeedback || 'No option selected.',
      optimalComplexity: q.optimalComplexity,
    };
  });

  const scorePct = Math.round((correctCount / Math.max(1, quiz.questions.length)) * 100);
  profile.cognitiveMetrics.signalRecognitionScore = Math.min(
    100,
    Math.round(profile.cognitiveMetrics.signalRecognitionScore * 0.5 + scorePct * 0.5)
  );

  const passed = scorePct >= 80;
  if (passed && !profile.passedTopicQuizzes.includes(topicId)) {
    profile.passedTopicQuizzes.push(topicId);
  }

  const promoted = evaluateRankPromotion(profile);
  await saveProfile(profile);
  await appendActivity(userId, {
    kind: 'quiz-submit',
    label: `Topic Quiz: ${quiz.topicTitle} (${scorePct}%)`,
    xp: passed ? 90 : 30,
    score: scorePct,
  });

  return res.json({
    scorePct,
    passed,
    promoted,
    breakdown,
    profile,
  });
});

router.get('/notes', async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  if (isMongoConnected()) {
    const doc = await UserBrainProfileModel.findOne({ userId }).select('notes');
    const notes = doc?.notes instanceof Map
      ? Object.fromEntries(doc.notes.entries())
      : doc?.notes ?? {};
    return res.json({ notes });
  }
  return res.json({ notes: notesStore.get(userId) ?? {} });
});

router.get('/notes/:problemId', async (req: Request, res: Response) => {
  const { problemId } = req.params;
  const userId = req.authUser!.id;
  if (isMongoConnected()) {
    const doc = await UserBrainProfileModel.findOne({ userId });
    const note = doc?.notes?.get(problemId) ?? '';
    return res.json({ note });
  }
  const userNotes = notesStore.get(userId) ?? {};
  return res.json({ note: userNotes[problemId] ?? '' });
});

router.post('/notes', async (req: Request, res: Response) => {
  const { problemId, note = '' } = req.body ?? {};
  const userId = req.authUser!.id;
  if (typeof problemId !== 'string' || !/^[a-zA-Z0-9_-]{1,120}$/.test(problemId)) {
    return res.status(400).json({ error: 'A valid problemId is required' });
  }
  if (typeof note !== 'string' || note.length > 20000) {
    return res.status(400).json({ error: 'Note must be text up to 20,000 characters' });
  }

  if (isMongoConnected()) {
    await getOrCreateProfile(userId);
    await UserBrainProfileModel.updateOne(
      { userId },
      { $set: { [`notes.${problemId}`]: note } }
    );
    return res.json({ ok: true, problemId, note });
  }

  const existing = notesStore.get(userId) ?? {};
  existing[problemId] = note;
  notesStore.set(userId, existing);
  return res.json({ ok: true, problemId, note });
});

// GET /api/cognitive/mastered-problems
router.get('/mastered-problems', async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  if (isMongoConnected()) {
    const profile = await UserBrainProfileModel.findOne({ userId }).select('masteredProblemSlugs');
    return res.json({ masteredProblemSlugs: profile?.masteredProblemSlugs ?? [] });
  }
  return res.json({ masteredProblemSlugs: masteredStore.get(userId) ?? [] });
});

// POST /api/cognitive/mastered-problems
router.post('/mastered-problems', async (req: Request, res: Response) => {
  const { problemSlug } = req.body ?? {};
  const userId = req.authUser!.id;
  if (typeof problemSlug !== 'string' || !/^[a-z0-9-]{2,120}$/.test(problemSlug)) {
    return res.status(400).json({ error: 'A valid problemSlug is required' });
  }
  if (isMongoConnected()) {
    await getOrCreateProfile(userId);
    const profile = await UserBrainProfileModel.findOneAndUpdate(
      { userId },
      { $addToSet: { masteredProblemSlugs: problemSlug } },
      { new: true, projection: { masteredProblemSlugs: 1 } }
    );
    await appendActivity(userId, {
      kind: 'problem-mastered',
      label: `Mastered Big Tech Problem: ${problemSlug}`,
      xp: 60,
    });
    return res.json({ masteredProblemSlugs: profile?.masteredProblemSlugs ?? [problemSlug] });
  }
  const current = masteredStore.get(userId) ?? [];
  if (!current.includes(problemSlug)) current.push(problemSlug);
  masteredStore.set(userId, current);
  await appendActivity(userId, {
    kind: 'problem-mastered',
    label: `Mastered Big Tech Problem: ${problemSlug}`,
    xp: 60,
  });
  return res.json({ masteredProblemSlugs: current });
});

router.post('/warmup/complete', async (req: Request, res: Response) => {
  const { drillId } = req.body ?? {};
  const userId = req.authUser!.id;
  if (!drillId) return res.status(400).json({ error: 'drillId is required' });

  if (isMongoConnected()) {
    await getOrCreateProfile(userId);
    const updated = await UserBrainProfileModel.findOneAndUpdate(
      { userId },
      { $addToSet: { completedWarmupDrills: drillId } },
      { new: true }
    );
    await appendActivity(userId, {
      kind: 'warmup-complete',
      label: `Completed Logic Warmup: ${drillId}`,
      xp: 25,
    });
    return res.json({ completedWarmupDrills: updated?.completedWarmupDrills ?? [drillId] });
  }

  const current = warmupStore.get(userId) ?? [];
  if (!current.includes(drillId)) current.push(drillId);
  warmupStore.set(userId, current);
  await appendActivity(userId, {
    kind: 'warmup-complete',
    label: `Completed Logic Warmup: ${drillId}`,
    xp: 25,
  });
  return res.json({ completedWarmupDrills: current });
});

export default router;
