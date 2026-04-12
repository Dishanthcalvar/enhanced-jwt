import { JWTShield } from '../src/validator';
import { makeRsaKeys, signValidToken } from './helpers';

describe('replay attack', () => {
  const { publicKey, privateKey } = makeRsaKeys();

  const opts = {
    allowedAlgorithms: ['RS256'],
    keys: [{ kid: 'v1', publicKey }],
    allowedIssuers: ['jwt-shield-demo'],
    allowedAudiences: ['jwt-shield-api'],
    maxTokenAgeSecs: 86400,
    blacklist: { type: 'memory' as const },
    enableFingerprintBinding: false,
  };

  it('rejects second use of the same jti', async () => {
    const token = signValidToken(privateKey);
    const shield = new JWTShield(opts);
    const first = await shield.validate(token);
    expect(first.valid).toBe(true);
    const second = await shield.validate(token);
    expect(second.valid).toBe(false);
    if (!second.valid) expect(second.attackVector).toBe('replay_attack');
  });
});
