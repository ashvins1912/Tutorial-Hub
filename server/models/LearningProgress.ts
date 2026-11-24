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
  quizHistory: Array<{ score: number; total: number; accuracy: number; attemptedAt: Date; objectiveResults?: Array<{ objectiveId: string; correct: number; total: number; accuracy: number }>; questionIndexes?: number[] }>;
  simulatorHistory: Array<{ simulatorId: string; scenario: string; answeredPredictions: number; completedAt: Date }>;
  bestScore: number;
  lastScore: number | null;
  quizTotal: number;
  masteryLevel: LearningDifficulty;
  lastAnswers: Record<string, string>;
  completedPracticeIds: string[];
  lastAccessedAt: Date;
}

const ObjectiveResultSchema = new Schema({
  objectiveId: { type: String, required: true, maxlength: 120 },
  correct: { type: Number, required: true, min: 0, max: 40 },
  total: { type: Number, required: true, min: 1, max: 40 },
  accuracy: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false });

const QuizAttemptSchema = new Schema({
  score: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 1, max: 40 },
  accuracy: { type: Number, required: true, min: 0, max: 100 },
  attemptedAt: { type: Date, default: Date.now },
  objectiveResults: { type: [ObjectiveResultSchema], default: [] },
  questionIndexes: { type: [Number], default: [] },
}, { _id: false });

const SimulatorCompletionSchema = new Schema({
  simulatorId: { type: String, required: true, maxlength: 80 },
  scenario: { type: String, enum: ['database-query-plan', 'system-capacity', 'concurrency-lost-update', 'cloud-pipeline-gate'], required: true },
  answeredPredictions: { type: Number, required: true, min: 1, max: 12 },
  completedAt: { type: Date, required: true },
}, { _id: false });

const LearningProgressSchema = new Schema<ILearningProgress>({
  userId: { type: String, required: true },
  lessonId: { type: String, required: true },
  algorithm: { type: String, enum: ['binary-search', 'bubble-sort'], default: 'binary-search' },
  input: { type: String, default: '2, 5, 8, 12, 16, 23, 38', maxlength: 300 },
  target: { type: String, default: '16', maxlength: 32 },
  currentStep: { type: Number, min: 0, max: 100, default: 0 },
  attempts: { type: Number, min: 0, default: 0 },
  quizHistory: { type: [QuizAttemptSchema], default: [] },
  simulatorHistory: { type: [SimulatorCompletionSchema], default: [] },
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

export const LearningProgress: mongoose.Model<ILearningProgress> =
  (mongoose.models.LearningProgress as mongoose.Model<ILearningProgress> | undefined) ||
  mongoose.model<ILearningProgress>('LearningProgress', LearningProgressSchema);
