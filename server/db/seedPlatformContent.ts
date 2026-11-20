import crypto from 'crypto';
import { isMongoConnected } from './connectMongo';
import { PlatformContentBundle } from '../models/PlatformContentBundle';
import {
  ALL_CONTENT_BUNDLE_KEYS,
  CANONICAL_BUNDLE_DEFINITIONS,
  type ContentBundleKey,
  type ContentDomainId,
  getCanonicalFallbackBundle,
  isValidContentBundleKey,
} from '../../src/data/canonicalDataRegistry';

const SCHEMA_VERSION = '2026.4';

export interface StoredContentBundleSummary {
  collectionKey: ContentBundleKey;
  domain: ContentDomainId;
  label: string;
  schemaVersion: string;
  checksum: string;
  itemCount: number;
  byteSize: number;
  syncedAt: string;
  source: 'mongodb' | 'in-memory';
}

export interface ContentBundleRecord extends StoredContentBundleSummary {
  payload: unknown;
}

export interface ContentPushReport {
  pushed: boolean;
  storageMode: 'mongodb' | 'in-memory';
  syncedAt: string;
  totalCollections: number;
  totalItems: number;
  totalBytes: number;
  collections: StoredContentBundleSummary[];
}

export interface ContentBootstrapResponse {
  pullEnabled: boolean;
  pushOnStartupEnabled: boolean;
  storageMode: 'mongodb' | 'in-memory' | 'static-local';
  syncedAt: string;
  totalCollections: number;
  totalItems: number;
  totalBytes: number;
  collections: StoredContentBundleSummary[];
  bundles: Partial<Record<ContentBundleKey, unknown>>;
}

export interface SingleBundlePullResponse {
  pullEnabled: boolean;
  collectionKey: ContentBundleKey;
  found: boolean;
  storageMode: 'mongodb' | 'in-memory' | 'static-local';
  meta: StoredContentBundleSummary | null;
  payload: unknown;
}

const memoryContentStore = new Map<ContentBundleKey, ContentBundleRecord>();

export function isDbContentPushEnabled(): boolean {
  const raw = process.env.ENABLE_DB_CONTENT_PUSH_ON_STARTUP?.trim().toLowerCase();
  if (!raw) return true;
  return raw !== 'false' && raw !== '0' && raw !== 'off';
}

export function isDbContentPullEnabled(): boolean {
  const raw = process.env.ENABLE_DB_CONTENT_PULL?.trim().toLowerCase();
  if (!raw) return true;
  return raw !== 'false' && raw !== '0' && raw !== 'off';
}

function hashAndMeasure(payload: unknown): { checksum: string; byteSize: number } {
  const serialized = JSON.stringify(payload);
  const checksum = crypto.createHash('sha256').update(serialized).digest('hex').slice(0, 16);
  const byteSize = Buffer.byteLength(serialized, 'utf8');
  return { checksum, byteSize };
}

function buildCanonicalContentBundles(keys?: ContentBundleKey[]): Array<{
  key: ContentBundleKey;
  domain: ContentDomainId;
  label: string;
  itemCount: number;
  payload: unknown;
}> {
  const targetKeys =
    keys && keys.length > 0
      ? keys.filter((k) => isValidContentBundleKey(k))
      : ALL_CONTENT_BUNDLE_KEYS;

  return targetKeys.map((key) => {
    const def = CANONICAL_BUNDLE_DEFINITIONS[key];
    const payload = getCanonicalFallbackBundle(key);
    const itemCount = def.countItems(payload as never);
    return {
      key,
      domain: def.domain,
      label: def.label,
      itemCount,
      payload,
    };
  });
}

