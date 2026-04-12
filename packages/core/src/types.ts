export type AttackVector =
  | 'none_exploit'
  | 'algorithm_downgrade'
  | 'kid_injection'
  | 'key_confusion'
  | 'replay_attack'
  | 'token_theft'
  | 'malformed'
  | 'invalid_signature'
  | 'invalid_claims';

export interface AttackEvent {
  timestamp: string;
  event_type: 'JWT_ATTACK_BLOCKED';
  attack_vector: AttackVector;
  source_ip: string;
  attempted_algorithm: string | null;
  token_fingerprint: string;
  user_agent: string;
  blocked: boolean;
  detail?: string;
}

export interface BlacklistAdapter {
  has(jti: string): Promise<boolean>;
  add(jti: string, ttlSeconds: number): Promise<void>;
}

export interface ShieldKeyEntry {
  kid: string;
  /** PEM or raw key material for verify */
  publicKey: string | Buffer;
  /** Optional — used by API for signing only */
  privateKey?: string | Buffer;
  /** When true, preferred for signing new tokens (API concern) */
  active?: boolean;
}

export interface ValidateContext {
  userAgent?: string;
  acceptLanguage?: string;
  ip?: string;
}

export interface JWTShieldOptions {
  allowedAlgorithms: string[];
  keys: ShieldKeyEntry[];
  allowedIssuers: string[];
  allowedAudiences: string[];
  maxTokenAgeSecs: number;
  blacklist:
    | BlacklistAdapter
    | { type: 'redis'; redisUrl: string }
    | { type: 'memory' };
  enableFingerprintBinding?: boolean;
  clockSkewSeconds?: number;
  onAttackDetected?: (event: AttackEvent) => void;
}

export interface ValidateSuccess {
  valid: true;
  payload: Record<string, unknown>;
  jti: string;
}

export interface ValidateFailure {
  valid: false;
  attackVector: AttackVector;
  message: string;
}

export type ValidateResult = ValidateSuccess | ValidateFailure;

export interface SanitizedHeader {
  alg: string;
  typ: string;
  kid?: string;
}
