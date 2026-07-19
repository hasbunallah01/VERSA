# Contributing to VERSA

Thanks for your interest in VERSA. This is a focused project — an autonomous
on-chain portrait artist — and contributions that keep it fast, stateless, and
reliable are very welcome.

## Getting started

```bash
git clone https://github.com/hasbunallah01/VERSA.git
cd VERSA
npm install
cp .env.example .env.local   # add your keys
npm run dev
```

Required: `OPENAI_API_KEY`. Recommended: `ETHERSCAN_API_KEY`. Keep
`X402_ENABLED=false` locally.

## Before you open a PR

```bash
npm run typecheck   # must pass, zero errors
npm run build       # must succeed
```

## Principles to preserve

- **Stateless & fast.** No database, no background workers. Every request must
  return inline within the serverless window.
- **Graceful always.** Never throw to the caller. Invalid input → clean error;
  empty wallet → "The Unwritten"; upstream failure → structured reason.
- **One engine, two doors.** Shared logic lives in `lib/`; the free web route and
  the paid MCP route both call it. Don't fork the engine.
- **MCP stays tolerant.** The `/api/mcp` endpoint must accept any `Accept` header.

## Code style

- TypeScript, strict mode.
- Prettier (`.prettierrc`) — single quotes, trailing commas, 100 col.
- Small, focused modules with a short header comment explaining intent.

## Commit messages

Conventional style is appreciated: `feat:`, `fix:`, `perf:`, `docs:`, `chore:`.
