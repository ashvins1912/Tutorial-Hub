import type {
  DifficultyTier,
  LogicBlock,
  ProblemDefinition,
  RaceFrame,
  RankTier,
  SignalPhrase,
  StatementSegment,
} from '../types/dsa';

export interface CompactTraceStep {
  active: number[];
  redundant?: number[];
  pointers: { label: string; index: number; color: 'sky' | 'amber' | 'rose' | 'emerald' }[];
  ops: number;
  mem: number;
  status: string;
  best: string;
  done?: boolean;
}

export interface CompactCodeTriplet {
  java: string[];
  js: string[];
  python: string[];
}

export interface CompactBlockSpec {
  id: string;
  label: string;
  category: LogicBlock['category'];
  targetSlot: LogicBlock['targetSlot'];
  mode: LogicBlock['mode'];
  summary: string;
  distractorReason?: string;
  code: CompactCodeTriplet;
}

export interface CompactTopProblemSpec {
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
  quizCorrect: { pattern: string; dataStructure: string; feedback: string };
  quizDistractors: { pattern: string; dataStructure: string; feedback: string }[];
  loopInvariantPrompt: string;
  invariantCorrect: { statement: string; feedback: string };
  invariantDistractors: { statement: string; feedback: string }[];
  feynmanBefore: string;
  feynmanAfter: string;
  feynmanCorrect: { phrase: string; feedback: string };
  feynmanDistractors: { phrase: string; feedback: string }[];
  twistConstraint: string;
  hasDpLadder?: boolean;
  sandboxInstruction: string;
  sandboxHint: string;
  signatures: ProblemDefinition['functionSignature'];
  blocks: CompactBlockSpec[];
  bottleneckQuestion: string;
  bottleneckCorrect: { text: string; explanation: string };
  bottleneckDistractors: { text: string; explanation: string }[];
  raceLabel: string;
  raceValues: (number | string)[];
  raceTarget?: number;
  bruteSteps: CompactTraceStep[];
  optimalSteps: CompactTraceStep[];
  companies: string[];
  frequencyNote: string;
  followUpTwists: { twist: string; adaptation: string }[];
  relatedProblems: { title: string; difficulty: DifficultyTier; sharedTrigger: string }[];
}

function toRaceFrames(steps: CompactTraceStep[]): RaceFrame[] {
  return steps.map((s, idx) => ({
    step: idx + 1,
    pointers: s.pointers,
    activeIndices: s.active,
    redundantIndices: s.redundant ?? [],
    operationsCount: s.ops,
    memoryUnits: s.mem,
    statusText: s.status,
    bestValueLabel: s.best,
    isComplete: s.done ?? idx === steps.length - 1,
  }));
}

export function createTopProblem(spec: CompactTopProblemSpec): ProblemDefinition {
  const quizOptions = [
    {
      id: `${spec.id}-q-d1`,
      pattern: spec.quizDistractors[0].pattern,
      dataStructure: spec.quizDistractors[0].dataStructure,
      isCorrect: false,
      feedback: spec.quizDistractors[0].feedback,
    },
    {
      id: `${spec.id}-q-ok`,
      pattern: spec.quizCorrect.pattern,
      dataStructure: spec.quizCorrect.dataStructure,
      isCorrect: true,
      feedback: spec.quizCorrect.feedback,
    },
    ...spec.quizDistractors.slice(1).map((d, i) => ({
      id: `${spec.id}-q-d${i + 2}`,
      pattern: d.pattern,
      dataStructure: d.dataStructure,
      isCorrect: false,
      feedback: d.feedback,
    })),
  ];

  const loopInvariants = [
    {
      id: `${spec.id}-inv-d1`,
      statement: spec.invariantDistractors[0].statement,
      isCorrect: false,
      feedback: spec.invariantDistractors[0].feedback,
    },
    {
      id: `${spec.id}-inv-ok`,
      statement: spec.invariantCorrect.statement,
      isCorrect: true,
      feedback: spec.invariantCorrect.feedback,
    },
    ...spec.invariantDistractors.slice(1).map((d, i) => ({
      id: `${spec.id}-inv-d${i + 2}`,
      statement: d.statement,
      isCorrect: false,
      feedback: d.feedback,
    })),
  ];

  const feynmanChoices = [
    {
      id: `${spec.id}-f-ok`,
      phrase: spec.feynmanCorrect.phrase,
      isCorrect: true,
      feedback: spec.feynmanCorrect.feedback,
    },
    ...spec.feynmanDistractors.map((d, i) => ({
      id: `${spec.id}-f-d${i + 1}`,
      phrase: d.phrase,
      isCorrect: false,
      feedback: d.feedback,
    })),
  ];

  const bottleneckOptions = [
    {
      id: `${spec.id}-b-d1`,
      text: spec.bottleneckDistractors[0].text,
      isCorrect: false,
      explanation: spec.bottleneckDistractors[0].explanation,
    },
    {
      id: `${spec.id}-b-ok`,
      text: spec.bottleneckCorrect.text,
      isCorrect: true,
      explanation: spec.bottleneckCorrect.explanation,
    },
    ...spec.bottleneckDistractors.slice(1).map((d, i) => ({
      id: `${spec.id}-b-d${i + 2}`,
      text: d.text,
      isCorrect: false,
      explanation: d.explanation,
    })),
  ];

  return {
    id: spec.id,
    number: spec.number,
    title: spec.title,
    difficulty: spec.difficulty,
    tier: spec.tier,
    rankRequirement: spec.rankRequirement,
    patternId: spec.patternId,
    patternName: spec.patternName,
    topicQuizId: spec.topicQuizId,
    estimatedMinutes: spec.estimatedMinutes,
    inputSizeExponent: spec.inputSizeExponent,
    targetBigO: spec.targetBigO,
    bruteBigO: spec.bruteBigO,
    spaceOptimal: spec.spaceOptimal,
    spaceBrute: spec.spaceBrute,
    summary: spec.summary,
    statementSegments: spec.statementSegments,
    signals: spec.signals,
    quizPrompt: spec.quizPrompt,
    quizOptions,
    loopInvariantPrompt: spec.loopInvariantPrompt,
    loopInvariants,
    feynmanPrompt: {
      templateBefore: spec.feynmanBefore,
      templateAfter: spec.feynmanAfter,
      choices: feynmanChoices,
      twistConstraint: spec.twistConstraint,
    },
    hasDpLadder: spec.hasDpLadder,
    sandboxConfig: {
      type: 'interactive-trace',
      instruction: spec.sandboxInstruction,
      hint: spec.sandboxHint,
    },
    functionSignature: spec.signatures,
    blocks: spec.blocks,
    bottleneck: {
      question: spec.bottleneckQuestion,
      options: bottleneckOptions,
    },
    raceDataset: {
      label: spec.raceLabel,
      values: spec.raceValues,
      target: spec.raceTarget,
      bruteTrace: toRaceFrames(spec.bruteSteps),
      optimalTrace: toRaceFrames(spec.optimalSteps),
    },
    interviewContext: {
      companies: spec.companies,
      frequencyNote: spec.frequencyNote,
      followUpTwists: spec.followUpTwists,
      relatedProblems: spec.relatedProblems,
    },
  };
}
