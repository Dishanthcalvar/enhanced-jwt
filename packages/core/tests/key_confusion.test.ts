import { JWTShield } from '../src/validator';
import { makeRsaKeys, signValidToken } from './helpers';

describe('key confusion vectors in header', () => {
  const { publicKey, privateKey } = makeRsaKeys();

  const baseOpts = () => ({
    allowedAlgorithms: ['RS256'],
    keys: [{ kid: 'v1', publicKey }],
    allowedIssuers: ['jwt-shield-demo'],
    allowedAudiences: ['jwt-shield-api'],
    maxTokenAgeSecs: 86400,
    blacklist: { type: 'memory' as const },
    enableFingerprintBinding: false,
  });

  it('rejects jku in header', async () => {
    const token = injectHeaderField(signValidToken(privateKey), 'jku', 'https://evil.test/jwks');
    const shield = new JWTShield(baseOpts());
    const r = await shield.validateWithoutReplay(token);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.attackVector).toBe('key_confusion');
  });
});

function injectHeaderField(token: string, field: string, value: string): string {
  const [h0, payload, sig] = token.split('.');
  const h = JSON.parse(Buffer.from(h0, 'base64url').toString('utf8')) as Record<string, unknown>;
  h[field] = value;
  const header = Buffer.from(JSON.stringify(h)).toString('base64url');
  return `${header}.${payload}.${sig}`;
}
