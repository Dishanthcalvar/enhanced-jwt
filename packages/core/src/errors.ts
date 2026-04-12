import type { AttackVector } from './types';

export class ShieldError extends Error {
  constructor(
    public readonly attackVector: AttackVector,
    message: string,
    public readonly attemptedAlgorithm: string | null = null
  ) {
    super(message);
    this.name = 'ShieldError';
  }
}
