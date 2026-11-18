export type DifficultyTier = 'Easy' | 'Easy-Med' | 'Medium' | 'Med-Hard' | 'Hard' | 'Hardest';

export type RankTier = 'Noob' | 'Apprentice' | 'Practitioner' | 'Strategist' | 'Pro';

export type PolyaStep = 'understand' | 'plan' | 'execute' | 'reflect';

export type CodeLanguage = 'java' | 'js' | 'python';

export type PipelineMode = 'brute' | 'optimal';

export type PipelineSlotId = 'init' | 'loop' | 'update';

export type BlockCategory = 'Variables & Pointers' | 'Loops' | 'Conditionals' | 'Data Structure Ops';

export interface SignalPhrase {
  id: string;
  phrase: string;
  impliedConstraint: string;
  eliminatedPatterns: string[];
  triggeredPatterns: string[];
  complexityHint: string;
}

export interface StatementSegment {
  text: string;
  signalId?: string;
}

export interface PatternQuizOption {
  id: string;
  pattern: string;
  dataStructure: string;
  isCorrect: boolean;
  feedback: string;
}

export interface LoopInvariantOption {
  id: string;
  statement: string;
  isCorrect: boolean;
  feedback: string;
}

export interface FeynmanPrompt {
  templateBefore: string;
  templateAfter: string;
  choices: {
    id: string;
    phrase: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  twistConstraint: string;
}

export interface LogicBlock {
  id: string;
  label: string;
  category: BlockCategory;
  targetSlot: PipelineSlotId;
  mode: PipelineMode | 'distractor';
  summary: string;
  distractorReason?: string;
  code: {
    java: string[];
    js: string[];
    python: string[];
  };
}

export interface RaceFrame {
  step: number;
  pointers: { label: string; index: number; color: 'sky' | 'amber' | 'rose' | 'emerald' }[];
  activeIndices: number[];
  redundantIndices: number[];
  operationsCount: number;
  memoryUnits: number;
  statusText: string;
  bestValueLabel: string;
  isComplete?: boolean;
}

export interface InterviewContext {
  companies: string[];
  frequencyNote: string;
  followUpTwists: {
    twist: string;
    adaptation: string;
  }[];
  relatedProblems: {
    title: string;
    difficulty: DifficultyTier;
    sharedTrigger: string;
  }[];
}

export interface ProblemDefinition {
  id: string;
  number: number;
  title: string;
  difficulty: DifficultyTier;
  tier: number;
  rankRequirement: RankTier;
  patternId: string;
  patternName: string;
  topicQuizId: string;
  estimatedMinutes: number;
  inputSizeExponent: number;
  targetBigO: string;
  bruteBigO: string;
  spaceOptimal: string;
  spaceBrute: string;
  summary: string;
  statementSegments: StatementSegment[];
  signals: SignalPhrase[];
  quizPrompt: string;
  quizOptions: PatternQuizOption[];
  loopInvariantPrompt: string;
  loopInvariants: LoopInvariantOption[];
  feynmanPrompt: FeynmanPrompt;
  hasDpLadder?: boolean;
  sandboxConfig: {
    type: 'two-sum' | 'sliding-window' | 'rain-water' | 'monotonic-stack' | 'coin-change';
    instruction: string;
    hint: string;
    sampleArray?: number[];
    targetSum?: number;
    sampleString?: string;
  };
  functionSignature: {
    java: { header: string; footer: string };
    js: { header: string; footer: string };
    python: { header: string; footer: string };
  };
  blocks: LogicBlock[];
  bottleneck: {
    question: string;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
      explanation: string;
    }[];
  };
  raceDataset: {
    label: string;
    values: (number | string)[];
    target?: number;
    bruteTrace: RaceFrame[];
    optimalTrace: RaceFrame[];
  };
  interviewContext: InterviewContext;
}

export interface CurriculumPattern {
  id: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  tierLabel: string;
  difficulty: DifficultyTier;
  name: string;
  topicGroup: string;
  signalClues: string[];
  bruteProgression: string;
  optimalProgression: string;
  timeComplexity: string;
  spaceComplexity: string;
  canonicalProblems: string[];
  linkedProblemId?: string;
}

