import { SessionProvider } from '@/state/session.context'
import { Web3OnboardProvider, init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import { ModalProvider } from '@/state/modal.context'
import { TransactionsProvider } from '@/state/transactions.context'

const ethereumGoerli = {
  id: '0x5',
  token: 'gETH',
  label: 'Ethereum Goerli',
  rpcUrl: 'https://rpc.ankr.com/eth_goerli',
}

const onboard = init({
  wallets: [injectedModule()],
  chains: [ethereumGoerli],
  appMetadata: {
    name: 'SMW',
    icon: 'https://smw.finance/favicon.ico',
    description: 'SMW',
  },
  accountCenter: {
    desktop: {
      enabled: false,
    },
    mobile: {
      enabled: false,
    },
  },
})

export const Providers = ({ children }) => {
  return (
    <ModalProvider>
      <Web3OnboardProvider web3Onboard={onboard}>
        <SessionProvider>
          <TransactionsProvider>
            {children}
          </TransactionsProvider>
        </SessionProvider>
      </Web3OnboardProvider>
    </ModalProvider>
  )
};