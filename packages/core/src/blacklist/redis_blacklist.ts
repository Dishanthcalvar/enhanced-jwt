import Redis from 'ioredis';
import type { BlacklistAdapter } from '../types';

export function createRedisBlacklist(redisUrl: string): BlacklistAdapter {
  const client = new Redis(redisUrl, { maxRetriesPerRequest: 2, lazyConnect: true });
  const prefix = 'jwtshield:jti:';

  return {
    async has(jti: string): Promise<boolean> {
      const v = await client.exists(`${prefix}${jti}`);
      return v === 1;
    },

    async add(jti: string, ttlSeconds: number): Promise<void> {
      const ttl = Math.max(1, Math.ceil(ttlSeconds));
      await client.setex(`${prefix}${jti}`, ttl, '1');
    },
  };
}
