/* eslint-disable react-hooks/exhaustive-deps */
import { init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import { createContext, useContext, useMemo, useState } from 'react';

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
    setCorrectChain(wallets[0].chains[0].id === ethereumGoerli.id);
    setSettingChain(false);
  };

  const connect = async () => {
    await onboard.connectWallet();
    refresh();
  };

  const handleSwitch = async () => {
    if (!correctChain) {
      setSettingChain(true);
      await onboard.setChain({ chainId: ethereumGoerli.id });
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