export async function pushPlatformContentToDb(options?: {
  force?: boolean;
  keys?: ContentBundleKey[];
}): Promise<ContentPushReport> {
  const force = Boolean(options?.force);
  const now = new Date();
  const syncedAtIso = now.toISOString();
  const bundles = buildCanonicalContentBundles(options?.keys);
  const mongoReady = isMongoConnected();
  const summaries: StoredContentBundleSummary[] = [];

  for (const { key, domain, label, itemCount, payload } of bundles) {
    const { checksum, byteSize } = hashAndMeasure(payload);

    memoryContentStore.set(key, {
      collectionKey: key,
      domain,
      label,
      schemaVersion: SCHEMA_VERSION,
      checksum,
      itemCount,
      byteSize,
      syncedAt: syncedAtIso,
      source: mongoReady ? 'mongodb' : 'in-memory',
      payload,
    });

    if (mongoReady) {
      const existing = await PlatformContentBundle.findOne({ collectionKey: key })
        .select('checksum schemaVersion syncedAt')
        .lean<{ checksum?: string; schemaVersion?: string; syncedAt?: Date } | null>();

      if (force || !existing || existing.checksum !== checksum || existing.schemaVersion !== SCHEMA_VERSION) {
        await PlatformContentBundle.updateOne(
          { collectionKey: key },
          {
            $set: {
              collectionKey: key,
              domain,
              label,
              schemaVersion: SCHEMA_VERSION,
              checksum,
              itemCount,
              byteSize,
              payload,
              syncedAt: now,
            },
          },
          { upsert: true }
        );
      }
    }

    summaries.push({
      collectionKey: key,
      domain,
      label,
      schemaVersion: SCHEMA_VERSION,
      checksum,
      itemCount,
      byteSize,
      syncedAt: syncedAtIso,
      source: mongoReady ? 'mongodb' : 'in-memory',
    });
  }

  const totalItems = summaries.reduce((acc, s) => acc + s.itemCount, 0);
  const totalBytes = summaries.reduce((acc, s) => acc + s.byteSize, 0);

  console.log(
    `[PatternForge ContentSync] Synced ${summaries.length} canonical bundles (${totalItems} records, ${(
      totalBytes / 1024
    ).toFixed(1)} KB) to ${mongoReady ? 'MongoDB' : 'in-memory snapshot store'}.`
  );

  return {
    pushed: true,
    storageMode: mongoReady ? 'mongodb' : 'in-memory',
    syncedAt: syncedAtIso,
    totalCollections: summaries.length,
    totalItems,
    totalBytes,
    collections: summaries,
  };
}

export async function seedPlatformContentOnStartup(): Promise<ContentPushReport | null> {
  if (!isDbContentPushEnabled()) {
    console.log('[PatternForge ContentSync] ENABLE_DB_CONTENT_PUSH_ON_STARTUP is false; skipping startup DB push.');
    return null;
  }
  return pushPlatformContentToDb({ force: false });
}

export async function pullPlatformContentFromDb(options?: {
  includePayload?: boolean;
  overrideFlag?: boolean;
}): Promise<ContentBootstrapResponse> {
  const pullEnabled = options?.overrideFlag ?? isDbContentPullEnabled();
  const pushOnStartupEnabled = isDbContentPushEnabled();
  const includePayload = options?.includePayload !== false;

  if (!pullEnabled) {
    return {
      pullEnabled: false,
      pushOnStartupEnabled,
      storageMode: 'static-local',
      syncedAt: new Date().toISOString(),
      totalCollections: 0,
      totalItems: 0,
      totalBytes: 0,
      collections: [],
      bundles: {},
    };
  }

  if (!isMongoConnected() && memoryContentStore.size < ALL_CONTENT_BUNDLE_KEYS.length) {
    await pushPlatformContentToDb({ force: false });
  }

  if (isMongoConnected()) {
    const query = includePayload
      ? PlatformContentBundle.find({})
      : PlatformContentBundle.find({}).select('-payload');

    const docs = await query.lean<
      Array<{
        collectionKey: ContentBundleKey;
        domain?: ContentDomainId;
        label?: string;
        schemaVersion: string;
        checksum: string;
        itemCount: number;
        byteSize?: number;
        payload?: unknown;
        syncedAt: Date;
      }>
    >();

    // Auto-seed if DB is empty or still on older schema version with fewer collections
    if (docs.length < ALL_CONTENT_BUNDLE_KEYS.length) {
      await pushPlatformContentToDb({ force: false });
      return pullPlatformContentFromDb(options);
    }

    const bundles: Partial<Record<ContentBundleKey, unknown>> = {};
    const collections: StoredContentBundleSummary[] = docs
      .filter((doc) => isValidContentBundleKey(doc.collectionKey))
      .map((doc) => {
        const def = CANONICAL_BUNDLE_DEFINITIONS[doc.collectionKey];
        if (includePayload) {
          bundles[doc.collectionKey] = doc.payload ?? null;
        }
        return {
          collectionKey: doc.collectionKey,
          domain: doc.domain ?? def.domain,
          label: doc.label || def.label,
          schemaVersion: doc.schemaVersion,
          checksum: doc.checksum,
          itemCount: doc.itemCount,
          byteSize: doc.byteSize ?? 0,
          syncedAt: new Date(doc.syncedAt).toISOString(),
          source: 'mongodb',
        };
      });

    const totalItems = collections.reduce((acc, c) => acc + c.itemCount, 0);
    const totalBytes = collections.reduce((acc, c) => acc + c.byteSize, 0);
    const latestSync =
      collections
        .map((c) => c.syncedAt)
        .sort()
        .at(-1) ?? new Date().toISOString();

    return {
      pullEnabled: true,
      pushOnStartupEnabled,
      storageMode: 'mongodb',
      syncedAt: latestSync,
      totalCollections: collections.length,
      totalItems,
      totalBytes,
      collections,
      bundles,
    };
  }

  const bundles: Partial<Record<ContentBundleKey, unknown>> = {};
  const collections: StoredContentBundleSummary[] = [];
  for (const record of memoryContentStore.values()) {
    if (includePayload) {
      bundles[record.collectionKey] = record.payload;
    }
    collections.push({
      collectionKey: record.collectionKey,
      domain: record.domain,
      label: record.label,
      schemaVersion: record.schemaVersion,
      checksum: record.checksum,
      itemCount: record.itemCount,
      byteSize: record.byteSize,
      syncedAt: record.syncedAt,
      source: 'in-memory',
    });
  }

  const totalItems = collections.reduce((acc, c) => acc + c.itemCount, 0);
  const totalBytes = collections.reduce((acc, c) => acc + c.byteSize, 0);
  const latestSync =
    collections
      .map((c) => c.syncedAt)
      .sort()
      .at(-1) ?? new Date().toISOString();

  return {
    pullEnabled: true,
    pushOnStartupEnabled,
    storageMode: 'in-memory',
    syncedAt: latestSync,
    totalCollections: collections.length,
    totalItems,
    totalBytes,
    collections,
    bundles,
  };
}

