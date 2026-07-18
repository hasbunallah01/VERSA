'use client';

import { useState } from 'react';

import { Logo, Wordmark } from './components/Logo';
import { PortraitResult } from './components/PortraitResult';
import type { Portrait } from './components/PortraitResult';

const STYLES = ['Poetic', 'Mystic', 'Degen', 'Noir'] as const;

const STEPS = [
  { n: 1, title: 'We read your\non-chain history', icon: 'doc' },
  { n: 2, title: 'We analyze behavior,\npatterns & traits', icon: 'chart' },
  { n: 3, title: 'We compose your\nsoul portrait', icon: 'palette' },
  { n: 4, title: 'You get art, poetry\n& real stats', icon: 'image' },
] as const;

export default function Home() {
  const [address, setAddress] = useState('');
  const [style, setStyle] = useState<(typeof STYLES)[number]>('Poetic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portrait, setPortrait] = useState<(Portrait & { address: string }) | null>(null);

  const isValid = /^0x[a-fA-F0-9]{40}$/.test(address.trim());

  const reveal = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);
    setPortrait(null);
    try {
      const res = await fetch('/api/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim(), style: style.toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        setError(data.error || 'Something went wrong composing this portrait. Try again.');
      } else {
        setPortrait(data);
      }
    } catch {
      setError('Could not reach the studio. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteNav />

      <main className="container main">
        {/* HERO */}
        <section className="hero" id="top">
          <div className="hero-copy">
            <span className="eyebrow">
              <SparkIcon /> AN AUTONOMOUS ON-CHAIN PORTRAIT ARTIST
            </span>
            <h1>
              Your wallet
              <br />
              has a soul.
              <br />
              <span className="gradient-text">VERSA paints it.</span>
            </h1>
            <p className="lede">
              Give VERSA any wallet address, and it composes an original soul portrait from the
              wallet&rsquo;s real on-chain history.
            </p>

            <div className="controls">
              <div className="field">
                <WalletIcon />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && reveal()}
                  placeholder="Paste any wallet address (0x...)"
                  spellCheck={false}
                  aria-label="Wallet address"
                />
              </div>
              <div className="style-select">
                <span className="style-label">Style</span>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as (typeof STYLES)[number])}
                  aria-label="Portrait style"
                >
                  {STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <CaretIcon />
              </div>
              <button
                className="btn btn-primary reveal"
                onClick={reveal}
                disabled={!isValid || loading}
              >
                {loading ? 'Composing…' : 'Reveal my portrait'} <SparkIcon light />
              </button>
            </div>

            <div className="trust">
              <span>
                <GlobeIcon /> Free on web
              </span>
              <span className="dot">·</span>
              <span>
                <NodesIcon /> Live as a paid agent service on OKX.AI
              </span>
            </div>
          </div>

          <div className="hero-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/versa-logo.png"
              alt="VERSA — on-chain soul portrait"
              className="hero-art-img"
              width={520}
              height={520}
              draggable={false}
            />
          </div>
        </section>

        {(loading || error || portrait) && (
          <PortraitResult
            loading={loading}
            error={error}
            portrait={portrait}
            onReset={() => setPortrait(null)}
          />
        )}

        {/* HOW IT WORKS */}
        <section className="how" id="how">
          <h2>How it works</h2>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div className="step-wrap" key={s.n}>
                <div className="step">
                  <div className="step-n">{s.n}</div>
                  <StepIcon name={s.icon} />
                  <p>
                    {s.title.split('\n').map((line, j) => (
                      <span key={j}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
                {i < STEPS.length - 1 && <span className="step-arrow">›</span>}
              </div>
            ))}
          </div>
        </section>

        {/* OKX.AI BANNER */}
        <section className="banner" id="about">
          <div className="banner-left">
            <BoltIcon />
            <div className="banner-left-text">
              <strong>Built for the</strong>
              <strong>OKX.AI Genesis Hackathon</strong>
              <a href="#" className="banner-cat">
                Art Creation Category
              </a>
            </div>
          </div>
          <div className="banner-mid">
            Live on OKX.AI as an
            <br />
            Autonomous Agent Service (A2MCP)
          </div>
          <div className="price-chip">
            <div className="price">$0.05</div>
            <div className="per">per portrait call</div>
          </div>
          <div className="okx-mark">
            <OkxMark />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-top">
            <div className="footer-brand">
              <Wordmark size={20} />
              <p>
                An Autonomous On-Chain Portrait Artist.
                <br />
                Your wallet. Your story. Your portrait.
              </p>
              <div className="footer-social">
                <a href="#" aria-label="X">
                  <XIcon />
                </a>
                <a href="#" aria-label="Website">
                  <GlobeIcon />
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Product</h4>
              <a href="#how">How it works</a>
              <a href="#examples">Examples</a>
              <a href="#api">API (Paid)</a>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>

            <div className="footer-col footer-connect">
              <h4>Connect</h4>
              <a href="#" className="footer-pill">
                Follow us on X <XIcon />
              </a>
              <a href="#" className="footer-pill">
                OKX.AI Listing <ExtIcon />
              </a>
            </div>

            <div className="footer-illo" aria-hidden="true">
              <DiamondSparkle />
            </div>
          </div>
          <div className="footer-legal">© 2026 VERSA. All rights reserved.</div>
        </footer>
      </main>

      {/* MOBILE BOTTOM NAV (with circular V centerpiece) */}
      <nav className="mobile-tab" aria-label="Primary">
        <a href="#how"><DocIcon /><span>How it works</span></a>
        <a href="#examples"><PicIcon /><span>Examples</span></a>
        <a href="#top" className="tab-v" aria-label="Top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/versa-logo.png"
            alt="VERSA"
            width={56}
            height={56}
            draggable={false}
            className="tab-v-img"
          />
        </a>
        <a href="#about"><InfoIcon /><span>About</span></a>
        <a href="#api"><ApiIcon /><span>API (Paid)</span></a>
      </nav>

      <style jsx>{styles}</style>
    </>
  );
}

