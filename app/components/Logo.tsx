/* app/components/Logo.tsx — VERSA brand mark.
 *
 * Faithful to the reference: a crisp gradient V (violet -> blue -> cyan),
 * sitting on a soft white podium inside a translucent glass sphere,
 * with subtle star sparkles around it. All inline SVG, no external assets.
 */

type LogoProps = {
  size?: number;
  /** When true, draws the sphere + podium + sparkles around the V. */
  withStage?: boolean;
};

const STAGE_DEFS = (
  sphereId: string,
  vMainId: string,
  vShineId: string,
  podiumId: string,
  glowId: string,
) => (
  <defs>
    {/* V body — violet -> blue -> cyan */}
    <linearGradient id={vMainId} x1="160" y1="170" x2="380" y2="430" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#8B5CFF" />
      <stop offset="0.55" stopColor="#4E7BFF" />
      <stop offset="1" stopColor="#22D3EE" />
    </linearGradient>
    {/* Subtle inner highlight on the right arm */}
    <linearGradient id={vShineId} x1="300" y1="170" x2="360" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#A48BFF" stopOpacity="0.0" />
      <stop offset="1" stopColor="#22D3EE" stopOpacity="0.45" />
    </linearGradient>
    {/* Glass sphere — faint white-to-transparent */}
    <radialGradient id={sphereId} cx="50%" cy="42%" r="55%">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
      <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.12" />
      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
    </radialGradient>
    {/* Podium top — soft white highlight */}
    <linearGradient id={podiumId} x1="120" y1="380" x2="420" y2="540" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="0.5" stopColor="#eef2ff" />
      <stop offset="1" stopColor="#dbe2f3" />
    </linearGradient>
    {/* Soft floor glow under the podium */}
    <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
      <stop offset="0" stopColor="#8B9CFF" stopOpacity="0.22" />
      <stop offset="1" stopColor="#8B9CFF" stopOpacity="0" />
    </radialGradient>
  </defs>
);

/** The plain V mark (used in the nav, the floating mobile tab, etc.). */
export function Logo({ size = 36, withStage = false }: LogoProps) {
  const uid = `lv-${Math.random().toString(36).slice(2, 9)}`;
  const vMain = `${uid}-vmain`;
  const vShine = `${uid}-vshine`;
  const sphere = `${uid}-sphere`;
  const podium = `${uid}-podium`;
  const glow = `${uid}-glow`;

  if (!withStage) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={vMain} x1="160" y1="170" x2="380" y2="430" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8B5CFF" />
            <stop offset="0.55" stopColor="#4E7BFF" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id={vShine} x1="300" y1="170" x2="360" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#A48BFF" stopOpacity="0" />
            <stop offset="1" stopColor="#22D3EE" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <path d="M156 172 L236 172 L266 280 L266 408 L256 408 Z" fill={`url(#${vMain})`} />
        <path d="M356 172 L276 172 L246 280 L246 408 L256 408 Z" fill={`url(#${vShine})`} />
      </svg>
    );
  }

  // With stage: sphere + V on podium + sparkles.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 560 560"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {STAGE_DEFS(sphere, vMain, vShine, podium, glow)}

      {/* Floor glow */}
      <ellipse cx="280" cy="500" rx="220" ry="28" fill={`url(#${glow})`} />

      {/* Glass sphere */}
      <circle cx="280" cy="260" r="220" fill={`url(#${sphere})`} stroke="#E6EBFA" strokeWidth="1.2" />

      {/* V — slightly above the podium */}
      <g>
        <path d="M170 178 L250 178 L280 286 L280 414 L256 414 Z" fill={`url(#${vMain})`} />
        <path d="M370 178 L290 178 L260 286 L260 414 L284 414 Z" fill={`url(#${vShine})`} />
        {/* crisp inner edge on the right arm for definition */}
        <path
          d="M280 286 L290 178 L370 178 L284 414"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.2"
        />
      </g>

      {/* White podium */}
      <ellipse cx="280" cy="440" rx="170" ry="22" fill={`url(#${podium})`} />
      <path
        d="M110 440 Q280 420 450 440 L438 470 Q280 452 122 470 Z"
        fill="#ffffff"
        stroke="#E6EBFA"
        strokeWidth="1"
      />
      <ellipse cx="280" cy="470" rx="150" ry="14" fill="#F1F4FB" />

      {/* Sparkles around the sphere */}
      <g fill="#8B5CFF" opacity="0.55">
        <path d="M70 160 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 z" />
        <path d="M490 150 l1.6 4.8 l4.8 1.6 l-4.8 1.6 l-1.6 4.8 l-1.6 -4.8 l-4.8 -1.6 l4.8 -1.6 z" />
        <path d="M60 360 l1.2 3.6 l3.6 1.2 l-3.6 1.2 l-1.2 3.6 l-1.2 -3.6 l-3.6 -1.2 l3.6 -1.2 z" />
        <path d="M500 360 l1.2 3.6 l3.6 1.2 l-3.6 1.2 l-1.2 3.6 l-1.2 -3.6 l-3.6 -1.2 l3.6 -1.2 z" />
      </g>
      <g fill="#22D3EE" opacity="0.55">
        <path d="M150 80 l1.4 4.2 l4.2 1.4 l-4.2 1.4 l-1.4 4.2 l-1.4 -4.2 l-4.2 -1.4 l4.2 -1.4 z" />
        <path d="M420 90 l1.2 3.6 l3.6 1.2 l-3.6 1.2 l-1.2 3.6 l-1.2 -3.6 l-3.6 -1.2 l3.6 -1.2 z" />
      </g>
    </svg>
  );
}

export function Wordmark({ size = 22, withStage = false }: { size?: number; withStage?: boolean }) {
  const vSize = withStage ? size * 1.55 : size * 1.4;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <Logo size={vSize} withStage={withStage} />
      <span
        style={{
          fontWeight: 800,
          fontSize: size,
          letterSpacing: '0.12em',
          color: 'var(--ink)',
        }}
      >
        VERSA
      </span>
    </span>
  );
}
