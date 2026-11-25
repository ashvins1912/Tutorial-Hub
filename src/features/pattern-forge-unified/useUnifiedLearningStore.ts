import { create } from 'zustand';
import { apiFetch } from '../../lib/apiFetch';
import type {
  AssessmentAttempt,
  LessonStageId,
  MasteryEvidence,
  RevisionSchedule,
  TopicMasterySummary,
} from '../../../shared/learningContract';
import {
  addVerifiedProblemEvidence,
  computeNextRevisionSchedule,
  computeTopicMastery,
  createEmptyMasteryEvidence,
  createInitialRevisionSchedule,
  scoreAssessmentDimensions,
  recordPredictionCheckpointEvidence,
  scorePatternRecognitionAttempt,
} from '../../../shared/masteryEngine';
import {
  getLearningTopicById,
  PATTERN_FORGE_TOPICS,
} from '../../../shared/patternForgeCurriculum';
import { buildLearningTrace } from '../../../shared/traceEngine';

const LOCAL_STORAGE_KEY = 'tutorial_hub_unified_learning_v1';

interface PersistedLocalPayload {
  evidenceByTopic: Record<string, MasteryEvidence>;
  assessmentHistory: AssessmentAttempt[];
  revisionsByTopic: Record<string, RevisionSchedule>;
}

function readLocalPayload(): PersistedLocalPayload {
  if (typeof window === 'undefined') {
    return { evidenceByTopic: {}, assessmentHistory: [], revisionsByTopic: {} };
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return { evidenceByTopic: {}, assessmentHistory: [], revisionsByTopic: {} };
    const parsed = JSON.parse(raw) as Partial<PersistedLocalPayload>;
    return {
      evidenceByTopic: parsed.evidenceByTopic ?? {},
      assessmentHistory: Array.isArray(parsed.assessmentHistory) ? parsed.assessmentHistory : [],
      revisionsByTopic: parsed.revisionsByTopic ?? {},
    };
  } catch {
    return { evidenceByTopic: {}, assessmentHistory: [], revisionsByTopic: {} };
  }
}

function writeLocalPayload(payload: PersistedLocalPayload) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage quota failures
  }
}

export interface RecordEvidencePayload {
  topicId: string;
  understandCompleted?: boolean;
  conceptCheckPassed?: boolean;
  traceCompletedId?: string;
  checkpointCorrect?: boolean;
  checkpointId?: string;
  checkpointTraceId?: string;
  verifiedProblemId?: string;
  patternRecognitionProblemId?: string;
  patternRecognitionAnswers?: Record<string, string>;
  hintsUsedDelta?: number;
}

interface UnifiedLearningStoreState {
  activeTopicId: string;
  activeStage: LessonStageId;
  activeWorkspaceTab: 'learn' | 'governance' | 'revisions';
  evidenceByTopic: Record<string, MasteryEvidence>;
  assessmentHistory: AssessmentAttempt[];
  revisionsByTopic: Record<string, RevisionSchedule>;
  hydrated: boolean;

  setActiveTopicId: (topicId: string, stage?: LessonStageId) => void;
  setActiveStage: (stage: LessonStageId) => void;
  setActiveWorkspaceTab: (tab: 'learn' | 'governance' | 'revisions') => void;
  hydrateFromServer: () => Promise<void>;
  getTopicMastery: (topicId: string) => TopicMasterySummary;
  recordEvidence: (payload: RecordEvidencePayload) => Promise<void>;
  submitAssessmentAttempt: (
    assessmentId: string,
    topicId: string,
    answers: Record<string, string>,
    meta: { hintsUsed: number; timeTakenSec: number }
  ) => Promise<{
    attempt: AssessmentAttempt;
    feedback: Array<{
      questionId: string;
      isCorrect: boolean;
      explanation: string;
      correctOptionId: string;
    }>;
  } | null>;
  submitRevisionAttempt: (
    topicId: string,
    input: { scorePct: number; hintsUsed: number; timeTakenSec: number; mistakesCount: number }
  ) => Promise<RevisionSchedule | null>;
}

const initialLocal = readLocalPayload();

