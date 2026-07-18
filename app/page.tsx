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

      <main className="container">
        <section className="hero">
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
                  placeholder="Paste any wallet address (0x…)"
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
              </div>
              <button className="btn btn-primary reveal" onClick={reveal} disabled={!isValid || loading}>
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

          <div className="hero-art" aria-hidden="true">
            <div className="podium-glow" />
            <div className="big-v">
              <Logo size={260} />
            </div>
            <div className="podium" />
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

        <section className="banner" id="about">
          <div className="banner-left">
            <BoltIcon />
            <div>
              <strong>Built for the OKX.AI Genesis Hackathon</strong>
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
      </main>

      <SiteFooter />

      <style jsx>{styles}</style>
    </>
  );
}

function SiteNav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Wordmark />
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
      <style jsx>{`
        .nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: saturate(180%) blur(12px);
          border-bottom: 1px solid var(--line-soft);
        }
        .nav-inner {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-links {
          display: flex;
          gap: 34px;
          font-size: 15px;
          font-weight: 500;
          color: var(--ink-soft);
        }
        .nav-links a:hover {
          color: var(--ink);
        }
        .nav-cta {
          font-size: 14px;
          padding: 10px 18px;
        }
        @media (max-width: 860px) {
          .nav-links,
          .nav-cta {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}

function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
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
        <div className="footer-col">
          <h4>Connect</h4>
          <a href="#" className="footer-pill">
            Follow us on X <XIcon />
          </a>
          <a href="#" className="footer-pill">
            OKX.AI Listing <ExtIcon />
          </a>
        </div>
      </div>
      <div className="container footer-legal">© 2026 VERSA. All rights reserved.</div>
      <style jsx>{`
        .footer {
          border-top: 1px solid var(--line-soft);
          margin-top: 60px;
          padding: 46px 0 30px;
          background: var(--bg-soft);
        }
        .footer-inner {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.4fr;
          gap: 30px;
        }
        .footer-brand p {
          color: var(--ink-muted);
          font-size: 14px;
          line-height: 1.6;
          margin: 14px 0;
        }
        .footer-social {
          display: flex;
          gap: 10px;
        }
        .footer-social a {
          width: 34px;
          height: 34px;
          border: 1px solid var(--line);
          border-radius: 9px;
          display: grid;
          place-items: center;
          color: var(--ink-soft);
        }
        .footer-col h4 {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--ink-muted);
          margin: 0 0 14px;
        }
        .footer-col a {
          display: block;
          font-size: 14px;
          color: var(--ink-soft);
          margin-bottom: 10px;
        }
        .footer-col a:hover {
          color: var(--ink);
        }
        .footer-pill {
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 10px 14px;
          display: inline-flex !important;
          align-items: center;
          gap: 8px;
          background: #fff;
        }
        .footer-legal {
          color: var(--ink-muted);
          font-size: 13px;
          text-align: center;
          margin-top: 34px;
        }
        @media (max-width: 860px) {
          .footer-inner {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </footer>
  );
}

