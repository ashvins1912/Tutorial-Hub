import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { isMongoConnected } from '../db/connectMongo';
import { UserAccount } from '../models/UserAccount';
import { IUserPreferences, UserBrainProfile } from '../models/UserBrainProfile';
import { CompanySprint } from '../models/CompanySprint';
import { CommunityPost } from '../models/CommunityPost';
import { getAllUserLearningStates } from './userStateRoutes';
import { getDevCognitiveExtras } from './cognitiveRoutes';
import { BIG_TECH_PROBLEMS } from '../seed/bigTechTopicSeed';
import { SEED_TOPIC_QUIZZES } from '../seed/cognitiveSeed';
import { computeSprintMetrics } from '../services/sprintGeneratorService';
import { PROBLEMS } from '../../src/data/problems';
import {
  MASTER_13_TOPIC_BANK,
  PRODUCT_COMPANY_HIGH_YIELD,
} from '../../src/data/productCompanyMasterBank';
import type { BigTechCompany, RankTier } from '../../src/types/dsa';

const PRODUCT_BANK_TOTAL =
  PRODUCT_COMPANY_HIGH_YIELD.length +
  MASTER_13_TOPIC_BANK.reduce((acc, section) => acc + section.problems.length, 0);

const router = express.Router();
router.use(requireAuth);

const devPrefsStore = new Map<string, { fullName?: string; preferences: IUserPreferences }>();

const DEFAULT_PREFS: IUserPreferences = {
  targetRole: 'Senior Software Engineer',
  targetCompany: 'Google',
  dailyGoalMinutes: 60,
  preferredLanguage: 'python',
  bio: '',
};

const RANK_ORDER: RankTier[] = ['Noob', 'Apprentice', 'Practitioner', 'Strategist', 'Pro'];
const RANK_XP_THRESHOLDS: Record<RankTier, number> = {
  Noob: 0,
  Apprentice: 400,
  Practitioner: 1000,
  Strategist: 1900,
  Pro: 3200,
};

const PERSISTED_KEY_LABELS: Record<string, { label: string; category: string }> = {
  'problem-progress': { label: '5-Stage Interactive Lab State', category: 'Core Lab' },
  'xray-decoded-constraints': { label: 'Constraint-to-Complexity Unlocks', category: 'Stage 1' },
  'active-recall-unlocked': { label: 'Active Recall Synthesis Unlocks', category: 'Stage 3' },
  'product-company-solved': { label: 'Product-Company Master Bank', category: 'Interview Bank' },
  'dp-practice-completed': { label: 'DP Learning Lab Progress', category: 'Dynamic Programming' },
  'matrix-problems-completed': { label: 'Matrix Problem Bank Progress', category: 'Matrices' },
  'algorithms-implemented': { label: 'Algorithms Studio Implementations', category: 'Algorithms' },
  'fuzzy-modules-completed': { label: 'N-Gram / Fuzzy Curriculum Track', category: 'Search & N-Gram' },
  'system-design-academy-progress': { label: 'System Design Academy Modules', category: 'System Design' },
  'system-design-roadmap-progress': { label: 'System Design & Distributed Algos Roadmap', category: 'System Design' },
  'ood-mastery-progress': { label: 'OOPs, SOLID & OOD Visual Studio', category: 'OOD & Principles' },
  'ai-engineering-progress': { label: 'AI Engineering 5-Phase Studio', category: 'AI Engineering' },
  'topic-expertise-checks': { label: 'Topic Expertise Playbook Checks', category: 'Curriculum' },
  'mutation-graph-solved': { label: 'Mutation Graph & Ladder Milestones', category: 'Curriculum' },
  'solver-adaptive-telemetry': { label: 'Universal Solver SM-2 & Micro-Drills', category: 'Logic Solver' },
  'engine-custom-concepts': { label: 'Custom Knowledge Engine Concepts', category: 'Concept Engine' },
  'engine-concept-mastery': { label: 'Concept Engine Mastery Snapshots', category: 'Concept Engine' },
  'ui-preferences': { label: 'Workspace Preferences (Theme & Language)', category: 'Preferences' },
};

function countArrayItems(val: unknown): number {
  return Array.isArray(val) ? val.length : 0;
}

