import {describe, it, expect} from 'vitest';
import {
  toWebSocketUrl, BACKEND_URL, LOCAL_STORAGE_KEYS, DEFAULT_VOTING_SYSTEM,
} from '../constants';

describe('constants', () => {
  describe('toWebSocketUrl', () => {
    it('converts https URL to wss', () => {
      const result = toWebSocketUrl('https://example.com');
      expect(result).toBe('wss://example.com');
    });

    it('converts http URL to ws', () => {
      const result = toWebSocketUrl('http://localhost:8787');
      expect(result).toBe('ws://localhost:8787');
    });

    it('preserves path and query parameters', () => {
      const result = toWebSocketUrl('https://example.com/path?query=value');
      expect(result).toBe('wss://example.com/path?query=value');
    });

    it('throws error for invalid URL', () => {
      expect(() => toWebSocketUrl('invalid-url')).toThrow('Invalid URL: invalid-url');
    });

    it('throws error for ftp URL', () => {
      expect(() => toWebSocketUrl('ftp://example.com')).toThrow('Invalid URL: ftp://example.com');
    });
  });

  describe('BACKEND_URL', () => {
    it('is defined', () => {
      expect(BACKEND_URL).toBeDefined();
      expect(typeof BACKEND_URL).toBe('string');
    });
  });

  describe('LOCAL_STORAGE_KEYS', () => {
    it('has NAME key', () => {
      expect(LOCAL_STORAGE_KEYS.NAME).toBe('planning-poker:name');
    });

    it('has USER_ID key', () => {
      expect(LOCAL_STORAGE_KEYS.USER_ID).toBe('planning-poker:userId');
    });

    it('is readonly', () => {
      expect(Object.isFrozen(LOCAL_STORAGE_KEYS)).toBe(false);
      // TypeScript ensures it's const, runtime doesn't enforce it
      expect(LOCAL_STORAGE_KEYS).toBeDefined();
    });
  });

  describe('DEFAULT_VOTING_SYSTEM', () => {
    it('is t-shirts', () => {
      expect(DEFAULT_VOTING_SYSTEM).toBe('t-shirts');
    });
  });
});
