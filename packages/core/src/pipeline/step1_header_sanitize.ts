import { ShieldError } from '../errors';
import { hasUrlOrEmbeddedKeyFields } from '../attacks/key_confusion';
import { extractKid } from '../attacks/kid_injection';
import type { SanitizedHeader } from '../types';

export interface Step1Result {
  sanitized: SanitizedHeader;
  /** Original header fields stripped or forbidden (for logging) */
  strippedFields: string[];
}

function decodeBase64Url(part: string): Buffer {
  try {
    return Buffer.from(part, 'base64url');
  } catch {
    throw new ShieldError('malformed', 'Invalid base64url header segment', null);
  }
}

export function step1HeaderSanitize(rawToken: string): Step1Result {
  const parts = rawToken.split('.');
  if (parts.length !== 3) {
    throw new ShieldError('malformed', 'JWT must have exactly 3 segments', null);
  }

  let json: string;
  try {
    json = decodeBase64Url(parts[0]).toString('utf8');
  } catch (e) {
    if (e instanceof ShieldError) throw e;
    throw new ShieldError('malformed', 'Could not decode header', null);
  }

  let header: Record<string, unknown>;
  try {
    header = JSON.parse(json) as Record<string, unknown>;
  } catch {
    throw new ShieldError('malformed', 'Malformed JWT header JSON', null);
  }

  const forbidden = hasUrlOrEmbeddedKeyFields(header);
  if (forbidden) {
    throw new ShieldError(
      'key_confusion',
      `Forbidden header field present: ${forbidden}`,
      typeof header.alg === 'string' ? header.alg : null
    );
  }

  const alg = header.alg;
  if (typeof alg !== 'string' || alg.length === 0) {
    throw new ShieldError('malformed', 'Header alg must be a non-empty string', null);
  }

  const typ = header.typ;
  if (typeof typ !== 'string' || typ.toLowerCase() !== 'jwt') {
    throw new ShieldError('malformed', 'Header typ must be JWT', typeof alg === 'string' ? alg : null);
  }

  const strippedFields: string[] = [];
  const allKeys = Object.keys(header);
  const allowed = new Set(['alg', 'typ', 'kid']);
  for (const k of allKeys) {
    if (!allowed.has(k)) {
      strippedFields.push(k);
    }
  }

  const kid = extractKid(header);
  const sanitized: SanitizedHeader = { alg, typ };
  if (kid !== undefined) {
    sanitized.kid = kid;
  }

  return { sanitized, strippedFields };
}
