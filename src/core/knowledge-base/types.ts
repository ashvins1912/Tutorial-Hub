export type CognitiveDomain =
  | 'DSA_ALGORITHMIC'
  | 'MATHEMATICAL_LOGIC'
  | 'DEDUCTIVE_CONSTRAINT'
  | 'GAME_THEORY_INVARIANT'
  | 'SYSTEM_STATE_LOGIC';

export type SocraticPhase =
  | 'DECONSTRUCT'
  | 'HYPOTHESIZE'
  | 'ELIMINATE_OR_BUILD'
  | 'VERIFY_EDGE_CASES';

export type WorkspaceKind =
  | 'array-pointer'
  | 'truth-grid'
  | 'invariant-tracker'
  | 'logic-builder';

export type DifficultyTier =
  | 'Foundations'
  | 'Intermediate'
  | 'Advanced'
  | 'Applied System Algorithms';

export type ProgressionTier = 'Easy' | 'Medium' | 'Hard' | 'System Design';

export type ComplexityOrder =
  | 'O(1)'
  | 'O(log N)'
  | 'O(N)'
  | 'O(N log N)'
  | 'O(N^2)'
  | 'O(2^N)'
  | 'O(N!)';

export type SupportedCodeLanguage = 'typescript' | 'python' | 'java';

export interface MultiLangCode {
  typescript: string;
  python: string;
  java: string;
}

export interface TierApproach {
  tier: 'Brute Force' | 'Better' | 'Optimal';
  title: string;
  timeComplexity: string;
  spaceComplexity: string;
  keyInsight: string;
  code: MultiLangCode;
}

export interface StrategySignature {
  id: string;
  name: string;
  category:
    | 'Foundations'
    | 'Hierarchical & Graph'
    | 'Algorithmic Paradigms'
    | 'String & Fuzzy Search'
    | 'Pure Logic & Math';
  difficulty: DifficultyTier;
  domains: CognitiveDomain[];
  workspaceKind: WorkspaceKind;
  curriculumTopicId?: string;
  mentalModel: string;
  structuralClues: string[];
  triggerKeywords: string[];
  antiPatterns: string[];
  optimalTime: string;
  optimalSpace: string;
  /** Complexity rank 1 (O(1)) .. 7 (O(N!)) used for TLE pruning against constraints */
  complexityRank: number;
  pitfalls: string[];
  socraticPrompts: Record<SocraticPhase, string>;
  approaches: [TierApproach, TierApproach, TierApproach];
}

export interface TopicModule {
  id: string;
  title: string;
  category: StrategySignature['category'];
  difficulty: DifficultyTier;
  domain: CognitiveDomain;
  summary: string;
  mentalModel: string;
  keyPatterns: string[];
  complexitySummary: string;
  approaches: TierApproach[];
}

export interface ProblemItem {
  id: string;
  title: string;
  tier: ProgressionTier;
  expectedDomain: CognitiveDomain;
  expectedStrategyId: string;
  workspaceKind: WorkspaceKind;
  statement: string;
  constraintsSummary: string;
  sampleInput: string;
  sampleOutput: string;
}

export interface ExtractedConstraint {
  raw: string;
  label: string;
  numericBound?: number;
  ceiling: ComplexityOrder;
  ceilingRank: number;
  spaceConstraint?: string;
  reason: string;
}

export interface DomainScore {
  domain: CognitiveDomain;
  score: number;
  matchedSignals: string[];
}

export interface DeconstructionResult {
  rawInput: string;
  normalizedText: string;
  primaryDomain: CognitiveDomain;
  domainScores: DomainScore[];
  constraints: ExtractedConstraint[];
  hardestCeiling: ComplexityOrder;
  hardestCeilingRank: number;
  paddedTrigrams: string[];
  triggerPhrases: string[];
  entities: string[];
  antiPatternSignals: string[];
}

export interface CandidateMatch {
  strategy: StrategySignature;
  overlapCount: number;
  jaccardScore: number;
  recallScore: number;
  matchedTrigrams: number;
  prunedReason?: string;
}

export interface RetrievalOutput {
  candidates: CandidateMatch[];
  indexedStrategyCount: number;
  totalIndexedTrigrams: number;
  evaluatedCount: number;
  prunedCount: number;
  elapsedMs: number;
}

export interface SocraticBlueprintStep {
  phase: SocraticPhase;
  label: string;
  objective: string;
  guidingPrompt: string;
  checkpointCriteria: string;
}

export interface ConfidenceBreakdown {
  domainAlignment: number;
  exactClueScore: number;
  ngramOverlap: number;
  penaltyDeduction: number;
  finalScore: number;
}

export interface RankedRecommendation {
  strategy: StrategySignature;
  confidence: number;
  breakdown: ConfidenceBreakdown;
  matchedClues: string[];
  reasoningTrace: string[];
  pitfallWarnings: string[];
  tleWarning?: string;
}

export interface EngineAnalysisResult {
  deconstruction: DeconstructionResult;
  retrieval: RetrievalOutput;
  recommendations: RankedRecommendation[];
  topStrategy: RankedRecommendation | null;
  blueprint: SocraticBlueprintStep[];
  recommendedWorkspace: WorkspaceKind;
  totalElapsedMs: number;
}

export interface MicroDrillQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MicroDrillSpec {
  id: string;
  title: string;
  targetPhase: SocraticPhase;
  domain: CognitiveDomain;
  diagnosedGap: string;
  estimatedMinutes: number;
  createdAt: string;
  sourceProblemId: string;
  completed: boolean;
  questions: MicroDrillQuestion[];
}

export interface DropRecord {
  id: string;
  problemId: string;
  problemTitle: string;
  domain: CognitiveDomain;
  droppedAtPhase: SocraticPhase;
  diagnosedGap: string;
  timestamp: string;
}

export interface Sm2ReviewItem {
  problemId: string;
  problemTitle: string;
  domain: CognitiveDomain;
  masteryScore: number;
  hintsUsed: number;
  independent: boolean;
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  lastReviewedAt: string;
  nextReviewAt: string;
}

export interface AdaptiveTelemetryState {
  drops: DropRecord[];
  microDrills: MicroDrillSpec[];
  sm2Queue: Sm2ReviewItem[];
  unlockedTier: ProgressionTier;
  completedProblemIds: string[];
}
