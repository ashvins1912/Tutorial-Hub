import mongoose, { Document, Schema } from 'mongoose';

export type ContentBundleKey =
  | 'algorithms-catalog'
  | 'master-73-roadmap'
  | 'algorithm-power-combos'
  | 'curriculum-topics'
  | 'curated-interview-bank'
  | 'solver-strategies';

export interface IPlatformContentBundle extends Document {
  collectionKey: ContentBundleKey;
  schemaVersion: string;
  checksum: string;
  itemCount: number;
  payload: unknown[];
  syncedAt: Date;
}

const PlatformContentBundleSchema = new Schema<IPlatformContentBundle>(
  {
    collectionKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    schemaVersion: {
      type: String,
      required: true,
      default: '2026.1',
    },
    checksum: {
      type: String,
      required: true,
    },
    itemCount: {
      type: Number,
      required: true,
      default: 0,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
      default: [],
    },
    syncedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'platform_content_bundles',
  }
);

export const PlatformContentBundle =
  mongoose.models.PlatformContentBundle ||
  mongoose.model<IPlatformContentBundle>('PlatformContentBundle', PlatformContentBundleSchema);
