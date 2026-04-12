import type { Request, Response, NextFunction } from 'express';
import type { IpReputationService } from '../services/ip_reputation';

export function ipBlockerMiddleware(ipSvc: IpReputationService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const raw =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    const check = await ipSvc.check(raw);
    if (!check.allowed) {
      res.status(403).send('Forbidden');
      return;
    }
    next();
  };
}
