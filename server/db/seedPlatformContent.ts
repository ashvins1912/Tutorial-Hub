import crypto from 'crypto';
import { isMongoConnected } from './connectMongo';
import { ContentBundleKey, PlatformContentBundle } from '../models/PlatformContentBundle';
import { ALGORITHMS_CATALOG } from '../../src/data/algorithmsCatalog';
import {
  ALGORITHM_POWER_COMBOS,
  MASTER_73_ROADMAP,
} from '../../src/data/algorithmCombinationsAndRoadmap';
import { CURRICULUM_TOPICS } from '../../src/features/topics/data/curriculumIndex';
import { CURATED_INTERVIEW_BANK } from '../../src/features/topics/data/curatedInterviewBank';
import { STRATEGIES_CATALOG } from '../../src/core/knowledge-base/strategiesCatalog';

const SCHEMA_VERSION = '2026.2';

export interface StoredContentBundleSummary {
  collectionKey: ContentBundleKey;
  schemaVersion: string;
  checksum: string;
  itemCount: number;
  syncedAt: string;
  source: 'mongodb' | 'in-memory';
}

export interface ContentBundleRecord extends StoredContentBundleSummary {
  payload: unknown[];
}

export interface ContentPushReport {
  pushed: boolean;
  storageMode: 'mongodb' | 'in-memory';
  syncedAt: string;
  totalItems: number;
  collections: StoredContentBundleSummary[];
}

