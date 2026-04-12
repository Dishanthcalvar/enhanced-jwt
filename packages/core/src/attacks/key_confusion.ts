const FORBIDDEN = new Set(['jku', 'jwk', 'x5u', 'x5c']);

export function hasUrlOrEmbeddedKeyFields(header: Record<string, unknown>): string | null {
  for (const key of FORBIDDEN) {
    if (key in header && header[key] != null) {
      return key;
    }
  }
  return null;
}
