import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { isMongoConnected } from '../db/connectMongo';
import { UnifiedLearningRecord } from '../models/UnifiedLearningRecord';
import type {
  AssessmentAttempt,
  MasteryDimensionId,
  MasteryEvidence,
  RevisionSchedule,
} from '../../shared/learningContract';
import {
  getAllCanonicalProblems,
  getAllCurricula,
  getAllLearningTopics,
  getAssessmentById,
  getCanonicalProblemById,
  getLearningTopicById,
  getLessonById,
  getLessonsByTopicId,
  PATTERN_FORGE_TOPICS,
} from '../../shared/patternForgeCurriculum';
import {
  computeNextRevisionSchedule,
  computeTopicMastery,
  createEmptyMasteryEvidence,
  createInitialRevisionSchedule,
} from '../../shared/masteryEngine';
import { auditCurriculumGovernance } from '../../shared/learningValidator';

const router = express.Router();

interface LearnerLearningState {
  evidenceByTopic: Record<string, MasteryEvidence>;
  assessmentHistory: AssessmentAttempt[];
  revisionsByTopic: Record<string, RevisionSchedule>;
}

// Graceful in-memory fallback when MONGODB_URI is not configured in development
const memoryStore = new Map<string, LearnerLearningState>();

function createEmptyState(): LearnerLearningState {
  return {
    evidenceByTopic: {},
    assessmentHistory: [],
    revisionsByTopic: {},
  };
}

async function loadLearnerState(userId: string): Promise<LearnerLearningState> {
  if (isMongoConnected()) {
    const doc = await UnifiedLearningRecord.findOne({ userId }).lean();
    if (!doc) return createEmptyState();
    return {
      evidenceByTopic: (doc.evidenceByTopic as Record<string, MasteryEvidence>) ?? {},
      assessmentHistory: (doc.assessmentHistory as AssessmentAttempt[]) ?? [],
      revisionsByTopic: (doc.revisionsByTopic as Record<string, RevisionSchedule>) ?? {},
    };
  }
  return memoryStore.get(userId) ?? createEmptyState();
}

async function saveLearnerState(userId: string, state: LearnerLearningState): Promise<void> {
  if (isMongoConnected()) {
    await UnifiedLearningRecord.findOneAndUpdate(
      { userId },
      {
        $set: {
          evidenceByTopic: state.evidenceByTopic,
          assessmentHistory: state.assessmentHistory.slice(-100),
          revisionsByTopic: state.revisionsByTopic,
        },
      },
      { upsert: true, new: true }
    );
    return;
  }
  memoryStore.set(userId, {
    evidenceByTopic: { ...state.evidenceByTopic },
    assessmentHistory: state.assessmentHistory.slice(-100),
    revisionsByTopic: { ...state.revisionsByTopic },
  });
}

// ============================================================================
// Public Read-Only Canonical Curriculum & Governance Endpoints
// ============================================================================

router.get('/curricula', (_req: Request, res: Response) => {
  res.json({ curricula: getAllCurricula() });
});

router.get('/governance', (_req: Request, res: Response) => {
  res.json({ audit: auditCurriculumGovernance() });
});

router.get('/topics', (req: Request, res: Response) => {
  const academyId = typeof req.query.academyId === 'string' ? req.query.academyId : undefined;
  const verificationStatus =
    typeof req.query.verificationStatus === 'string' ? req.query.verificationStatus : undefined;
  const pilotOnly = req.query.pilotOnly === 'true';
  const topics = getAllLearningTopics({ academyId, verificationStatus, pilotOnly });
  res.json({ topics, total: topics.length });
});

router.get('/topics/:id', (req: Request, res: Response) => {
  const topic = getLearningTopicById(req.params.id);
  if (!topic) return res.status(404).json({ code: 'TOPIC_NOT_FOUND', message: 'Learning topic not found.' });
  return res.json({ topic });
});

router.get('/topics/:id/lessons', (req: Request, res: Response) => {
  const topic = getLearningTopicById(req.params.id);
  if (!topic) return res.status(404).json({ code: 'TOPIC_NOT_FOUND', message: 'Learning topic not found.' });
  return res.json({ lessons: getLessonsByTopicId(topic.id) });
});

router.get('/lessons/:id', (req: Request, res: Response) => {
  const lesson = getLessonById(req.params.id);
  if (!lesson) return res.status(404).json({ code: 'LESSON_NOT_FOUND', message: 'Lesson not found.' });
  return res.json({ lesson });
});

router.get('/problems', (req: Request, res: Response) => {
  const topicId = typeof req.query.topicId === 'string' ? req.query.topicId : undefined;
  const problems = getAllCanonicalProblems(topicId);
  res.json({ problems, total: problems.length });
});

router.get('/problems/:id', (req: Request, res: Response) => {
  const problem = getCanonicalProblemById(req.params.id);
  if (!problem) return res.status(404).json({ code: 'PROBLEM_NOT_FOUND', message: 'Canonical problem not found.' });
  return res.json({ problem });
});

