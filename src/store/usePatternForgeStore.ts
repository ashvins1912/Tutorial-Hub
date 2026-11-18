import { create } from 'zustand';
import {
  CodeLanguage,
  PipelineMode,
  PipelineSlotId,
  PolyaStep,
  TopicQuiz,
  UserBrainProfile,
} from '../types/dsa';
import { PROBLEMS } from '../data/problems';
import { INITIAL_BRAIN_PROFILE, SEED_TOPIC_QUIZZES } from '../../server/seed/cognitiveSeed';

export type TopView = 'workspace' | 'skill-tree' | 'system-design' | 'roadmap' | 'revision' | 'schemas' | 'complete-roadmap' | 'leetcode-75' | 'top-interview-100' | 'topic-academy' | 'sprint';

interface ProblemLocalProgress {
  selectedSignalId: string | null;
  exploredSignals: string[];
  constraintExponent: number;
  quizOptionId: string | null;
  quizSolved: boolean;
  sandboxSolved: boolean;
  lockedInvariantId: string | null;
  invariantSolved: boolean;
  pipelineMode: PipelineMode;
  placedBlocks: Record<PipelineMode, Record<PipelineSlotId, string | null>>;
  assemblyErrors: number;
  bruteRunCompleted: boolean;
  bottleneckOptionId: string | null;
  bottleneckSolved: boolean;
  feynmanOptionId: string | null;
  feynmanCompleted: boolean;
  isRecallMode: boolean;
}

function createInitialProblemProgress(problemId: string): ProblemLocalProgress {
  const problem = PROBLEMS.find((p) => p.id === problemId) ?? PROBLEMS[0];
  return {
    selectedSignalId: problem.signals[0]?.id ?? null,
    exploredSignals: problem.signals[0] ? [problem.signals[0].id] : [],
    constraintExponent: problem.inputSizeExponent,
    quizOptionId: null,
    quizSolved: false,
    sandboxSolved: false,
    lockedInvariantId: null,
    invariantSolved: false,
    pipelineMode: 'brute',
    placedBlocks: {
      brute: { init: null, loop: null, update: null },
      optimal: { init: null, loop: null, update: null },
    },
    assemblyErrors: 0,
    bruteRunCompleted: false,
    bottleneckOptionId: null,
    bottleneckSolved: false,
    feynmanOptionId: null,
    feynmanCompleted: false,
    isRecallMode: false,
  };
}

interface PatternForgeState {
  activeView: TopView;
  theme: 'light' | 'dark';
  activeProblemId: string;
  currentStage: 1 | 2 | 3 | 4 | 5;
  polyaStep: PolyaStep;
  activeLanguage: CodeLanguage;
  compareAllLanguages: boolean;
  hoveredBlockId: string | null;
  steppingSlot: PipelineSlotId | null;
  distractorAlert: { blockId: string; reason: string } | null;
  interviewDrawerOpen: boolean;
  activeTopicQuiz: TopicQuiz | null;
  quizModalOpen: boolean;
  promotionToast: string | null;

  // Cognitive Profile & 1-3-7-21 Queue
  brainProfile: UserBrainProfile;
  isLoadingProfile: boolean;

  // Per-problem state
  problemProgress: Record<string, ProblemLocalProgress>;

  // Actions
  setActiveView: (view: TopView) => void;
  toggleTheme: () => void;
  selectProblem: (problemId: string, options?: { recallMode?: boolean }) => void;
  setCurrentStage: (stage: 1 | 2 | 3 | 4 | 5) => void;
  setPolyaStep: (step: PolyaStep) => void;
  setActiveLanguage: (lang: CodeLanguage) => void;
  setCompareAllLanguages: (compare: boolean) => void;
  setHoveredBlockId: (blockId: string | null) => void;
  setSteppingSlot: (slot: PipelineSlotId | null) => void;
  setInterviewDrawerOpen: (open: boolean) => void;
  clearPromotionToast: () => void;

  // Stage 1 Actions
  selectSignal: (signalId: string) => void;
  setConstraintExponent: (exp: number) => void;
  answerPatternQuiz: (optionId: string) => void;

  // Stage 2 & Polya Plan Actions
  markSandboxSolved: () => void;
  selectLoopInvariant: (invariantId: string) => void;

  // Stage 3 Actions
  setPipelineMode: (mode: PipelineMode) => void;
  placeBlockInSlot: (slot: PipelineSlotId, blockId: string) => void;
  removeBlockFromSlot: (slot: PipelineSlotId) => void;
  autoFillCurrentPipeline: () => void;
  clearDistractorAlert: () => void;

