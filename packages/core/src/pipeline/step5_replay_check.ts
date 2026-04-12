import { createHash } from 'crypto';
import { ShieldError } from '../errors';
import type { BlacklistAdapter } from '../types';

export function deriveJtiFromPayload(payload: Record<string, unknown>): string {
  const jti = payload.jti;
  if (typeof jti === 'string' && jti.length > 0) {
    return jti;
  }
  const sub = payload.sub;
  const iat = payload.iat;
  const exp = payload.exp;
  const raw = `${String(sub)}:${String(iat)}:${String(exp)}`;
  return createHash('sha256').update(raw, 'utf8').digest('hex');
}

export async function step5ReplayCheck(
  payload: Record<string, unknown>,
  blacklist: BlacklistAdapter
): Promise<{ jti: string; payload: Record<string, unknown> }> {
  const jti = deriveJtiFromPayload(payload);

  const exists = await blacklist.has(jti);
  if (exists) {
    throw new ShieldError('replay_attack', 'Token identifier already used (replay)', null);
  }

  const exp = payload.exp;
  const now = Math.floor(Date.now() / 1000);
  const expNum = typeof exp === 'number' ? exp : Number(exp);
  const ttl = Math.max(1, expNum - now);

  await blacklist.add(jti, ttl);

  return { jti, payload };
}
