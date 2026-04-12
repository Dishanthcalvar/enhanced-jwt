/** Kid validation is enforced in key_store.resolveVerificationKey */

export function extractKid(header: Record<string, unknown>): string | undefined {
  const kid = header.kid;
  if (kid === undefined || kid === null) return undefined;
  if (typeof kid !== 'string') return undefined;
  return kid;
}
