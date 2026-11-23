import { isMongoConnected } from '../db/connectMongo';
import { SolverEndpointRateLimit } from '../models/SolverEndpointRateLimit';

const WINDOW_MS = 60_000;
const RETENTION_MS = 2 * WINDOW_MS;
const LIMITS = { 'ai-coach': 5, 'fetch-url': 10 } as const;
type SolverEndpoint = keyof typeof LIMITS;
const localWindows = new Map<string, { count: number; expiresAt: number }>();

export function isWithinSolverEndpointLimit(endpoint: SolverEndpoint, count: number): boolean {
  return Number.isInteger(count) && count >= 0 && count <= LIMITS[endpoint];
}

export function getSolverRetryAfterSeconds(now: Date, windowStart: Date): number {
  return Math.max(1, Math.ceil((windowStart.getTime() + WINDOW_MS - now.getTime()) / 1000));
}

export async function consumeSolverEndpointRequest(
  userId: string,
  endpoint: SolverEndpoint,
  now = new Date(),
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const windowStart = new Date(Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS);
  const retryAfterSeconds = getSolverRetryAfterSeconds(now, windowStart);
  if (!isMongoConnected()) {
    if (process.env.NODE_ENV === 'production') throw new Error('Persistent solver rate limiting is unavailable.');
    const key = `${userId}:${endpoint}:${windowStart.getTime()}`;
    const count = (localWindows.get(key)?.count ?? 0) + 1;
    localWindows.set(key, { count, expiresAt: windowStart.getTime() + RETENTION_MS });
    for (const [entryKey, entry] of localWindows) {
      if (entry.expiresAt <= now.getTime()) localWindows.delete(entryKey);
    }
    return { allowed: isWithinSolverEndpointLimit(endpoint, count), retryAfterSeconds };
  }

  const filter = { userId, endpoint, windowStart };
  const expiresAt = new Date(windowStart.getTime() + RETENTION_MS);
  try {
    const record = await SolverEndpointRateLimit.findOneAndUpdate(
      filter,
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
    return { allowed: isWithinSolverEndpointLimit(endpoint, record?.count ?? LIMITS[endpoint] + 1), retryAfterSeconds };
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      const record = await SolverEndpointRateLimit.findOneAndUpdate(filter, { $inc: { count: 1 } }, { new: true }).lean();
      return { allowed: isWithinSolverEndpointLimit(endpoint, record?.count ?? LIMITS[endpoint] + 1), retryAfterSeconds };
    }
    throw error;
  }
}
