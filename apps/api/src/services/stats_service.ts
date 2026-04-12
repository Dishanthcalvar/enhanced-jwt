import type Redis from 'ioredis';

const TOTAL = 'shield:stats:total_requests';
const BLOCKED = 'shield:stats:total_blocked';
const ATTACK = (v: string) => `shield:stats:attack:${v}`;
const START = 'shield:stats:started_at';

export class StatsService {
  constructor(private readonly redis: Redis) {}

  async ensureStarted(): Promise<void> {
    const exists = await this.redis.exists(START);
    if (!exists) {
      await this.redis.set(START, String(Date.now()));
    }
  }

  async incrementRequests(): Promise<void> {
    await this.redis.incr(TOTAL);
  }

  async incrementBlocked(vector: string): Promise<void> {
    await this.redis.incr(BLOCKED);
    await this.redis.incr(ATTACK(vector));
  }

  async getSummary(): Promise<{
    total_requests: number;
    total_blocked: number;
    block_rate_percent: number;
    attacks_by_type: Record<string, number>;
    blocked_ips: number;
    uptime_seconds: number;
  }> {
    const started = await this.redis.get(START);
    const uptime = started ? Math.floor((Date.now() - Number(started)) / 1000) : 0;
    const total = Number((await this.redis.get(TOTAL)) ?? 0);
    const blocked = Number((await this.redis.get(BLOCKED)) ?? 0);
    const keys = await this.redis.keys('shield:stats:attack:*');
    const attacks_by_type: Record<string, number> = {};
    for (const k of keys) {
      const parts = k.split(':');
      const vector = parts[parts.length - 1];
      attacks_by_type[vector] = Number((await this.redis.get(k)) ?? 0);
    }
    const blockedKeys = await this.redis.keys('shield:ip:block:*');
    const block_rate = total > 0 ? Math.round((blocked / total) * 10000) / 100 : 0;
    return {
      total_requests: total,
      total_blocked: blocked,
      block_rate_percent: block_rate,
      attacks_by_type,
      blocked_ips: blockedKeys.length,
      uptime_seconds: uptime,
    };
  }
}
