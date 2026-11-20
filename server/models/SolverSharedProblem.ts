import mongoose, { Document, Schema } from 'mongoose';

export type SolverProblemVisibility = 'saved' | 'shared';
export type SolverSourcePlatform = 'LeetCode' | 'GeeksforGeeks' | 'Custom';

export interface ISolverSharedProblem extends Document {
  publicId: string;
  ownerUserId: string;
  ownerEmail: string;
  authorName: string;
  visibility: SolverProblemVisibility;
  sourcePlatform: SolverSourcePlatform;
  sourceUrl: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  statement: string;
  examples: string[];
  constraints: string[];
  topics: string[];
  recommendedPattern: string;
  complexitySummary: string;
  userNotes: string;
  upvotes: number;
  upvotedBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SolverSharedProblemSchema = new Schema<ISolverSharedProblem>(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    ownerUserId: { type: String, required: true, index: true },
    ownerEmail: { type: String, default: '', lowercase: true, trim: true },
    authorName: { type: String, default: 'Learner', trim: true },
    visibility: {
      type: String,
      enum: ['saved', 'shared'],
      required: true,
      index: true,
    },
    sourcePlatform: {
      type: String,
      enum: ['LeetCode', 'GeeksforGeeks', 'Custom'],
      default: 'Custom',
    },
    sourceUrl: { type: String, default: '', trim: true },
    slug: { type: String, default: '', trim: true },
    title: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    statement: { type: String, required: true },
    examples: { type: [String], default: [] },
    constraints: { type: [String], default: [] },
    topics: { type: [String], default: [] },
    recommendedPattern: { type: String, default: '' },
    complexitySummary: { type: String, default: '' },
    userNotes: { type: String, default: '' },
    upvotes: { type: Number, default: 0 },
    upvotedBy: { type: [String], default: [] },
  },
  { timestamps: true }
);

SolverSharedProblemSchema.index({ visibility: 1, createdAt: -1 });
SolverSharedProblemSchema.index({ ownerUserId: 1, visibility: 1, createdAt: -1 });

export const SolverSharedProblem =
  mongoose.models.SolverSharedProblem ||
  mongoose.model<ISolverSharedProblem>('SolverSharedProblem', SolverSharedProblemSchema);
