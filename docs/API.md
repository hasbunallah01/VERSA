# VERSA API Reference

VERSA exposes two HTTP surfaces backed by the same engine.

| Endpoint | Audience | Auth | Format |
| --- | --- | --- | --- |
| `POST /api/mcp` | AI agents | x402 (paid) | MCP / JSON-RPC 2.0 |
| `POST /api/portrait` | the website | none (free) | plain JSON |

---

## `POST /api/mcp` — the agent endpoint (MCP)

A Model Context Protocol server (Streamable HTTP + JSON-RPC 2.0). It
implements `initialize`, `tools/list`, and `tools/call`. Any `Accept`
header is accepted; clients that do not request `text/event-stream`
receive a plain `application/json` response.

### Discover the tools

```bash
curl -X POST https://<domain>/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

### Tool: `generate_portrait`

**Arguments**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `address` | string | yes | EVM address: `0x` + 40 hex characters |
| `style` | enum | no | `poetic` \| `mystic` \| `degen` \| `noir` (default `poetic`) |

**Call**

```bash
curl -X POST https://<domain>/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0","id":2,"method":"tools/call",
    "params":{
      "name":"generate_portrait",
      "arguments":{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","style":"poetic"}
    }
  }'
```

The tool result `content[0].text` is a JSON string with this shape:

```json
{
  "ok": true,
  "address": "0xd8da...6045",
  "archetype": "The Patient Night Gardener",
  "portrait": "A 3-5 sentence character reading grounded in on-chain behavior.",
  "poem": "line one\nline two\n...",
  "palette": { "name": "Dusk Accumulation", "colors": ["#1a1a2e", "#e94560", "#16213e", "#0f3460", "#53354a"] },
  "artPrompt": "a vivid image-generation prompt of the portrait",
  "traits": ["night trader", "diamond hands", "nft romantic"],
  "stats": {
    "walletAgeDays": 3120,
    "txSampleCount": 200,
    "nightOwlScore": 41,
    "tokenDiversity": 12,
    "nftTransfers": 7
  }
}
```

### Payments (x402)

When `X402_ENABLED=true`, a `tools/call` for `generate_portrait` without a
payment header returns **HTTP 402** with the payment requirements:

```json
{
  "x402Version": 2,
  "resource": { "url": ".../api/mcp", "description": "VERSA — generate an on-chain soul portrait", "mimeType": "application/json" },
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:196",
    "asset": "<token contract>",
    "amount": "50000",
    "payTo": "<receiving wallet>",
    "maxTimeoutSeconds": 300,
    "extra": { "name": "USDT0", "version": "2" }
  }]
}
```

The caller pays and retries with a payment header (`X-PAYMENT` or
`PAYMENT-SIGNATURE`); VERSA verifies + settles via the facilitator and then
returns the portrait. Discovery (`initialize`, `tools/list`) is always free.

---

## `POST /api/portrait` — the free web endpoint

Used by the VERSA website. Same engine, no payment.

**Request**

```json
{ "address": "0x…", "style": "poetic" }
```

**Response** — identical portrait shape as above (`ok`, `archetype`, `portrait`,
`poem`, `palette`, `artPrompt`, `traits`, `stats`).

**Errors**

| Status | Meaning |
| --- | --- |
| `400` | Missing or malformed address |
| `502` | Creative engine failed (e.g. upstream error) |

---

## Error handling

All errors return a structured body — never a hang. Invalid addresses are
rejected fast; empty wallets still succeed with the **"The Unwritten"**
archetype.
