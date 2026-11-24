import mongoose, { Schema, Document } from 'mongoose';

export type CommunityInviteStatus = 'pending' | 'accepted' | 'revoked';

export interface ICommunityInvite extends Document {
  inviteCode: string;
  inviterUserId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  personalMessage: string;
  status: CommunityInviteStatus;
  acceptedByUserId?: string;
  acceptedByName?: string;
  acceptedByEmail?: string;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityInviteSchema = new Schema<ICommunityInvite>(
  {
    inviteCode: { type: String, required: true, unique: true, index: true },
    inviterUserId: { type: String, required: true, index: true },
    inviterName: { type: String, default: '' },
    inviterEmail: { type: String, default: '', lowercase: true, trim: true },
    inviteeEmail: { type: String, default: '', lowercase: true, trim: true, index: true },
    personalMessage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'revoked'],
      default: 'pending',
      index: true,
    },
    acceptedByUserId: { type: String, default: '' },
    acceptedByName: { type: String, default: '' },
    acceptedByEmail: { type: String, default: '', lowercase: true, trim: true },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

export const CommunityInvite: mongoose.Model<ICommunityInvite> =
  (mongoose.models.CommunityInvite as mongoose.Model<ICommunityInvite> | undefined) ||
  mongoose.model<ICommunityInvite>('CommunityInvite', CommunityInviteSchema);
