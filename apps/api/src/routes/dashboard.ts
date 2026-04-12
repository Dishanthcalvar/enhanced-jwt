import { Router } from 'express';
import jwt from 'jsonwebtoken';
import type { JWTShield } from '@jwt-shield/core';
import type { StatsService } from '../services/stats_service';
import type { AttackLogger } from '../services/attack_logger';
import type { IpReputationService } from '../services/ip_reputation';
import { fingerprintContextFromRequest } from '../middleware/fingerprint';

export function createDashboardRouter(
  stats: StatsService,
  attacks: AttackLogger,
  ipSvc: IpReputationService,
  shield: JWTShield
): Router {
  const router = Router();

  router.get('/summary', async (_req, res) => {
    const summary = await stats.getSummary();
    res.json(summary);
  });

  router.get('/events', async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const events = await attacks.recent(limit);
    res.json(events);
  });

  router.get('/blocked-ips', async (_req, res) => {
    const list = await ipSvc.listBlocked();
    res.json(list);
  });

  router.post('/unblock-ip', async (req, res) => {
    const ip = req.body?.ip;
    if (typeof ip !== 'string') {
      res.status(400).json({ error: 'ip required' });
      return;
    }
    await ipSvc.unblock(ip);
    res.json({ success: true });
  });

  router.post('/inspect', async (req, res) => {
    const token = req.body?.token;
    if (typeof token !== 'string' || !token.trim()) {
      res.status(400).json({ error: 'token required' });
      return;
    }
    const raw = token.trim();
    const parts = raw.split('.');
    let headerJson: Record<string, unknown> | null = null;
    let payloadJson: Record<string, unknown> | null = null;
    try {
      if (parts[0]) {
        headerJson = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as Record<
          string,
          unknown
        >;
      }
      if (parts[1]) {
        payloadJson = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as Record<
          string,
          unknown
        >;
      }
    } catch {
      // leave nulls
    }

    const ctx = fingerprintContextFromRequest(req);
    const result = await shield.validateWithoutReplay(raw, ctx);

    const steps: { step: string; ok: boolean; detail?: string }[] = [];
    if (!headerJson) {
      steps.push({ step: 'header_decode', ok: false, detail: 'Could not decode header' });
    } else {
      steps.push({ step: 'header_decode', ok: true });
    }

    if (result.valid) {
      steps.push({ step: 'full_pipeline', ok: true });
    } else {
      steps.push({ step: 'full_pipeline', ok: false, detail: result.message });
    }

    res.json({
      valid: result.valid,
      attackVector: result.valid ? null : result.attackVector,
      message: result.valid ? undefined : result.message,
      header: headerJson,
      payload: payloadJson ?? (result.valid ? result.payload : jwt.decode(raw)),
      steps,
    });
  });

  return router;
}
