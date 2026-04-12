import { JWTShield } from '../src/validator';
import { computeFingerprintHash } from '../src/pipeline/step4_claims_verify';
import { makeRsaKeys, signValidToken } from './helpers';

describe('valid tokens', () => {
  const { publicKey, privateKey } = makeRsaKeys();

  const opts = {
    allowedAlgorithms: ['RS256' as const],
    keys: [{ kid: 'v1', publicKey }],
    allowedIssuers: ['jwt-shield-demo'],
    allowedAudiences: ['jwt-shield-api'],
    maxTokenAgeSecs: 86400,
    blacklist: { type: 'memory' as const },
    enableFingerprintBinding: false,
  };

  it('accepts a correctly signed RS256 token once', async () => {
    const token = signValidToken(privateKey);
    const shield = new JWTShield(opts);
    const r = await shield.validate(token);
    expect(r.valid).toBe(true);
  });

  it('accepts token with matching fingerprint when binding enabled', async () => {
    const ctx = { userAgent: 'jest', acceptLanguage: 'en', ip: '10.0.0.1' };
    const fgp = computeFingerprintHash(ctx);
    const token = signValidToken(privateKey, { fgp });
    const shield = new JWTShield({ ...opts, enableFingerprintBinding: true });
    const r = await shield.validate(token, ctx);
    expect(r.valid).toBe(true);
  });
});
