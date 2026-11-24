import mongoose, { Schema, Document } from 'mongoose';

export interface IAIAcademyProgress extends Document {
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt: Date | null;
  quizAttempts: number;
  quizPassed: boolean;
  quizLastCorrect: boolean | null;
  lastAccessedAt: Date;
}

const AIAcademyProgressSchema = new Schema<IAIAcademyProgress>({
  userId: { type: String, required: true, index: true },
  lessonId: { type: String, required: true, maxlength: 120 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  quizAttempts: { type: Number, min: 0, default: 0 },
  quizPassed: { type: Boolean, default: false },
  quizLastCorrect: { type: Boolean, default: null },
  lastAccessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

AIAcademyProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
AIAcademyProgressSchema.index({ userId: 1, lastAccessedAt: -1 });

export const AIAcademyProgress: mongoose.Model<IAIAcademyProgress> =
  (mongoose.models.AIAcademyProgress as mongoose.Model<IAIAcademyProgress> | undefined) ||
  mongoose.model<IAIAcademyProgress>('AIAcademyProgress', AIAcademyProgressSchema);
