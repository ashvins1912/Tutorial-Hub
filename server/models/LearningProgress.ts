import mongoose, { Schema, Document } from 'mongoose';

export type LearningDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ILearningProgress extends Document {
  userId: string;
  lessonId: string;
  algorithm: 'binary-search' | 'bubble-sort';
  input: string;
  target: string;
  currentStep: number;
  attempts: number;
  bestScore: number;
  lastScore: number | null;
  quizTotal: number;
  masteryLevel: LearningDifficulty;
  lastAnswers: Record<string, string>;
  completedPracticeIds: string[];
  lastAccessedAt: Date;
}

const LearningProgressSchema = new Schema<ILearningProgress>({
  userId: { type: String, required: true },
  lessonId: { type: String, required: true },
  algorithm: { type: String, enum: ['binary-search', 'bubble-sort'], default: 'binary-search' },
  input: { type: String, default: '2, 5, 8, 12, 16, 23, 38', maxlength: 300 },
  target: { type: String, default: '16', maxlength: 32 },
  currentStep: { type: Number, min: 0, max: 100, default: 0 },
  attempts: { type: Number, min: 0, default: 0 },
  bestScore: { type: Number, min: 0, max: 100, default: 0 },
  lastScore: { type: Number, min: 0, max: 100, default: null },
  quizTotal: { type: Number, min: 0, default: 0 },
  masteryLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  lastAnswers: { type: Schema.Types.Mixed, default: {} },
  completedPracticeIds: { type: [String], default: [] },
  lastAccessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

LearningProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
LearningProgressSchema.index({ userId: 1, lastAccessedAt: -1 });

export const LearningProgress = mongoose.models.LearningProgress ||
  mongoose.model<ILearningProgress>('LearningProgress', LearningProgressSchema);
