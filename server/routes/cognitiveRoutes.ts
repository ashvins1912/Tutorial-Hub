import express, { Request, Response } from 'express';
import { INITIAL_BRAIN_PROFILE, SEED_TOPIC_QUIZZES } from '../seed/cognitiveSeed';
import { RankTier, UserBrainProfile } from '../../src/types/dsa';

const router = express.Router();

const RANK_ORDER: RankTier[] = ['Noob', 'Apprentice', 'Practitioner', 'Strategist', 'Pro'];

const RANK_REQUIRED_QUIZZES: Record<RankTier, string> = {
  Noob: 'sliding-window',
  Apprentice: 'monotonic-stack',
  Practitioner: 'binary-search-answer',
  Strategist: 'graph-topo-sort',
  Pro: 'dp-1d',
};

const INTERVAL_PROGRESSION: (1 | 3 | 7 | 21)[] = [1, 3, 7, 21];

// In-memory store initialized from cognitiveSeed (mirrors UserBrainProfile schema)
const profileStore = new Map<string, UserBrainProfile>();

function getOrCreateProfile(userId: string): UserBrainProfile {
  if (!profileStore.has(userId)) {
    profileStore.set(userId, {
      ...INITIAL_BRAIN_PROFILE,
      userId,
      cognitiveMetrics: { ...INITIAL_BRAIN_PROFILE.cognitiveMetrics },
      passedTopicQuizzes: [...INITIAL_BRAIN_PROFILE.passedTopicQuizzes],
      completedProblemIds: [...INITIAL_BRAIN_PROFILE.completedProblemIds],
      spacedRepetitionQueue: INITIAL_BRAIN_PROFILE.spacedRepetitionQueue.map((item) => ({ ...item })),
    });
  }
  return profileStore.get(userId)!;
}

function evaluateRankPromotion(profile: UserBrainProfile): boolean {
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

// GET /api/cognitive/profile/:userId
router.get('/profile/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId || 'learner-default';
  const profile = getOrCreateProfile(userId);
  res.json({ profile });
});

// POST /api/cognitive/complete-problem
router.post('/complete-problem', (req: Request, res: Response) => {
  const {
    userId = 'learner-default',
    problemId,
    problemTitle,
    patternTag,
    twistConstraint,
    dryRunCompleted = true,
    assemblyErrors = 0,
    bottleneckCorrect = true,
  } = req.body ?? {};

  if (!problemId) {
    return res.status(400).json({ error: 'problemId is required' });
  }

  const profile = getOrCreateProfile(userId);

  if (!profile.completedProblemIds.includes(problemId)) {
    profile.completedProblemIds.push(problemId);
  }

  // Update cognitive metrics
  const deltaAssembly = assemblyErrors === 0 ? 8 : Math.max(2, 6 - assemblyErrors * 2);
  profile.cognitiveMetrics.logicAssemblyAccuracy = Math.min(
    100,
    Math.round(profile.cognitiveMetrics.logicAssemblyAccuracy * 0.65 + (100 - assemblyErrors * 10) * 0.35 + (assemblyErrors === 0 ? 3 : 0))
  );
  if (profile.cognitiveMetrics.logicAssemblyAccuracy < 80 && assemblyErrors === 0) {
    profile.cognitiveMetrics.logicAssemblyAccuracy = Math.min(100, profile.cognitiveMetrics.logicAssemblyAccuracy + deltaAssembly);
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

  // Schedule or advance 1-3-7-21 spaced repetition queue
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

  return res.json({
    profile,
    promoted,
    nextIntervalDays: profile.spacedRepetitionQueue.find((q) => q.problemId === problemId)?.intervalStage ?? 1,
  });
});

// GET /api/cognitive/quiz/:topicId
router.get('/quiz/:topicId', (req: Request, res: Response) => {
  const { topicId } = req.params;
  const quiz = SEED_TOPIC_QUIZZES.find((q) => q.topicId === topicId);
  if (!quiz) {
    return res.status(404).json({ error: `Quiz for topic "${topicId}" not found` });
  }
  return res.json({ quiz });
});

// GET /api/cognitive/quizzes (list all seeded topic quizzes)
router.get('/quizzes', (_req: Request, res: Response) => {
  return res.json({ quizzes: SEED_TOPIC_QUIZZES });
});

// POST /api/cognitive/quiz/submit
router.post('/quiz/submit', (req: Request, res: Response) => {
  const { userId = 'learner-default', topicId, answers } = req.body ?? {};
  const quiz = SEED_TOPIC_QUIZZES.find((q) => q.topicId === topicId);
  if (!quiz) {
    return res.status(404).json({ error: `Quiz "${topicId}" not found` });
  }

  const profile = getOrCreateProfile(userId);
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

  return res.json({
    scorePct,
    passed,
    promoted,
    breakdown,
    profile,
  });
});

// In-memory notes & warmup drills per userId
const notesStore = new Map<string, Record<string, string>>();
const warmupStore = new Map<string, string[]>();

router.get('/notes/:userId/:problemId', (req: Request, res: Response) => {
  const { userId, problemId } = req.params;
  const userNotes = notesStore.get(userId) ?? {};
  res.json({ note: userNotes[problemId] ?? '' });
});

router.post('/notes', (req: Request, res: Response) => {
  const { userId = 'learner-default', problemId, note = '' } = req.body ?? {};
  if (!problemId) return res.status(400).json({ error: 'problemId is required' });
  const existing = notesStore.get(userId) ?? {};
  existing[problemId] = note;
  notesStore.set(userId, existing);
  return res.json({ ok: true, problemId, note });
});

router.post('/warmup/complete', (req: Request, res: Response) => {
  const { userId = 'learner-default', drillId } = req.body ?? {};
  if (!drillId) return res.status(400).json({ error: 'drillId is required' });
  const current = warmupStore.get(userId) ?? [];
  if (!current.includes(drillId)) current.push(drillId);
  warmupStore.set(userId, current);
  return res.json({ completedWarmupDrills: current });
});

export default router;
