/* eslint-disable react-hooks/exhaustive-deps */
import { init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import { createContext, useContext, useMemo, useState } from 'react';

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

  const [wallet, setWallet] = useState(null);
  const [correctChain, setCorrectChain] = useState(false);
  const [settingChain, setSettingChain] = useState(false);

  const refresh = () => {
    const { wallets } = onboard.state.get();
    setWallet(wallets[0]);
    setCorrectChain(wallets[0].chains[0].id === DEFAULT_CHAIN_ID);
    setSettingChain(false);
  };

  const connect = async () => {
    await onboard.connectWallet();
    refresh();
  };

  const handleSwitch = async () => {
    if (!correctChain) {
      setSettingChain(true);
      await onboard.setChain({ chainId: DEFAULT_CHAIN_ID });
      refresh();
      setSettingChain(false);
    }
  };

  const memoizedData = useMemo(
    () => ({
      wallet,
      correctChain,
      settingChain,
      connect,
      handleSwitch,
    }),
    [wallet, correctChain, settingChain]
  );

  return <WalletContext.Provider value={memoizedData} {...props} />;
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