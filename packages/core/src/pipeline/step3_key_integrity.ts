import { ShieldError } from '../errors';
import { resolveVerificationKey } from '../key_store';
import type { SanitizedHeader, ShieldKeyEntry } from '../types';

export interface Step3Result {
  publicKeyPem: string | Buffer;
  kid: string;
}

export function step3KeyIntegrity(
  header: SanitizedHeader,
  pinnedAlgorithm: string,
  keys: ShieldKeyEntry[]
): Step3Result {
  try {
    const resolved = resolveVerificationKey(keys, header.kid, pinnedAlgorithm);
    return { publicKeyPem: resolved.publicKey, kid: resolved.kid };
  } catch (e) {
    if (e instanceof ShieldError) throw e;
    const msg = e instanceof Error ? e.message : String(e);
    throw new ShieldError('malformed', `Key integrity check failed: ${msg}`, pinnedAlgorithm);
  }
}
