<p align="center">
  <img src="public/versa-logo.png" alt="VERSA" width="130" />
</p>

<h1 align="center">VERSA</h1>
<p align="center"><b>An Autonomous On-Chain Portrait Artist</b></p>
<p align="center"><i>Your wallet has a soul. VERSA paints it.</i></p>

<p align="center">
  <a href="#what-it-is">What</a> ·
  <a href="#how-it-works">How</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#the-mcp-service">MCP Service</a> ·
  <a href="#payments-x402">Payments</a> ·
  <a href="#local-development">Develop</a> ·
  <a href="#deployment">Deploy</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

---

## What it is

VERSA is an **Autonomous On-Chain Portrait Artist**. Give it any EVM wallet address and it reads the wallet's real on-chain history — age, activity rhythm, tokens touched, NFT movement, giving vs. receiving — and composes an original **soul portrait**:

- **Archetype** — a mythic title (e.g. _"The Patient Night Gardener"_)
- **Portrait** — an evocative 3–5 sentence character reading, grounded in real behavior
- **Poem** — an original 8–12 line free-verse poem
- **Palette** — a named 5-color palette (hex) matching the wallet's spirit
- **Art prompt** — a ready-to-use image-generation prompt of the portrait
- **Traits** — short trait tags (e.g. _night trader_, _diamond hands_, _nft romantic_)
- **Stats** — grounded numbers: wallet age, night-owl score, token diversity, NFT moves

Empty or brand-new wallets are honored too — they receive **"The Unwritten."**

VERSA has two doors to the same engine:

| Surface | Who | Price |
| --- | --- | --- |
| **Website** (`/`) | humans | **Free** — the demo & social surface |
| **MCP API** (`/api/mcp`) | AI agents on [OKX.AI](https://okx.ai) | **$0.05 / call** via x402 |

Built for the **OKX.AI Genesis Hackathon** — Art Creation category.

## How it works

```
wallet address ─▶ on-chain signals ─▶ creative engine ─▶ soul portrait
   (0x…)          (Etherscan/RPC)      (one LLM call)     (strict JSON)
```

1. **Read** the wallet's on-chain history (bounded, ~4s budget).
2. **Analyze** behavior into signals: age, night/day rhythm, token diversity, NFT movement, outgoing ratio.
3. **Compose** — a single, capped LLM call turns the signals into the portrait, as strict validated JSON.
4. **Return** the full portrait inline, in seconds.

## Architecture

```
versa/
├── app/
│   ├── page.tsx                 # Landing + live portrait (the website)
│   ├── layout.tsx               # Root layout, fonts, metadata
│   ├── globals.css              # VERSA design system (tokens, buttons)
│   ├── components/
│   │   ├── Logo.tsx             # Gradient-V mark + wordmark (inline SVG)
│   │   └── PortraitResult.tsx   # The shareable portrait card
│   └── api/
│       ├── mcp/route.ts         # PAID agent endpoint — MCP server (x402)
│       └── portrait/route.ts    # FREE web endpoint (same engine, no gate)
├── lib/
│   ├── wallet-data.ts           # On-chain signal collection (Etherscan + RPC)
│   ├── creative-engine.ts       # The LLM call → validated SoulPortrait
│   └── payment.ts               # x402 gate: 402 challenge + verify/settle
├── public/
│   └── versa-logo.png           # Brand mark / OKX avatar
└── docs/
    └── ARCHITECTURE.md          # Deeper design notes
```

**Design principles**

- **Stateless & fast.** No database, no background workers. Every call is bounded and returns inline within the serverless window — the single most important lesson carried from prior services.
- **Accept-header tolerant MCP.** The MCP endpoint accepts any `Accept` header and returns plain JSON to non-SSE clients, so real-world callers (including marketplace test harnesses) never get a `406`.
- **One engine, two doors.** The website and the agent API share the exact same `lib/` engine; only the payment gate differs.
- **Graceful always.** Invalid address → clean error. Empty wallet → "The Unwritten". LLM/timeout failure → structured reason, never a hang.

## The MCP Service

The agent-facing endpoint is a **Model Context Protocol** server (Streamable HTTP + JSON-RPC 2.0) at:

```
POST /api/mcp
```

It implements the full MCP lifecycle (`initialize`, `tools/list`, `tools/call`) via [`mcp-handler`](https://www.npmjs.com/package/mcp-handler).

### Tool: `generate_portrait`

| Arg | Type | Notes |
| --- | --- | --- |
| `address` | string | EVM address (`0x` + 40 hex) — required |
| `style` | enum | `poetic` \| `mystic` \| `degen` \| `noir` — optional |

Returns the full portrait as JSON: `archetype`, `portrait`, `poem`, `palette`, `artPrompt`, `traits`, `stats`.

Test discovery with a plain request (no special headers needed):

```bash
curl -X POST https://<your-domain>/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## Payments (x402)

Discovery (`initialize`, `tools/list`) is always free so the marketplace can inspect the service. Calling `generate_portrait` is gated by **x402** when `X402_ENABLED=true`:

1. Unpaid call → **HTTP 402** with the payment requirements (`accepts`: network, token, amount, `payTo`, `maxTimeoutSeconds`).
2. The caller signs a payment and retries with the payment header.
3. VERSA **verifies + settles** via the configured facilitator, then runs the portrait and returns it.

Price: **$0.05** per portrait (USDT0 on X Layer). All network/token/facilitator values are environment-driven — see `.env.example`.

## Local development

```bash
npm install
cp .env.example .env.local     # fill in keys
npm run dev                    # http://localhost:3000
```

Required: `OPENAI_API_KEY`. Recommended: `ETHERSCAN_API_KEY` (richer portraits; falls back to public RPC without it). Keep `X402_ENABLED=false` locally to test portraits for free.

## Deployment

VERSA deploys as a standard Next.js app (Vercel recommended).

1. Import the repo into Vercel.
2. Add environment variables (see `.env.example`) — at minimum `OPENAI_API_KEY` and `ETHERSCAN_API_KEY`.
3. Deploy. The website is at `/`; the agent API at `/api/mcp`.
4. To enable paid mode, set the `X402_*` variables and `X402_ENABLED=true`, then redeploy.

## Environment

See [`.env.example`](.env.example) for the full list. Summary:

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | ✅ | Creative engine |
| `ETHERSCAN_API_KEY` | ▲ recommended | Rich wallet signals |
| `ETH_RPC_URL` | optional | RPC fallback override |
| `X402_ENABLED` | — | `true` to require payment on the MCP tool |
| `X402_PAY_TO` | for paid | Receiving wallet |
| `X402_AMOUNT` | for paid | Price, 6-dp units (`50000` = $0.05) |
| `X402_NETWORK` / `X402_ASSET` | for paid | Chain + token |
| `X402_FACILITATOR_BASE` | for paid | Verify/settle facilitator |

## Roadmap

- [x] MCP server + `generate_portrait` tool
- [x] On-chain signal collection (Etherscan + RPC fallback)
- [x] Creative engine with strict, validated output
- [x] Free website + shareable portrait card
- [x] x402 payment gate (env-driven)
- [ ] Rendered portrait **image** export (shareable card as PNG)
- [ ] Multi-chain wallets (X Layer, Base, Solana)
- [ ] ENS / domain name resolution as input
- [ ] Portrait gallery + permalink per wallet
- [ ] Style packs beyond the initial four

## License

MIT © 2026 VERSA. Built for the OKX.AI Genesis Hackathon.
