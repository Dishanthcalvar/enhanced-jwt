import type { BlacklistAdapter, JWTShieldOptions, ValidateContext, ValidateResult } from '../types';
import { ShieldError } from '../errors';
import { step1HeaderSanitize } from './step1_header_sanitize';
import { step2AlgorithmPin } from './step2_algorithm_pin';
import { step3KeyIntegrity } from './step3_key_integrity';
import { step4ClaimsVerify } from './step4_claims_verify';
import { deriveJtiFromPayload, step5ReplayCheck } from './step5_replay_check';

export async function runValidationPipeline(
  rawToken: string,
  options: JWTShieldOptions,
  blacklist: BlacklistAdapter,
  context: ValidateContext,
  skipReplay = false
): Promise<ValidateResult> {
  const clockSkew = options.clockSkewSeconds ?? 30;
  const fingerprint = options.enableFingerprintBinding ?? false;

  try {
    const { sanitized } = step1HeaderSanitize(rawToken);
    const algorithm = step2AlgorithmPin(sanitized, options.allowedAlgorithms);
    const { publicKeyPem } = step3KeyIntegrity(sanitized, algorithm, options.keys);
    const { payload } = step4ClaimsVerify(
      rawToken,
      publicKeyPem,
      algorithm,
      options.allowedIssuers,
      options.allowedAudiences,
      options.maxTokenAgeSecs,
      clockSkew,
      fingerprint,
      context
    );

    if (skipReplay) {
      const jti = deriveJtiFromPayload(payload);
      return { valid: true, payload, jti };
    }

    const { jti, payload: finalPayload } = await step5ReplayCheck(payload, blacklist);

    return { valid: true, payload: finalPayload, jti };
  } catch (e) {
    if (e instanceof ShieldError) {
      return {
        valid: false,
        attackVector: e.attackVector,
        message: e.message,
      };
    }
    const msg = e instanceof Error ? e.message : String(e);
    return { valid: false, attackVector: 'malformed', message: msg };
  }
}

export { step1HeaderSanitize } from './step1_header_sanitize';
export { step2AlgorithmPin } from './step2_algorithm_pin';
export { step3KeyIntegrity } from './step3_key_integrity';
export { step4ClaimsVerify, computeFingerprintHash } from './step4_claims_verify';
export { step5ReplayCheck } from './step5_replay_check';
