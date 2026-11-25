import mongoose, { Document, Schema } from 'mongoose';
import type {
  AssessmentAttempt,
  MasteryEvidence,
  RevisionSchedule,
} from '../../shared/learningContract';

export interface IUnifiedLearningRecord extends Document {
  userId: string;
  evidenceByTopic: Record<string, MasteryEvidence>;
  assessmentHistory: AssessmentAttempt[];
  revisionsByTopic: Record<string, RevisionSchedule>;
  updatedAt: Date;
}

const UnifiedLearningRecordSchema = new Schema<IUnifiedLearningRecord>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    evidenceByTopic: { type: Schema.Types.Mixed, default: {} },
    assessmentHistory: { type: [Schema.Types.Mixed] as unknown as AssessmentAttempt[], default: [] },
    revisionsByTopic: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

export const UnifiedLearningRecord =
  (mongoose.models.UnifiedLearningRecord as mongoose.Model<IUnifiedLearningRecord> | undefined) ||
  mongoose.model<IUnifiedLearningRecord>('UnifiedLearningRecord', UnifiedLearningRecordSchema);
