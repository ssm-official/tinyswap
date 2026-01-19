'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
  bsc,
  avalanche,
  linea,
  scroll,
  blast
} from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useState } from 'react';

const config = getDefaultConfig({
  appName: 'TinySwap',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, arbitrum, optimism, base, bsc, avalanche, linea, scroll, blast],
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#7b3fe4',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
