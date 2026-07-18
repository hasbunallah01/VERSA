# VERSA — Architecture Notes

This document goes one level deeper than the README for anyone extending VERSA.

## The three engine modules (`lib/`)

### `wallet-data.ts` — signal collection
Turns an address into a compact `WalletSignals` bundle. Two tiers:

- **Rich (Etherscan):** three parallel calls (tx sample, token transfers, NFT
  transfers). Derives wallet age, night/day activity split, outgoing ratio,
  distinct token symbols, NFT movement count. One round-trip of wall time.
- **Basic (RPC fallback):** `eth_getBalance` + `eth_getTransactionCount` when no
  Etherscan key is present or the API misses. No key required.

Every fetch is wrapped in a hard timeout (`FETCH_TIMEOUT_MS`). The function
never throws — an empty wallet returns zeroed signals and is later rendered as
"The Unwritten".

### `creative-engine.ts` — the portrait
One OpenAI Chat Completions call:

- `response_format: json_object` + a strict validator (`validatePortrait`) so
  malformed output is caught, not shipped.
- `temperature: 0.4` for consistency — the same wallet yields the same archetype
  and traits across calls; the poem may vary slightly.
- `max_tokens` capped, one call only → fast.
- The grounded `stats` are computed from the signals in code, **not** trusted to
  the model, so numbers are always accurate.

### `payment.ts` — the x402 gate
- `buildPaymentRequirements()` produces the 402 body (`accepts`).
- `extractPaymentHeader()` reads the payment proof from common header variants.
- `verifyAndSettle()` calls the facilitator's `verify` then `settle`.
- Everything network/token/facilitator specific is env-driven; `X402_ENABLED`
  toggles the whole gate (false = free mode).

## The two routes

- **`app/api/mcp/route.ts`** — the paid agent door. Wraps `mcp-handler` with:
  1. an **Accept-header normalizer** (any Accept works; SSE unwrapped to JSON),
  2. the **x402 gate** applied only to `tools/call` for `generate_portrait`
     (discovery stays free).
- **`app/api/portrait/route.ts`** — the free web door. Same engine, no gate.

## Why stateless

Prior experience showed that offloading work to background workers introduces
cold-start latency that trips marketplace test-harness timeouts. VERSA's whole
pipeline (bounded fetches + one LLM call) fits comfortably in a single
serverless invocation, so it runs inline and returns in seconds. No database,
no queue, no worker.

## Extending

- **New chain:** add a collector branch in `wallet-data.ts` keyed on a `chain`
  arg; keep the same `WalletSignals` shape so the engine is unchanged.
- **New style:** styles are passed through to the prompt; add to the enum in
  both the MCP tool schema and the web UI.
- **Image export:** render the `PortraitResult` card server-side (e.g. satori /
  @vercel/og) and return a PNG for richer social sharing.
