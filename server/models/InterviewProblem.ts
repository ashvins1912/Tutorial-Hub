import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewProblem extends Document {
  slug: string;
  title: string;
  normalizedTitle: string;
  topicId: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  aliases: string[];
  relatedTitles: string[];
  catalogStatus: 'inventory' | 'authored' | 'review';
  contentStatus: 'needs-authoring' | 'in-progress' | 'validated';
  statement?: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  stages: {
    understand?: { concept?: string; prerequisites?: string[]; invariants?: string[] };
    visualize?: { diagram?: string; animationSteps?: string[] };
    implement?: { bruteForce?: string; better?: string; optimal?: string; java?: string; javascript?: string; python?: string };
    practice?: { hints?: string[]; testCases?: Array<{ input: string; expected: string }> };
    master?: { proof?: string; timeComplexity?: string; spaceComplexity?: string; quiz?: string[]; revisionDays?: number[] };
  };
  source: { kind: string; reference?: string };
  matchReview?: { status: 'clear' | 'needs-review'; confidence: number; matchedSlug?: string; reason?: string };
  authoringMetadata?: { generation: string; status: string; sourcePolicy: string; missingEvidence: string[] };
}

const ExampleSchema = new Schema({ input: String, output: String, explanation: String }, { _id: false });
const InterviewProblemSchema = new Schema<IInterviewProblem>({
  slug: { type: String, required: true },
  title: { type: String, required: true },
  normalizedTitle: { type: String, required: true, index: true },
  topicId: { type: String, required: true, index: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  aliases: { type: [String], default: [] },
  relatedTitles: { type: [String], default: [] },
  catalogStatus: { type: String, enum: ['inventory', 'authored', 'review'], default: 'inventory' },
  contentStatus: { type: String, enum: ['needs-authoring', 'in-progress', 'validated'], default: 'needs-authoring' },
  statement: String,
  examples: { type: [ExampleSchema], default: [] },
  constraints: { type: [String], default: [] },
  stages: {
    understand: Schema.Types.Mixed,
    visualize: Schema.Types.Mixed,
    implement: Schema.Types.Mixed,
    practice: Schema.Types.Mixed,
    master: Schema.Types.Mixed,
  },
  source: { kind: { type: String, default: 'master-interview-inventory' }, reference: String },
  matchReview: Schema.Types.Mixed,
  authoringMetadata: Schema.Types.Mixed,
}, { timestamps: true, strict: true });

InterviewProblemSchema.index({ topicId: 1, normalizedTitle: 1 }, { unique: true });
InterviewProblemSchema.index({ slug: 1 }, { unique: true });

export const InterviewProblem = mongoose.models.InterviewProblem ||
  mongoose.model<IInterviewProblem>('InterviewProblem', InterviewProblemSchema);
