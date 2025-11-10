import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  sepolia
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { SubscriptionProvider } from './contexts/SubscriptionContext.tsx';


const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '00462d1e9f2931d394ebdfc09b204d8d',
  chains: [ sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR),
  syncConnectedChain: false, // Disable automatic chain syncing// Disable automatic wallet connection
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
        <SubscriptionProvider>
          <App />
        </SubscriptionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>

  </StrictMode>,
)