// ============================================================================
// Authenticated Learner Mastery, Assessments & Adaptive Revision Endpoints
// ============================================================================

router.get('/mastery', requireAuth, async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const state = await loadLearnerState(userId);
  const summaries = PATTERN_FORGE_TOPICS.map((topic) => {
    const ev =
      state.evidenceByTopic[topic.id] ??
      createEmptyMasteryEvidence(topic.id, topic.version.version);
    return computeTopicMastery(ev);
  });
  return res.json({
    mastery: summaries,
    assessmentHistory: state.assessmentHistory,
  });
});

router.post('/mastery/evidence', requireAuth, async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const body = req.body as Record<string, unknown>;
  const topicId = typeof body?.topicId === 'string' ? body.topicId : '';
  const topic = getLearningTopicById(topicId);
  if (!topic) return res.status(404).json({ code: 'TOPIC_NOT_FOUND', message: 'Topic not found.' });

  const state = await loadLearnerState(userId);
  const current =
    state.evidenceByTopic[topic.id] ??
    createEmptyMasteryEvidence(topic.id, topic.version.version);

  const next: MasteryEvidence = {
    ...current,
    contentVersion: topic.version.version,
    updatedAt: new Date().toISOString(),
  };

  if (body.understandCompleted === true) next.understandCompleted = true;
  if (body.conceptCheckPassed === true) next.conceptCheckPassed = true;
  if (body.complexityCheckPassed === true) next.complexityCheckPassed = true;

  if (typeof body.traceCompletedId === 'string' && topic.traceIds.includes(body.traceCompletedId)) {
    if (!next.tracesCompleted.includes(body.traceCompletedId)) {
      next.tracesCompleted = [...next.tracesCompleted, body.traceCompletedId];
    }
  }

  if (typeof body.checkpointCorrect === 'boolean') {
    next.predictionCheckpointsTotal += 1;
    if (body.checkpointCorrect) next.predictionCheckpointsCorrect += 1;
    else next.mistakesCount += 1;
  }

  if (typeof body.verifiedProblemId === 'string') {
    const prob = topic.problems.find((p) => p.id === body.verifiedProblemId);
    if (prob) {
      if (!next.implementationsVerified.includes(prob.id)) {
        next.implementationsVerified = [...next.implementationsVerified, prob.id];
      }
      const edgeCount = prob.testSuite.cases.filter((c) => c.isEdgeCase || c.isBoundary).length;
      next.edgeCasesPassed = Math.max(next.edgeCasesPassed, next.edgeCasesPassed + edgeCount);
      if (prob.category === 'debugging' && !next.debuggingExercisesPassed.includes(prob.id)) {
        next.debuggingExercisesPassed = [...next.debuggingExercisesPassed, prob.id];
      }
    }
  }

  if (typeof body.patternRecognitionScorePct === 'number' && Number.isFinite(body.patternRecognitionScorePct)) {
    const pct = Math.max(0, Math.min(100, Math.round(body.patternRecognitionScorePct)));
    next.patternRecognitionBestPct = Math.max(next.patternRecognitionBestPct, pct);
    if (pct >= 75) next.complexityCheckPassed = true;
  }

  if (typeof body.hintsUsedDelta === 'number' && body.hintsUsedDelta > 0) {
    next.hintsUsedTotal += Math.min(10, Math.trunc(body.hintsUsedDelta));
  }

  state.evidenceByTopic[topic.id] = next;

  // Ensure topic enters spaced-revision schedule once substantive practice begins
  if (
    !state.revisionsByTopic[topic.id] &&
    (next.implementationsVerified.length > 0 || next.conceptCheckPassed)
  ) {
    state.revisionsByTopic[topic.id] = createInitialRevisionSchedule(topic.id, topic.title);
  }

  await saveLearnerState(userId, state);

  return res.json({
    ok: true,
    mastery: computeTopicMastery(next),
    revision: state.revisionsByTopic[topic.id] ?? null,
  });
});

