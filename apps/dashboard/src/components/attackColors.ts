import type { AttackVector } from '../types';

const map: Record<string, string> = {
  none_exploit: '#ef4444',
  algorithm_downgrade: '#f97316',
  kid_injection: '#eab308',
  key_confusion: '#a855f7',
  replay_attack: '#3b82f6',
  token_theft: '#ec4899',
  malformed: '#6b7280',
  invalid_signature: '#64748b',
  invalid_claims: '#94a3b8',
};

export function attackColor(vector: string): string {
  return map[vector] ?? '#6b7280';
}

export type { AttackVector };