/* ----------------------------- NAV ----------------------------- */

function SiteNav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Wordmark size={20} />
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#examples">Examples</a>
          <a href="#about">About</a>
          <a href="#api">API (Paid)</a>
        </div>
        <a href="#top" className="btn btn-primary nav-cta">
          Get your portrait
        </a>
      </div>
    </nav>
  );
}

/* ----------------------------- ICONS ----------------------------- */

function SparkIcon({ light }: { light?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z"
        fill={light ? '#fff' : 'url(#sg)'}
      />
      <defs>
        <linearGradient id="sg" x1="5" y1="3" x2="19" y2="17">
          <stop stopColor="#8B5CFF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b93ad" strokeWidth="1.7" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M16 12h3" strokeLinecap="round" />
    </svg>
  );
}
function CaretIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b93ad" strokeWidth="2" aria-hidden="true">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" />
    </svg>
  );
}
function NodesIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8 11l8-4M8 13l8 4" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="url(#bg)" aria-hidden="true">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
      <defs>
        <linearGradient id="bg" x1="4" y1="2" x2="18" y2="22">
          <stop stopColor="#8B5CFF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5-6.6L5.5 22H2.4l7.8-8.9L2 2h6.9l4.5 6L18.9 2zm-2.4 18h1.7L7.6 3.8H5.8L16.5 20z" />
    </svg>
  );
}
function ExtIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
    </svg>
  );
}
function OkxMark() {
  return (
    <svg width="120" height="34" viewBox="0 0 160 34" fill="#0d1220" aria-hidden="true">
      <rect x="0" y="0" width="11" height="11" />
      <rect x="13" y="0" width="11" height="11" />
      <rect x="26" y="0" width="11" height="11" />
      <rect x="13" y="13" width="11" height="11" />
      <rect x="0" y="26" width="11" height="11" />
      <rect x="26" y="26" width="11" height="11" />
      <text x="46" y="26" fontSize="24" fontWeight="800" fontFamily="Inter, sans-serif">
        .AI
      </text>
    </svg>
  );
}
function DocIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 3h9l4 4v14H6a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M15 3v4h4" />
    </svg>
  );
}
function PicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M5 17l4-4 3 3 3-4 4 5" strokeLinecap="round" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 8v.5" strokeLinecap="round" />
    </svg>
  );
}
function ApiIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 5l-4 14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StepIcon({ name }: { name: string }) {
  const common = {
    width: 30,
    height: 30,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'url(#stpg)',
    strokeWidth: 1.7,
  } as const;
  const grad = (
    <defs>
      <linearGradient id="stpg" x1="0" y1="0" x2="24" y2="24">
        <stop stopColor="#8B5CFF" />
        <stop offset="1" stopColor="#22D3EE" />
      </linearGradient>
    </defs>
  );
  if (name === 'doc')
    return (
      <svg {...common}>
        {grad}
        <path d="M6 3h9l4 4v14H6a1 1 0 01-1-1V4a1 1 0 011-1z" />
        <circle cx="11" cy="13" r="3" />
        <path d="M13.5 15.5L16 18" strokeLinecap="round" />
      </svg>
    );
  if (name === 'chart')
    return (
      <svg {...common}>
        {grad}
        <path d="M4 20V10M9 20V6M14 20v-8M19 20V4" strokeLinecap="round" />
      </svg>
    );
  if (name === 'palette')
    return (
      <svg {...common}>
        {grad}
        <path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2.5-1.5H18a3 3 0 003-3c0-4.5-4-9-9-9z" />
      </svg>
    );
  return (
    <svg {...common}>
      {grad}
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M5 17l4-4 3 3 3-4 4 5" />
    </svg>
  );
}
function DiamondSparkle() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <g stroke="url(#dg)" strokeWidth="1.4" fill="none" opacity="0.7">
        <path d="M60 12 L92 60 L60 108 L28 60 Z" />
        <path d="M60 12 L60 108 M28 60 L92 60 M38 30 L82 90 M82 30 L38 90" />
      </g>
      <g fill="url(#ds)" opacity="0.9">
        <path d="M16 18 l1.4 4.2 l4.2 1.4 l-4.2 1.4 l-1.4 4.2 l-1.4 -4.2 l-4.2 -1.4 l4.2 -1.4 z" />
        <path d="M100 24 l1.2 3.6 l3.6 1.2 l-3.6 1.2 l-1.2 3.6 l-1.2 -3.6 l-3.6 -1.2 l3.6 -1.2 z" />
        <path d="M104 96 l1.2 3.6 l3.6 1.2 l-3.6 1.2 l-1.2 3.6 l-1.2 -3.6 l-3.6 -1.2 l3.6 -1.2 z" />
      </g>
      <defs>
        <linearGradient id="dg" x1="28" y1="12" x2="92" y2="108">
          <stop stopColor="#8B5CFF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="ds" x1="0" y1="0" x2="120" y2="120">
          <stop stopColor="#8B5CFF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ----------------------------- STYLES ----------------------------- */

