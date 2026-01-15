/**
 * Application-wide constants
 */

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8787';

export const LOCAL_STORAGE_KEYS = {
  NAME: 'planning-poker:name',
  USER_ID: 'planning-poker:userId',
} as const;

export const DEFAULT_VOTING_SYSTEM = 't-shirts';

/**
 * Convert HTTP URL to WebSocket URL
 */
export function toWebSocketUrl(httpUrl: string): string {
  if (httpUrl.startsWith('https://')) {
    return httpUrl.replace(/^https:\/\//, 'wss://');
  }

  if (httpUrl.startsWith('http://')) {
    return httpUrl.replace(/^http:\/\//, 'ws://');
  }

  throw new Error(`Invalid URL: ${httpUrl}`);
}
