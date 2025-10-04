import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { VeChainKitProvider } from '@vechain/vechain-kit'
import { ChakraProvider } from '@chakra-ui/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider>
      <VeChainKitProvider
        network={{ type: 'test' }}
        loginMethods={[
          { method: 'dappkit', gridColumn: 4 },
        ]}
        feeDelegation={{
          delegatorUrl: 'https://sponsor-testnet.vechain.energy/by/90',
          delegateAllTransactions: false
        }}
        dappKit={{
          allowedWallets: ['veworld', 'wallet-connect', 'sync2'],
          walletConnectOptions: {
            projectId: 'a0b855ceaf109dbc8426479a4c3d38d8',
            metadata: {
              name: 'ProofOfImpact',
              description: 'Blockchain-Verified Environmental Action',
              url: typeof window !== 'undefined' ? window.location.origin : '',
              icons: []
            }
          }
        }}
      >
        <App />
      </VeChainKitProvider>
    </ChakraProvider>
  </StrictMode>,
)
