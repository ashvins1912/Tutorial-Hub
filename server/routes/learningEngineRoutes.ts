import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { isMongoConnected } from '../db/connectMongo';
import { UnifiedLearningRecord } from '../models/UnifiedLearningRecord';
import type {
  AssessmentAttempt,
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
  addVerifiedProblemEvidence,
  computeNextRevisionSchedule,
  computeTopicMastery,
  createEmptyMasteryEvidence,
  createInitialRevisionSchedule,
  scoreAssessmentDimensions,
  scorePatternRecognitionAttempt,
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
    return computeTopicMastery(ev, topic.problems);
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
      const verified = addVerifiedProblemEvidence(next, prob, topic.problems);
      next.implementationsVerified = verified.implementationsVerified;
      next.edgeCasesPassed = verified.edgeCasesPassed;
      next.debuggingExercisesPassed = verified.debuggingExercisesPassed;
      next.tracesCompleted = verified.tracesCompleted;
    }
  }

  const recognitionProblemId = typeof body.patternRecognitionProblemId === 'string' ? body.patternRecognitionProblemId : '';
  const recognitionProblem = topic.problems.find((problem) => problem.id === recognitionProblemId);
  const recognitionAnswers = body.patternRecognitionAnswers;
  if (recognitionProblem?.patternRecognitionPrompt && recognitionAnswers && typeof recognitionAnswers === 'object' && !Array.isArray(recognitionAnswers)) {
    const normalizedAnswers = Object.fromEntries(
      Object.entries(recognitionAnswers as Record<string, unknown>)
        .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    );
    const recognitionScore = scorePatternRecognitionAttempt(
      recognitionProblem.patternRecognitionPrompt,
      normalizedAnswers
    ).weightedScorePct;
    next.patternRecognitionBestPct = Math.max(next.patternRecognitionBestPct, recognitionScore);
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
    mastery: computeTopicMastery(next, topic.problems),
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

  const feedback = assessment.questions.map((q) => {
    const selectedId = typeof answers[q.id] === 'string' ? answers[q.id] : '';
    const option = q.options.find((o) => o.id === selectedId);
    const isCorrect = Boolean(option?.isCorrect);
    const correctOption = q.options.find((o) => o.isCorrect);
    return {
      questionId: q.id,
      isCorrect,
      explanation: option?.explanation ?? correctOption?.explanation ?? '',
      correctOptionId: correctOption?.id ?? '',
    };
  });

  const assessmentScore = scoreAssessmentDimensions(assessment.questions, answers);
  const { scorePct, dimensionScores, correctCount } = assessmentScore;
  const passed = scorePct >= assessment.passingScorePct;

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
  ev.transferAssessmentBestPct = Math.max(ev.transferAssessmentBestPct, dimensionScores.transferAbility ?? 0);
  ev.complexityAnalysisBestPct = Math.max(
    ev.complexityAnalysisBestPct ?? 0,
    dimensionScores.complexityAnalysis ?? 0
  );
  ev.hintsUsedTotal += hintsUsed;
  ev.mistakesCount += assessment.questions.length - correctCount;
  ev.updatedAt = attempt.submittedAt;
  state.evidenceByTopic[topic.id] = ev;

  const existingRev =
    state.revisionsByTopic[topic.id] ?? createInitialRevisionSchedule(topic.id, topic.title);
  state.revisionsByTopic[topic.id] = computeNextRevisionSchedule(existingRev, {
    scorePct,
    hintsUsed,
    timeTakenSec,
    mistakesCount: assessment.questions.length - correctCount,
  });

  await saveLearnerState(userId, state);

  return res.json({
    attempt,
    feedback,
    mastery: computeTopicMastery(ev, topic.problems),
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
