import { isMongoConnected } from '../db/connectMongo';
import { SystemDesignAiRateLimit } from '../models/SystemDesignAiRateLimit';

const WINDOW_MS = 60_000;
const RETENTION_MS = 2 * WINDOW_MS;
export const SYSTEM_DESIGN_AI_LIMIT_PER_MINUTE = 5;
const localWindows = new Map<string, { count: number; expiresAt: number }>();

export type SystemDesignAiRateLimitDecision = { allowed: boolean; retryAfterSeconds: number };

export function isWithinSystemDesignAiLimit(count: number): boolean {
  return Number.isInteger(count) && count >= 0 && count <= SYSTEM_DESIGN_AI_LIMIT_PER_MINUTE;
}

export function getSystemDesignAiRetryAfterSeconds(now: Date, windowStart: Date): number {
  return Math.max(1, Math.ceil((windowStart.getTime() + WINDOW_MS - now.getTime()) / 1000));
}

export async function consumeSystemDesignAiRequest(
  userId: string,
  now = new Date(),
): Promise<SystemDesignAiRateLimitDecision> {
  const windowStart = new Date(Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS);
  const retryAfterSeconds = getSystemDesignAiRetryAfterSeconds(now, windowStart);

  if (!isMongoConnected()) {
    if (process.env.NODE_ENV === 'production') throw new Error('Persistent AI rate limiting is unavailable.');
    const key = `${userId}:${windowStart.getTime()}`;
    const current = localWindows.get(key);
    const count = (current?.count ?? 0) + 1;
    localWindows.set(key, { count, expiresAt: windowStart.getTime() + RETENTION_MS });
    for (const [entryKey, entry] of localWindows) {
      if (entry.expiresAt <= now.getTime()) localWindows.delete(entryKey);
    }
    return { allowed: isWithinSystemDesignAiLimit(count), retryAfterSeconds };
  }

  const expiresAt = new Date(windowStart.getTime() + RETENTION_MS);
  const filter = { userId, windowStart };
  try {
    const record = await SystemDesignAiRateLimit.findOneAndUpdate(
      filter,
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
    return { allowed: isWithinSystemDesignAiLimit(record?.count ?? SYSTEM_DESIGN_AI_LIMIT_PER_MINUTE + 1), retryAfterSeconds };
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      const record = await SystemDesignAiRateLimit.findOneAndUpdate(
        filter, { $inc: { count: 1 } }, { new: true },
      ).lean();
      return { allowed: isWithinSystemDesignAiLimit(record?.count ?? SYSTEM_DESIGN_AI_LIMIT_PER_MINUTE + 1), retryAfterSeconds };
    }
    throw error;
  }
}
