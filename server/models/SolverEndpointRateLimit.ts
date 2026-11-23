import mongoose, { Document, Schema } from 'mongoose';

export interface ISolverEndpointRateLimit extends Document {
  userId: string;
  endpoint: string;
  windowStart: Date;
  count: number;
  expiresAt: Date;
}

const SolverEndpointRateLimitSchema = new Schema<ISolverEndpointRateLimit>({
  userId: { type: String, required: true, maxlength: 128 },
  endpoint: { type: String, required: true, maxlength: 32 },
  windowStart: { type: Date, required: true },
  count: { type: Number, required: true, min: 1, default: 0 },
  expiresAt: { type: Date, required: true },
}, { versionKey: false });

SolverEndpointRateLimitSchema.index({ userId: 1, endpoint: 1, windowStart: 1 }, { unique: true });
SolverEndpointRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SolverEndpointRateLimit = mongoose.models.SolverEndpointRateLimit ||
  mongoose.model<ISolverEndpointRateLimit>('SolverEndpointRateLimit', SolverEndpointRateLimitSchema);
