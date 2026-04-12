export { JWTShield } from './validator';
export { ShieldError } from './errors';
export type {
  AttackVector,
  AttackEvent,
  BlacklistAdapter,
  JWTShieldOptions,
  ShieldKeyEntry,
  ValidateContext,
  ValidateResult,
  ValidateSuccess,
  ValidateFailure,
} from './types';
export { runValidationPipeline } from './pipeline';
export { computeFingerprintHash } from './pipeline/step4_claims_verify';
export { createMemoryBlacklist } from './blacklist/memory_blacklist';
export { createRedisBlacklist } from './blacklist/redis_blacklist';
