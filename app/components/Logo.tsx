/* app/components/Logo.tsx — the VERSA gradient-V mark, inline SVG. */

export function Logo({ size = 32 }: { size?: number }) {
  const id = 'vlogo';
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-a`} x1="120" y1="150" x2="392" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B5CFF" />
          <stop offset="0.55" stopColor="#4E7BFF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="256" y1="150" x2="372" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6D5CFF" stopOpacity="0.92" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path d="M132 150 L214 150 L256 286 L256 372 Z" fill={`url(#${id}-a)`} />
      <path d="M380 150 L298 150 L256 286 L256 372 Z" fill={`url(#${id}-b)`} />
    </svg>
  );
}

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <Logo size={size * 1.4} />
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
