import '@/styles/globals.css'
import { MainContextProvider } from '@/state/main.context'
import { Layout } from '@/components/layout/Layout'
import { Web3OnboardProvider, init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'

const injected = injectedModule();

const ethereumGoerli = {
  id: '0x5',
  token: 'gETH',
  label: 'Ethereum Goerli',
  rpcUrl: 'https://rpc.ankr.com/eth_goerli',
}

const onboard = init({
  wallets: [injected],
  chains: [ethereumGoerli],
  appMetadata: {
    name: 'SMW',
    icon: <svg></svg>, // svg string icon
    description: 'SMW',
  },
})

export default function App({ Component, pageProps }) {
  return (
    <Web3OnboardProvider web3Onboard={onboard}>
      <MainContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MainContextProvider>
    </Web3OnboardProvider>
  );
}
