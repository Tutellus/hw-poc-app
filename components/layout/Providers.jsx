import { MainContextProvider } from '@/state/main.context'
import { Web3OnboardProvider, init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'

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
    <Web3OnboardProvider web3Onboard={onboard}>
      <MainContextProvider>
          {children}
      </MainContextProvider>
    </Web3OnboardProvider>
  )
};