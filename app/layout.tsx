import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'VERSA — An Autonomous On-Chain Portrait Artist',
  description:
    'VERSA reads any wallet\u2019s on-chain history and composes an original soul portrait: archetype, poem, palette, and art prompt. A paid A2MCP agent service on OKX.AI.',
  openGraph: {
    title: 'VERSA — Your wallet has a soul. VERSA paints it.',
    description: 'Give VERSA any wallet address and get an original on-chain soul portrait.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
