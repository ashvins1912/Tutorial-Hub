import mongoose, { Schema, Document } from 'mongoose';

export type RankTier = 'LogicWarmup' | 'Noob' | 'Apprentice' | 'Practitioner' | 'Strategist' | 'Pro';

export interface ISpacedRepetitionItem {
  problemId: mongoose.Types.ObjectId | string;
  problemTitle?: string;
  patternTag: string;
  intervalStage: 1 | 3 | 7 | 21;
  nextReviewDate: Date;
  isDueNow?: boolean;
  twistConstraint: string;
}

export interface IUserBrainProfile extends Document {
  userId: string;
  currentTier: RankTier;
  cognitiveMetrics: {
    signalRecognitionScore: number;
    bottleneckDiagnosisScore: number;
    logicAssemblyAccuracy: number;
    paperDryRunStreak: number;
  };
  passedTopicQuizzes: string[];
  completedProblemIds: string[];
  completedWarmupDrills: string[];
  masteredProblemSlugs: string[];
  notes: Map<string, string>;
  spacedRepetitionQueue: ISpacedRepetitionItem[];
}

const SpacedRepetitionItemSchema = new Schema<ISpacedRepetitionItem>(
  {
    problemId: { type: Schema.Types.Mixed, ref: 'Problem', required: true },
    problemTitle: { type: String, default: '' },
    patternTag: { type: String, required: true },
    intervalStage: { type: Number, enum: [1, 3, 7, 21], default: 1 },
    nextReviewDate: { type: Date, required: true },
    isDueNow: { type: Boolean, default: false },
    twistConstraint: { type: String, required: true },
  },
  { _id: false }
);

const UserBrainProfileSchema = new Schema<IUserBrainProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    currentTier: {
      type: String,
      enum: ['LogicWarmup', 'Noob', 'Apprentice', 'Practitioner', 'Strategist', 'Pro'],
      default: 'Noob',
    },
    cognitiveMetrics: {
      signalRecognitionScore: { type: Number, min: 0, max: 100, default: 76 },
      bottleneckDiagnosisScore: { type: Number, min: 0, max: 100, default: 80 },
      logicAssemblyAccuracy: { type: Number, min: 0, max: 100, default: 74 },
      paperDryRunStreak: { type: Number, min: 0, default: 2 },
    },
    passedTopicQuizzes: [{ type: String }],
    completedProblemIds: [{ type: String }],
    completedWarmupDrills: [{ type: String }],
    masteredProblemSlugs: [{ type: String }],
    notes: { type: Map, of: String, default: {} },
    spacedRepetitionQueue: [SpacedRepetitionItemSchema],
  },
  { timestamps: true }
);

export const UserBrainProfile =
  mongoose.models.UserBrainProfile ||
  mongoose.model<IUserBrainProfile>('UserBrainProfile', UserBrainProfileSchema);
