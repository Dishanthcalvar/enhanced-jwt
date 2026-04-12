import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { createMemoryBlacklist } from './blacklist/memory_blacklist';
import { createRedisBlacklist } from './blacklist/redis_blacklist';
import type {
  AttackEvent,
  BlacklistAdapter,
  JWTShieldOptions,
  ValidateContext,
  ValidateResult,
} from './types';
import { runValidationPipeline } from './pipeline';
import { createHash } from 'crypto';

function tokenFingerprint(token: string): string {
  const prefix = token.slice(0, 20);
  return createHash('sha256').update(prefix, 'utf8').digest('hex');
}

function resolveBlacklistAdapter(
  config: JWTShieldOptions['blacklist']
): BlacklistAdapter {
  if ('has' in config && 'add' in config) {
    return config;
  }
  if (config.type === 'memory') {
    return createMemoryBlacklist();
  }
  return createRedisBlacklist(config.redisUrl);
}

export class JWTShield {
  private readonly blacklist: BlacklistAdapter;
  private readonly options: JWTShieldOptions;

  constructor(options: JWTShieldOptions) {
    this.options = options;
    this.blacklist = resolveBlacklistAdapter(options.blacklist);
  }

  getBlacklist(): BlacklistAdapter {
    return this.blacklist;
  }

  private emitAttack(
    event: Omit<AttackEvent, 'timestamp' | 'event_type' | 'blocked'> & { blocked?: boolean }
  ): void {
    const full: AttackEvent = {
      timestamp: new Date().toISOString(),
      event_type: 'JWT_ATTACK_BLOCKED',
      blocked: event.blocked ?? true,
      ...event,
    };
    this.options.onAttackDetected?.(full);
  }

  async validate(token: string, context: ValidateContext = {}): Promise<ValidateResult> {
    const result = await runValidationPipeline(token, this.options, this.blacklist, context, false);

    if (!result.valid) {
      this.emitAttack({
        attack_vector: result.attackVector,
        source_ip: context.ip ?? 'unknown',
        attempted_algorithm: null,
        token_fingerprint: tokenFingerprint(token),
        user_agent: context.userAgent ?? '',
        detail: result.message,
      });
    }

    return result;
  }

  /**
   * Runs header → algorithm → key → claims only (no replay blacklist side effects).
   */
  async validateWithoutReplay(
    token: string,
    context: ValidateContext = {}
  ): Promise<ValidateResult> {
    return runValidationPipeline(token, this.options, this.blacklist, context, true);
  }

  middleware(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const raw = auth.slice('Bearer '.length).trim();
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        '';
      const result = await this.validate(raw, {
        userAgent: req.headers['user-agent'],
        acceptLanguage: req.headers['accept-language'] as string | undefined,
        ip,
      });

      if (!result.valid) {
        res.status(403).json({ error: 'Forbidden', code: result.attackVector });
        return;
      }

      (req as Request & { shieldPayload?: Record<string, unknown> }).shieldPayload = result.payload;
      next();
    };
  }
}
