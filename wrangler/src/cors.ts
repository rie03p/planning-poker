import type {Env} from './types';

function getAllowedOrigins(env: Env): Set<string> {
  const envOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(o => o.length > 0);
  return new Set(envOrigins);
}

export function getCorsHeaders(origin: string | undefined, env: Env): Headers | undefined {
  const allowedOrigins = getAllowedOrigins(env);

  if (!origin || !allowedOrigins.has(origin)) {
    return undefined;
  }

  return new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  });
}
