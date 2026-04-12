import { JWTShield } from '../src/validator';
import { makeRsaKeys, signValidToken } from './helpers';

describe('kid injection', () => {
  const { publicKey, privateKey } = makeRsaKeys();

  const baseOpts = () => ({
    allowedAlgorithms: ['RS256'],
    keys: [
      { kid: 'v1', publicKey },
      { kid: 'v2', publicKey },
    ],
    allowedIssuers: ['jwt-shield-demo'],
    allowedAudiences: ['jwt-shield-api'],
    maxTokenAgeSecs: 86400,
    blacklist: { type: 'memory' as const },
    enableFingerprintBinding: false,
  });

  it('rejects unknown kid with multiple keys configured', async () => {
    const token = jwtWithKid(signValidToken(privateKey), 'evil-kid');
    const shield = new JWTShield(baseOpts());
    const r = await shield.validateWithoutReplay(token);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.attackVector).toBe('kid_injection');
  });
});

function jwtWithKid(token: string, kid: string): string {
  const [_, payload, sig] = token.split('.');
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid })).toString('base64url');
  return `${header}.${payload}.${sig}`;
}
