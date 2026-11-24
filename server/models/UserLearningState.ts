import mongoose, { Schema, Document } from 'mongoose';

export interface IUserLearningState extends Document {
  userId: string;
  stateKey: string;
  payload: unknown;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserLearningStateSchema = new Schema<IUserLearningState>({
  userId: { type: String, required: true },
  stateKey: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

UserLearningStateSchema.index({ userId: 1, stateKey: 1 }, { unique: true });

export const UserLearningState: mongoose.Model<IUserLearningState> =
  (mongoose.models.UserLearningState as mongoose.Model<IUserLearningState> | undefined) ||
  mongoose.model<IUserLearningState>('UserLearningState', UserLearningStateSchema);
