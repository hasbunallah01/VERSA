/**
 * lib/wallet-data.ts — On-chain signal collection for VERSA.
 *
 * Gathers a compact, bounded set of signals about a wallet that the
 * creative engine turns into a portrait. Two sources:
 *
 *   1. Etherscan API (ETHERSCAN_API_KEY) — rich signals: wallet age,
 *      transaction history sample, token diversity. Free tier is fine.
 *   2. Public JSON-RPC fallback (no key) — balance + tx count only.
 *
 * Design constraints (learned the hard way on SONDA):
 *   - FAST: every call has a hard timeout; total budget ~4s.
 *   - BOUNDED: fixed number of requests regardless of wallet size.
 *   - NEVER throws for "empty" wallets — a new wallet is a valid
 *     subject ("The Unwritten") and must produce a portrait.
 */

const FETCH_TIMEOUT_MS = 4_000;

/** Compact signal bundle the creative engine consumes. */
export type WalletSignals = {
  address: string;
  /** Whether we got rich (etherscan) or basic (rpc) data. */
  depth: 'rich' | 'basic';
  balanceEth: number | null;
  txCount: number | null;
  /** Unix seconds of first observed tx (rich only). */
  firstTxAt: number | null;
  /** Unix seconds of most recent observed tx (rich only). */
  lastTxAt: number | null;
  /** Sampled counts by rough hour-of-day bucket (rich only). */
  activity: { night: number; day: number } | null;
  /** Distinct ERC-20 token symbols seen in recent transfers (rich only). */
  tokens: string[];
  /** Count of NFT transfers seen in sample (rich only). */
  nftTransfers: number;
  /** Ratio of outgoing txs in sample, 0..1 (rich only). */
  outgoingRatio: number | null;
};

const timedFetch = async (url: string): Promise<Response> => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
};

// Etherscan API V2 (V1 was deprecated 2025-08-15). V2 uses one base path
// for all chains, selected via `chainid` (1 = Ethereum mainnet).
// https://docs.etherscan.io/v2-migration
const ETHERSCAN_BASE = 'https://api.etherscan.io/v2/api';
const ETHERSCAN_CHAIN_ID = process.env.ETHERSCAN_CHAIN_ID ?? '1';

const etherscan = async <T>(params: Record<string, string>): Promise<T | null> => {
  const key = process.env.ETHERSCAN_API_KEY;
  if (!key) return null;
  const qs = new URLSearchParams({ chainid: ETHERSCAN_CHAIN_ID, ...params, apikey: key }).toString();
  try {
    const res = await timedFetch(`${ETHERSCAN_BASE}?${qs}`);
    if (!res.ok) return null;
    const body = (await res.json()) as { status: string; result: T };
    // status "0" with result "Max rate limit reached" etc → treat as miss.
    if (body.status !== '1') return null;
    return body.result;
  } catch {
    return null;
  }
};

type EtherscanTx = {
  timeStamp: string;
  from: string;
  to: string;
};

type EtherscanTokenTx = { tokenSymbol: string };

const RPC_ENDPOINTS = [
  process.env.ETH_RPC_URL,
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  'https://ethereum.publicnode.com',
].filter((u): u is string => Boolean(u));

/** Public RPC fallback — tries each configured endpoint in order. */
const rpc = async (method: string, params: unknown[]): Promise<string | null> => {
  for (const url of RPC_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) continue;
      const body = (await res.json()) as { result?: string; error?: unknown };
      if (body.result === undefined || body.error) continue;
      return body.result;
    } catch {
      // try the next endpoint
    }
  }
  return null;
};

/**
 * Collect signals for an address. Never throws; degrades gracefully.
 * Total wall-clock budget: ~4s (etherscan calls run in parallel).
 */
export const collectWalletSignals = async (address: string): Promise<WalletSignals> => {
  const addr = address.toLowerCase();

  // Rich path: three parallel Etherscan calls (tx sample, token transfers,
  // NFT transfers). One round-trip wall time.
  const [txs, tokenTxs, nftTxs] = await Promise.all([
    etherscan<EtherscanTx[]>({
      module: 'account',
      action: 'txlist',
      address: addr,
      startblock: '0',
      endblock: '99999999',
      page: '1',
      offset: '200',
      sort: 'asc',
    }),
    etherscan<EtherscanTokenTx[]>({
      module: 'account',
      action: 'tokentx',
      address: addr,
      page: '1',
      offset: '100',
      sort: 'desc',
    }),
    etherscan<unknown[]>({
      module: 'account',
      action: 'tokennfttx',
      address: addr,
      page: '1',
      offset: '50',
      sort: 'desc',
    }),
  ]);

  if (txs && txs.length > 0) {
    // Rich signals from the tx sample.
    const first = Number(txs[0].timeStamp);
    const last = Number(txs[txs.length - 1].timeStamp);
    let night = 0;
    let day = 0;
    let outgoing = 0;
    for (const tx of txs) {
      const hour = new Date(Number(tx.timeStamp) * 1000).getUTCHours();
      if (hour >= 22 || hour < 6) night += 1;
      else day += 1;
      if (tx.from?.toLowerCase() === addr) outgoing += 1;
    }
    const tokens = Array.from(
      new Set((tokenTxs ?? []).map((t) => t.tokenSymbol).filter(Boolean)),
    ).slice(0, 12);

    return {
      address: addr,
      depth: 'rich',
      balanceEth: null, // not needed for the portrait when rich data exists
      txCount: txs.length >= 200 ? 200 : txs.length,
      firstTxAt: first,
      lastTxAt: last,
      activity: { night, day },
      tokens,
      nftTransfers: (nftTxs ?? []).length,
      outgoingRatio: txs.length > 0 ? outgoing / txs.length : null,
    };
  }

  // Basic path: RPC balance + tx count. Works with no API key at all.
  const [balanceHex, countHex] = await Promise.all([
    rpc('eth_getBalance', [addr, 'latest']),
    rpc('eth_getTransactionCount', [addr, 'latest']),
  ]);

  return {
    address: addr,
    depth: 'basic',
    balanceEth: balanceHex ? Number(BigInt(balanceHex)) / 1e18 : null,
    txCount: countHex ? Number(BigInt(countHex)) : null,
    firstTxAt: null,
    lastTxAt: null,
    activity: null,
    tokens: [],
    nftTransfers: 0,
    outgoingRatio: null,
  };
};

/** Loose EVM address validation. */
export const isEvmAddress = (value: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(value.trim());
