# Changelog

All notable changes to VERSA are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] — 2026-07

Initial release for the **OKX.AI Genesis Hackathon** (Art Creation).

### Added
- MCP server at `/api/mcp` (Streamable HTTP + JSON-RPC 2.0) with the
  `generate_portrait` tool, tolerant of any `Accept` header.
- On-chain signal collection (`lib/wallet-data.ts`) — Etherscan with a public
  RPC fallback, bounded and fast.
- Creative engine (`lib/creative-engine.ts`) — a single, capped LLM call
  producing a strictly validated soul portrait (archetype, portrait, poem,
  palette, art prompt, traits, grounded stats).
- x402 payment gate (`lib/payment.ts`) — env-driven 402 challenge plus
  facilitator verify/settle.
- Free web endpoint (`/api/portrait`) and the full VERSA website (hero, live
  portrait card, how-it-works, hackathon banner, footer) — desktop + mobile.
- Documentation: README, `docs/ARCHITECTURE.md`, `docs/API.md`.
- Project meta: MIT license, CI workflow, editorconfig, prettier config,
  contributing and security guides.

### Notes
- "The Unwritten" portrait is returned for empty or brand-new wallets.