function SparkIcon({ light }: { light?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b93ad" strokeWidth="1.7">
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M16 12h3" strokeLinecap="round" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" />
    </svg>
  );
}
function NodesIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8 11l8-4M8 13l8 4" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="url(#bg)">
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5-6.6L5.5 22H2.4l7.8-8.9L2 2h6.9l4.5 6L18.9 2zm-2.4 18h1.7L7.6 3.8H5.8L16.5 20z" />
    </svg>
  );
}
function ExtIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
    </svg>
  );
}
function OkxMark() {
  return (
    <svg width="86" height="26" viewBox="0 0 120 34" fill="#0d1220">
      <rect x="0" y="0" width="10" height="10" />
      <rect x="12" y="0" width="10" height="10" />
      <rect x="24" y="0" width="10" height="10" />
      <rect x="12" y="12" width="10" height="10" />
      <rect x="0" y="24" width="10" height="10" />
      <rect x="24" y="24" width="10" height="10" />
      <text x="44" y="26" fontSize="24" fontWeight="800" fontFamily="Inter, sans-serif">
        .AI
      </text>
    </svg>
  );
}
function StepIcon({ name }: { name: string }) {
  const common = {
    width: 26,
    height: 26,
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

const styles = `
  .hero {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    align-items: center;
    gap: 30px;
    padding: 56px 0 40px;
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--blue);
    background: #eef1ff;
    border: 1px solid #e0e6ff;
    padding: 7px 13px;
    border-radius: 999px;
  }
  h1 {
    font-size: 58px;
    line-height: 1.04;
    letter-spacing: -0.02em;
    font-weight: 800;
    margin: 20px 0 0;
  }
  .lede {
    color: var(--ink-soft);
    font-size: 17px;
    line-height: 1.6;
    max-width: 430px;
    margin: 20px 0 28px;
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: stretch;
  }
  .field {
    flex: 1 1 260px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 0 16px;
    box-shadow: var(--shadow-sm);
  }
  .field input {
    border: none;
    outline: none;
    width: 100%;
    height: 54px;
    font-size: 15px;
    font-family: inherit;
    background: transparent;
    color: var(--ink);
  }
  .style-select {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 0 14px;
    box-shadow: var(--shadow-sm);
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
    height: 54px;
    color: var(--ink);
    cursor: pointer;
  }
  .reveal {
    height: 54px;
    padding: 0 24px;
    white-space: nowrap;
  }
  .trust {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 18px;
    color: var(--ink-muted);
    font-size: 14px;
  }
  .trust span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .trust .dot {
    color: var(--line);
  }

  .hero-art {
    position: relative;
    height: 420px;
    display: grid;
    place-items: center;
  }
  .podium-glow {
    position: absolute;
    width: 340px;
    height: 340px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(120, 130, 255, 0.16), transparent 62%);
    filter: blur(6px);
  }
  .big-v {
    position: relative;
    transform: translateY(-14px);
    filter: drop-shadow(0 24px 40px rgba(78, 100, 255, 0.28));
  }
  .podium {
    position: absolute;
    bottom: 66px;
    width: 250px;
    height: 46px;
    border-radius: 50%;
    background: linear-gradient(180deg, #eef2ff, #dfe6ff);
    box-shadow: 0 20px 40px rgba(90, 110, 200, 0.18);
  }

  .how {
    padding: 30px 0 10px;
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
    padding: 26px 18px;
    text-align: center;
    box-shadow: var(--shadow-sm);
    position: relative;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .step-n {
    position: absolute;
    top: 14px;
    left: 14px;
    width: 22px;
    height: 22px;
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

  .banner {
    display: grid;
    grid-template-columns: 1.4fr 1.3fr auto auto;
    align-items: center;
    gap: 26px;
    background: linear-gradient(180deg, #f7f9ff, #eef2ff);
    border: 1px solid #e3e9ff;
    border-radius: var(--radius-lg);
    padding: 26px 30px;
    margin: 34px 0 10px;
  }
  .banner-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .banner-left strong {
    display: block;
    font-size: 17px;
  }
  .banner-cat {
    color: var(--blue);
    font-size: 14px;
    font-weight: 600;
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
    padding: 12px 20px;
  }
  .price {
    font-size: 24px;
    font-weight: 800;
  }
  .per {
    font-size: 12px;
    color: var(--ink-muted);
  }

  @media (max-width: 860px) {
    .hero {
      grid-template-columns: 1fr;
      padding: 30px 0 10px;
    }
    h1 {
      font-size: 42px;
    }
    .hero-art {
      order: -1;
      height: 260px;
    }
    .podium {
      bottom: 40px;
      width: 180px;
    }
    .controls {
      flex-direction: column;
    }
    .steps {
      flex-wrap: wrap;
    }
    .step-wrap {
      flex: 1 1 44%;
    }
    .step-arrow {
      display: none;
    }
    .banner {
      grid-template-columns: 1fr;
      gap: 16px;
      text-align: left;
    }
  }
`;
