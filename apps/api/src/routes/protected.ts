import { Router, type Request, type Response } from 'express';

export function createProtectedRouter(): Router {
  const router = Router();

  const dataHandler = (req: Request, res: Response) => {
    const payload = (req as Request & { shieldPayload?: Record<string, unknown> }).shieldPayload;
    res.json({
      message: 'Protected resource',
      receivedAt: new Date().toISOString(),
      subject: payload?.sub,
    });
  };

  router.get('/data', dataHandler);
  router.post('/data', dataHandler);

  router.get('/me', (req, res) => {
    const payload = (req as Request & { shieldPayload?: Record<string, unknown> }).shieldPayload;
    res.json({ payload });
  });

  return router;
}
