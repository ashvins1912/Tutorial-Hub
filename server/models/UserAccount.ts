import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAccount extends Document {
  supabaseUserId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  lastSignInAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserAccountSchema = new Schema<IUserAccount>({
  supabaseUserId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  fullName: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  lastSignInAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const UserAccount: mongoose.Model<IUserAccount> =
  (mongoose.models.UserAccount as mongoose.Model<IUserAccount> | undefined) ||
  mongoose.model<IUserAccount>('UserAccount', UserAccountSchema);
