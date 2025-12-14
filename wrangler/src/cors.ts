const ALLOWED_ORIGINS = new Set([
  'https://planning-poker-ba3.pages.dev',
  // 'http://localhost:5173',
]);

export function getCorsHeaders(origin: string | undefined): Headers | undefined {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return undefined;
  }

  return new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  });
}
