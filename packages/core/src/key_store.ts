import { createPublicKey } from 'crypto';
import type { KeyObject } from 'crypto';
import { ShieldError } from './errors';
import type { ShieldKeyEntry } from './types';

export interface ResolvedVerifyKey {
  kid: string;
  publicKey: string | Buffer;
  keyObject: KeyObject;
  algorithmHint: 'RS256' | 'ES256';
}

function detectAlgFromKey(keyObject: KeyObject): 'RS256' | 'ES256' {
  const type = keyObject.asymmetricKeyType;
  if (type === 'rsa') return 'RS256';
  if (type === 'ec') {
    const named = keyObject.asymmetricKeyDetails?.namedCurve;
    if (named === 'prime256v1' || named === 'P-256') return 'ES256';
  }
  throw new Error('Unsupported key type for JWT Shield (expect RSA 2048+ or EC P-256)');
}

export function minRsaBits(keyObject: KeyObject): number {
  const details = keyObject.asymmetricKeyDetails;
  if (keyObject.asymmetricKeyType === 'rsa' && details?.modulusLength != null) {
    return details.modulusLength;
  }
  return 0;
}

export function assertKeyIntegrity(algorithm: string, keyObject: KeyObject): void {
  if (algorithm === 'RS256') {
    if (keyObject.asymmetricKeyType !== 'rsa') {
      throw new Error('RS256 requires RSA public key');
    }
    const bits = minRsaBits(keyObject);
    if (bits < 2048) {
      throw new Error(`RSA key must be at least 2048 bits, got ${bits}`);
    }
  } else if (algorithm === 'ES256') {
    if (keyObject.asymmetricKeyType !== 'ec') {
      throw new Error('ES256 requires EC public key');
    }
    const curve = keyObject.asymmetricKeyDetails?.namedCurve;
    if (curve !== 'prime256v1' && curve !== 'P-256') {
      throw new Error('ES256 requires P-256 (prime256v1) curve');
    }
  }
}

export function resolveVerificationKey(
  keys: ShieldKeyEntry[],
  headerKid: string | undefined,
  pinnedAlgorithm: string
): ResolvedVerifyKey {
  const whitelist = new Map(keys.map((k) => [k.kid, k]));

  if (keys.length === 0) {
    throw new ShieldError('malformed', 'No signing keys configured', null);
  }

  if (keys.length === 1) {
    const only = keys[0];
    if (headerKid !== undefined && headerKid !== only.kid) {
      throw new ShieldError('kid_injection', 'Token kid does not match configured key', pinnedAlgorithm);
    }
    const keyObject = createPublicKey(only.publicKey);
    assertKeyIntegrity(pinnedAlgorithm, keyObject);
    return {
      kid: only.kid,
      publicKey: only.publicKey,
      keyObject,
      algorithmHint: detectAlgFromKey(keyObject),
    };
  }

  if (!headerKid) {
    throw new ShieldError('kid_injection', 'Missing kid for multi-key configuration', pinnedAlgorithm);
  }

  const entry = whitelist.get(headerKid);
  if (!entry) {
    throw new ShieldError('kid_injection', 'Unknown or untrusted kid', pinnedAlgorithm);
  }

  const keyObject = createPublicKey(entry.publicKey);
  assertKeyIntegrity(pinnedAlgorithm, keyObject);
  const hint = detectAlgFromKey(keyObject);
  if (hint !== pinnedAlgorithm) {
    throw new ShieldError('key_confusion', 'Algorithm does not match key material', pinnedAlgorithm);
  }

  return {
    kid: entry.kid,
    publicKey: entry.publicKey,
    keyObject,
    algorithmHint: hint,
  };
}
