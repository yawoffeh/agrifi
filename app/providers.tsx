"use client"

import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet, sepolia, base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const config = createConfig({
  chains: [mainnet, sepolia, base],
  transports: {
    [mainnet.id]: http("https://ethereum-rpc.publicnode.com"),
    [sepolia.id]: http("https://sepolia.infura.io"),
    [base.id]: http("https://base-sepolia-public.nodies.app"),
  },
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
