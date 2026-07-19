/**
 * lib/payment.ts — x402 payment gate for VERSA.
 *
 * Implements the x402 pay-per-call flow for the paid tool:
 *
 *   1. Request arrives WITHOUT a payment header
 *        → respond HTTP 402 with the payment requirements ("accepts").
 *   2. Caller pays and retries WITH the payment header
 *        → verify (and settle) via the configured facilitator, then
 *          allow the work to run.
 *
 * Everything network/token/facilitator-specific lives in env so the
 * deployment can target OKX's facilitator + X Layer + USDT0 without
 * code changes:
 *
 *   X402_ENABLED            "true" | "false"  (false = free mode; useful
 *                           for pre-listing tests)
 *   X402_PAY_TO             receiving wallet address
 *   X402_AMOUNT             price in smallest units (6dp): "50000" = $0.05
 *   X402_NETWORK            CAIP-2 id, e.g. "eip155:196" (X Layer)
 *   X402_ASSET              token contract address (USDT0 on X Layer)
 *   X402_ASSET_NAME         e.g. "USDT0"
 *   X402_FACILITATOR_BASE   e.g. "https://web3.okx.com/api/v6/pay/x402"
 *   X402_FACILITATOR_KEY    optional API key header value if required
 *   X402_MAX_TIMEOUT_SECS   default "300"
 *
 * Payment headers accepted (spec + common variants):
 *   X-PAYMENT / PAYMENT-SIGNATURE
 */

export type PaymentRequirements = {
  x402Version: number;
  resource: { url: string; description: string; mimeType: string };
  accepts: Array<{
    scheme: 'exact';
    network: string;
    asset: string;
    amount: string;
    payTo: string;
    maxTimeoutSeconds: number;
    extra?: Record<string, string>;
  }>;
};

const bool = (v: string | undefined, dflt: boolean): boolean =>
  v === undefined ? dflt : v.toLowerCase() === 'true';

export const paymentsEnabled = (): boolean => bool(process.env.X402_ENABLED, false);

export const buildPaymentRequirements = (resourceUrl: string): PaymentRequirements => ({
  x402Version: 2,
  resource: {
    url: resourceUrl,
    description: 'VERSA — generate an on-chain soul portrait (archetype, portrait, poem, palette, art prompt).',
    mimeType: 'application/json',
  },
  accepts: [
    {
      scheme: 'exact',
      network: process.env.X402_NETWORK ?? 'eip155:196',
      asset: process.env.X402_ASSET ?? '',
      amount: process.env.X402_AMOUNT ?? '50000',
      payTo: process.env.X402_PAY_TO ?? '',
      maxTimeoutSeconds: Number(process.env.X402_MAX_TIMEOUT_SECS ?? '300'),
      extra: { name: process.env.X402_ASSET_NAME ?? 'USDT0', version: '2' },
    },
  ],
});

export const extractPaymentHeader = (request: Request): string | null =>
  request.headers.get('x-payment') ??
  request.headers.get('payment-signature') ??
  request.headers.get('payment') ??
  null;

type FacilitatorResult = { ok: boolean; detail: string };

// Confirmed from OKX's Onchain OS payment API docs (api-http-batch /
// api-http-exact reference): base URL, path prefix, and response
// envelope shape. All endpoints require API Key authentication.
const OKX_X402_BASE = 'https://web3.okx.com/api/v6/pay/x402';

const facilitatorCall = async (
  path: 'verify' | 'settle',
  paymentHeader: string,
  requirements: PaymentRequirements,
): Promise<FacilitatorResult> => {
  const base = (process.env.X402_FACILITATOR_BASE ?? OKX_X402_BASE).replace(/\/$/, '');
  const key = process.env.X402_FACILITATOR_KEY;
  if (!key) return { ok: false, detail: 'Facilitator API key is not configured.' };
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(`${base}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // OKX Onchain OS API key header (matches the onchainos CLI's
        // own auth convention for web3.okx.com endpoints).
        'OK-ACCESS-KEY': key,
      },
      body: JSON.stringify({
        payment: paymentHeader,
        requirements: requirements.accepts[0],
      }),
      signal: controller.signal,
    });
    clearTimeout(t);
    const text = await res.text().catch(() => '');
    if (!res.ok) return { ok: false, detail: `${path} ${res.status}: ${text.slice(0, 160)}` };
    try {
      // OKX's documented envelope: { code: "0", msg: "success", data: {...} }
      // On business errors, code is non-"0" and data is null.
      const body = JSON.parse(text) as { code?: string | number; msg?: string; data?: unknown };
      const success = body.code === '0' || body.code === 0;
      return success
        ? { ok: true, detail: `${path} ok` }
        : { ok: false, detail: `${path} rejected (code ${body.code}): ${body.msg ?? text.slice(0, 160)}` };
    } catch {
      return { ok: false, detail: `${path} returned non-JSON.` };
    }
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? `${path} failed: ${error.message}` : `${path} failed.`,
    };
  }
};

/**
 * Verify then settle a payment. Returns ok=true only when both pass.
 */
export const verifyAndSettle = async (
  paymentHeader: string,
  requirements: PaymentRequirements,
): Promise<FacilitatorResult> => {
  const verify = await facilitatorCall('verify', paymentHeader, requirements);
  if (!verify.ok) return verify;
  return facilitatorCall('settle', paymentHeader, requirements);
};