router.post('/assessments/:id/attempts', requireAuth, async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const found = getAssessmentById(req.params.id);
  if (!found) {
    return res.status(404).json({ code: 'ASSESSMENT_NOT_FOUND', message: 'Assessment not found.' });
  }

  const { topic, assessment } = found;
  const body = (req.body ?? {}) as {
    answers?: Record<string, string>;
    hintsUsed?: number;
    timeTakenSec?: number;
  };
  const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
  const hintsUsed = typeof body.hintsUsed === 'number' ? Math.max(0, Math.trunc(body.hintsUsed)) : 0;
  const timeTakenSec = typeof body.timeTakenSec === 'number' ? Math.max(1, Math.trunc(body.timeTakenSec)) : 60;

  let correct = 0;
  const dimTotals = new Map<MasteryDimensionId, { correct: number; total: number }>();

  const feedback = assessment.questions.map((q) => {
    const selectedId = typeof answers[q.id] === 'string' ? answers[q.id] : '';
    const option = q.options.find((o) => o.id === selectedId);
    const isCorrect = Boolean(option?.isCorrect);
    if (isCorrect) correct += 1;

    const prevDim = dimTotals.get(q.dimension) ?? { correct: 0, total: 0 };
    prevDim.total += 1;
    if (isCorrect) prevDim.correct += 1;
    dimTotals.set(q.dimension, prevDim);

    const correctOption = q.options.find((o) => o.isCorrect);
    return {
      questionId: q.id,
      isCorrect,
      explanation: option?.explanation ?? correctOption?.explanation ?? '',
      correctOptionId: correctOption?.id ?? '',
    };
  });

  const scorePct = assessment.questions.length > 0 ? Math.round((correct / assessment.questions.length) * 100) : 0;
  const passed = scorePct >= assessment.passingScorePct;
  const dimensionScores: Partial<Record<MasteryDimensionId, number>> = {};
  for (const [dim, stats] of dimTotals.entries()) {
    dimensionScores[dim] = Math.round((stats.correct / stats.total) * 100);
  }

  const attempt: AssessmentAttempt = {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    assessmentId: assessment.id,
    topicId: topic.id,
    contentVersion: topic.version.version,
    kind: assessment.kind,
    submittedAt: new Date().toISOString(),
    scorePct,
    passed,
    hintsUsed,
    timeTakenSec,
    dimensionScores,
    answers,
  };

  const state = await loadLearnerState(userId);
  state.assessmentHistory = [...state.assessmentHistory, attempt];

  const ev =
    state.evidenceByTopic[topic.id] ??
    createEmptyMasteryEvidence(topic.id, topic.version.version);
  ev.transferAssessmentBestPct = Math.max(ev.transferAssessmentBestPct, scorePct);
  if ((dimensionScores.complexityAnalysis ?? 0) >= 80) {
    ev.complexityCheckPassed = true;
  }
  ev.hintsUsedTotal += hintsUsed;
  ev.mistakesCount += assessment.questions.length - correct;
  ev.updatedAt = attempt.submittedAt;
  state.evidenceByTopic[topic.id] = ev;

  const existingRev =
    state.revisionsByTopic[topic.id] ?? createInitialRevisionSchedule(topic.id, topic.title);
  state.revisionsByTopic[topic.id] = computeNextRevisionSchedule(existingRev, {
    scorePct,
    hintsUsed,
    timeTakenSec,
    mistakesCount: assessment.questions.length - correct,
  });

  await saveLearnerState(userId, state);

  return res.json({
    attempt,
    feedback,
    mastery: computeTopicMastery(ev),
    revision: state.revisionsByTopic[topic.id],
  });
});

router.get('/revisions', requireAuth, async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const state = await loadLearnerState(userId);
  const nowMs = Date.now();
  const revisions = Object.values(state.revisionsByTopic)
    .map((rev) => ({
      ...rev,
      status:
        rev.status === 'needs-reinforcement'
          ? 'needs-reinforcement'
          : new Date(rev.dueAt).getTime() <= nowMs
            ? 'due'
            : 'scheduled',
    }))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  return res.json({ revisions });
});

router.post('/revisions/:id/attempts', requireAuth, async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const state = await loadLearnerState(userId);
  const targetRev = Object.values(state.revisionsByTopic).find(
    (r) => r.id === req.params.id || r.topicId === req.params.id
  );
  if (!targetRev) {
    return res.status(404).json({ code: 'REVISION_NOT_FOUND', message: 'Revision schedule not found.' });
  }

  const body = (req.body ?? {}) as {
    scorePct?: number;
    hintsUsed?: number;
    timeTakenSec?: number;
    mistakesCount?: number;
  };
  const scorePct = typeof body.scorePct === 'number' ? Math.max(0, Math.min(100, Math.round(body.scorePct))) : 0;
  const hintsUsed = typeof body.hintsUsed === 'number' ? Math.max(0, Math.trunc(body.hintsUsed)) : 0;
  const timeTakenSec = typeof body.timeTakenSec === 'number' ? Math.max(1, Math.trunc(body.timeTakenSec)) : 60;
  const mistakesCount = typeof body.mistakesCount === 'number' ? Math.max(0, Math.trunc(body.mistakesCount)) : 0;

  const updated = computeNextRevisionSchedule(targetRev, {
    scorePct,
    hintsUsed,
    timeTakenSec,
    mistakesCount,
  });
  state.revisionsByTopic[updated.topicId] = updated;

  const topic = getLearningTopicById(updated.topicId);
  const ev =
    state.evidenceByTopic[updated.topicId] ??
    createEmptyMasteryEvidence(updated.topicId, topic?.version.version ?? '1.0.0');
  if (scorePct >= 80 && hintsUsed === 0) {
    ev.delayedRecallPassedCount += 1;
  }
  ev.updatedAt = new Date().toISOString();
  state.evidenceByTopic[updated.topicId] = ev;

  await saveLearnerState(userId, state);

  return res.json({
    ok: true,
    revision: updated,
    mastery: computeTopicMastery(ev),
  });
});

export default router;
