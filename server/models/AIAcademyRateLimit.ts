import mongoose, { Schema, Document } from 'mongoose';

export interface IAIAcademyRateLimit extends Document {
  userId: string;
  windowStart: Date;
  count: number;
  expiresAt: Date;
}

const AIAcademyRateLimitSchema = new Schema<IAIAcademyRateLimit>({
  userId: { type: String, required: true, maxlength: 128 },
  windowStart: { type: Date, required: true },
  count: { type: Number, required: true, min: 1, default: 0 },
  expiresAt: { type: Date, required: true },
}, { versionKey: false });

AIAcademyRateLimitSchema.index({ userId: 1, windowStart: 1 }, { unique: true });
AIAcademyRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AIAcademyRateLimit: mongoose.Model<IAIAcademyRateLimit> =
  (mongoose.models.AIAcademyRateLimit as mongoose.Model<IAIAcademyRateLimit> | undefined) ||
  mongoose.model<IAIAcademyRateLimit>('AIAcademyRateLimit', AIAcademyRateLimitSchema);
