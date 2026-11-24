/**
 * Canonical Learning Content & Governance Contract (Layer 2)
 * Shared across Pattern Forge and all Tutorial Hub academies.
 */

export type AcademyId =
  | 'pattern-forge'
  | 'dsa-academy'
  | 'java-academy'
  | 'python-academy'
  | 'database-academy'
  | 'system-design-academy'
  | 'full-stack-academy'
  | 'devops-cloud-academy'
  | 'ai-engineering-academy';

export type LessonStageId = 'understand' | 'visualize' | 'implement' | 'practice' | 'master';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type VerificationStatus =
  | 'Draft'
  | 'Structurally Valid'
  | 'Technically Reviewed'
  | 'Code Verified'
  | 'Content Verified'
  | 'Learning Validated'
  | 'Published';

export type PublicationStatus = 'unpublished' | 'pilot' | 'published' | 'deprecated';

export type SolutionTier = 'brute' | 'better' | 'optimal';

export type ReferenceLanguage = 'java' | 'javascript' | 'python';

export type PracticeCategory =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'edge-case'
  | 'debugging'
  | 'mixed-pattern'
  | 'unseen-transfer';

export type MasteryDimensionId =
  | 'understanding'
  | 'patternRecognition'
  | 'visualization'
  | 'implementation'
  | 'correctness'
  | 'complexityAnalysis'
  | 'debugging'
  | 'transferAbility';

export type MasteryLevel =
  | 'Not Started'
  | 'Learning'
  | 'Practicing'
  | 'Proficient'
  | 'Mastered';

export type RevisionIntervalDay = 1 | 3 | 7 | 14 | 30;

export interface TopicPrerequisite {
  topicId: string;
  title: string;
  reason: string;
  required: boolean;
}

export interface LearningObjective {
  id: string;
  statement: string;
  stage: LessonStageId;
  dimension: MasteryDimensionId;
}

export interface ConceptualExample {
  id: string;
  title: string;
  problemStatement: string;
  input: string;
  output: string;
  constraints: string[];
  walkthrough: string[];
  keyObservation: string;
}

export interface BruteForceComparison {
  id: string;
  title: string;
  bruteApproach: string;
  bruteTime: string;
  bruteSpace: string;
  bottleneck: string;
  optimizedApproach: string;
  optimizedTime: string;
  optimizedSpace: string;
  whyBetter: string;
}

export interface UnderstandStageContent {
  whatIsPattern: string;
  whyItExists: string;
  problemItSolves: string;
  whenToUse: string[];
  whenNotToUse: string[];
  advantages: string[];
  limitations: string[];
  realWorldAnalogy: {
    title: string;
    narrative: string;
    mappingToAlgorithm: string;
  };
  simpleExample: ConceptualExample;
  conceptualExamples: ConceptualExample[];
  bruteForceComparisons: BruteForceComparison[];
  importantObservations: string[];
  commonMisconceptions: Array<{
    misconception: string;
    correction: string;
  }>;
  conceptCheck: {
    id: string;
    prompt: string;
    options: Array<{ id: string; label: string; explanation: string; isCorrect: boolean }>;
  };
}

// ============================================================================
// Interactive Visualization Engine Contracts (Section 6)
// ============================================================================

export type TraceDataStructureKind =
  | 'array'
  | 'hashmap'
  | 'hashset'
  | 'window'
  | 'dp-1d'
  | 'dp-2d'
  | 'stack'
  | 'queue'
  | 'linked-list'
  | 'tree'
  | 'graph';

export interface TraceVariable {
  name: string;
  value: string;
  changed?: boolean;
  role?: 'pointer' | 'accumulator' | 'result' | 'state';
}

export interface TraceOperation {
  type:
    | 'init'
    | 'inspect'
    | 'lookup'
    | 'insert'
    | 'expand'
    | 'shrink'
    | 'transition'
    | 'update-best'
    | 'complete';
  summary: string;
  detail: string;
  highlightedIndices?: number[];
}

