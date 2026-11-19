import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';

// Verify access tokens against the same Supabase project used by the browser.
// The public anon/publishable key is sufficient for auth.getUser(token) and
// avoids accidentally preferring a stale service-role key from another project.
let verifier: SupabaseClient | null = null;
let verifierProjectUrl: string | null = null;
let verifierApiKey: string | null = null;

function getVerifier(): { client: SupabaseClient | null; projectUrl: string | null; apiKeySource: string | null } {
  const projectUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '')
    .trim()
    .replace(/\/+$/, '');

  const candidates: Array<[string, string | undefined]> = [
    ['SUPABASE_ANON_KEY', process.env.SUPABASE_ANON_KEY],
    ['VITE_SUPABASE_ANON_KEY', process.env.VITE_SUPABASE_ANON_KEY],
    ['SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY],
  ];
  const selected = candidates.find(([, value]) => Boolean(value?.trim()));
  const apiKey = selected?.[1]?.trim() || '';
  const apiKeySource = selected?.[0] || null;

  if (!projectUrl || !apiKey) return { client: null, projectUrl: projectUrl || null, apiKeySource };

  // Recreate the verifier if either its project URL or key changes.
  if (!verifier || verifierProjectUrl !== projectUrl || verifierApiKey !== apiKey) {
    verifier = createClient(projectUrl, apiKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
    verifierProjectUrl = projectUrl;
    verifierApiKey = apiKey;
  }

  return { client: verifier, projectUrl, apiKeySource };
}

declare global {
  namespace Express {
    interface Request {
      authUser?: { id: string; email?: string; userMetadata?: Record<string, unknown> };
    }
  }
}

function readTokenIssuer(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { iss?: unknown };
    return typeof claims.iss === 'string' ? claims.iss.replace(/\/+$/, '') : null;
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { client, projectUrl, apiKeySource } = getVerifier();
  if (!client || !projectUrl) {
    return res.status(503).json({
      code: 'AUTH_NOT_CONFIGURED',
      message: 'Configure SUPABASE_URL and a matching Supabase API key on the backend.',
    });
  }

  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token) return res.status(401).json({ code: 'AUTH_REQUIRED', message: 'Sign in to continue.' });

  const issuer = readTokenIssuer(token);
  const expectedIssuer = `${projectUrl}/auth/v1`;
  if (issuer && issuer !== expectedIssuer) {
    console.error('[auth] Supabase project mismatch: token issuer does not match configured project.');
    return res.status(503).json({
      code: 'SUPABASE_PROJECT_MISMATCH',
      message: 'The frontend and backend are configured for different Supabase projects.',
    });
  }

  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      // Log diagnostic metadata only. Never log the bearer token or API key.
      console.error('[auth] Supabase token verification rejected:', JSON.stringify({
        status: error?.status ?? null,
        code: error?.code ?? null,
        name: error?.name ?? null,
        message: error?.message ?? 'No user returned',
        apiKeySource,
      }));

      const reason = error?.code || (error?.status ? `SUPABASE_HTTP_${error.status}` : 'TOKEN_REJECTED');
      return res.status(401).json({
        code: 'INVALID_SESSION',
        reason,
        message: 'Supabase rejected this session. Sign in again; if it persists, verify the backend Supabase project and API key.',
      });
    }

    req.authUser = {
      id: data.user.id,
      email: data.user.email,
      userMetadata: data.user.user_metadata ?? {},
    };
    return next();
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'UNKNOWN_ERROR';
    console.error('[auth] Supabase verification request failed:', errorName);
    return res.status(503).json({
      code: 'AUTH_VERIFICATION_UNAVAILABLE',
      message: 'The authentication service could not be reached. Please try again.',
    });
  }
}
