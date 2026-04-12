import { JWTShield } from '../src/validator';
import { makeRsaKeys } from './helpers';

describe('algorithm downgrade', () => {
  const { publicKey } = makeRsaKeys();

  const baseOpts = () => ({
    allowedAlgorithms: ['RS256'],
    keys: [{ kid: 'v1', publicKey }],
    allowedIssuers: ['jwt-shield-demo'],
    allowedAudiences: ['jwt-shield-api'],
    maxTokenAgeSecs: 86400,
    blacklist: { type: 'memory' as const },
    enableFingerprintBinding: false,
  });

  it('rejects HS256 when only RS256 is allowlisted', async () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(
      JSON.stringify({
        sub: 'x',
        exp: now + 3600,
        iat: now,
        iss: 'jwt-shield-demo',
        aud: 'jwt-shield-api',
      })
    ).toString('base64url');
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const token = `${header}.${payload}.bm9w`;
    const shield = new JWTShield(baseOpts());
    const r = await shield.validateWithoutReplay(token);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.attackVector).toBe('algorithm_downgrade');
  });
});