function countTruthyRecord(val: unknown): number {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return 0;
  let total = 0;
  for (const v of Object.values(val as Record<string, unknown>)) {
    if (Array.isArray(v)) {
      total += v.filter(Boolean).length;
    } else if (v) {
      total += 1;
    }
  }
  return total;
}

function summarizePayloadCount(key: string, val: unknown): number {
  if (Array.isArray(val)) return val.length;
  if (!val || typeof val !== 'object') return val ? 1 : 0;
  if (key === 'problem-progress') {
    const entries = Object.values(val as Record<string, Record<string, unknown>>);
    return entries.filter(
      (e) =>
        e &&
        (e.quizSolved ||
          e.sandboxSolved ||
          e.invariantSolved ||
          e.bottleneckSolved ||
          e.feynmanCompleted ||
          (Array.isArray(e.exploredSignals) && e.exploredSignals.length > 1))
    ).length;
  }
  if (key === 'system-design-academy-progress') {
    const entries = Object.values(val as Record<string, { done?: boolean; note?: string }>);
    return entries.filter((e) => e?.done || (e?.note && e.note.trim().length > 0)).length;
  }
  if (key === 'system-design-roadmap-progress') {
    const r = val as {
      completedFrameworkSteps?: unknown[];
      reviewedModules?: unknown[];
      reviewedAlgos?: unknown[];
      quizAnswers?: Record<string, unknown>;
    };
    return (
      (Array.isArray(r.completedFrameworkSteps) ? r.completedFrameworkSteps.length : 0) +
      (Array.isArray(r.reviewedModules) ? r.reviewedModules.length : 0) +
      (Array.isArray(r.reviewedAlgos) ? r.reviewedAlgos.length : 0) +
      (r.quizAnswers && typeof r.quizAnswers === 'object' ? Object.keys(r.quizAnswers).length : 0)
    );
  }
  if (key === 'solver-adaptive-telemetry') {
    const t = val as {
      completedProblemIds?: unknown[];
      microDrills?: unknown[];
      drops?: unknown[];
    };
    return (
      (Array.isArray(t.completedProblemIds) ? t.completedProblemIds.length : 0) +
      (Array.isArray(t.microDrills) ? t.microDrills.length : 0) +
      (Array.isArray(t.drops) ? t.drops.length : 0)
    );
  }
  if (key === 'ai-engineering-progress') {
    const ai = val as { completedPhases?: unknown[]; solvedQuizIds?: unknown[] };
    return (
      (Array.isArray(ai.completedPhases) ? ai.completedPhases.length : 0) +
      (Array.isArray(ai.solvedQuizIds) ? ai.solvedQuizIds.length : 0)
    );
  }
  return countTruthyRecord(val);
}

