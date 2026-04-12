import { generateKeyPairSync, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

export function makeRsaKeys() {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

export function signValidToken(
  privateKey: string,
  payloadOverrides: Record<string, unknown> = {},
  signOverrides: jwt.SignOptions = {}
) {
  return jwt.sign(
    {
      sub: 'user-1',
      jti: randomUUID(),
      ...payloadOverrides,
    },
    privateKey,
    {
      algorithm: 'RS256',
      expiresIn: 3600,
      issuer: 'jwt-shield-demo',
      audience: 'jwt-shield-api',
      ...signOverrides,
    }
  );
}
