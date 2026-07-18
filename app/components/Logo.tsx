/* app/components/Logo.tsx — VERSA brand mark.
 *
 * Uses the exact brand artwork (public/versa-logo.png): the gradient V
 * sitting on a white podium inside a glass sphere, with the surrounding
 * sparkles — identical to the approved reference.
 *
 * For nav/wordmark we use the full artwork at small sizes.
 */

type LogoProps = {
  size?: number;
  alt?: string;
};

export function Logo({ size = 36, alt = 'VERSA' }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/versa-logo.png"
      width={size}
      height={size}
      alt={alt}
      draggable={false}
      style={{ display: 'block' }}
    />
  );
}

export function Wordmark({ size = 22 }: { size?: number }) {
  // The PNG already has the V — the wordmark is just V + "VERSA" text.
  const vSize = Math.round(size * 1.5);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <Logo size={vSize} />
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
