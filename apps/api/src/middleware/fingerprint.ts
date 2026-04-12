import type { Request } from 'express';
import { computeFingerprintHash } from '@jwt-shield/core';

export function fingerprintContextFromRequest(req: Request): {
  userAgent?: string;
  acceptLanguage?: string;
  ip?: string;
} {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
  return {
    userAgent: req.headers['user-agent'],
    acceptLanguage: req.headers['accept-language'] as string | undefined,
    ip,
  };
}

export function fingerprintHashFromRequest(req: Request): string {
  return computeFingerprintHash(fingerprintContextFromRequest(req));
}
