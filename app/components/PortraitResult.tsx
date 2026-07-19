'use client';

import { useRef, useState } from 'react';

export type Portrait = {
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

const short = (a: string) => (a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

/** VERSA's X handle, tagged in shares. Update if the brand gets its own account. */
const VERSA_HANDLE = 'HayBeeservices';

const buildShareText = (p: Portrait & { address: string }): string => {
  const topTraits = p.traits.slice(0, 2).join(' · ');
  return [
    `My wallet's soul portrait: "${p.archetype}"`,
    topTraits ? `(${topTraits})` : null,
    `— palette "${p.palette.name}" 🎨`,
    `Painted by @${VERSA_HANDLE}'s VERSA. What's yours?`,
    '#VERSA #OKXAI',
  ]
    .filter(Boolean)
    .join(' ');
};

export function PortraitResult({
  loading,
  error,
  portrait,
  onReset,
}: {
  loading: boolean;
  error: string | null;
  portrait: (Portrait & { address: string }) | null;
  onReset: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#fbfcff',
        cacheBust: true,
      });
      const link = document.createElement('a');
      const slug = portrait ? portrait.archetype.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'portrait';
      link.download = `versa-${slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // Downloading is a nice-to-have; fail quietly rather than
      // interrupting a person who just wants to share on X instead.
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="result">
      {loading && (
        <div className="composing">
          <div className="orb" />
          <p className="composing-title">Reading the chain…</p>
          <p className="composing-sub">VERSA is composing this wallet&rsquo;s soul portrait.</p>
        </div>
      )}

      {!loading && error && (
        <div className="err">
          <strong>Couldn&rsquo;t compose this portrait</strong>
          <p>{error}</p>
        </div>
      )}

      {!loading && portrait && (
        <article className="card" ref={cardRef}>
          <header className="card-head">
            <span className="card-eyebrow">SOUL PORTRAIT</span>
            <span className="card-addr">{short(portrait.address)}</span>
          </header>

          <h2 className="archetype gradient-text">{portrait.archetype}</h2>

          <p className="portrait-text">{portrait.portrait}</p>

          <div className="poem">
            {portrait.poem.split('\n').map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </div>

          <div className="palette">
            <div className="palette-name">{portrait.palette.name}</div>
            <div className="swatches">
              {portrait.palette.colors.map((c) => (
                <div className="swatch" key={c} style={{ background: c }} title={c}>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="traits">
            {portrait.traits.map((t) => (
              <span className="trait" key={t}>
                {t}
              </span>
            ))}
          </div>

          <div className="stats">
            <Stat label="Wallet age" value={portrait.stats.walletAgeDays != null ? `${portrait.stats.walletAgeDays}d` : '—'} />
            <Stat label="Night owl" value={portrait.stats.nightOwlScore != null ? `${portrait.stats.nightOwlScore}%` : '—'} />
            <Stat label="Tokens" value={String(portrait.stats.tokenDiversity)} />
            <Stat label="NFT moves" value={String(portrait.stats.nftTransfers)} />
          </div>

          <details className="art-prompt">
            <summary>Art prompt</summary>
            <p>{portrait.artPrompt}</p>
          </details>

          <div className="card-brand">
            <span className="brand-v">V</span> Made with VERSA · versa-bice.vercel.app
          </div>

          <div className="card-actions">
            <a
              className="btn btn-primary"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText(portrait))}`}
              target="_blank"
              rel="noreferrer"
            >
              Share on X
            </a>
            <button className="btn btn-ghost" onClick={download} disabled={downloading}>
              {downloading ? 'Preparing…' : 'Download image'}
            </button>
            <button className="btn btn-ghost" onClick={onReset}>
              Portrait another wallet
            </button>
          </div>
        </article>
      )}

      <style jsx>{`
        .result {
          margin: 8px 0 24px;
          scroll-margin-top: 90px;
        }
        .composing {
          text-align: center;
          padding: 50px 0;
        }
        .orb {
          width: 68px;
          height: 68px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #8b5cff, #4e7bff, #22d3ee, #8b5cff);
          filter: blur(1px);
          animation: spin 1.1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .composing-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }
        .composing-sub {
          color: var(--ink-muted);
          margin: 6px 0 0;
        }
        .err {
          border: 1px solid #ffd9d9;
          background: #fff5f5;
          border-radius: var(--radius);
          padding: 22px 24px;
          color: #b42323;
        }
        .err strong {
          display: block;
          margin-bottom: 4px;
        }
        .err p {
          margin: 0;
          color: #8a4b4b;
        }

        .card {
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          background: linear-gradient(180deg, #ffffff, #fbfcff);
          box-shadow: var(--shadow-md);
          padding: 34px 36px;
          max-width: 760px;
          margin: 0 auto;
        }
        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .card-eyebrow {
          font-size: 12px;
          letter-spacing: 0.14em;
          font-weight: 700;
          color: var(--ink-muted);
        }
        .card-addr {
          font-family: ui-monospace, monospace;
          font-size: 13px;
          color: var(--ink-soft);
          background: var(--bg-soft);
          padding: 5px 10px;
          border-radius: 8px;
        }
        .archetype {
          font-size: 40px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 4px 0 18px;
          line-height: 1.1;
        }
        .portrait-text {
          font-size: 17px;
          line-height: 1.7;
          color: var(--ink);
          margin: 0 0 24px;
        }
        .poem {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 22px 24px;
          background: var(--bg-soft);
          border-radius: var(--radius);
          border-left: 3px solid var(--blue);
          font-size: 16px;
          line-height: 1.65;
          color: var(--ink-soft);
          font-style: italic;
          margin-bottom: 24px;
        }
        .palette {
          margin-bottom: 22px;
        }
        .palette-name {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .swatches {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .swatch {
          flex: 1 1 0;
          min-width: 70px;
          height: 58px;
          border-radius: 10px;
          position: relative;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 5px;
        }
        .swatch span {
          font-size: 10px;
          font-family: ui-monospace, monospace;
          color: rgba(255, 255, 255, 0.92);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }
        .traits {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }
        .trait {
          font-size: 13px;
          font-weight: 600;
          color: var(--blue);
          background: #eef1ff;
          border: 1px solid #e0e6ff;
          padding: 6px 12px;
          border-radius: 999px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .art-prompt {
          border-top: 1px solid var(--line-soft);
          padding-top: 16px;
          margin-bottom: 8px;
        }
        .art-prompt summary {
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          color: var(--ink-soft);
        }
        .art-prompt p {
          margin: 10px 0 0;
          font-size: 14px;
          color: var(--ink-muted);
          line-height: 1.6;
          font-family: ui-monospace, monospace;
        }
        .card-brand {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-muted);
          letter-spacing: 0.02em;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px dashed var(--line);
        }
        .brand-v {
          display: inline-grid;
          place-items: center;
          width: 18px;
          height: 18px;
          border-radius: 5px;
          background: var(--grad-btn);
          color: #fff;
          font-size: 11px;
          font-weight: 800;
        }
        .card-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 22px;
        }
        .btn-ghost {
          background: #fff;
          border: 1px solid var(--line);
          color: var(--ink-soft);
          padding: 12px 20px;
        }
        .btn-ghost:hover {
          border-color: var(--ink-muted);
        }
        @media (max-width: 640px) {
          .card {
            padding: 24px 20px;
          }
          .archetype {
            font-size: 30px;
          }
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .card-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="stat-v">{value}</div>
      <div className="stat-l">{label}</div>
      <style jsx>{`
        .stat {
          background: var(--bg-soft);
          border: 1px solid var(--line-soft);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }
        .stat-v {
          font-size: 20px;
          font-weight: 800;
        }
        .stat-l {
          font-size: 12px;
          color: var(--ink-muted);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
