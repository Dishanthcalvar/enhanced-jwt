import type { BlacklistAdapter } from '../types';

interface Entry {
  expiresAt: number;
}

export function createMemoryBlacklist(): BlacklistAdapter {
  const store = new Map<string, Entry>();

  return {
    async has(jti: string): Promise<boolean> {
      const e = store.get(jti);
      if (!e) return false;
      if (Date.now() > e.expiresAt) {
        store.delete(jti);
        return false;
      }
      return true;
    },

    async add(jti: string, ttlSeconds: number): Promise<void> {
      const ttl = Math.max(1, ttlSeconds);
      store.set(jti, { expiresAt: Date.now() + ttl * 1000 });
    },
  };
}
