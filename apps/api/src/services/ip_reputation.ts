import type Redis from 'ioredis';
import { env } from '../config/env';

const WINDOW_SEC = 60;
const PREF_REJ = 'shield:ip:rej:';
const PREF_ATK = 'shield:ip:atk:';
const PREF_BLOCK = 'shield:ip:block:';
const PREF_PERM = 'shield:ip:perm:';

export interface IpCheckResult {
  allowed: boolean;
  reason?: 'blocked' | 'permanent';
}

export class IpReputationService {
  constructor(private readonly redis: Redis) {}

  async check(ip: string): Promise<IpCheckResult> {
    const perm = await this.redis.get(PREF_PERM + ip);
    if (perm) return { allowed: false, reason: 'permanent' };
    const block = await this.redis.get(PREF_BLOCK + ip);
    if (block) return { allowed: false, reason: 'blocked' };
    return { allowed: true };
  }

  async recordRejected(ip: string): Promise<{ warn: boolean; blocked: boolean }> {
    const key = PREF_REJ + ip;
    const n = await this.redis.incr(key);
    if (n === 1) await this.redis.expire(key, WINDOW_SEC);

    let blocked = false;
    let warn = false;
    if (n >= env.IP_BLOCK_THRESHOLD) {
      await this.redis.setex(PREF_BLOCK + ip, env.IP_BLOCK_DURATION_SECONDS, 'rejected_flood');
      blocked = true;
    } else if (n >= env.IP_WARN_THRESHOLD) {
      warn = true;
    }
    return { warn, blocked };
  }

  async recordAttack(ip: string, vector: string): Promise<{ permanent: boolean; blocked: boolean }> {
    const key = PREF_ATK + ip;
    const n = await this.redis.incr(key);
    if (n === 1) await this.redis.expire(key, WINDOW_SEC);

    let permanent = false;
    let blocked = false;
    if (n >= env.IP_ATTACK_PERMANENT_THRESHOLD) {
      await this.redis.set(PREF_PERM + ip, vector);
      permanent = true;
    }
    if (n >= env.IP_BLOCK_THRESHOLD) {
      await this.redis.setex(PREF_BLOCK + ip, env.IP_BLOCK_DURATION_SECONDS, `attack:${vector}`);
      blocked = true;
    }
    return { permanent, blocked };
  }

  async unblock(ip: string): Promise<void> {
    await this.redis.del(PREF_BLOCK + ip, PREF_PERM + ip, PREF_REJ + ip, PREF_ATK + ip);
  }

  async listBlocked(): Promise<
    { ip: string; reason: string; expiresAt: number | null; permanent: boolean }[]
  > {
    const keys = await this.redis.keys(PREF_BLOCK + '*');
    const out: { ip: string; reason: string; expiresAt: number | null; permanent: boolean }[] = [];
    for (const k of keys) {
      const ip = k.slice(PREF_BLOCK.length);
      const reason = (await this.redis.get(k)) ?? 'unknown';
      const ttl = await this.redis.ttl(k);
      const perm = await this.redis.get(PREF_PERM + ip);
      out.push({
        ip,
        reason,
        expiresAt: ttl > 0 ? Date.now() + ttl * 1000 : null,
        permanent: Boolean(perm),
      });
    }
    return out;
  }
}
