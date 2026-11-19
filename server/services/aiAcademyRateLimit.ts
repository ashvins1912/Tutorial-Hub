import { AIAcademyRateLimit } from '../models/AIAcademyRateLimit';

const WINDOW_MS = 60_000;
const RETENTION_MS = 2 * WINDOW_MS;
export const AI_ACADEMY_PROGRESS_LIMIT_PER_MINUTE = 60;

export type RateLimitDecision = { allowed: boolean; retryAfterSeconds: number };

export async function consumeAcademyProgressRequest(
  userId: string,
  now = new Date(),
): Promise<RateLimitDecision> {
  const windowStart = new Date(Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS);
  const expiresAt = new Date(windowStart.getTime() + RETENTION_MS);
  const filter = { userId, windowStart };
  const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt } };
  const retryAfterSeconds = Math.max(1, Math.ceil((windowStart.getTime() + WINDOW_MS - now.getTime()) / 1000));

  try {
    const record = await AIAcademyRateLimit.findOneAndUpdate(filter, update, {
      upsert: true, new: true, setDefaultsOnInsert: true,
    }).lean();
    return { allowed: (record?.count ?? AI_ACADEMY_PROGRESS_LIMIT_PER_MINUTE + 1) <= AI_ACADEMY_PROGRESS_LIMIT_PER_MINUTE, retryAfterSeconds };
  } catch (error) {
    // Concurrent first requests can race to create the same unique user/window row.
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      const record = await AIAcademyRateLimit.findOneAndUpdate(filter, { $inc: { count: 1 } }, {
        new: true,
      }).lean();
      return { allowed: (record?.count ?? AI_ACADEMY_PROGRESS_LIMIT_PER_MINUTE + 1) <= AI_ACADEMY_PROGRESS_LIMIT_PER_MINUTE, retryAfterSeconds };
    }
    throw error;
  }
}
