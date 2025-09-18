import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WagmiProvider, http, createConfig } from 'wagmi'
import { metaMask, walletConnect } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { sepolia } from 'viem/chains'
import { AuthProvider } from './contexts/AuthContext'

const wcProjectId = import.meta.env.VITE_WC_PROJECT_ID as string | undefined
const config = createConfig({
  chains: [sepolia],
  transports: { [sepolia.id]: http() },
  connectors: [
    metaMask(),
    ...(wcProjectId ? [walletConnect({ projectId: wcProjectId })] : []),
  ],
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
