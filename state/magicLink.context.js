/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Magic } from "magic-sdk";
import { ethers } from "ethers";

const MAGICLINK_API_KEY = process.env.NEXT_PUBLIC_MAGICLINK_API_KEY;

const customNodeOptions = {
  rpcUrl: "https://rpc.ankr.com/polygon_mumbai", // Polygon RPC URL
  chainId: 80001, // Polygon chain id
};

const MagicLinkContext = createContext({
  magicLink: null,
  loggedIn: false,
  web3Provider: null,
  externalAccount: null,
  login: () => {},
});

function MagicLinkProvider(props) {
  const [magicLink, setMagicLink] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [provider, setProvider] = useState(null);
  const [externalAccount, setExternalAccount] = useState(null);
  const { data } = useSession();
  const accessToken = data?.accessToken;

  const login = async () => {
    const magicLink = new Magic(MAGICLINK_API_KEY, { network: customNodeOptions });

    await magicLink.auth.loginWithEmailOTP({
      email: data?.user?.email || "",
      showUI: false,
    });

    const magicLinkProvider = await magicLink.wallet.getProvider();
    const web3Provider = new ethers.providers.Web3Provider(magicLinkProvider);
    const account = await web3Provider.listAccounts();

    setMagicLink(magicLink);
    setLoggedIn(true);
    setProvider(web3Provider);
    setExternalAccount(account[0]);
  };

  useEffect(() => {
    if (accessToken) login();
  }, [accessToken]);

  const logout = async () => {
    if (!magicLink) {
      console.log("magicLink not initialized yet");
      return;
    }
    await magicLink.auth.logout();
    setMagicLink(null);
    setLoggedIn(false);
    setProvider(null);
    setExternalAccount(null);
  };

  const memoizedData = useMemo(
    () => ({
      magicLink,
      externalAccount,
      loggedIn,
      web3Provider: provider,
      login,
      logout,
    }),
    [loggedIn, provider]
  );

  return <MagicLinkContext.Provider value={memoizedData} {...props} />;
}

function useMagicLink() {
  const context = useContext(MagicLinkContext);
  if (context === undefined) {
    throw new Error(`useMagicLink must be used within a MagicLinkProvider`);
  }
  return context;
}

export { MagicLinkProvider, useMagicLink };
