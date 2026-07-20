/**
 * app/api/portrait/route.ts — Free web endpoint powering the site.
 *
 * This is the human-facing door: the VERSA website calls it directly to
 * render a portrait for free (the viral/demo surface). It shares the
 * exact same engine as the paid MCP tool, but with NO x402 gate.
 *
 * Rate-limited to 3 requests/minute per IP (see lib/rate-limit.ts) to
 * bound cost exposure on a free endpoint that calls a paid LLM API.
 *
 * The paid door for agents is /api/mcp (x402-gated). Keeping them
 * separate lets the site stay free while the marketplace stays paid,
 * from one codebase.
 */

import { NextResponse } from 'next/server';

import { generatePortrait } from '@/lib/creative-engine';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { collectWalletSignals, isEvmAddress } from '@/lib/wallet-data';

export const maxDuration = 60;

export const POST = async (request: Request): Promise<NextResponse> => {
  // Free endpoint calling a paid LLM API — bound exposure to a burst of
  // traffic (bots, scrapers, repeated testing) with a simple per-IP cap.
  const limit = checkRateLimit(getClientIp(request));
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: `You've reached the portrait limit for a moment. Try again in ${limit.retryAfterSeconds}s.`,
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let body: { address?: unknown; style?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Send a JSON body with an address.' }, { status: 400 });
  }

  const address = typeof body.address === 'string' ? body.address.trim() : '';
  if (!isEvmAddress(address)) {
    return NextResponse.json(
      { ok: false, error: 'That doesn\u2019t look like a wallet address. Paste a 0x address with 40 hex characters.' },
      { status: 400 },
    );
  }

  const signals = await collectWalletSignals(address);
  const result = await generatePortrait(signals);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 502 });
  }

  return NextResponse.json({ ok: true, address, ...result.portrait }, { status: 200 });
};

export const GET = (): NextResponse =>
  NextResponse.json(
    { name: 'VERSA', endpoint: 'POST /api/portrait', body: { address: '0x…', style: 'poetic|mystic|degen|noir' } },
    { status: 200 },
  );