export async function pullSingleContentBundleFromDb(
  collectionKey: ContentBundleKey,
  options?: { overrideFlag?: boolean }
): Promise<SingleBundlePullResponse> {
  const pullEnabled = options?.overrideFlag ?? isDbContentPullEnabled();

  if (!pullEnabled) {
    return {
      pullEnabled: false,
      collectionKey,
      found: false,
      storageMode: 'static-local',
      meta: null,
      payload: null,
    };
  }

  if (isMongoConnected()) {
    let doc = await PlatformContentBundle.findOne({ collectionKey }).lean<{
      collectionKey: ContentBundleKey;
      domain?: ContentDomainId;
      label?: string;
      schemaVersion: string;
      checksum: string;
      itemCount: number;
      byteSize?: number;
      payload?: unknown;
      syncedAt: Date;
    } | null>();

    if (!doc) {
      await pushPlatformContentToDb({ force: false, keys: [collectionKey] });
      doc = await PlatformContentBundle.findOne({ collectionKey }).lean();
    }

    if (!doc) {
      return {
        pullEnabled: true,
        collectionKey,
        found: false,
        storageMode: 'mongodb',
        meta: null,
        payload: null,
      };
    }

    const def = CANONICAL_BUNDLE_DEFINITIONS[collectionKey];
    const meta: StoredContentBundleSummary = {
      collectionKey,
      domain: doc.domain ?? def.domain,
      label: doc.label || def.label,
      schemaVersion: doc.schemaVersion,
      checksum: doc.checksum,
      itemCount: doc.itemCount,
      byteSize: doc.byteSize ?? 0,
      syncedAt: new Date(doc.syncedAt).toISOString(),
      source: 'mongodb',
    };

    return {
      pullEnabled: true,
      collectionKey,
      found: doc.payload !== null && doc.payload !== undefined,
      storageMode: 'mongodb',
      meta,
      payload: doc.payload ?? null,
    };
  }

  if (!memoryContentStore.has(collectionKey)) {
    await pushPlatformContentToDb({ force: false, keys: [collectionKey] });
  }

  const record = memoryContentStore.get(collectionKey);
  if (!record) {
    return {
      pullEnabled: true,
      collectionKey,
      found: false,
      storageMode: 'in-memory',
      meta: null,
      payload: null,
    };
  }

  const { payload, ...meta } = record;
  return {
    pullEnabled: true,
    collectionKey,
    found: payload !== null && payload !== undefined,
    storageMode: 'in-memory',
    meta,
    payload,
  };
}
