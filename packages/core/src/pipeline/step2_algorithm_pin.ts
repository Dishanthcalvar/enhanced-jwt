import { ShieldError } from '../errors';
import { isNoneAlgorithm } from '../attacks/none_exploit';
import { isAlgorithmAllowed } from '../attacks/algorithm_downgrade';
import type { SanitizedHeader } from '../types';

export function step2AlgorithmPin(header: SanitizedHeader, allowlist: string[]): string {
  const alg = header.alg;

  if (isNoneAlgorithm(alg)) {
    throw new ShieldError('none_exploit', 'Algorithm "none" is not permitted', alg);
  }

  if (!isAlgorithmAllowed(alg, allowlist)) {
    throw new ShieldError('algorithm_downgrade', `Algorithm ${alg} is not allowlisted`, alg);
  }

  return alg;
}
