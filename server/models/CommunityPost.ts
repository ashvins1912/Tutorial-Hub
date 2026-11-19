import mongoose, { Schema, Document } from 'mongoose';

export type CommunityPostType = 'problem' | 'challenge' | 'read';
export type CommunityDifficulty = 'Easy' | 'Medium' | 'Hard' | 'All';

export interface ICommunityComment {
  userId: string;
  authorName: string;
  body: string;
  createdAt: Date;
}

export interface ICommunityPost extends Document {
  authorUserId: string;
  authorName: string;
  authorEmail: string;
  authorTier: string;
  postType: CommunityPostType;
  title: string;
  description: string;
  topicTag: string;
  difficulty: CommunityDifficulty;
  problemRef?: string;
  externalUrl?: string;
  sourcePlatform?: string;
  targetTimeMinutes?: number;
  upvotedBy: string[];
  completedBy: string[];
  comments: ICommunityComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommunityCommentSchema = new Schema<ICommunityComment>(
  {
    userId: { type: String, required: true },
    authorName: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CommunityPostSchema = new Schema<ICommunityPost>(
  {
    authorUserId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, default: '', lowercase: true, trim: true },
    authorTier: { type: String, default: 'Noob' },
    postType: {
      type: String,
      enum: ['problem', 'challenge', 'read'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    topicTag: { type: String, default: 'General DSA', trim: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'All'],
      default: 'Medium',
    },
    problemRef: { type: String, default: '' },
    externalUrl: { type: String, default: '' },
    sourcePlatform: { type: String, default: '', index: true },
    targetTimeMinutes: { type: Number, min: 5, max: 180 },
    upvotedBy: { type: [String], default: [] },
    completedBy: { type: [String], default: [] },
    comments: { type: [CommunityCommentSchema], default: [] },
  },
  { timestamps: true }
);

CommunityPostSchema.index({ createdAt: -1 });

export const CommunityPost =
  mongoose.models.CommunityPost ||
  mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);
