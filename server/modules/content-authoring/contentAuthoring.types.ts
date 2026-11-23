export type ContentDomain = 'DSA' | 'MACHINE_LEARNING' | 'AI' | 'DATABASE' | 'SYSTEM_DESIGN' | 'SOFTWARE_ENGINEERING' | 'GENERAL';
export type ContentKind = 'algorithm' | 'coding_problem' | 'concept' | 'model' | 'architecture' | 'database_concept' | 'case_study' | 'tutorial' | 'question_bank' | 'custom';
export type ContentLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'undetermined';
export type AuthoringStatus = 'uploaded' | 'analyzed' | 'review_required' | 'failed';
export type GenerationStatus = 'not_started' | 'generating' | 'generated' | 'failed';

export interface LearningSection {
  id: string;
  title: string;
  purpose: string;
  required: boolean;
  blockType: 'explanation' | 'reasoning' | 'visualization' | 'code' | 'quiz' | 'exercise' | 'assessment' | 'reference';
}
export interface ContentAnalysis {
  domain: ContentDomain;
  kind: ContentKind;
  level: ContentLevel;
  confidence: number;
  title: string;
  topics: string[];
  prerequisites: string[];
  concepts: string[];
  detected: { headings: string[]; codeBlocks: number; tables: number; wordCount: number };
  recommendedVisualizations: string[];
  outline: LearningSection[];
  warnings: string[];
}
export interface CanonicalLearningDraft {
  schemaVersion: '1.0';
  title: string;
  domain: ContentDomain;
  kind: ContentKind;
  level: ContentLevel;
  source: { fileName: string; format: string; sha256: string };
  sourceText: string;
  learningObjectives: string[];
  prerequisites: string[];
  concepts: string[];
  sections: LearningSection[];
  status: 'draft';
}
export interface GeneratedCodeExample {
  language: string;
  code: string;
  explanation: string;
}
export interface GeneratedLessonModule {
  sectionId: string;
  title: string;
  purpose: string;
  contentMarkdown: string;
  keyPoints: string[];
  reasoningSteps: string[];
  workedExamples: Array<{ title: string; input?: string; output?: string; explanation: string }>;
  codeExamples: GeneratedCodeExample[];
}
export interface GeneratedVisualization {
  id: string;
  title: string;
  type: 'mermaid' | 'step-animation' | 'table' | 'equation' | 'chart-spec';
  description: string;
  source: string;
  steps?: Array<{ title: string; explanation: string; state?: Record<string, unknown> }>;
}
export interface GeneratedQuizQuestion {
  question: string;
  type: 'single-choice' | 'multiple-choice' | 'short-answer';
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
export interface GeneratedLessonSimulator {
  schemaVersion: 1;
  id: string;
  kind: 'algorithm-trace';
  title: string;
  description: string;
  algorithm: 'binary-search' | 'bubble-sort';
  initialInput: string;
  target?: string;
}
export interface GeneratedLesson {
  schemaVersion: '1.0';
  title: string;
  summary: string;
  learningObjectives: string[];
  modules: GeneratedLessonModule[];
  visualizations: GeneratedVisualization[];
  quiz: GeneratedQuizQuestion[];
  practiceTasks: Array<{ title: string; instructions: string; expectedOutcome: string; difficulty: string }>;
  simulator?: GeneratedLessonSimulator;
  references: Array<{ label: string; url: string; suppliedByUser: boolean }>;
  qualityNotes: string[];
  validation: { status: 'unverified-draft'; checks: string[]; warnings: string[] };
}
export interface GenerationMetadata {
  status: GenerationStatus;
  provider?: string;
  model?: string;
  generatedAt?: Date;
  durationMs?: number;
  errorCode?: string;
}
