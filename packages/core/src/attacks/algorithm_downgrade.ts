export function isAlgorithmAllowed(alg: string, allowlist: string[]): boolean {
  return allowlist.includes(alg);
}
