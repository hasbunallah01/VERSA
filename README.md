<p align="center">
  <img src="public/versa-logo.png" alt="VERSA" width="120" />
</p>

<h1 align="center">VERSA</h1>
<p align="center"><b>An Autonomous On-Chain Portrait Artist</b></p>

<p align="center">
Give VERSA any EVM wallet address and it composes an original <i>soul portrait</i> from the wallet's real on-chain history: an archetype title, a character portrait, an 8–12 line poem, a named color palette, a ready-to-use art prompt, and trait tags.
</p>

---

## What it is

VERSA is a paid <b>A2MCP</b> Agent Service Provider on the <a href="https://okx.ai">OKX.AI</a> marketplace. Any agent can call it, pay per call via <b>x402</b>, and receive a complete portrait inline in a few seconds.

- **Input:** an EVM address (+ optional style: poetic / mystic / degen / noir)
- **Signals:** wallet age, activity rhythm (night-owl score), token diversity, NFT movement, giving/receiving balance
- **Output:** strict JSON — archetype, portrait, poem, palette, artPrompt, traits, grounded stats
- **Speed:** bounded fetches + one capped LLM call → returns inline in seconds
- **Empty wallets** are honored too: they receive "The Unwritten" portrait.

## MCP endpoint

```
POST /api/mcp        # JSON-RPC 2.0 (initialize / tools/list / tools/call)
```

Tolerant of any `Accept` header; returns plain JSON to non-SSE clients.

Tool: `generate_portrait(address, style?)`

## Payments (x402)

Discovery (`initialize`, `tools/list`) is free. Calling `generate_portrait` requires an x402 payment when `X402_ENABLED=true`: the first call returns HTTP 402 with the payment requirements; the paid retry is verified and settled via the configured facilitator, then the portrait is returned.

Price: **$0.05 per portrait** (USDT0 on X Layer).

## Environment

See `.env.example`. Required: `OPENAI_API_KEY`. Recommended: `ETHERSCAN_API_KEY`. Payment vars enable paid mode.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev                  # http://localhost:3000/api/mcp
```

---

<p align="center">Built for the OKX.AI Genesis Hackathon · Art Creation</p>
