import { createClient } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const verifier = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

declare global {
  namespace Express {
    interface Request {
      authUser?: { id: string; email?: string; userMetadata?: Record<string, unknown> };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!verifier) {
    return res.status(503).json({ code: 'AUTH_NOT_CONFIGURED', message: 'Supabase server credentials are not configured.' });
  }
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return res.status(401).json({ code: 'AUTH_REQUIRED', message: 'Sign in to continue.' });

  try {
    const { data, error } = await verifier.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ code: 'INVALID_SESSION', message: 'Your session is invalid or expired.' });
    }
    req.authUser = {
      id: data.user.id,
      email: data.user.email,
      userMetadata: data.user.user_metadata ?? {},
    };
    return next();
  } catch {
    return res.status(401).json({ code: 'INVALID_SESSION', message: 'Unable to verify your session.' });
  }
}