export const useUnifiedLearningStore = create<UnifiedLearningStoreState>((set, get) => ({
  activeTopicId: 'hashmap-hashset-lookup',
  activeStage: 'understand',
  activeWorkspaceTab: 'learn',
  evidenceByTopic: initialLocal.evidenceByTopic,
  assessmentHistory: initialLocal.assessmentHistory,
  revisionsByTopic: initialLocal.revisionsByTopic,
  hydrated: false,

  setActiveTopicId: (topicId, stage = 'understand') =>
    set((state) => {
      if (
        state.activeTopicId === topicId &&
        state.activeStage === stage &&
        state.activeWorkspaceTab === 'learn'
      ) {
        return state;
      }
      return { activeTopicId: topicId, activeStage: stage, activeWorkspaceTab: 'learn' };
    }),

  setActiveStage: (stage) => set({ activeStage: stage }),

  setActiveWorkspaceTab: (tab) => set({ activeWorkspaceTab: tab }),

  hydrateFromServer: async () => {
    try {
      const [masteryRes, revRes] = await Promise.all([
        apiFetch('/api/learning/mastery'),
        apiFetch('/api/learning/revisions'),
      ]);
      if (masteryRes.ok) {
        const data = (await masteryRes.json()) as {
          mastery?: TopicMasterySummary[];
          assessmentHistory?: AssessmentAttempt[];
        };
        const nextEvidence: Record<string, MasteryEvidence> = { ...get().evidenceByTopic };
        for (const item of data.mastery ?? []) {
          if (item.evidence && item.evidence.updatedAt) {
            nextEvidence[item.topicId] = item.evidence;
          }
        }
        const nextRevisions: Record<string, RevisionSchedule> = { ...get().revisionsByTopic };
        if (revRes.ok) {
          const revData = (await revRes.json()) as { revisions?: RevisionSchedule[] };
          for (const rev of revData.revisions ?? []) {
            nextRevisions[rev.topicId] = rev;
          }
        }
        const nextHistory = Array.isArray(data.assessmentHistory) && data.assessmentHistory.length > 0
          ? data.assessmentHistory
          : get().assessmentHistory;

        set({
          evidenceByTopic: nextEvidence,
          assessmentHistory: nextHistory,
          revisionsByTopic: nextRevisions,
          hydrated: true,
        });
        writeLocalPayload({
          evidenceByTopic: nextEvidence,
          assessmentHistory: nextHistory,
          revisionsByTopic: nextRevisions,
        });
        return;
      }
    } catch {
      // Offline / local fallback remains authoritative
    }
    set({ hydrated: true });
  },

  getTopicMastery: (topicId) => {
    const topic = getLearningTopicById(topicId);
    const existing =
      get().evidenceByTopic[topicId] ??
      createEmptyMasteryEvidence(topicId, topic?.version.version ?? '1.0.0');
    return computeTopicMastery(existing, topic?.problems);
  },

  recordEvidence: async (payload) => {
    const topic = getLearningTopicById(payload.topicId);
    if (!topic) return;

    const current =
      get().evidenceByTopic[topic.id] ??
      createEmptyMasteryEvidence(topic.id, topic.version.version);

    const next: MasteryEvidence = {
      ...current,
      contentVersion: topic.version.version,
      updatedAt: new Date().toISOString(),
    };

    if (payload.understandCompleted) next.understandCompleted = true;
    if (payload.conceptCheckPassed) next.conceptCheckPassed = true;

    if (payload.traceCompletedId && !next.tracesCompleted.includes(payload.traceCompletedId)) {
      next.tracesCompleted = [...next.tracesCompleted, payload.traceCompletedId];
    }

    if (typeof payload.checkpointCorrect === 'boolean') {
      const hasCheckpointIdentity = typeof payload.checkpointId === 'string' || typeof payload.checkpointTraceId === 'string';
      const traceId = payload.checkpointTraceId;
      const checkpointId = payload.checkpointId;
      const trace = typeof traceId === 'string' && topic.traceIds.includes(traceId)
        ? buildLearningTrace(traceId)
        : null;
      const checkpointIsCanonical = typeof checkpointId === 'string' &&
        Boolean(trace?.steps.some((step) => step.checkpoint?.id === checkpointId));
      if (!hasCheckpointIdentity || checkpointIsCanonical) {
        const checkpointEvidence = recordPredictionCheckpointEvidence(
          next,
          checkpointIsCanonical && typeof traceId === 'string' && typeof checkpointId === 'string'
            ? `${traceId}:${checkpointId}`
            : undefined,
          payload.checkpointCorrect
        );
        next.predictionCheckpointResults = checkpointEvidence.predictionCheckpointResults;
        next.predictionCheckpointsTotal = checkpointEvidence.predictionCheckpointsTotal;
        next.predictionCheckpointsCorrect = checkpointEvidence.predictionCheckpointsCorrect;
        next.mistakesCount = checkpointEvidence.mistakesCount;
      }
    }

    if (payload.verifiedProblemId) {
      const prob = topic.problems.find((p) => p.id === payload.verifiedProblemId);
      if (prob) {
        const verified = addVerifiedProblemEvidence(next, prob, topic.problems);
        next.implementationsVerified = verified.implementationsVerified;
        next.edgeCasesPassed = verified.edgeCasesPassed;
        next.debuggingExercisesPassed = verified.debuggingExercisesPassed;
        next.tracesCompleted = verified.tracesCompleted;
      }
    }

    if (payload.patternRecognitionProblemId && payload.patternRecognitionAnswers) {
      const recognitionProblem = topic.problems.find((problem) => problem.id === payload.patternRecognitionProblemId);
      if (recognitionProblem?.patternRecognitionPrompt) {
        const recognitionScore = scorePatternRecognitionAttempt(
          recognitionProblem.patternRecognitionPrompt,
          payload.patternRecognitionAnswers
        ).weightedScorePct;
        next.patternRecognitionBestPct = Math.max(next.patternRecognitionBestPct, recognitionScore);
      }
    }

    if (typeof payload.hintsUsedDelta === 'number' && payload.hintsUsedDelta > 0) {
      next.hintsUsedTotal += payload.hintsUsedDelta;
    }

    const nextEvidenceMap = { ...get().evidenceByTopic, [topic.id]: next };
    const nextRevisions = { ...get().revisionsByTopic };
    if (
      !nextRevisions[topic.id] &&
      (next.implementationsVerified.length > 0 || next.conceptCheckPassed)
    ) {
      nextRevisions[topic.id] = createInitialRevisionSchedule(topic.id, topic.title);
    }

    set({ evidenceByTopic: nextEvidenceMap, revisionsByTopic: nextRevisions });
    writeLocalPayload({
      evidenceByTopic: nextEvidenceMap,
      assessmentHistory: get().assessmentHistory,
      revisionsByTopic: nextRevisions,
    });

    try {
      const res = await apiFetch('/api/learning/mastery/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          mastery?: TopicMasterySummary;
          revision?: RevisionSchedule | null;
        };
        if (data.mastery?.evidence) {
          const syncedEvidence = {
            ...get().evidenceByTopic,
            [topic.id]: data.mastery.evidence,
          };
          const syncedRevisions = data.revision
            ? { ...get().revisionsByTopic, [topic.id]: data.revision }
            : get().revisionsByTopic;
          set({ evidenceByTopic: syncedEvidence, revisionsByTopic: syncedRevisions });
          writeLocalPayload({
            evidenceByTopic: syncedEvidence,
            assessmentHistory: get().assessmentHistory,
            revisionsByTopic: syncedRevisions,
          });
        }
      }
    } catch {
      // Local state already persisted
    }
  },

  submitAssessmentAttempt: async (assessmentId, topicId, answers, meta) => {
    const topic = getLearningTopicById(topicId);
    const assessment = topic?.assessments.find((a) => a.id === assessmentId);
    if (!topic || !assessment) return null;

    // Try authoritative server grading first
    try {
      const res = await apiFetch(`/api/learning/assessments/${encodeURIComponent(assessmentId)}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, hintsUsed: meta.hintsUsed, timeTakenSec: meta.timeTakenSec }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          attempt: AssessmentAttempt;
          feedback: Array<{
            questionId: string;
            isCorrect: boolean;
            explanation: string;
            correctOptionId: string;
          }>;
          mastery: TopicMasterySummary;
          revision: RevisionSchedule;
        };
        const nextEvidence = { ...get().evidenceByTopic, [topic.id]: data.mastery.evidence };
        const nextHistory = [...get().assessmentHistory, data.attempt];
        const nextRevisions = { ...get().revisionsByTopic, [topic.id]: data.revision };
        set({
          evidenceByTopic: nextEvidence,
          assessmentHistory: nextHistory,
          revisionsByTopic: nextRevisions,
        });
        writeLocalPayload({
          evidenceByTopic: nextEvidence,
          assessmentHistory: nextHistory,
          revisionsByTopic: nextRevisions,
        });
        return { attempt: data.attempt, feedback: data.feedback };
      }
    } catch {
      // Fall back to deterministic client grading
    }

    let correct = 0;
    const feedback = assessment.questions.map((q) => {
      const chosen = q.options.find((o) => o.id === answers[q.id]);
      const right = q.options.find((o) => o.isCorrect);
      const isCorrect = Boolean(chosen?.isCorrect);
      if (isCorrect) correct += 1;
      return {
        questionId: q.id,
        isCorrect,
        explanation: chosen?.explanation ?? right?.explanation ?? '',
        correctOptionId: right?.id ?? '',
      };
    });

    const assessmentScore = scoreAssessmentDimensions(assessment.questions, answers);
    const scorePct = assessmentScore.scorePct;
    const attempt: AssessmentAttempt = {
      id: `local-att-${Date.now()}`,
      assessmentId,
      topicId,
      contentVersion: topic.version.version,
      kind: assessment.kind,
      submittedAt: new Date().toISOString(),
      scorePct,
      passed: scorePct >= assessment.passingScorePct,
      hintsUsed: meta.hintsUsed,
      timeTakenSec: meta.timeTakenSec,
      dimensionScores: assessmentScore.dimensionScores,
      answers,
    };

    const currentEv =
      get().evidenceByTopic[topic.id] ??
      createEmptyMasteryEvidence(topic.id, topic.version.version);
    const nextEv: MasteryEvidence = {
      ...currentEv,
      transferAssessmentBestPct: Math.max(currentEv.transferAssessmentBestPct, assessmentScore.dimensionScores.transferAbility ?? 0),
      complexityAnalysisBestPct: Math.max(currentEv.complexityAnalysisBestPct ?? 0, assessmentScore.dimensionScores.complexityAnalysis ?? 0),
      hintsUsedTotal: currentEv.hintsUsedTotal + meta.hintsUsed,
      mistakesCount: currentEv.mistakesCount + (assessment.questions.length - correct),
      updatedAt: attempt.submittedAt,
    };

    const existingRev =
      get().revisionsByTopic[topic.id] ?? createInitialRevisionSchedule(topic.id, topic.title);
    const nextRev = computeNextRevisionSchedule(existingRev, {
      scorePct,
      hintsUsed: meta.hintsUsed,
      timeTakenSec: meta.timeTakenSec,
      mistakesCount: assessment.questions.length - correct,
    });

    const nextEvidence = { ...get().evidenceByTopic, [topic.id]: nextEv };
    const nextHistory = [...get().assessmentHistory, attempt];
    const nextRevisions = { ...get().revisionsByTopic, [topic.id]: nextRev };
    set({
      evidenceByTopic: nextEvidence,
      assessmentHistory: nextHistory,
      revisionsByTopic: nextRevisions,
    });
    writeLocalPayload({
      evidenceByTopic: nextEvidence,
      assessmentHistory: nextHistory,
      revisionsByTopic: nextRevisions,
    });

    return { attempt, feedback };
  },

  submitRevisionAttempt: async (topicId, input) => {
    const topic = getLearningTopicById(topicId) ?? PATTERN_FORGE_TOPICS[0];
    const existing =
      get().revisionsByTopic[topic.id] ?? createInitialRevisionSchedule(topic.id, topic.title);
    const nextRev = computeNextRevisionSchedule(existing, input);

    const currentEv =
      get().evidenceByTopic[topic.id] ??
      createEmptyMasteryEvidence(topic.id, topic.version.version);
    const nextEv: MasteryEvidence = {
      ...currentEv,
      delayedRecallPassedCount:
        input.scorePct >= 80 && input.hintsUsed === 0
          ? currentEv.delayedRecallPassedCount + 1
          : currentEv.delayedRecallPassedCount,
      updatedAt: new Date().toISOString(),
    };

    const nextEvidence = { ...get().evidenceByTopic, [topic.id]: nextEv };
    const nextRevisions = { ...get().revisionsByTopic, [topic.id]: nextRev };
    set({ evidenceByTopic: nextEvidence, revisionsByTopic: nextRevisions });
    writeLocalPayload({
      evidenceByTopic: nextEvidence,
      assessmentHistory: get().assessmentHistory,
      revisionsByTopic: nextRevisions,
    });

    try {
      await apiFetch(`/api/learning/revisions/${encodeURIComponent(existing.id)}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
    } catch {
      // Already updated locally
    }

    return nextRev;
  },
}));
