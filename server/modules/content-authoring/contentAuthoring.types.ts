export type ContentDomain = 'DSA' | 'MACHINE_LEARNING' | 'AI' | 'DATABASE' | 'SYSTEM_DESIGN' | 'SOFTWARE_ENGINEERING' | 'GENERAL';
export type ContentKind = 'algorithm' | 'coding_problem' | 'concept' | 'model' | 'architecture' | 'database_concept' | 'case_study' | 'tutorial' | 'question_bank' | 'custom';
export type ContentLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'undetermined';
export type AuthoringStatus = 'uploaded' | 'analyzed' | 'review_required' | 'failed';

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