export interface ContentBootstrapResponse {
  pullEnabled: boolean;
  pushOnStartupEnabled: boolean;
  storageMode: 'mongodb' | 'in-memory' | 'static-local';
  syncedAt: string;
  totalItems: number;
  collections: StoredContentBundleSummary[];
  bundles: Partial<Record<ContentBundleKey, unknown[]>>;
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

function hashPayload(payload: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

function buildCanonicalContentBundles(): Array<{ key: ContentBundleKey; payload: unknown[] }> {
  const compactAlgorithms = ALGORITHMS_CATALOG.map((algo) => ({
    id: algo.id,
    name: algo.name,
    shortName: algo.shortName,
    category: algo.category,
    timeComplexity: algo.timeComplexity,
    spaceComplexity: algo.spaceComplexity,
    complexityLeap: algo.complexityLeap,
    tagline: algo.tagline,
    coreIdea: algo.coreIdea,
    loopInvariant: algo.loopInvariant,
    whenToUse: algo.whenToUse,
    whenItFails: algo.whenItFails,
    linkedTopics: algo.linkedTopics,
    linkedProblemSlugs: algo.linkedProblemSlugs,
    frameCount: algo.frames.length,
  }));

  const compactTopics = CURRICULUM_TOPICS.map((topic) => ({
    id: topic.id,
    order: topic.order,
    title: topic.title,
    shortTitle: topic.shortTitle,
    tier: topic.tier,
    category: topic.category,
    tagline: topic.tagline,
    keywords: topic.keywords,
    mentalModelSteps: topic.mentalModelSteps,
    optimalTime: topic.solutions.optimal.timeComplexity,
    optimalSpace: topic.solutions.optimal.spaceComplexity,
    patternClues: topic.patternClues,
    problemCount: topic.problemLadder.length,
  }));

  const compactStrategies = STRATEGIES_CATALOG.map((strategy) => ({
    id: strategy.id,
    name: strategy.name,
    category: strategy.category,
    difficulty: strategy.difficulty,
    domains: strategy.domains,
    workspaceKind: strategy.workspaceKind,
    curriculumTopicId: strategy.curriculumTopicId,
    mentalModel: strategy.mentalModel,
    structuralClues: strategy.structuralClues,
    triggerKeywords: strategy.triggerKeywords,
    optimalTime: strategy.optimalTime,
    optimalSpace: strategy.optimalSpace,
    complexityRank: strategy.complexityRank,
  }));

  return [
    { key: 'algorithms-catalog', payload: compactAlgorithms },
    { key: 'master-73-roadmap', payload: MASTER_73_ROADMAP },
    { key: 'algorithm-power-combos', payload: ALGORITHM_POWER_COMBOS },
    { key: 'curriculum-topics', payload: compactTopics },
    { key: 'curated-interview-bank', payload: CURATED_INTERVIEW_BANK },
    { key: 'solver-strategies', payload: compactStrategies },
  ];
}

export async function pushPlatformContentToDb(options?: {
  force?: boolean;
}): Promise<ContentPushReport> {
  const force = Boolean(options?.force);
  const now = new Date();
  const syncedAtIso = now.toISOString();
  const bundles = buildCanonicalContentBundles();
  const mongoReady = isMongoConnected();
  const summaries: StoredContentBundleSummary[] = [];

  for (const { key, payload } of bundles) {
    const checksum = hashPayload(payload);
    const itemCount = payload.length;

    memoryContentStore.set(key, {
      collectionKey: key,
      schemaVersion: SCHEMA_VERSION,
      checksum,
      itemCount,
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
              schemaVersion: SCHEMA_VERSION,
              checksum,
              itemCount,
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
      schemaVersion: SCHEMA_VERSION,
      checksum,
      itemCount,
      syncedAt: syncedAtIso,
      source: mongoReady ? 'mongodb' : 'in-memory',
    });
  }

  const totalItems = summaries.reduce((acc, s) => acc + s.itemCount, 0);
  console.log(
    `[PatternForge ContentSync] Synced ${summaries.length} content collections (${totalItems} items) to ${
      mongoReady ? 'MongoDB' : 'in-memory snapshot store'
    }.`
  );

  return {
    pushed: true,
    storageMode: mongoReady ? 'mongodb' : 'in-memory',
    syncedAt: syncedAtIso,
    totalItems,
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
      totalItems: 0,
      collections: [],
      bundles: {},
    };
  }

  // Ensure snapshot exists in dev mode even if startup push was disabled
  if (!isMongoConnected() && memoryContentStore.size === 0) {
    await pushPlatformContentToDb({ force: false });
  }

  if (isMongoConnected()) {
    const docs = await PlatformContentBundle.find({})
      .lean<
        Array<{
          collectionKey: ContentBundleKey;
          schemaVersion: string;
          checksum: string;
          itemCount: number;
          payload: unknown[];
          syncedAt: Date;
        }>
      >();

    if (docs.length === 0) {
      await pushPlatformContentToDb({ force: true });
      return pullPlatformContentFromDb(options);
    }

    const bundles: Partial<Record<ContentBundleKey, unknown[]>> = {};
    const collections: StoredContentBundleSummary[] = docs.map((doc) => {
      if (includePayload) {
        bundles[doc.collectionKey] = Array.isArray(doc.payload) ? doc.payload : [];
      }
      return {
        collectionKey: doc.collectionKey,
        schemaVersion: doc.schemaVersion,
        checksum: doc.checksum,
        itemCount: doc.itemCount,
        syncedAt: new Date(doc.syncedAt).toISOString(),
        source: 'mongodb',
      };
    });

    const totalItems = collections.reduce((acc, c) => acc + c.itemCount, 0);
    const latestSync = collections
      .map((c) => c.syncedAt)
      .sort()
      .at(-1) ?? new Date().toISOString();

    return {
      pullEnabled: true,
      pushOnStartupEnabled,
      storageMode: 'mongodb',
      syncedAt: latestSync,
      totalItems,
      collections,
      bundles,
    };
  }

  const bundles: Partial<Record<ContentBundleKey, unknown[]>> = {};
  const collections: StoredContentBundleSummary[] = [];
  for (const record of memoryContentStore.values()) {
    if (includePayload) {
      bundles[record.collectionKey] = record.payload;
    }
    collections.push({
      collectionKey: record.collectionKey,
      schemaVersion: record.schemaVersion,
      checksum: record.checksum,
      itemCount: record.itemCount,
      syncedAt: record.syncedAt,
      source: 'in-memory',
    });
  }

  const totalItems = collections.reduce((acc, c) => acc + c.itemCount, 0);
  const latestSync = collections
    .map((c) => c.syncedAt)
    .sort()
    .at(-1) ?? new Date().toISOString();

  return {
    pullEnabled: true,
    pushOnStartupEnabled,
    storageMode: 'in-memory',
    syncedAt: latestSync,
    totalItems,
    collections,
    bundles,
  };
}
