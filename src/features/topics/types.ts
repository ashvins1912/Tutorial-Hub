export type TopicDifficultyTier =
  | 'Foundations'
  | 'Intermediate'
  | 'Advanced'
  | 'Applied System Algorithms';

export type SupportedLanguage = 'python' | 'java' | 'javascript';

export type SolutionTierKey = 'brute' | 'better' | 'optimal';

export interface PatternClue {
  signal: string;
  constraintHint: string;
  whyItMatches: string;
}

export interface AnnotatedCodeLine {
  code: string;
  annotation: string;
}

export interface SolutionTierSpec {
  tier: SolutionTierKey;
  title: string;
  timeComplexity: string;
  spaceComplexity: string;
  intuition: string;
  bottleneckOrUpgrade: string;
  edgeCases: string[];
  code: Record<SupportedLanguage, AnnotatedCodeLine[]>;
}

export type ProblemDifficulty =
  | 'Easy'
  | 'Medium'
  | 'Hard'
  | 'Real-World System';

export interface ProblemLadderItem {
  id: string;
  title: string;
  difficulty: ProblemDifficulty;
  patternTwist: string;
  targetComplexity: string;
  trainerSlug?: string;
}

export interface LogicBlockItem {
  id: string;
  role: 'Base Case' | 'Initialization' | 'Loop Invariant' | 'State Update' | 'Pruning / Return';
  label: string;
  snippet: string;
  correctOrder: number;
  misplacedHint: string;
}

export type VisualizerKind =
  | 'array-pointers'
  | 'sliding-window'
  | 'hash-map'
  | 'stack-queue'
  | 'dp-table'
  | 'recursion-stack'
  | 'ngram-pipeline'
  | 'tree-graph';

export interface VisualizerConfig {
  kind: VisualizerKind;
  presetLabel: string;
  inputSummary: string;
  /** Optional custom numeric/string seed consumed by pure stepGenerator */
  sampleArray?: number[];
  sampleTarget?: number;
  sampleString?: string;
  sampleQuery?: string;
  sampleCandidates?: string[];
  codeLines: string[];
}

export type CurriculumDfdNodeKind =
  | 'external-input'
  | 'process'
  | 'data-store'
  | 'external-output';

export interface CurriculumDfdNode {
  id: string;
  stepNumber: number;
  code: string;
  label: string;
  shortSummary: string;
  kind: CurriculumDfdNodeKind;
  timeComplexity: string;
  spaceComplexity: string;
  input: string;
  output: string;
  upstreamLabels: string[];
  downstreamLabels: string[];
  stageMechanics: string;
  invariantNote: string;
  bottleneckNote: string;
  edgeCases: string[];
  col: number;
  row: number;
}

export interface CurriculumDfdEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  kind?: 'flow' | 'store-io';
}

export interface CurriculumDfdGraph {
  topicId: string;
  topicTitle: string;
  tier: TopicDifficultyTier;
  category: string;
  inputConstraint: string;
  recurrenceRelation: string;
  bruteTime: string;
  bruteSpace: string;
  betterTime: string;
  betterSpace: string;
  optimalTime: string;
  optimalSpace: string;
  nodes: CurriculumDfdNode[];
  edges: CurriculumDfdEdge[];
}

export interface CurriculumTopic {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  tier: TopicDifficultyTier;
  category: string;
  tagline: string;
  keywords: string[];
  patternClues: PatternClue[];
  mentalModelSteps: string[];
  solutions: Record<SolutionTierKey, SolutionTierSpec>;
  problemLadder: ProblemLadderItem[];
  logicBlocks: LogicBlockItem[];
  visualizer: VisualizerConfig;
  dfdGraph?: CurriculumDfdGraph;
  deepLink?: {
    kind: 'algorithm' | 'ngram-lab' | 'pruning-sim' | 'fuzzy-curriculum';
    targetId: string;
    label: string;
  };
}

export interface VisualizerFrame {
  step: number;
  title: string;
  explanation: string;
  activeLine: number;
  invariantNote: string;
  arrayValues?: (number | string)[];
  pointers?: Record<string, number>;
  highlightIndices?: number[];
  windowRange?: [number, number];
  mapEntries?: { key: string; value: string; highlight?: boolean }[];
  stackItems?: string[];
  dpGrid?: {
    rowLabels: string[];
    colLabels: string[];
    cells: (number | string)[][];
    activeCell?: [number, number];
  };
  ngramState?: {
    query: string;
    queryGrams: string[];
    activeGramIndex: number;
    candidates: {
      title: string;
      gramCount: number;
      overlap: number;
      score: number;
      status: 'scanning' | 'pruned' | 'kept' | 'reranked';
      reason: string;
    }[];
  };
}

export interface ConstraintDrillQuestion {
  id: string;
  problemTitle: string;
  statement: string;
  constraints: string[];
  targetComplexity: string;
  options: {
    id: string;
    pattern: string;
    dataStructure: string;
    isCorrect: boolean;
    rationale: string;
  }[];
  linkedTopicId: string;
}
