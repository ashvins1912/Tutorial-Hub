import mongoose, { Document, Schema } from 'mongoose';
import type { ContentBundleKey, ContentDomainId } from '../../src/data/canonicalDataRegistry';

export type { ContentBundleKey, ContentDomainId };

export interface IPlatformContentBundle extends Document {
  collectionKey: ContentBundleKey;
  domain: ContentDomainId;
  label: string;
  schemaVersion: string;
  checksum: string;
  itemCount: number;
  byteSize: number;
  payload: unknown;
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
    domain: {
      type: String,
      required: true,
      default: 'algorithms',
      index: true,
    },
    label: {
      type: String,
      required: true,
      default: '',
    },
    schemaVersion: {
      type: String,
      required: true,
      default: '2026.4',
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
    byteSize: {
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
