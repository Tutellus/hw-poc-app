/* eslint-disable react-hooks/exhaustive-deps */
import { init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const WALLETS_STORAGE_KEY = "connectedWallets"

const ethereumGoerli = {
  id: '0x5',
  token: 'gETH',
  label: 'Ethereum Goerli',
  rpcUrl: 'https://rpc.ankr.com/eth_goerli',
};

const bscTestnet = {
  id: '0x61',
  token: 'BNB',
  label: 'Binance Smart Chain Testnet',
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
};

// Set this to the chain you want to use by default in the app
const DEFAULT_CHAIN = bscTestnet;

export const DEFAULT_CHAIN_ID = DEFAULT_CHAIN.id;

const onboard = init({
  wallets: [injectedModule()],
  chains: [
    DEFAULT_CHAIN
  ],
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

const WalletContext = createContext({
  wallet: null,
  correctChain: false,
  settingChain: false,
  connect: () => {},
  handleSwitch: () => {},
});

function WalletProvider(props) {

  // const [wallet, setWallet] = useState(null);
  // const [correctChain, setCorrectChain] = useState(false);
  // const [settingChain, setSettingChain] = useState(false);

  // const handleSwitch = async () => {
  //   if (!correctChain) {
  //     setSettingChain(true);
  //     await onboard.setChain({ chainId: DEFAULT_CHAIN_ID });
  //     refresh();
  //     setSettingChain(false);
  //   }
  // };

  // const autoConnect = async () => {
  //   const previouslyConnectedWallets = JSON.parse(window.localStorage.getItem(WALLETS_STORAGE_KEY))
  //   if (previouslyConnectedWallets) {
  //     const prevWallet = previouslyConnectedWallets?.[0]
  //     const params = prevWallet ? { autoSelect: { label: prevWallet, disableModals: true } } : null
  //     connect(params);
  //   }
  // }

  // const connect = async (params) => {
  //   try {
  //     const wallets = await onboard.connectWallet(params)
  //     const connectedWallets = wallets.map(({ label }) => label)
  //     window.localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(connectedWallets))
  //     const innerWallet = wallets[0]
  //     setWallet(innerWallet)
  //     setCorrectChain(innerWallet.chains[0].id === DEFAULT_CHAIN_ID);
  //   } catch (error) {
  //     console.error(error)
  //     setWallet(null)
  //     setCorrectChain(false);
  //   }
  // }

  // useEffect(() => {
  //   autoConnect();
  // }, []);

  // const memoizedData = useMemo(
  //   () => ({
  //     wallet,
  //     correctChain,
  //     settingChain,
  //     connect,
  //     handleSwitch,
  //   }),
  //   [wallet, correctChain, settingChain]
  // );

  return <WalletContext.Provider value={{}} {...props} />;
}

function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error(
      `useWalletContext must be used within a WalletContextProvider`
    );
  }
  return context;
}

export { WalletProvider, useWallet };