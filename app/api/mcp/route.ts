/**
 * app/api/mcp/route.ts — VERSA's MCP server (OKX.AI A2MCP, paid).
 *
 * One tool:
 *   generate_portrait(address, style?) — reads the wallet's on-chain
 *   history and returns an original soul portrait: archetype, portrait
 *   prose, poem, color palette, art prompt, trait tags, grounded stats.
 *
 * Protocol hardening (every SONDA lesson baked in from day one):
 *   - Proper MCP server (initialize / tools/list / tools/call) via
 *     mcp-handler, Streamable HTTP + JSON-RPC 2.0.
 *   - ACCEPT-HEADER TOLERANT: the strict MCP spec requires clients to
 *     send `Accept: application/json, text/event-stream`; real-world
 *     callers (including platform testers) often don't. We rewrite the
 *     header before delegating and unwrap SSE frames to plain JSON for
 *     clients that didn't ask for SSE. No 406s, ever.
 *   - FAST: no database, no workers. Wallet fetches are bounded (~4s),
 *     one capped LLM call (~6s). Total well under the function window.
 *
 * Payment (x402):
 *   - Discovery is free: initialize / tools/list always work unpaid so
 *     the marketplace can inspect the service.
 *   - tools/call for generate_portrait requires payment when
 *     X402_ENABLED=true: no payment header → HTTP 402 with the
 *     requirements; with header → facilitator verify+settle → work.
 */

import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { encodePaymentRequiredHeader } from '@okxweb3/x402-core/http';

import { generatePortrait } from '@/lib/creative-engine';
import {
  buildPaymentRequirements,
  extractPaymentHeader,
  paymentsEnabled,
  verifyAndSettle,
} from '@/lib/payment';
import { collectWalletSignals, isEvmAddress } from '@/lib/wallet-data';

export const maxDuration = 60;

/* -------------------------------------------------------------------------- */
/* MCP server                                                                 */
/* -------------------------------------------------------------------------- */

const handler = createMcpHandler(
  (server) => {
    server.tool(
      'generate_portrait',
      'Generate an original soul portrait of any EVM wallet: an archetype title, a 3-5 sentence character portrait, an 8-12 line poem, a named 5-color palette, a ready-to-use art prompt, and trait tags — all derived from the wallet\'s real on-chain history (age, rhythm, tokens, NFTs). Returns the complete portrait inline in a few seconds.',
      {
        address: z
          .string()
          .min(1)
          .describe('The EVM wallet address to portrait, e.g. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'),
        style: z
          .enum(['poetic', 'mystic', 'degen', 'noir'])
          .optional()
          .describe('Optional voice for the portrait. Default: poetic.'),
      },
      async ({ address, style }) => {
        const addr = address.trim();
        if (!isEvmAddress(addr)) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  ok: false,
                  error: 'Invalid EVM address. Expected 0x followed by 40 hex characters.',
                }),
              },
            ],
            isError: true,
          };
        }

        // 1. Bounded on-chain signal collection (never throws).
        const signals = await collectWalletSignals(addr);

        // 2. One capped creative call.
        const result = await generatePortrait(
          style ? { ...signals, address: `${signals.address} (style: ${style})` } : signals,
        );

        if (!result.ok) {
          return {
            content: [
              { type: 'text' as const, text: JSON.stringify({ ok: false, error: result.reason }) },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ ok: true, address: addr, ...result.portrait }, null, 2),
            },
          ],
        };
      },
    );
  },
  { serverInfo: { name: 'versa', version: '1.0.0' } },
  { basePath: '/api', maxDuration: 60, verboseLogs: false, disableSse: true },
);

/* -------------------------------------------------------------------------- */
/* Accept-tolerant + x402 wrapper                                             */
/* -------------------------------------------------------------------------- */

const COMPLIANT_ACCEPT = 'application/json, text/event-stream';

/** Best-effort detection of a paid tools/call without consuming the body. */
const isPaidToolCall = async (request: Request): Promise<boolean> => {
  if (request.method !== 'POST') return false;
  try {
    const body = (await request.clone().json()) as {
      method?: string;
      params?: { name?: string };
    };
    return body.method === 'tools/call' && body.params?.name === 'generate_portrait';
  } catch {
    return false;
  }
};

const wrapped = async (request: Request): Promise<Response> => {
  // ---- x402 gate (only for the paid tool call; discovery stays free) ----
  if (paymentsEnabled() && (await isPaidToolCall(request))) {
    const requirements = buildPaymentRequirements(request.url);
    // The marketplace/harness validates the PAYMENT-REQUIRED response
    // header (a base64-encoded copy of the same challenge), not just the
    // JSON body — the official SDK ships encodePaymentRequiredHeader for
    // exactly this. Set it on every 402 alongside the body.
    const paymentRequiredHeader = encodePaymentRequiredHeader(requirements);
    const paymentHeader = extractPaymentHeader(request);
    if (!paymentHeader) {
      return new Response(JSON.stringify(requirements), {
        status: 402,
        headers: {
          'content-type': 'application/json',
          'PAYMENT-REQUIRED': paymentRequiredHeader,
        },
      });
    }
    const settled = await verifyAndSettle(paymentHeader, requirements);
    if (!settled.ok) {
      return new Response(
        JSON.stringify({ ...requirements, error: `Payment not accepted: ${settled.detail}` }),
        {
          status: 402,
          headers: {
            'content-type': 'application/json',
            'PAYMENT-REQUIRED': paymentRequiredHeader,
          },
        },
      );
    }
    // Paid — fall through to the MCP handler.
  }

  // ---- Accept tolerance ----
  const originalAccept = request.headers.get('accept') ?? '';
  const clientWantsSse = originalAccept.includes('text/event-stream');

  const headers = new Headers(request.headers);
  headers.set('accept', COMPLIANT_ACCEPT);
  const proxied = new Request(request.url, {
    method: request.method,
    headers,
    body:
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.clone().arrayBuffer(),
  });

  const res = await handler(proxied);

  if (clientWantsSse) return res;
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('text/event-stream')) return res;

  const raw = await res.text();
  const dataLines = raw
    .split('\n')
    .filter((l) => l.startsWith('data:'))
    .map((l) => l.slice(5).trim())
    .filter(Boolean);
  const jsonBody = dataLines.length > 0 ? dataLines.join('') : raw.trim();

  return new Response(jsonBody, {
    status: res.status,
    headers: {
      'content-type': 'application/json',
      ...(res.headers.get('mcp-session-id')
        ? { 'mcp-session-id': res.headers.get('mcp-session-id') as string }
        : {}),
    },
  });
};

export { wrapped as GET, wrapped as POST, wrapped as DELETE };