// GET /api/profile/stats — Comprehensive database-backed learner profile & telemetry
router.get('/stats', async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const authEmail = req.authUser!.email ?? '';
  const authMeta = req.authUser!.userMetadata ?? {};
  const mongoReady = isMongoConnected();

  // 1. Account + Brain Profile + Sprint + All UserLearningState records
  let accountInfo = {
    id: userId,
    email: authEmail,
    fullName: String(authMeta.full_name ?? authMeta.name ?? ''),
    avatarUrl: String(authMeta.avatar_url ?? authMeta.picture ?? ''),
    memberSince: new Date().toISOString(),
    lastSignInAt: new Date().toISOString(),
  };

  let currentTier: RankTier = 'Noob';
  let cognitiveMetrics = {
    signalRecognitionScore: 0,
    bottleneckDiagnosisScore: 0,
    logicAssemblyAccuracy: 0,
    paperDryRunStreak: 0,
  };
  let passedTopicQuizzes: string[] = [];
  let completedProblemIds: string[] = [];
  let completedWarmupDrills: string[] = [];
  let masteredProblemSlugs: string[] = [];
  let notesObj: Record<string, string> = {};
  let spacedRepetitionQueue: {
    problemId: string;
    problemTitle: string;
    patternTag: string;
    intervalStage: 1 | 3 | 7 | 21;
    nextReviewDate: string;
    isDueNow: boolean;
    twistConstraint: string;
  }[] = [];
  let activityLog: { date: string; kind: string; label: string; xp: number; score?: number }[] = [];
  let preferences: IUserPreferences = { ...DEFAULT_PREFS };
  let activeSprintSummary: {
    targetCompany: string;
    currentDay: number;
    dailyMinutesBudget: number;
    completionPct: number;
    readinessScore: number;
    tasksCompleted: number;
    totalTasks: number;
  } | null = null;

  if (mongoReady) {
    const [accountDoc, profileDoc, sprintDoc] = await Promise.all([
      UserAccount.findOne({ supabaseUserId: userId }).lean(),
      UserBrainProfile.findOne({ userId }).lean(),
      CompanySprint.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    ]);

    if (accountDoc) {
      accountInfo = {
        id: accountDoc.supabaseUserId,
        email: accountDoc.email || authEmail,
        fullName: accountDoc.fullName || accountInfo.fullName,
        avatarUrl: accountDoc.avatarUrl || accountInfo.avatarUrl,
        memberSince: accountDoc.createdAt
          ? new Date(accountDoc.createdAt).toISOString()
          : accountInfo.memberSince,
        lastSignInAt: accountDoc.lastSignInAt
          ? new Date(accountDoc.lastSignInAt).toISOString()
          : accountInfo.lastSignInAt,
      };
    }

    if (profileDoc) {
      currentTier = (RANK_ORDER.includes(profileDoc.currentTier as RankTier)
        ? profileDoc.currentTier
        : 'Noob') as RankTier;
      if (profileDoc.cognitiveMetrics) {
        cognitiveMetrics = {
          signalRecognitionScore: profileDoc.cognitiveMetrics.signalRecognitionScore ?? 0,
          bottleneckDiagnosisScore: profileDoc.cognitiveMetrics.bottleneckDiagnosisScore ?? 0,
          logicAssemblyAccuracy: profileDoc.cognitiveMetrics.logicAssemblyAccuracy ?? 0,
          paperDryRunStreak: profileDoc.cognitiveMetrics.paperDryRunStreak ?? 0,
        };
      }
      passedTopicQuizzes = profileDoc.passedTopicQuizzes ?? [];
      completedProblemIds = profileDoc.completedProblemIds ?? [];
      completedWarmupDrills = profileDoc.completedWarmupDrills ?? [];
      masteredProblemSlugs = profileDoc.masteredProblemSlugs ?? [];
      notesObj =
        profileDoc.notes instanceof Map
          ? Object.fromEntries(profileDoc.notes.entries())
          : (profileDoc.notes as Record<string, string>) ?? {};
      spacedRepetitionQueue = (profileDoc.spacedRepetitionQueue ?? []).map((q: any) => ({
        problemId: String(q.problemId),
        problemTitle: q.problemTitle || String(q.problemId),
        patternTag: q.patternTag || 'Core Pattern',
        intervalStage: q.intervalStage ?? 1,
        nextReviewDate: q.nextReviewDate
          ? new Date(q.nextReviewDate).toISOString()
          : new Date().toISOString(),
        isDueNow: Boolean(q.isDueNow),
        twistConstraint: q.twistConstraint || '',
      }));
      activityLog = (profileDoc.activityLog ?? []).map((a: any) => ({
        date: a.date ? new Date(a.date).toISOString() : new Date().toISOString(),
        kind: a.kind,
        label: a.label,
        xp: a.xp ?? 10,
        score: a.score,
      }));
      if (profileDoc.preferences) {
        preferences = {
          targetRole: profileDoc.preferences.targetRole ?? DEFAULT_PREFS.targetRole,
          targetCompany: profileDoc.preferences.targetCompany ?? DEFAULT_PREFS.targetCompany,
          dailyGoalMinutes: profileDoc.preferences.dailyGoalMinutes ?? DEFAULT_PREFS.dailyGoalMinutes,
          preferredLanguage:
            profileDoc.preferences.preferredLanguage ?? DEFAULT_PREFS.preferredLanguage,
          bio: profileDoc.preferences.bio ?? '',
        };
      }
    }

    if (sprintDoc) {
      const allTasks = (sprintDoc.dailySchedule ?? []).flatMap((d: any) => d.tasks ?? []);
      const tasksCompleted = allTasks.filter((t: any) => t.isCompleted).length;
      const metrics = computeSprintMetrics({
        id: String(sprintDoc._id),
        userId: sprintDoc.userId,
        targetCompany: sprintDoc.targetCompany,
        dailyMinutesBudget: sprintDoc.dailyMinutesBudget,
        startDate: new Date(sprintDoc.startDate).toISOString(),
        currentDay: sprintDoc.currentDay,
        companyPatternWeights: {},
        dailySchedule: sprintDoc.dailySchedule,
        completionPct: 0,
        readinessScore: 28,
      });
      activeSprintSummary = {
        targetCompany: sprintDoc.targetCompany,
        currentDay: sprintDoc.currentDay,
        dailyMinutesBudget: sprintDoc.dailyMinutesBudget,
        completionPct: metrics.completionPct,
        readinessScore: metrics.readinessScore,
        tasksCompleted,
        totalTasks: allTasks.length,
      };
    }
  } else {
    const dev = getDevCognitiveExtras(userId);
    currentTier = dev.profile.currentTier;
    cognitiveMetrics = dev.profile.cognitiveMetrics;
    passedTopicQuizzes = dev.profile.passedTopicQuizzes;
    completedProblemIds = dev.profile.completedProblemIds;
    completedWarmupDrills = dev.completedWarmupDrills;
    masteredProblemSlugs = dev.masteredProblemSlugs;
    notesObj = dev.notes;
    spacedRepetitionQueue = dev.profile.spacedRepetitionQueue;
    activityLog = dev.activityLog.map((a) => ({
      date: new Date(a.date).toISOString(),
      kind: a.kind,
      label: a.label,
      xp: a.xp,
      score: a.score,
    }));
    const savedDevPrefs = devPrefsStore.get(userId);
    if (savedDevPrefs) {
      if (savedDevPrefs.fullName) accountInfo.fullName = savedDevPrefs.fullName;
      preferences = savedDevPrefs.preferences;
    }
  }

  const { states, updatedAtByKey } = await getAllUserLearningStates(userId);

  // 2. Analyze 5-Stage Lab Progress from DB `problem-progress`
  const labProgressMap =
    states['problem-progress'] && typeof states['problem-progress'] === 'object'
      ? (states['problem-progress'] as Record<string, Record<string, unknown>>)
      : {};

  let signalsExploredTotal = 0;
  let patternQuizzesSolved = 0;
  let sandboxesVerified = 0;
  let invariantsLocked = 0;
  let bottlenecksDiagnosed = 0;
  let feynmanReflectionsDone = 0;
  let totalAssemblyErrors = 0;
  let labsInProgress = 0;

  for (const p of PROBLEMS) {
    const st = labProgressMap[p.id];
    if (!st) continue;
    const explored = Array.isArray(st.exploredSignals) ? st.exploredSignals.length : 0;
    signalsExploredTotal += explored;
    if (st.quizSolved) patternQuizzesSolved++;
    if (st.sandboxSolved) sandboxesVerified++;
    if (st.invariantSolved) invariantsLocked++;
    if (st.bottleneckSolved) bottlenecksDiagnosed++;
    if (st.feynmanCompleted) feynmanReflectionsDone++;
    totalAssemblyErrors += Number(st.assemblyErrors ?? 0);
    const touched =
      st.quizSolved ||
      st.sandboxSolved ||
      st.invariantSolved ||
      st.bottleneckSolved ||
      st.feynmanCompleted ||
      explored > 1;
    if (touched && !completedProblemIds.includes(p.id) && !st.feynmanCompleted) {
      labsInProgress++;
    }
  }

  const completedLabsSet = new Set(completedProblemIds);
  for (const p of PROBLEMS) {
    if (labProgressMap[p.id]?.feynmanCompleted) completedLabsSet.add(p.id);
  }
  const completedLabsCount = completedLabsSet.size;

  // 3. Cross-Platform Module Counters (all DB-backed!)
  const xrayDecodedCount = countArrayItems(states['xray-decoded-constraints']);
  const activeRecallCount = countArrayItems(states['active-recall-unlocked']);
  const productCompanySolvedCount = countArrayItems(states['product-company-solved']);
  const dpPracticeCount = countArrayItems(states['dp-practice-completed']);
  const matrixCompletedCount = countArrayItems(states['matrix-problems-completed']);
  const algorithmsImplCount = countArrayItems(states['algorithms-implemented']);
  const fuzzyModulesCount = countArrayItems(states['fuzzy-modules-completed']);
  const sysDesignProgress =
    states['system-design-academy-progress'] &&
    typeof states['system-design-academy-progress'] === 'object'
      ? (states['system-design-academy-progress'] as Record<
          string,
          { done?: boolean; note?: string }
        >)
      : {};
  const sysDesignCompletedCount = Object.values(sysDesignProgress).filter((v) => v?.done).length;
  const sysDesignRoadmapCount = summarizePayloadCount(
    'system-design-roadmap-progress',
    states['system-design-roadmap-progress'],
  );
  const oodMasteredCount = countArrayItems(states['ood-mastery-progress']);
  const aiProgressRaw =
    states['ai-engineering-progress'] && typeof states['ai-engineering-progress'] === 'object'
      ? (states['ai-engineering-progress'] as {
          completedPhases?: unknown[];
          solvedQuizIds?: unknown[];
        })
      : null;
  const aiPhasesCount = Array.isArray(aiProgressRaw?.completedPhases)
    ? aiProgressRaw.completedPhases.length
    : 0;
  const aiQuizzesCount = Array.isArray(aiProgressRaw?.solvedQuizIds)
    ? aiProgressRaw.solvedQuizIds.length
    : 0;
  const topicExpertiseChecksCount = countTruthyRecord(states['topic-expertise-checks']);
  const mutationGraphCount = countArrayItems(states['mutation-graph-solved']);
  const solverTelemetryRaw =
    states['solver-adaptive-telemetry'] && typeof states['solver-adaptive-telemetry'] === 'object'
      ? (states['solver-adaptive-telemetry'] as {
          completedProblemIds?: string[];
          drops?: unknown[];
          microDrills?: { completed?: boolean }[];
          sm2Queue?: { masteryScore?: number }[];
          unlockedTier?: string;
        })
      : null;
  const solverCompletedCount = Array.isArray(solverTelemetryRaw?.completedProblemIds)
    ? solverTelemetryRaw.completedProblemIds.length
    : 0;
  const solverDrillsDone = Array.isArray(solverTelemetryRaw?.microDrills)
    ? solverTelemetryRaw.microDrills.filter((d) => d?.completed).length
    : 0;
  const solverDropsCount = Array.isArray(solverTelemetryRaw?.drops)
    ? solverTelemetryRaw.drops.length
    : 0;
  const solverUnlockedTier = solverTelemetryRaw?.unlockedTier ?? 'Easy';
  const customConceptsCount = countArrayItems(states['engine-custom-concepts']);
  const engineMasteryMap =
    states['engine-concept-mastery'] && typeof states['engine-concept-mastery'] === 'object'
      ? (states['engine-concept-mastery'] as Record<string, number>)
      : {};
  const engineMasteryValues = Object.values(engineMasteryMap).filter((n) => typeof n === 'number');
  const engineAvgMastery =
    engineMasteryValues.length > 0
      ? Math.round(engineMasteryValues.reduce((a, b) => a + b, 0) / engineMasteryValues.length)
      : 0;

  // 4. Difficulty & Topic Category Mastery Breakdown across Big Tech 48 + Interactive Lab 23
  const masteredSlugSet = new Set(masteredProblemSlugs);
  const difficultyBreakdown = {
    Easy: { solved: 0, total: 0 },
    Medium: { solved: 0, total: 0 },
    Hard: { solved: 0, total: 0 },
  };
  const topicMap = new Map<string, { solved: number; total: number }>();

  for (const bp of BIG_TECH_PROBLEMS) {
    const diffKey = bp.difficulty as 'Easy' | 'Medium' | 'Hard';
    if (difficultyBreakdown[diffKey]) {
      difficultyBreakdown[diffKey].total++;
      const isSolved =
        masteredSlugSet.has(bp.slug) ||
        (bp.labProblemId ? completedLabsSet.has(bp.labProblemId) : false);
      if (isSolved) difficultyBreakdown[diffKey].solved++;
    }
    const existing = topicMap.get(bp.topicCategory) ?? { solved: 0, total: 0 };
    existing.total++;
    const isSolved =
      masteredSlugSet.has(bp.slug) ||
      (bp.labProblemId ? completedLabsSet.has(bp.labProblemId) : false);
    if (isSolved) existing.solved++;
    topicMap.set(bp.topicCategory, existing);
  }

  const topicBreakdown = Array.from(topicMap.entries())
    .map(([topic, stats]) => ({
      topic,
      solved: stats.solved,
      total: stats.total,
      pct: stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct || a.topic.localeCompare(b.topic));

  // 5. Big Tech Company Readiness Scores (weighted by bigTechFrequency)
  const companies: BigTechCompany[] = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'];
  const companyReadiness = companies.map((company) => {
    let weightedSolved = 0;
    let weightedTotal = 0;
    let solvedCount = 0;
    let totalCount = 0;
    for (const bp of BIG_TECH_PROBLEMS) {
      const freq = bp.bigTechFrequency.find((f) => f.company === company);
      if (!freq) continue;
      totalCount++;
      weightedTotal += freq.frequencyScore;
      const isSolved =
        masteredSlugSet.has(bp.slug) ||
        (bp.labProblemId ? completedLabsSet.has(bp.labProblemId) : false);
      if (isSolved) {
        solvedCount++;
        weightedSolved += freq.frequencyScore;
      }
    }
    return {
      company,
      solvedCount,
      totalCount,
      readinessPct: weightedTotal > 0 ? Math.round((weightedSolved / weightedTotal) * 100) : 0,
    };
  });

  // 6. Notes Analytics
  const noteEntries = Object.entries(notesObj).filter(([, txt]) => typeof txt === 'string' && txt.trim().length > 0);
  const totalNoteWords = noteEntries.reduce(
    (acc, [, txt]) => acc + txt.trim().split(/\s+/).filter(Boolean).length,
    0
  );

  // 7. Spaced Repetition Analytics
  const nowMs = Date.now();
  const srStageCounts: Record<1 | 3 | 7 | 21, number> = { 1: 0, 3: 0, 7: 0, 21: 0 };
  let srDueNow = 0;
  for (const item of spacedRepetitionQueue) {
    srStageCounts[item.intervalStage] = (srStageCounts[item.intervalStage] ?? 0) + 1;
    if (item.isDueNow || new Date(item.nextReviewDate).getTime() <= nowMs) {
      srDueNow++;
    }
  }

  let communityChallengesSolved = 0;
  if (mongoReady) {
    communityChallengesSolved = await CommunityPost.countDocuments({ completedBy: userId });
  } else {
    communityChallengesSolved = activityLog.filter((a) => a.kind === 'community-challenge').length;
  }

  // 8. Total XP & Rank Progress Calculation
  const totalXp =
    completedLabsCount * 120 +
    masteredProblemSlugs.length * 60 +
    productCompanySolvedCount * 45 +
    passedTopicQuizzes.length * 90 +
    completedWarmupDrills.length * 25 +
    xrayDecodedCount * 15 +
    activeRecallCount * 35 +
    dpPracticeCount * 40 +
    matrixCompletedCount * 40 +
    algorithmsImplCount * 50 +
    fuzzyModulesCount * 45 +
    sysDesignCompletedCount * 60 +
    sysDesignRoadmapCount * 30 +
    oodMasteredCount * 45 +
    aiPhasesCount * 40 +
    aiQuizzesCount * 25 +
    topicExpertiseChecksCount * 10 +
    mutationGraphCount * 25 +
    solverCompletedCount * 40 +
    solverDrillsDone * 20 +
    customConceptsCount * 35 +
    noteEntries.length * 15 +
    communityChallengesSolved * 50;

  const tierIdx = Math.max(0, RANK_ORDER.indexOf(currentTier));
  const nextTier: RankTier | null =
    tierIdx < RANK_ORDER.length - 1 ? RANK_ORDER[tierIdx + 1] : null;
  const currentFloor = RANK_XP_THRESHOLDS[currentTier];
  const nextThreshold = nextTier ? RANK_XP_THRESHOLDS[nextTier] : currentFloor;
  const rankProgressPct = nextTier
    ? Math.min(100, Math.max(0, Math.round(((totalXp - currentFloor) / Math.max(1, nextThreshold - currentFloor)) * 100)))
    : 100;

  // 9. 14-Day Activity Momentum Buckets (real timestamps from activityLog + updatedAtByKey)
  const dayBuckets: { date: string; label: string; count: number; xp: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const isoDay = d.toISOString().slice(0, 10);
    dayBuckets.push({
      date: isoDay,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: 0,
      xp: 0,
    });
  }
  const bucketMap = new Map(dayBuckets.map((b) => [b.date, b]));
  for (const act of activityLog) {
    const day = act.date.slice(0, 10);
    const b = bucketMap.get(day);
    if (b) {
      b.count += 1;
      b.xp += act.xp;
    }
  }
  for (const [stateKey, ts] of Object.entries(updatedAtByKey)) {
    if (stateKey === 'ui-preferences') continue;
    const itemCount = summarizePayloadCount(stateKey, states[stateKey]);
    if (itemCount === 0) continue;
    const day = ts.slice(0, 10);
    const b = bucketMap.get(day);
    if (b && b.count === 0) {
      b.count += 1;
      b.xp += 15;
    }
  }

  // 10. Database Sync Ledger (auditing every migrated UI state key)
  const dbSyncLedger = Object.entries(PERSISTED_KEY_LABELS).map(([key, meta]) => ({
    key,
    label: meta.label,
    category: meta.category,
    persisted: key in states,
    itemCount: key in states ? summarizePayloadCount(key, states[key]) : 0,
    updatedAt: updatedAtByKey[key] ?? null,
  }));

  const compositeAccuracy = Math.round(
    (cognitiveMetrics.signalRecognitionScore +
      cognitiveMetrics.bottleneckDiagnosisScore +
      cognitiveMetrics.logicAssemblyAccuracy) /
      3
  );

  const uniqueProblemsSolved =
    completedLabsCount +
    masteredProblemSlugs.length +
    productCompanySolvedCount +
    dpPracticeCount +
    matrixCompletedCount +
    solverCompletedCount;

  const isFreshAccount =
    totalXp === 0 &&
    uniqueProblemsSolved === 0 &&
    compositeAccuracy === 0 &&
    cognitiveMetrics.paperDryRunStreak === 0 &&
    spacedRepetitionQueue.length === 0 &&
    activityLog.length === 0;

  return res.json({
    storageMode: mongoReady ? 'mongodb' : 'dev-memory',
    isFreshAccount,
    communityChallengesSolved,
    account: accountInfo,
    preferences,
    rank: {
      currentTier,
      nextTier,
      totalXp,
      xpToNextTier: nextTier ? Math.max(0, nextThreshold - totalXp) : 0,
      rankProgressPct,
    },
    cognitiveMetrics,
    compositeAccuracy,
    uniqueProblemsSolved,
    labTelemetry: {
      totalLabs: PROBLEMS.length,
      completedLabs: completedLabsCount,
      inProgressLabs: labsInProgress,
      signalsExploredTotal,
      xrayDecodedCount,
      patternQuizzesSolved,
      sandboxesVerified,
      invariantsLocked,
      activeRecallCount,
      bottlenecksDiagnosed,
      feynmanReflectionsDone,
      totalAssemblyErrors,
    },
    solverTelemetry: {
      completedCount: solverCompletedCount,
      microDrillsCompleted: solverDrillsDone,
      dropsLogged: solverDropsCount,
      unlockedTier: solverUnlockedTier,
      customConceptsCount,
      engineTrackedConcepts: engineMasteryValues.length,
      engineAvgMastery,
    },
    moduleProgress: [
      { id: 'labs', label: '5-Stage Interactive Labs', completed: completedLabsCount, total: PROBLEMS.length },
      { id: 'bigtech', label: 'Big Tech 48 Vault', completed: masteredProblemSlugs.length, total: BIG_TECH_PROBLEMS.length },
      { id: 'product-bank', label: 'Product Co. & Master Bank', completed: productCompanySolvedCount, total: PRODUCT_BANK_TOTAL },
      { id: 'quizzes', label: 'Topic Pattern Quizzes', completed: passedTopicQuizzes.length, total: SEED_TOPIC_QUIZZES.length },
      { id: 'xray', label: 'Constraint-to-Complexity Gates', completed: xrayDecodedCount, total: PROBLEMS.length },
      { id: 'recall', label: 'Active Recall Synthesis', completed: activeRecallCount, total: PROBLEMS.length },
      { id: 'dp-lab', label: 'DP Learning Lab', completed: dpPracticeCount, total: 12 },
      { id: 'matrix-bank', label: 'Matrix Problem Bank', completed: matrixCompletedCount, total: 10 },
      { id: 'algorithms', label: 'Algorithms Studio', completed: algorithmsImplCount, total: 16 },
      { id: 'fuzzy', label: 'N-Gram / Fuzzy Modules', completed: fuzzyModulesCount, total: 6 },
      { id: 'sys-design', label: 'System Design Academy', completed: sysDesignCompletedCount, total: 12 },
      { id: 'sys-roadmap', label: 'System Design Master Roadmap', completed: sysDesignRoadmapCount, total: 19 },
      { id: 'ood-studio', label: 'OOPs, SOLID & OOD Studio', completed: oodMasteredCount, total: 32 },
      { id: 'ai-engineering', label: 'AI Engineering 5-Phase Studio', completed: aiPhasesCount + aiQuizzesCount, total: 15 },
      { id: 'mutations', label: 'Mutation Graph & Ladder', completed: mutationGraphCount, total: 24 },
      { id: 'solver-studio', label: 'Universal Logic Solver', completed: solverCompletedCount, total: 15 },
      { id: 'concept-engine', label: 'Knowledge Engine Concepts', completed: engineMasteryValues.length + customConceptsCount, total: 15 + customConceptsCount },
    ],
    difficultyBreakdown,
    topicBreakdown,
    companyReadiness,
    activeSprint: activeSprintSummary,
    spacedRepetition: {
      totalScheduled: spacedRepetitionQueue.length,
      dueNow: srDueNow,
      stageCounts: srStageCounts,
      queue: spacedRepetitionQueue,
    },
    notesSummary: {
      totalNotes: noteEntries.length,
      totalWords: totalNoteWords,
      recentKeys: noteEntries.slice(0, 6).map(([k]) => k),
    },
    warmupDrillsCompleted: completedWarmupDrills.length,
    topicExpertiseChecksCount,
    activity14Days: dayBuckets,
    recentActivity: [...activityLog].reverse().slice(0, 15),
    dbSyncLedger,
  });
});

// PATCH /api/profile/preferences — Save profile details & learning goals to MongoDB
router.patch('/preferences', async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const { fullName, targetRole, targetCompany, dailyGoalMinutes, preferredLanguage, bio } =
    req.body ?? {};

  const validCompanies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Any'] as const;
  const validLangs = ['python', 'js', 'java'] as const;

  const cleanFullName =
    typeof fullName === 'string' ? fullName.trim().slice(0, 80) : undefined;
  const cleanPrefs: IUserPreferences = {
    targetRole:
      typeof targetRole === 'string' && targetRole.trim()
        ? targetRole.trim().slice(0, 80)
        : DEFAULT_PREFS.targetRole,
    targetCompany: validCompanies.includes(targetCompany)
      ? targetCompany
      : DEFAULT_PREFS.targetCompany,
    dailyGoalMinutes: Math.min(
      360,
      Math.max(15, Number.isFinite(Number(dailyGoalMinutes)) ? Math.round(Number(dailyGoalMinutes)) : 60)
    ),
    preferredLanguage: validLangs.includes(preferredLanguage)
      ? preferredLanguage
      : DEFAULT_PREFS.preferredLanguage,
    bio: typeof bio === 'string' ? bio.trim().slice(0, 300) : '',
  };

  if (isMongoConnected()) {
    if (cleanFullName !== undefined) {
      await UserAccount.updateOne(
        { supabaseUserId: userId },
        { $set: { fullName: cleanFullName } }
      );
    }
    await UserBrainProfile.updateOne(
      { userId },
      { $set: { preferences: cleanPrefs } },
      { upsert: true }
    );
    return res.json({ ok: true, fullName: cleanFullName, preferences: cleanPrefs });
  }

  devPrefsStore.set(userId, { fullName: cleanFullName, preferences: cleanPrefs });
  return res.json({ ok: true, fullName: cleanFullName, preferences: cleanPrefs });
});

export default router;