const styles = `
  .main { padding-bottom: 40px; }

  /* NAV */
  .nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: saturate(180%) blur(12px);
    border-bottom: 1px solid var(--line-soft);
  }
  .nav-inner {
    height: 76px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .nav-links {
    display: flex;
    gap: 36px;
    font-size: 15px;
    font-weight: 500;
    color: var(--ink-soft);
  }
  .nav-links a:hover { color: var(--ink); }
  .nav-cta { font-size: 14px; padding: 11px 20px; }

  /* HERO */
  .hero {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    align-items: center;
    gap: 20px;
    padding: 64px 0 36px;
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--blue);
    background: #eef1ff;
    border: 1px solid #e0e6ff;
    padding: 8px 14px;
    border-radius: 999px;
  }
  h1 {
    font-size: 64px;
    line-height: 1.04;
    letter-spacing: -0.025em;
    font-weight: 800;
    margin: 22px 0 0;
  }
  .lede {
    color: var(--ink-soft);
    font-size: 17px;
    line-height: 1.6;
    max-width: 460px;
    margin: 22px 0 30px;
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: stretch;
  }
  .field {
    flex: 1 1 280px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 0 16px;
    box-shadow: var(--shadow-sm);
    min-height: 58px;
  }
  .field input {
    border: none;
    outline: none;
    width: 100%;
    height: 56px;
    font-size: 15px;
    font-family: inherit;
    background: transparent;
    color: var(--ink);
  }
  .style-select {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 0 16px;
    box-shadow: var(--shadow-sm);
    min-height: 58px;
  }
  .style-label {
    color: var(--ink-muted);
    font-size: 14px;
  }
  .style-select select {
    border: none;
    outline: none;
    background: transparent;
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    height: 56px;
    color: var(--ink);
    cursor: pointer;
    appearance: none;
    padding-right: 4px;
  }
  .reveal {
    height: 58px;
    padding: 0 26px;
    white-space: nowrap;
    font-size: 15px;
  }
  .trust {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 20px;
    color: var(--ink-muted);
    font-size: 14px;
  }
  .trust span { display: inline-flex; align-items: center; gap: 7px; }
  .trust .dot { color: var(--line); }

  .hero-art {
    position: relative;
    height: 480px;
    display: grid;
    place-items: center;
  }
  .hero-art-img {
    width: 480px;
    height: 480px;
    max-width: 100%;
    object-fit: contain;
    filter: drop-shadow(0 30px 50px rgba(78, 100, 255, 0.18));
  }

  /* HOW */
  .how {
    padding: 36px 0 10px;
    text-align: center;
  }
  .how h2 {
    font-size: 30px;
    font-weight: 800;
    margin: 0 0 30px;
  }
  .steps {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 6px;
  }
  .step-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
  }
  .step {
    flex: 1;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 28px 18px;
    text-align: center;
    box-shadow: var(--shadow-sm);
    position: relative;
    min-height: 156px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  .step-n {
    position: absolute;
    top: 14px;
    left: 14px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--grad-btn);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    display: grid;
    place-items: center;
  }
  .step p {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.4;
    margin: 0;
  }
  .step-arrow {
    color: var(--ink-muted);
    font-size: 22px;
    flex: 0 0 auto;
  }

  /* BANNER */
  .banner {
    display: grid;
    grid-template-columns: 1.3fr 1.3fr auto auto;
    align-items: center;
    gap: 28px;
    background: linear-gradient(180deg, #f7f9ff, #eef2ff);
    border: 1px solid #e3e9ff;
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    margin: 38px 0 14px;
  }
  .banner-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .banner-left-text { display: flex; flex-direction: column; gap: 2px; }
  .banner-left strong { display: block; font-size: 17px; line-height: 1.25; }
  .banner-cat {
    color: var(--blue);
    font-size: 14px;
    font-weight: 600;
    margin-top: 4px;
  }
  .banner-mid {
    color: var(--ink-soft);
    font-size: 14px;
    line-height: 1.5;
  }
  .price-chip {
    text-align: center;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 14px 22px;
  }
  .price { font-size: 26px; font-weight: 800; }
  .per { font-size: 12px; color: var(--ink-muted); }
  .okx-mark { display: flex; align-items: center; }

  /* FOOTER */
  .footer {
    border-top: 1px solid var(--line-soft);
    margin-top: 50px;
    padding: 50px 0 30px;
    background: var(--bg-soft);
  }
  .footer-top {
    display: grid;
    grid-template-columns: 1.6fr 0.8fr 0.8fr 1.1fr 0.6fr;
    gap: 30px;
    align-items: start;
  }
  .footer-brand p {
    color: var(--ink-muted);
    font-size: 14px;
    line-height: 1.6;
    margin: 14px 0;
  }
  .footer-social { display: flex; gap: 10px; }
  .footer-social a {
    width: 36px;
    height: 36px;
    border: 1px solid var(--line);
    border-radius: 9px;
    display: grid;
    place-items: center;
    color: var(--ink-soft);
    background: #fff;
  }
  .footer-col h4 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ink-muted);
    margin: 0 0 16px;
    font-weight: 700;
  }
  .footer-col a {
    display: block;
    font-size: 14px;
    color: var(--ink-soft);
    margin-bottom: 10px;
  }
  .footer-col a:hover { color: var(--ink); }
  .footer-pill {
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 10px 14px;
    display: inline-flex !important;
    align-items: center;
    gap: 8px;
    background: #fff;
    margin-bottom: 10px;
  }
  .footer-illo { display: flex; justify-content: flex-end; }
  .footer-legal {
    color: var(--ink-muted);
    font-size: 13px;
    text-align: center;
    margin-top: 36px;
  }

  /* MOBILE BOTTOM TAB — hidden on desktop */
  .mobile-tab {
    display: none;
  }

  /* RESPONSIVE */
  @media (max-width: 980px) {
    .nav-links { display: none; }
    .nav-cta { display: none; }
  }

  @media (max-width: 860px) {
    .hero {
      grid-template-columns: 1fr;
      grid-template-areas:
        'eyebrow eyebrow'
        'headline art'
        'lede    art'
        'controls controls'
        'trust trust';
      padding: 22px 0 6px;
      gap: 14px 14px;
    }
    .eyebrow { grid-area: eyebrow; align-self: start; }
    .hero-copy { display: contents; }
    .hero-copy h1 { grid-area: headline; margin: 0; font-size: 40px; line-height: 1.05; letter-spacing: -0.02em; }
    .hero-copy .lede { grid-area: lede; margin: 0; max-width: 100%; font-size: 14px; line-height: 1.5; }
    .hero-copy .controls { grid-area: controls; flex-direction: column; }
    .hero-copy .trust { grid-area: trust; }
    .hero-art {
      grid-area: art;
      order: initial;
      height: 160px;
      align-self: start;
      justify-self: end;
      width: 100%;
    }
    .hero-art-img { width: 140px; height: 140px; }
    .field, .style-select, .reveal { width: 100%; }
    .steps {
      flex-wrap: wrap;
      gap: 10px;
    }
    .step-wrap {
      flex: 1 1 calc(50% - 18px);
      flex-direction: column;
      gap: 0;
    }
    .step { width: 100%; }
    .step-arrow { display: none; }
    .banner { grid-template-columns: 1fr; gap: 18px; text-align: left; padding: 22px 22px; }
    .okx-mark { justify-content: flex-start; }
    .footer-top { grid-template-columns: 1fr 1fr; }
    .footer-illo { display: none; }
    .main { padding-bottom: 110px; }

    /* Bottom mobile tab — flat, no white circle, just the V logo in center */
    .mobile-tab {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      position: fixed;
      left: 0; right: 0; bottom: 0;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: saturate(180%) blur(14px);
      border-top: 1px solid var(--line);
      z-index: 60;
      align-items: center;
      justify-items: center;
      padding: 10px 6px max(10px, env(safe-area-inset-bottom));
    }
    .mobile-tab a {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--ink-soft);
      font-size: 11px;
      font-weight: 500;
      padding: 4px 2px;
      text-align: center;
    }
    .mobile-tab a:global(.tab-v) {
      padding: 0;
    }
    .tab-v-img {
      width: 56px;
      height: 56px;
      object-fit: contain;
    }
  }
`;
