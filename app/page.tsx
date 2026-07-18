export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0B14',
        color: '#EDEDF2',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '4rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #8B5CFF 0%, #4E7BFF 55%, #22D3EE 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.08em',
        }}
      >
        VERSA
      </div>
      <p style={{ fontSize: '1.15rem', color: '#A9A9BC', maxWidth: 480, lineHeight: 1.6 }}>
        An Autonomous On-Chain Portrait Artist. Give VERSA a wallet address and it composes an
        original soul portrait — archetype, poem, palette, and art prompt — from its on-chain
        history.
      </p>
      <p style={{ marginTop: '1.5rem', color: '#6B6B80', fontSize: '0.9rem' }}>
        Live as a paid A2MCP agent service on OKX.AI &middot; MCP endpoint at{' '}
        <code style={{ color: '#8B9FFF' }}>/api/mcp</code>
      </p>
    </main>
  );
}