  // Stage 4 Actions
  markBruteRunCompleted: () => void;
  answerBottleneck: (optionId: string) => void;

  // Polya Reflect + Backend Cognitive Sync
  fetchBrainProfile: () => Promise<void>;
  submitFeynmanReflection: (choiceId: string) => Promise<void>;
  openTopicQuiz: (topicId: string) => Promise<void>;
  closeTopicQuiz: () => void;
  submitTopicQuiz: (answers: Record<string, string>) => Promise<{
    scorePct: number;
    passed: boolean;
    promoted: boolean;
    breakdown: {
      questionId: string;
      isCorrect: boolean;
      feedback: string;
      optimalComplexity: { time: string; space: string };
    }[];
  } | null>;
}

const initialProgressMap: Record<string, ProblemLocalProgress> = {};
for (const p of PROBLEMS) {
  initialProgressMap[p.id] = createInitialProblemProgress(p.id);
}

export const usePatternForgeStore = create<PatternForgeState>((set, get) => ({
  activeView: 'workspace',
  theme: 'light',
  activeProblemId: PROBLEMS[0].id,
  currentStage: 1,
  polyaStep: 'understand',
  activeLanguage: 'python',
  compareAllLanguages: false,
  hoveredBlockId: null,
  steppingSlot: null,
  distractorAlert: null,
  interviewDrawerOpen: false,
  activeTopicQuiz: null,
  quizModalOpen: false,
  promotionToast: null,

  brainProfile: INITIAL_BRAIN_PROFILE,
  isLoadingProfile: false,

  problemProgress: initialProgressMap,

  setActiveView: (view) => set({ activeView: view }),

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next === 'dark');
      }
      return { theme: next };
    }),

  selectProblem: (problemId, options) =>
    set((state) => {
      const existing = state.problemProgress[problemId] ?? createInitialProblemProgress(problemId);
      const isRecall = Boolean(options?.recallMode);
      return {
        activeView: 'workspace',
        activeProblemId: problemId,
        currentStage: isRecall ? 3 : 1,
        polyaStep: isRecall ? 'execute' : 'understand',
        distractorAlert: null,
        problemProgress: {
          ...state.problemProgress,
          [problemId]: isRecall
            ? {
                ...createInitialProblemProgress(problemId),
                isRecallMode: true,
                pipelineMode: 'optimal',
                bottleneckSolved: true,
                quizSolved: true,
                sandboxSolved: true,
                invariantSolved: true,
              }
            : existing,
        },
      };
    }),

  setCurrentStage: (stage) => {
    const polyaMap: Record<number, PolyaStep> = {
      1: 'understand',
      2: 'understand',
      3: 'execute',
      4: 'execute',
      5: 'reflect',
    };
    set({
      currentStage: stage,
      polyaStep: polyaMap[stage] ?? 'understand',
    });
  },

  setPolyaStep: (step) => {
    const stageMap: Record<PolyaStep, 1 | 2 | 3 | 4 | 5> = {
      understand: 1,
      plan: 2,
      execute: 3,
      reflect: 4,
    };
    set({
      polyaStep: step,
      currentStage: stageMap[step],
    });
  },

  setActiveLanguage: (lang) => set({ activeLanguage: lang }),
  setCompareAllLanguages: (compare) => set({ compareAllLanguages: compare }),
  setHoveredBlockId: (blockId) => set({ hoveredBlockId: blockId }),
  setSteppingSlot: (slot) => set({ steppingSlot: slot }),
  setInterviewDrawerOpen: (open) => set({ interviewDrawerOpen: open }),
  clearPromotionToast: () => set({ promotionToast: null }),

  selectSignal: (signalId) =>
    set((state) => {
      const pid = state.activeProblemId;
      const cur = state.problemProgress[pid];
      const explored = cur.exploredSignals.includes(signalId)
        ? cur.exploredSignals
        : [...cur.exploredSignals, signalId];
      return {
        problemProgress: {
          ...state.problemProgress,
          [pid]: { ...cur, selectedSignalId: signalId, exploredSignals: explored },
        },
      };
    }),

  setConstraintExponent: (exp) =>
    set((state) => {
      const pid = state.activeProblemId;
      return {
        problemProgress: {
          ...state.problemProgress,
          [pid]: { ...state.problemProgress[pid], constraintExponent: exp },
        },
      };
    }),

  answerPatternQuiz: (optionId) =>
    set((state) => {
      const pid = state.activeProblemId;
      const problem = PROBLEMS.find((p) => p.id === pid);
      const option = problem?.quizOptions.find((o) => o.id === optionId);
      const isCorrect = Boolean(option?.isCorrect);
      return {
        problemProgress: {
          ...state.problemProgress,
          [pid]: {
            ...state.problemProgress[pid],
            quizOptionId: optionId,
            quizSolved: state.problemProgress[pid].quizSolved || isCorrect,
          },
        },
      };
    }),

  markSandboxSolved: () =>
    set((state) => {
      const pid = state.activeProblemId;
      return {
        problemProgress: {
          ...state.problemProgress,
          [pid]: { ...state.problemProgress[pid], sandboxSolved: true },
        },
      };
    }),

  selectLoopInvariant: (invariantId) =>
    set((state) => {
      const pid = state.activeProblemId;
      const problem = PROBLEMS.find((p) => p.id === pid);
      const inv = problem?.loopInvariants.find((i) => i.id === invariantId);
      const isCorrect = Boolean(inv?.isCorrect);
      return {
        problemProgress: {
          ...state.problemProgress,
          [pid]: {
            ...state.problemProgress[pid],
            lockedInvariantId: invariantId,
            invariantSolved: state.problemProgress[pid].invariantSolved || isCorrect,
          },
        },
      };
    }),

  setPipelineMode: (mode) =>
    set((state) => {
      const pid = state.activeProblemId;
      return {
        distractorAlert: null,
        problemProgress: {
          ...state.problemProgress,
          [pid]: { ...state.problemProgress[pid], pipelineMode: mode },
        },
      };
    }),

  placeBlockInSlot: (slot, blockId) =>
    set((state) => {
      const pid = state.activeProblemId;
      const problem = PROBLEMS.find((p) => p.id === pid);
      const block = problem?.blocks.find((b) => b.id === blockId);
      const cur = state.problemProgress[pid];
      if (!block) return state;

      if (block.mode === 'distractor') {
        return {
          distractorAlert: {
            blockId,
            reason: block.distractorReason || 'This block introduces a subtle algorithmic flaw.',
          },
          problemProgress: {
            ...state.problemProgress,
            [pid]: { ...cur, assemblyErrors: cur.assemblyErrors + 1 },
          },
        };
      }

      if (block.targetSlot !== slot) {
        return {
          distractorAlert: {
            blockId,
            reason: `"${block.label}" belongs in the "${block.targetSlot.toUpperCase()}" piece rather than "${slot.toUpperCase()}".`,
          },
          problemProgress: {
            ...state.problemProgress,
            [pid]: { ...cur, assemblyErrors: cur.assemblyErrors + 1 },
          },
        };
      }

      const mode = cur.pipelineMode;
      if (block.mode !== mode) {
        return {
          distractorAlert: {
            blockId,
            reason: `You are currently assembling the ${mode === 'brute' ? 'Brute Force' : 'Optimal'} pipeline. Switch mode or use ${mode} blocks.`,
          },
          problemProgress: {
            ...state.problemProgress,
            [pid]: { ...cur, assemblyErrors: cur.assemblyErrors + 1 },
          },
        };
      }

      return {
        distractorAlert: null,
        problemProgress: {
          ...state.problemProgress,
          [pid]: {
            ...cur,
            placedBlocks: {
              ...cur.placedBlocks,
              [mode]: {
                ...cur.placedBlocks[mode],
                [slot]: blockId,
              },
            },
          },
        },
      };
    }),

  removeBlockFromSlot: (slot) =>
    set((state) => {
      const pid = state.activeProblemId;
      const cur = state.problemProgress[pid];
      const mode = cur.pipelineMode;
      return {
        problemProgress: {
          ...state.problemProgress,
          [pid]: {
            ...cur,
            placedBlocks: {
              ...cur.placedBlocks,
              [mode]: {
                ...cur.placedBlocks[mode],
                [slot]: null,
              },
            },
          },
        },
      };
    }),

  autoFillCurrentPipeline: () =>
    set((state) => {
      const pid = state.activeProblemId;
      const problem = PROBLEMS.find((p) => p.id === pid);
      const cur = state.problemProgress[pid];
      if (!problem) return state;
      const mode = cur.pipelineMode;
      const matching = problem.blocks.filter((b) => b.mode === mode);
      const init = matching.find((b) => b.targetSlot === 'init')?.id ?? null;
      const loop = matching.find((b) => b.targetSlot === 'loop')?.id ?? null;
      const update = matching.find((b) => b.targetSlot === 'update')?.id ?? null;
      return {
        distractorAlert: null,
        problemProgress: {
          ...state.problemProgress,
          [pid]: {
            ...cur,
            placedBlocks: {
              ...cur.placedBlocks,
              [mode]: { init, loop, update },
            },
          },
        },
      };
    }),

  clearDistractorAlert: () => set({ distractorAlert: null }),

  markBruteRunCompleted: () =>
    set((state) => {
      const pid = state.activeProblemId;
      return {
        problemProgress: {
          ...state.problemProgress,
          [pid]: { ...state.problemProgress[pid], bruteRunCompleted: true },
        },
      };
    }),

  answerBottleneck: (optionId) =>
    set((state) => {
      const pid = state.activeProblemId;
      const problem = PROBLEMS.find((p) => p.id === pid);
      const opt = problem?.bottleneck.options.find((o) => o.id === optionId);
      const isCorrect = Boolean(opt?.isCorrect);
      return {
        problemProgress: {
          ...state.problemProgress,
          [pid]: {
            ...state.problemProgress[pid],
            bottleneckOptionId: optionId,
            bottleneckSolved: state.problemProgress[pid].bottleneckSolved || isCorrect,
          },
        },
      };
    }),

  fetchBrainProfile: async () => {
    set({ isLoadingProfile: true });
    try {
      const res = await fetch('/api/cognitive/profile/learner-default');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          set({ brainProfile: data.profile, isLoadingProfile: false });
          return;
        }
      }
    } catch {
      // fallback to local initial profile
    }
    set({ isLoadingProfile: false });
  },

  submitFeynmanReflection: async (choiceId) => {
    const state = get();
    const pid = state.activeProblemId;
    const problem = PROBLEMS.find((p) => p.id === pid);
    const cur = state.problemProgress[pid];
    const choice = problem?.feynmanPrompt.choices.find((c) => c.id === choiceId);
    if (!problem || !choice) return;

    set({
      problemProgress: {
        ...state.problemProgress,
        [pid]: {
          ...cur,
          feynmanOptionId: choiceId,
          feynmanCompleted: cur.feynmanCompleted || choice.isCorrect,
        },
      },
    });

    if (!choice.isCorrect) return;

    try {
      const res = await fetch('/api/cognitive/complete-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.brainProfile.userId,
          problemId: problem.id,
          problemTitle: problem.title,
          patternTag: problem.patternName,
          twistConstraint: problem.feynmanPrompt.twistConstraint,
          dryRunCompleted: cur.sandboxSolved,
          assemblyErrors: cur.assemblyErrors,
          bottleneckCorrect: cur.bottleneckSolved,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        set({
          brainProfile: data.profile,
          promotionToast: data.promoted
            ? `Promoted to ${data.profile.currentTier} Rank!`
            : `Scheduled "${problem.title}" for +${data.nextIntervalDays}d Spaced Repetition recall.`,
        });
      }
    } catch {
      // Graceful local fallback if API unavailable
    }
  },

  openTopicQuiz: async (topicId) => {
    try {
      const res = await fetch(`/api/cognitive/quiz/${topicId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.quiz) {
          set({ activeTopicQuiz: data.quiz, quizModalOpen: true });
          return;
        }
      }
    } catch {
      // Fallback to local seed
    }
    const localQuiz = SEED_TOPIC_QUIZZES.find((q) => q.topicId === topicId) ?? SEED_TOPIC_QUIZZES[0];
    set({ activeTopicQuiz: localQuiz, quizModalOpen: true });
  },

  closeTopicQuiz: () => set({ quizModalOpen: false }),

  submitTopicQuiz: async (answers) => {
    const state = get();
    const quiz = state.activeTopicQuiz;
    if (!quiz) return null;

    try {
      const res = await fetch('/api/cognitive/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.brainProfile.userId,
          topicId: quiz.topicId,
          answers,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        set({
          brainProfile: data.profile,
          promotionToast: data.promoted
            ? `Rank Up! Promoted to ${data.profile.currentTier}.`
            : data.passed
              ? `Passed ${quiz.topicTitle} (${data.scorePct}%).`
              : null,
        });
        return {
          scorePct: data.scorePct,
          passed: data.passed,
          promoted: data.promoted,
          breakdown: data.breakdown,
        };
      }
    } catch {
      // Fallback local grading
    }
    return null;
  },
}));
