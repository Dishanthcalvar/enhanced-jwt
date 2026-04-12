import { Router, type RequestHandler, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { JWTShield, ShieldKeyEntry } from '@jwt-shield/core';
import { env } from '../config/env';
import { getRedis } from '../config/redis';
import { fingerprintHashFromRequest } from '../middleware/fingerprint';
const REFRESH_PREFIX = 'shield:refresh:';
const REFRESH_TTL_SEC = 7 * 24 * 3600;

export function createAuthRouter(
  keys: ShieldKeyEntry[],
  activeKid: string,
  shield: JWTShield,
  loginLimiter?: RequestHandler
): Router {
  const router = Router();
  const redis = getRedis();

  const loginHandler = async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};
    if (username !== env.DEMO_USERNAME || password !== env.DEMO_PASSWORD) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const active = keys.find((k) => k.kid === activeKid && k.privateKey);
    if (!active?.privateKey) {
      res.status(500).json({ error: 'Signing key not configured' });
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const jti = uuidv4();
    const fgp = env.ENABLE_FINGERPRINT_BINDING ? fingerprintHashFromRequest(req) : undefined;

    const payload: Record<string, unknown> = {
      sub: username,
      jti,
      iat: now,
    };
    if (fgp) payload.fgp = fgp;

    const token = jwt.sign(payload, active.privateKey, {
      algorithm: 'RS256',
      expiresIn: env.JWT_MAX_TOKEN_AGE_SECONDS,
      issuer: env.JWT_ALLOWED_ISSUERS.split(',')[0],
      audience: env.JWT_ALLOWED_AUDIENCES.split(',')[0],
      keyid: activeKid,
    });

    const refreshId = uuidv4();
    await redis.setex(`${REFRESH_PREFIX}${refreshId}`, REFRESH_TTL_SEC, username as string);

    res.json({
      token,
      expiresIn: env.JWT_MAX_TOKEN_AGE_SECONDS,
      refreshToken: refreshId,
    });
  };

  if (loginLimiter) {
    router.post('/login', loginLimiter, loginHandler);
  } else {
    router.post('/login', loginHandler);
  }

  router.post('/logout', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const raw = auth.slice('Bearer '.length).trim();
    const decoded = jwt.decode(raw) as { jti?: string } | null;
    if (!decoded?.jti) {
      res.status(400).json({ error: 'Invalid token' });
      return;
    }
    await shield.getBlacklist().add(decoded.jti, 365 * 24 * 3600);
    res.json({ success: true });
  });

  router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body ?? {};
    if (typeof refreshToken !== 'string') {
      res.status(400).json({ error: 'refreshToken required' });
      return;
    }
    const key = `${REFRESH_PREFIX}${refreshToken}`;
    const sub = await redis.get(key);
    if (!sub) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }
    await redis.del(key);

    const active = keys.find((k) => k.kid === activeKid && k.privateKey);
    if (!active?.privateKey) {
      res.status(500).json({ error: 'Signing key not configured' });
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const jti = uuidv4();
    const fgp = env.ENABLE_FINGERPRINT_BINDING ? fingerprintHashFromRequest(req) : undefined;

    const payload: Record<string, unknown> = {
      sub,
      jti,
      iat: now,
    };
    if (fgp) payload.fgp = fgp;

    const token = jwt.sign(payload, active.privateKey, {
      algorithm: 'RS256',
      expiresIn: env.JWT_MAX_TOKEN_AGE_SECONDS,
      issuer: env.JWT_ALLOWED_ISSUERS.split(',')[0],
      audience: env.JWT_ALLOWED_AUDIENCES.split(',')[0],
      keyid: activeKid,
    });

    const newRefresh = uuidv4();
    await redis.setex(`${REFRESH_PREFIX}${newRefresh}`, REFRESH_TTL_SEC, sub);

    res.json({
      token,
      expiresIn: env.JWT_MAX_TOKEN_AGE_SECONDS,
      refreshToken: newRefresh,
    });
  });

  return router;
}
