/**
 * lib/creative-engine.ts — The heart of VERSA.
 *
 * One bounded OpenAI call that turns wallet signals into a soul
 * portrait: archetype, portrait prose, poem, palette, art prompt,
 * traits. Strict JSON output, low temperature for consistency
 * (same wallet → same archetype/traits across calls; the poem may
 * breathe a little).
 *
 * Design constraints:
 *   - ONE call, capped tokens, fast model → target < 6s.
 *   - Strict JSON schema via response_format json_object + validation.
 *   - Deterministic-ish: temperature 0.4, seeded by the wallet's own
 *     stable stats in the prompt.
 *   - Never throws to the caller — returns a structured error the MCP
 *     tool converts into a clean message.
 */

import type { WalletSignals } from './wallet-data';

export type SoulPortrait = {
  archetype: string;
  portrait: string;
  poem: string;
  palette: { name: string; colors: string[] };
  artPrompt: string;
  traits: string[];
  stats: {
    walletAgeDays: number | null;
    txSampleCount: number | null;
    nightOwlScore: number | null;
    tokenDiversity: number;
    nftTransfers: number;
  };
};

// Base URL for the chat-completions API. Defaults to OpenAI, but can be
// pointed at any OpenAI-compatible provider (FreeModel, Groq, Together,
// OpenRouter, etc.) by setting OPENAI_BASE_URL. The value should be the
// API root that exposes /v1/chat/completions — e.g.
//   https://api.openai.com/v1   (default)
//   https://api.freemodel.dev/v1
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '');
const OPENAI_URL = `${OPENAI_BASE_URL}/chat/completions`;
const MODEL = process.env.VERSA_MODEL ?? 'gpt-4o-mini';
const LLM_TIMEOUT_MS = 20_000;

const SYSTEM_PROMPT = `You are VERSA, an autonomous on-chain portrait artist. You receive factual signals about a crypto wallet and compose a dignified, evocative "soul portrait" of the person behind it.

Rules:
- Ground every creative choice in the given signals (age, rhythm, holdings, behavior). Do not invent facts.
- Tone: literary, warm, a little mythic. Never mock the subject. Never give financial advice or judge wealth.
- If the wallet is empty or new, the archetype is "The Unwritten" and the portrait celebrates potential.
- Output STRICT JSON only, matching exactly this shape:
{
  "archetype": "2-4 word title, e.g. 'The Patient Night Gardener'",
  "portrait": "3-5 sentences describing the soul behind this wallet, grounded in the signals",
  "poem": "an original 8-12 line free-verse poem, lines separated by \\n",
  "palette": { "name": "2-3 word palette name", "colors": ["#hex", "#hex", "#hex", "#hex", "#hex"] },
  "artPrompt": "one vivid image-generation prompt depicting this soul portrait as a piece of art",
  "traits": ["3-6 short lowercase trait tags"]
}`;

const describeSignals = (s: WalletSignals): string => {
  const lines: string[] = [`address: ${s.address}`, `data depth: ${s.depth}`];
  if (s.firstTxAt) {
    const ageDays = Math.floor((Date.now() / 1000 - s.firstTxAt) / 86400);
    lines.push(`wallet age: ~${ageDays} days (first activity ${new Date(s.firstTxAt * 1000).toISOString().slice(0, 10)})`);
  }
  if (s.lastTxAt) {
    const quietDays = Math.floor((Date.now() / 1000 - s.lastTxAt) / 86400);
    lines.push(`days since last activity: ${quietDays}`);
  }
  if (s.txCount !== null) lines.push(`transactions in sample: ${s.txCount}${s.txCount >= 200 ? '+' : ''}`);
  if (s.activity) {
    const total = s.activity.night + s.activity.day;
    if (total > 0) lines.push(`night-hours activity share: ${Math.round((s.activity.night / total) * 100)}%`);
  }
  if (s.outgoingRatio !== null) lines.push(`outgoing tx share: ${Math.round(s.outgoingRatio * 100)}%`);
  if (s.tokens.length > 0) lines.push(`tokens touched recently: ${s.tokens.join(', ')}`);
  lines.push(`nft transfers in sample: ${s.nftTransfers}`);
  if (s.balanceEth !== null) lines.push(`eth balance: ${s.balanceEth.toFixed(4)}`);
  if (s.txCount === 0) lines.push('NOTE: wallet appears empty/new — use "The Unwritten" archetype.');
  else if (s.txCount === null) lines.push('NOTE: transaction count unavailable; do not assume the wallet is empty — describe it as guarded/private rather than unwritten.');
  return lines.join('\n');
};

const isHex = (c: unknown): c is string => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c);

const validatePortrait = (raw: unknown): SoulPortrait | null => {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const pal = r.palette as Record<string, unknown> | undefined;
  if (
    typeof r.archetype !== 'string' ||
    typeof r.portrait !== 'string' ||
    typeof r.poem !== 'string' ||
    typeof r.artPrompt !== 'string' ||
    !Array.isArray(r.traits) ||
    !pal ||
    typeof pal.name !== 'string' ||
    !Array.isArray(pal.colors) ||
    !(pal.colors as unknown[]).every(isHex)
  ) {
    return null;
  }
  return {
    archetype: r.archetype,
    portrait: r.portrait,
    poem: r.poem,
    artPrompt: r.artPrompt,
    traits: (r.traits as unknown[]).filter((t): t is string => typeof t === 'string').slice(0, 6),
    palette: { name: pal.name, colors: (pal.colors as string[]).slice(0, 5) },
    stats: { walletAgeDays: null, txSampleCount: null, nightOwlScore: null, tokenDiversity: 0, nftTransfers: 0 },
  };
};

export const generatePortrait = async (
  signals: WalletSignals,
): Promise<{ ok: true; portrait: SoulPortrait } | { ok: false; reason: string }> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { ok: false, reason: 'Creative engine is not configured (missing API key).' };

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
  try {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 700,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Compose the soul portrait for these signals:\n\n${describeSignals(signals)}` },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, reason: `Creative engine error (${res.status}). ${text.slice(0, 120)}` };
    }
    const body = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = body.choices?.[0]?.message?.content ?? '';
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { ok: false, reason: 'Creative engine returned malformed output.' };
    }
    const portrait = validatePortrait(parsed);
    if (!portrait) return { ok: false, reason: 'Creative engine output failed validation.' };

    // Attach grounded stats computed from the signals (not the LLM).
    const ageDays = signals.firstTxAt
      ? Math.floor((Date.now() / 1000 - signals.firstTxAt) / 86400)
      : null;
    const nightShare =
      signals.activity && signals.activity.night + signals.activity.day > 0
        ? Math.round((signals.activity.night / (signals.activity.night + signals.activity.day)) * 100)
        : null;
    portrait.stats = {
      walletAgeDays: ageDays,
      txSampleCount: signals.txCount,
      nightOwlScore: nightShare,
      tokenDiversity: signals.tokens.length,
      nftTransfers: signals.nftTransfers,
    };
    return { ok: true, portrait };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error && error.name === 'AbortError'
        ? 'Creative engine timed out.'
        : 'Creative engine request failed.',
    };
  } finally {
    clearTimeout(t);
  }
};
