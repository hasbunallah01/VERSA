'use client';

import { forwardRef } from 'react';

import type { Portrait } from './PortraitResult';

/**
 * ShareCard — a purpose-built, compact export card for social sharing.
 *
 * Unlike the on-site PortraitResult (which shows everything in full for
 * reading), this is a fixed-size 1080×1350 (4:5) gallery card designed
 * to look beautiful as an image on X / Instagram:
 *   - background derived from the portrait's OWN palette (dark tones),
 *     so every card feels unique to the wallet
 *   - archetype as the hero, in a serif display face
 *   - a SHORT excerpt of the portrait + a few poem lines, not everything
 *   - the palette as an elegant strip, stats as a tight row
 *   - VERSA wordmark watermark
 *
 * It renders off-screen (see PortraitResult) purely so html-to-image can
 * snapshot it at a fixed size, independent of the viewport.
 */

const firstSentences = (text: string, count: number): string => {
  const parts = text.match(/[^.!?]+[.!?]+/g);
  if (!parts) return text;
  return parts.slice(0, count).join(' ').trim();
};

/** Pick a dark base + a lighter accent from the palette for the background. */
const pickBackdrop = (colors: string[]): { dark: string; darker: string; accent: string } => {
  // Sort by rough luminance; darkest two anchor the gradient, a mid tone accents.
  const lum = (hex: string): number => {
    const c = hex.replace('#', '');
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const sorted = [...colors].sort((a, b) => lum(a) - lum(b));
  return {
    darker: sorted[0] ?? '#0b0b14',
    dark: sorted[1] ?? sorted[0] ?? '#141426',
    accent: sorted[Math.min(3, sorted.length - 1)] ?? '#8b5cff',
  };
};

const short = (a: string) => (a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

export const ShareCard = forwardRef<HTMLDivElement, { portrait: Portrait & { address: string } }>(
  function ShareCard({ portrait }, ref) {
    const { dark, darker, accent } = pickBackdrop(portrait.palette.colors);
    const excerpt = firstSentences(portrait.portrait, 2);
    const poemLines = portrait.poem.split('\n').filter(Boolean).slice(0, 4);

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1350,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(155deg, ${dark} 0%, ${darker} 100%)`,
          fontFamily: "'Fraunces', Georgia, serif",
          color: '#F4F1EA',
          padding: '84px 76px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* soft accent glow */}
        <div
          style={{
            position: 'absolute',
            top: -220,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: '50%',
            background: accent,
            opacity: 0.22,
            filter: 'blur(120px)',
          }}
        />

        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 22,
              letterSpacing: '0.32em',
              fontWeight: 600,
              color: 'rgba(244,241,234,0.62)',
            }}
          >
            SOUL PORTRAIT
          </span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 22,
              color: 'rgba(244,241,234,0.72)',
              background: 'rgba(255,255,255,0.08)',
              padding: '8px 18px',
              borderRadius: 999,
            }}
          >
            {short(portrait.address)}
          </span>
        </div>

        {/* archetype hero */}
        <h1
          style={{
            fontSize: 92,
            lineHeight: 1.02,
            fontWeight: 600,
            margin: '54px 0 0',
            letterSpacing: '-0.02em',
            zIndex: 1,
          }}
        >
          {portrait.archetype}
        </h1>

        {/* excerpt */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 30,
            lineHeight: 1.55,
            color: 'rgba(244,241,234,0.82)',
            margin: '40px 0 0',
            zIndex: 1,
          }}
        >
          {excerpt}
        </p>

        {/* poem */}
        <div
          style={{
            margin: '44px 0 0',
            paddingLeft: 28,
            borderLeft: `3px solid ${accent}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            zIndex: 1,
          }}
        >
          {poemLines.map((line, i) => (
            <span key={i} style={{ fontSize: 32, fontStyle: 'italic', color: 'rgba(244,241,234,0.9)', lineHeight: 1.4 }}>
              {line}
            </span>
          ))}
        </div>

        {/* spacer */}
        <div style={{ flex: 1 }} />

        {/* palette strip */}
        <div style={{ display: 'flex', gap: 0, borderRadius: 16, overflow: 'hidden', zIndex: 1 }}>
          {portrait.palette.colors.map((c) => (
            <div key={c} style={{ flex: 1, height: 64, background: c }} />
          ))}
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 22,
            color: 'rgba(244,241,234,0.62)',
            margin: '16px 0 0',
            zIndex: 1,
          }}
        >
          {portrait.palette.name}
        </div>

        {/* stats row */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            margin: '36px 0 0',
            fontFamily: "'Inter', sans-serif",
            zIndex: 1,
          }}
        >
          {[
            { v: portrait.stats.walletAgeDays != null ? `${portrait.stats.walletAgeDays}d` : '—', l: 'Wallet age' },
            { v: portrait.stats.nightOwlScore != null ? `${portrait.stats.nightOwlScore}%` : '—', l: 'Night owl' },
            { v: String(portrait.stats.tokenDiversity), l: 'Tokens' },
            { v: String(portrait.stats.nftTransfers), l: 'NFT moves' },
          ].map((s) => (
            <div key={s.l}>
              <div style={{ fontSize: 40, fontWeight: 700, color: '#F4F1EA' }}>{s.v}</div>
              <div style={{ fontSize: 20, color: 'rgba(244,241,234,0.55)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* footer / watermark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            margin: '44px 0 0',
            paddingTop: 28,
            borderTop: '1px solid rgba(244,241,234,0.14)',
            fontFamily: "'Inter', sans-serif",
            zIndex: 1,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #8B5CFF, #22D3EE)',
              color: '#fff',
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            V
          </span>
          <span style={{ fontSize: 26, fontWeight: 600, color: 'rgba(244,241,234,0.9)' }}>VERSA</span>
          <span style={{ fontSize: 24, color: 'rgba(244,241,234,0.5)', marginLeft: 'auto' }}>
            versa-bice.vercel.app
          </span>
        </div>
      </div>
    );
  },
);
