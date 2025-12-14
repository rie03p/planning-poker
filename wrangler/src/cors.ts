const ALLOWED_ORIGINS = [
  "https://planning-poker-ba3.pages.dev",
  // "http://localhost:5173",
];

export function getCorsHeaders(origin: string | null): Headers | null {
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return null;
  }

  return new Headers({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  });
}
