import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';

// Keep a single verifier instance, but bind it to the same project used by
// the browser. Backend environment is loaded by server.ts before routes run.
let verifier: SupabaseClient | null = null;
let verifierProjectUrl: string | null = null;

function getVerifier(): { client: SupabaseClient | null; projectUrl: string | null } {
  const projectUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '')
    .trim()
    .replace(/\/+$/, '');
  const apiKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!projectUrl || !apiKey) return { client: null, projectUrl: projectUrl || null };

  if (!verifier || verifierProjectUrl !== projectUrl) {
    verifier = createClient(projectUrl, apiKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
    verifierProjectUrl = projectUrl;
  }

  return { client: verifier, projectUrl };
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
  const { client, projectUrl } = getVerifier();
  if (!client || !projectUrl) {
    return res.status(503).json({
      code: 'AUTH_NOT_CONFIGURED',
      message: 'Configure SUPABASE_URL and a server-side Supabase API key on the backend.',
    });
  }

  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token) return res.status(401).json({ code: 'AUTH_REQUIRED', message: 'Sign in to continue.' });

  const issuer = readTokenIssuer(token);
  const expectedIssuer = `${projectUrl}/auth/v1`;
  if (issuer && issuer !== expectedIssuer) {
    console.error('[auth] Supabase project mismatch: token issuer does not match configured Supabase project.');
    return res.status(503).json({
      code: 'SUPABASE_PROJECT_MISMATCH',
      message: 'The frontend and backend are configured for different Supabase projects.',
    });
  }

  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      console.error('[auth] Supabase token verification failed:', error?.code || error?.name || 'USER_NOT_FOUND');
      return res.status(401).json({
        code: 'INVALID_SESSION',
        reason: error?.code || 'TOKEN_REJECTED',
        message: 'Your session could not be verified. Sign in again.',
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
