import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'VERSA — An Autonomous On-Chain Portrait Artist',
  description:
    'VERSA reads any wallet\u2019s on-chain history and composes an original soul portrait: archetype, poem, palette, and art prompt. A paid A2MCP agent service on OKX.AI.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
