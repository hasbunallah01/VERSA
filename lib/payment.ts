/**
 * lib/payment.ts — x402 payment gate for VERSA.
 *
 * Implements the x402 pay-per-call flow for the paid tool:
 *
 *   1. Request arrives WITHOUT a payment header
 *        → respond HTTP 402 with the payment requirements ("accepts").
 *   2. Caller pays and retries WITH the payment header (base64-encoded
 *      PaymentPayload, per the x402 spec)
 *        → verify + settle via OKX's official facilitator client, then
 *          allow the work to run.
 *
 * Uses the official @okxweb3/x402-core SDK for the facilitator calls
 * rather than hand-rolled HTTP requests: OKX's facilitator requires
 * HMAC-SHA256 request signing (OK-ACCESS-KEY / OK-ACCESS-SIGN /
 * OK-ACCESS-TIMESTAMP / OK-ACCESS-PASSPHRASE), which the SDK implements
 * correctly — reimplementing that signing by hand for code that moves
 * real money is not worth the risk.
 *
 * Env vars:
 *   X402_ENABLED            "true" | "false"  (false = free mode; useful
 *                           for pre-listing tests)
 *   X402_PAY_TO             receiving wallet address
 *   X402_AMOUNT             price in smallest units (6dp): "50000" = $0.05
 *   X402_NETWORK            CAIP-2 id, e.g. "eip155:196" (X Layer)
 *   X402_ASSET              token contract address (USDT0 on X Layer)
 *   X402_ASSET_NAME         e.g. "USDT0"
 *   X402_FACILITATOR_BASE   defaults to https://web3.okx.com
 *   X402_API_KEY            required — OKX Onchain OS API key
 *   X402_SECRET_KEY         required — used for HMAC request signing
 *   X402_PASSPHRASE         required — set when the API key was created
 *   X402_MAX_TIMEOUT_SECS   default "300"
 */

import { OKXFacilitatorClient } from '@okxweb3/x402-core/facilitator';
import { decodePaymentSignatureHeader } from '@okxweb3/x402-core/http';
import type { Network, PaymentPayload, PaymentRequirements } from '@okxweb3/x402-core/types';

export type PaymentRequired = {
  x402Version: number;
  resource: { url: string; description: string; mimeType: string };
  accepts: PaymentRequirements[];
};

const bool = (v: string | undefined, dflt: boolean): boolean =>
  v === undefined ? dflt : v.toLowerCase() === 'true';

export const paymentsEnabled = (): boolean => bool(process.env.X402_ENABLED, false);

const asNetwork = (v: string): Network => {
  // Network is a CAIP-2 identifier: "<namespace>:<reference>", e.g.
  // "eip155:196". Validate the shape before the type assertion so a
  // misconfigured env var fails loudly instead of silently.
  if (!v.includes(':')) {
    throw new Error(`Invalid network identifier "${v}" — expected CAIP-2 format like "eip155:196".`);
  }
  return v as Network;
};

export const buildPaymentRequirements = (resourceUrl: string): PaymentRequired => ({
  x402Version: 2,
  resource: {
    url: resourceUrl,
    description:
      'VERSA — generate an on-chain soul portrait (archetype, portrait, poem, palette, art prompt).',
    mimeType: 'application/json',
  },
  accepts: [
    {
      scheme: 'exact',
      network: asNetwork(process.env.X402_NETWORK ?? 'eip155:196'),
      asset: process.env.X402_ASSET ?? '',
      amount: process.env.X402_AMOUNT ?? '50000',
      payTo: process.env.X402_PAY_TO ?? '',
      maxTimeoutSeconds: Number(process.env.X402_MAX_TIMEOUT_SECS ?? '300'),
      extra: { name: process.env.X402_ASSET_NAME ?? 'USDT0', version: '2' },
    },
  ],
});

/** Reads the payment proof header. Per spec it's PAYMENT-SIGNATURE (base64 PaymentPayload). */
export const extractPaymentHeader = (request: Request): string | null =>
  request.headers.get('payment-signature') ?? request.headers.get('x-payment') ?? null;

let cachedClient: OKXFacilitatorClient | null = null;

const getClient = (): OKXFacilitatorClient | null => {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.X402_API_KEY;
  const secretKey = process.env.X402_SECRET_KEY;
  const passphrase = process.env.X402_PASSPHRASE;
  if (!apiKey || !secretKey || !passphrase) return null;
  cachedClient = new OKXFacilitatorClient({
    apiKey,
    secretKey,
    passphrase,
    baseUrl: process.env.X402_FACILITATOR_BASE || undefined,
  });
  return cachedClient;
};

type Result = { ok: boolean; detail: string };

/**
 * Decode the payment header into a PaymentPayload, then verify and
 * settle it with OKX's facilitator. Returns ok=true only once both
 * steps succeed.
 */
export const verifyAndSettle = async (
  paymentHeader: string,
  requirements: PaymentRequired,
): Promise<Result> => {
  const client = getClient();
  if (!client) {
    return {
      ok: false,
      detail: 'Facilitator credentials are not configured (X402_API_KEY / X402_SECRET_KEY / X402_PASSPHRASE).',
    };
  }

  let payload: PaymentPayload;
  try {
    payload = decodePaymentSignatureHeader(paymentHeader);
  } catch {
    return { ok: false, detail: 'Malformed payment signature header.' };
  }

  const paymentRequirements = requirements.accepts[0];

  try {
    const verifyResult = await client.verify(payload, paymentRequirements);
    if (!verifyResult.isValid) {
      return { ok: false, detail: `verify rejected: ${verifyResult.invalidReason ?? 'unknown reason'}` };
    }
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? `verify failed: ${error.message}` : 'verify failed.' };
  }

  try {
    const settleResult = await client.settle(payload, paymentRequirements);
    if (settleResult.status === 'success' || settleResult.status === 'pending' || settleResult.success) {
      return { ok: true, detail: `settle ${settleResult.status ?? 'ok'}` };
    }
    return { ok: false, detail: `settle rejected: ${settleResult.errorReason ?? 'unknown reason'}` };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? `settle failed: ${error.message}` : 'settle failed.' };
  }
};