export interface TopicQuizQuestion {
  id: string;
  scenarioText: string;
  constraintHint: string;
  questionPrompt: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    cognitiveFeedback: string;
  }[];
  optimalComplexity: {
    time: string;
    space: string;
  };
}

export interface TopicQuiz {
  topicId: string;
  topicTitle: string;
  tier: RankTier;
  questions: TopicQuizQuestion[];
}

export interface SpacedRepetitionItem {
  problemId: string;
  problemTitle: string;
  patternTag: string;
  intervalStage: 1 | 3 | 7 | 21;
  nextReviewDate: string;
  isDueNow: boolean;
  twistConstraint: string;
}

export interface CognitiveMetrics {
  signalRecognitionScore: number;
  bottleneckDiagnosisScore: number;
  logicAssemblyAccuracy: number;
  paperDryRunStreak: number;
}

export interface UserBrainProfile {
  userId: string;
  currentTier: RankTier;
  cognitiveMetrics: CognitiveMetrics;
  passedTopicQuizzes: string[];
  completedProblemIds: string[];
  spacedRepetitionQueue: SpacedRepetitionItem[];
}

export type BigTechCompany = 'Google' | 'Meta' | 'Amazon' | 'Microsoft' | 'Apple';

export type BigTechTopicCategory =
  | 'Arrays & Prefix Sum'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Modified Binary Search'
  | 'Linked Lists'
  | 'Monotonic Stack'
  | 'Trees DFS/BFS'
  | 'Heaps & Intervals'
  | 'Graphs & Topo Sort'
  | 'Union-Find & Shortest Path'
  | 'Backtracking & Tries'
  | 'Dynamic Programming';

export interface BigTechTopicSummary {
  topicCategory: BigTechTopicCategory;
  shortDesc: string;
  complexityLeap: string;
  coreInvariant: string;
  keywordTriggers: string[];
}

export interface BigTechProblem {
  slug: string;
  number: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topicCategory: BigTechTopicCategory;
  primaryPattern: string;
  secondaryStructure: string;
  labProblemId?: string;
  promptSummary: string;
  constraintsText: string;
  bigTechFrequency: {
    company: BigTechCompany;
    frequencyScore: number;
    lastAskedTag: string;
  }[];
  howToIdentify: {
    keywordTriggers: string[];
    eliminatorRule: string;
    mentalModelQuestion: string;
  };
  interviewSolutionLadder: {
    clarifyingQuestions: {
      question: string;
      interviewerAnswer: string;
      isCritical: boolean;
    }[];
    bruteForcePitch: {
      explanation: string;
      bottleneck: string;
      time: string;
      space: string;
    };
    optimalPitch: {
      explanation: string;
      invariant: string;
      time: string;
      space: string;
    };
    interviewerFollowUp: {
      twist: string;
      adaptation: string;
    };
  };
  solutions: {
    java: string;
    js: string;
    python: string;
  };
}

export type SprintTaskType =
  | 'PatternWarmup'
  | 'CoreProblem'
  | 'SpacedRecall'
  | 'BlindArena'
  | 'Mock45Sim';

export interface SprintTask {
  taskId: string;
  taskType: SprintTaskType;
  problemId: string;
  problemSlug: string;
  problemNumber: number;
  problemTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topicCategory: BigTechTopicCategory;
  twistConstraint: string;
  isCompleted: boolean;
  scoreEarned: number;
  estimatedMinutes: number;
  labProblemId?: string;
}

export interface SprintDaySchedule {
  dayNumber: number;
  phaseTitle: string;
  focusPattern: string;
  patternTriggerReminder: string;
  companyInsiderTip: string;
  isUnlocked: boolean;
  tasks: SprintTask[];
}

export interface CompanySprint {
  id: string;
  userId: string;
  targetCompany: BigTechCompany;
  dailyMinutesBudget: 60 | 120;
  startDate: string;
  currentDay: number;
  companyPatternWeights: Record<string, number>;
  dailySchedule: SprintDaySchedule[];
  completionPct: number;
  readinessScore: number;
}
