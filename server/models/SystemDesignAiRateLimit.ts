import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemDesignAiRateLimit extends Document {
  userId: string;
  windowStart: Date;
  count: number;
  expiresAt: Date;
}

const SystemDesignAiRateLimitSchema = new Schema<ISystemDesignAiRateLimit>({
  userId: { type: String, required: true, maxlength: 128 },
  windowStart: { type: Date, required: true },
  count: { type: Number, required: true, min: 1, default: 0 },
  expiresAt: { type: Date, required: true },
}, { versionKey: false });

SystemDesignAiRateLimitSchema.index({ userId: 1, windowStart: 1 }, { unique: true });
SystemDesignAiRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SystemDesignAiRateLimit = mongoose.models.SystemDesignAiRateLimit ||
  mongoose.model<ISystemDesignAiRateLimit>('SystemDesignAiRateLimit', SystemDesignAiRateLimitSchema);
