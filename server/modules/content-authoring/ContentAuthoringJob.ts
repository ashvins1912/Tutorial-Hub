import mongoose, { Schema, Document } from 'mongoose';
import type { AuthoringStatus, ContentAnalysis, CanonicalLearningDraft, GeneratedLesson, GenerationMetadata } from './contentAuthoring.types';

export interface IContentAuthoringJob extends Document {
  ownerId: string;
  fileName: string;
  mimeType: string;
  sourceFormat: string;
  sourceText: string;
  sha256: string;
  status: AuthoringStatus;
  analysis?: ContentAnalysis;
  draft?: CanonicalLearningDraft;
  generatedLesson?: GeneratedLesson;
  generation?: GenerationMetadata;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema({
  id: String, title: String, purpose: String, required: Boolean, blockType: String,
}, { _id: false });
const ContentAuthoringJobSchema = new Schema<IContentAuthoringJob>({
  ownerId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  mimeType: { type: String, required: true },
  sourceFormat: { type: String, required: true },
  sourceText: { type: String, required: true, select: false },
  sha256: { type: String, required: true },
  status: { type: String, enum: ['uploaded', 'analyzed', 'review_required', 'failed'], default: 'uploaded', index: true },
  analysis: Schema.Types.Mixed,
  draft: Schema.Types.Mixed,
  generatedLesson: Schema.Types.Mixed,
  generation: Schema.Types.Mixed,
  error: String,
}, { timestamps: true });

ContentAuthoringJobSchema.index({ ownerId: 1, createdAt: -1 });
export const ContentAuthoringJob = mongoose.models.ContentAuthoringJob ||
  mongoose.model<IContentAuthoringJob>('ContentAuthoringJob', ContentAuthoringJobSchema);