export interface TracePointer {
  name: string;
  index: number;
  color: 'sky' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

export interface TraceMapEntry {
  key: string;
  value: string;
  highlighted?: boolean;
  isNew?: boolean;
}

export interface TraceDpCellHighlight {
  row: number;
  col: number;
  role: 'current' | 'dependency' | 'updated' | 'answer';
}

export interface TraceState {
  array?: Array<string | number>;
  pointers?: TracePointer[];
  windowRange?: { left: number; right: number; valid: boolean } | null;
  hashMap?: TraceMapEntry[];
  hashSet?: Array<{ value: string; highlighted?: boolean }>;
  dp1d?: Array<{ index: number; value: string; label?: string; role?: 'current' | 'dependency' | 'updated' | 'answer' }>;
  dp2d?: {
    rowHeaders: string[];
    colHeaders: string[];
    grid: Array<Array<string | number>>;
    highlights: TraceDpCellHighlight[];
  };
  intermediateResult?: string;
  finalResult?: string;
}

export interface TraceCheckpoint {
  id: string;
  prompt: string;
  options: Array<{
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }>;
}

export interface TraceStep {
  stepIndex: number;
  operation: TraceOperation;
  variables: TraceVariable[];
  state: TraceState;
  stateChangeSummary: string;
  invariant: string;
  checkpoint?: TraceCheckpoint;
}

export interface LearningTrace {
  id: string;
  topicId: string;
  title: string;
  algorithmName: string;
  description: string;
  primaryStructure: TraceDataStructureKind;
  defaultInputLabel: string;
  defaultInput: Record<string, string>;
  inputSchema: Array<{
    key: string;
    label: string;
    placeholder: string;
    helpText: string;
  }>;
  invariantRule: string;
  steps: TraceStep[];
}

// ============================================================================
// Verified Code Implementations & Test Suites (Sections 3 & 7)
// ============================================================================

export interface CodeVariant {
  tier: SolutionTier;
  label: string;
  summary: string;
  timeComplexity: string;
  spaceComplexity: string;
  stepByStepExplanation: string[];
  code: {
    java: string; // Java 21 primary reference
    javascript: string; // Modern ES2022+
    python: string; // Python 3.12+
  };
}

export interface TestCase {
  id: string;
  name: string;
  args: unknown[];
  expected: unknown;
  isEdgeCase?: boolean;
  isBoundary?: boolean;
  note?: string;
}

export interface TestSuite {
  id: string;
  entryFunctionName: {
    java: string;
    javascript: string;
    python: string;
  };
  comparator: 'exact' | 'unordered-array' | 'unordered-string-groups';
  cases: TestCase[];
}

export interface ProblemSolution {
  problemId: string;
  variants: CodeVariant[];
  correctnessProof: {
    invariant: string;
    initialization: string;
    maintenance: string;
    termination: string;
  };
  complexityAnalysis: {
    time: string;
    timeJustification: string;
    space: string;
    spaceJustification: string;
  };
  edgeCases: Array<{
    caseTitle: string;
    inputExample: string;
    expectedBehavior: string;
  }>;
  commonMistakes: Array<{
    mistake: string;
    whyItFails: string;
    fix: string;
  }>;
}

export interface CanonicalProblem {
  id: string;
  topicId: string;
  slug: string;
  title: string;
  difficulty: DifficultyLevel;
  category: PracticeCategory;
  hidePatternUntilSolved: boolean;
  problemStatement: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  constraints: string[];
  hints: string[];
  starterCodeJs: string;
  buggyCodeJs?: string;
  bugDescription?: string;
  solution: ProblemSolution;
  testSuite: TestSuite;
  verificationStatus: VerificationStatus;
  patternRecognitionPrompt?: PatternRecognitionPrompt;
}

// ============================================================================
// Pattern Recognition Intelligence (Section 8)
// ============================================================================

export interface PatternRecognitionCriterion {
  criterion:
    | 'structuralUnderstanding'
    | 'patternIdentification'
    | 'dataStructureSelection'
    | 'constraintReasoning'
    | 'complexityAnalysis'
    | 'alternativeApproachEvaluation';
  label: string;
  weight: number; // 20, 25, 15, 15, 15, 10 -> sums to 100
  question: string;
  options: Array<{
    id: string;
    label: string;
    isCorrect: boolean;
    rationale: string;
  }>;
}

export interface PatternRecognitionPrompt {
  id: string;
  problemTitle: string;
  problemExcerpt: string;
  constraintsSummary: string;
  criteria: PatternRecognitionCriterion[];
}

// ============================================================================
// Assessments, Mastery, Revisions & Governance (Sections 9, 10, 11)
// ============================================================================

export interface AssessmentQuestion {
  id: string;
  objectiveId: string;
  dimension: MasteryDimensionId;
  prompt: string;
  scenarioContext?: string;
  options: Array<{
    id: string;
    label: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface CanonicalAssessment {
  id: string;
  topicId: string;
  title: string;
  kind: 'concept' | 'pattern-recognition' | 'unseen-transfer' | 'delayed-recall';
  passingScorePct: number;
  questions: AssessmentQuestion[];
}

export interface ContentReview {
  id: string;
  version: string;
  role: 'author' | 'technical-reviewer' | 'learning-reviewer';
  reviewer: string;
  statusGranted: VerificationStatus;
  reviewedAt: string;
  notes: string;
}

export interface ContentVersion {
  contentId: string;
  version: string;
  publicationStatus: PublicationStatus;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  author: string;
  technicalReviewer: string | null;
  learningReviewer: string | null;
  reviewHistory: ContentReview[];
}

export interface LessonStage {
  id: LessonStageId;
  order: number;
  title: string;
  subtitle: string;
  requiredEvidenceLabel: string;
}

export interface LearningAsset {
  id: string;
  kind: 'trace' | 'solution' | 'diagram' | 'test-suite' | 'rubric';
  title: string;
  verified: boolean;
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  stages: LessonStage[];
  assets: LearningAsset[];
  contentVersion: string;
}

export interface MasteryRequirement {
  dimension: MasteryDimensionId;
  label: string;
  minimumScorePct: number;
  evidenceDescription: string;
}

export interface LearningTopic {
  id: string; // Preserved canonical ID from DSA28_PATTERNS
  academyId: AcademyId;
  number: number;
  groupId: string;
  groupTitle: string;
  title: string;
  shortTitle: string;
  description: string;
  difficulty: DifficultyLevel;
  prerequisites: TopicPrerequisite[];
  learningObjectives: LearningObjective[];
  concepts: string[];
  recognitionSignals: string[];
  antiPatterns: string[];
  isPilotReference: boolean;
  understand?: UnderstandStageContent;
  traceIds: string[];
  problems: CanonicalProblem[];
  assessments: CanonicalAssessment[];
  masteryRequirements: MasteryRequirement[];
  revisionIntervalsDays: RevisionIntervalDay[];
  references: Array<{ title: string; source: string }>;
  version: ContentVersion;
  verificationStatus: VerificationStatus;
  activityCounts: {
    conceptualExamples: number;
    interactiveTraces: number;
    bruteForceComparisons: number;
    codingProblems: number;
    edgeCaseChallenges: number;
    debuggingExercises: number;
    mixedPatternProblems: number;
    unseenTransferExercises: number;
  };
}

export interface Curriculum {
  id: string;
  academyId: AcademyId;
  title: string;
  description: string;
  version: string;
  topicIds: string[];
  pilotTopicIds: string[];
  targetActivitiesPerTopic: number;
}

// ============================================================================
// Learner Evidence, Assessment Attempts & Revision State
// ============================================================================

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  topicId: string;
  contentVersion: string;
  kind: CanonicalAssessment['kind'];
  submittedAt: string;
  scorePct: number;
  passed: boolean;
  hintsUsed: number;
  timeTakenSec: number;
  dimensionScores: Partial<Record<MasteryDimensionId, number>>;
  answers: Record<string, string>;
}

export interface DimensionMasteryRecord {
  dimension: MasteryDimensionId;
  label: string;
  scorePct: number;
  evidenceCount: number;
  metMasteryThreshold: boolean;
  lastUpdatedAt: string | null;
}

export interface MasteryEvidence {
  topicId: string;
  contentVersion: string;
  understandCompleted: boolean;
  conceptCheckPassed: boolean;
  tracesCompleted: string[];
  predictionCheckpointsCorrect: number;
  predictionCheckpointsTotal: number;
  implementationsVerified: string[];
  edgeCasesPassed: number;
  debuggingExercisesPassed: string[];
  patternRecognitionBestPct: number;
  complexityCheckPassed: boolean;
  transferAssessmentBestPct: number;
  delayedRecallPassedCount: number;
  hintsUsedTotal: number;
  mistakesCount: number;
  updatedAt: string;
}

export interface TopicMasterySummary {
  topicId: string;
  level: MasteryLevel;
  overallScorePct: number;
  dimensions: DimensionMasteryRecord[];
  missingForMastery: string[];
  evidence: MasteryEvidence;
}

export interface RevisionSchedule {
  id: string;
  topicId: string;
  topicTitle: string;
  currentStageIndex: number; // 0..4 maps to [1, 3, 7, 14, 30]
  intervalDays: RevisionIntervalDay;
  dueAt: string;
  lastReviewedAt: string | null;
  status: 'due' | 'scheduled' | 'needs-reinforcement';
  consecutiveFailures: number;
  adjustmentReason: string;
  history: Array<{
    attemptedAt: string;
    scorePct: number;
    hintsUsed: number;
    timeTakenSec: number;
    nextIntervalDays: RevisionIntervalDay;
    outcome: 'advanced' | 'held' | 'reinforced';
  }>;
}
