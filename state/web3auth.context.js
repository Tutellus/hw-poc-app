/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { DEFAULT_CHAIN_ID } from "./wallet.context";
import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";
import { useRouter } from "next/router";

const PROJECT_ID = "63d3c3a83d55158bfb36d502";

const Web3AuthContext = createContext({
  web3Auth: null,
  web3Authprovider: null,
  web3Provider: null,
  user: null,
  loggingIn: false,
  loadingProxy: false,
  assigningProxy: false,
  proxy: null,
  externalAccount: null,
  logIn: () => {},
  logOut: () => {},
  loadProxy: () => {},
});

function Web3AuthProvider(props) {

  const [web3Auth, setWeb3Auth] = useState(null);
  const [web3Authprovider, setWeb3AuthProvider] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);
  const [loadingProxy, setLoadingProxy] = useState(false);
  const [assigningProxy, setAssigningProxy] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [user, setUser] = useState(null);
  const [proxy, setProxy] = useState(null);
  const [externalAccount, setExternalAccount] = useState(null);
  const router = useRouter();

  const logIn = async () => {
    if (loggingIn) {
      return;
    }
    setLoggingIn(true);
    try {
      const provider = await web3Auth.connect();
      const userInfo = await web3Auth.getUserInfo();
      setWeb3AuthProvider(provider);
      setUser(userInfo);
    } catch (e) {
      console.error(e);
      setWeb3AuthProvider(null);
      setUser(null);
    }
    setLoggingIn(false);
  };

  const logOut = async () => {
    if (loggingIn) {
      return;
    }
    try {
      const provider = await web3Auth.logout();
      setWeb3AuthProvider(provider);
      setWeb3Provider(null);
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const assignProxy = async () => {
    if (user) {
      setAssigningProxy(true);
      const params = {
        userId: user.idToken,
        chainId: DEFAULT_CHAIN_ID,
        projectId: PROJECT_ID,
      }
      const response = await fetch('/api/usecases/users/assignProxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })
      const { proxy } = await response.json()
      if (proxy) {
        setProxy(proxy);
        setAssigningProxy(false);
      }
    }
  }

  const loadProxy = async () => {
    if (user) {
      setLoadingProxy(true);

      const filter = {
        userId: user.idToken,
        chainId: DEFAULT_CHAIN_ID,
        projectId: PROJECT_ID,
      }

      const response = await fetch('/api/usecases/proxies/getProxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filter }),
      })
      const { proxy } = await response.json()
      if (proxy) {
        setProxy(proxy);
      } else {
        assignProxy();
      }
      setLoadingProxy(false);
    }
  }

  const redirect = () => {
    if (user) {
      if (router.pathname !== '/dashboard') {
        router.push('/dashboard');
      }
    } else {
      if (router.pathname !== '/login') {
        router.push('/login');
      }
    }
  }

  const getExternalAccount = async (provider) => {
    const signer = await provider.getSigner();
    const account = await signer.getAddress();
    setExternalAccount(account);
  }

  useEffect(() => {
    const init = async () => {
      try {
        const w3a = new Web3Auth({
          clientId: "BFRcGKRLQsiohDLtVSWAtXOdKsk55U8DcEsju4Zv1Wu5-OMrJ6q3lz4HIbPU1CwtcyE-osWAFNxWWooTkxYTDmk",
          chainConfig: {
            chainNamespace: "eip155",
            chainId: DEFAULT_CHAIN_ID,
          },
        });
        setWeb3Auth(w3a);
        await w3a.initModal();
        setWeb3AuthProvider(w3a.provider);
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  useEffect(() => {

    if (web3Authprovider) {
      const provider = new ethers.providers.Web3Provider(web3Authprovider);
      setWeb3Provider(provider);
      getExternalAccount(provider);
    }
  }, [web3Authprovider]);

  useEffect(() => {
    redirect();
    loadProxy();
  }, [user]);

  const memoizedData = useMemo(
    () => ({
      web3Auth,
      web3Authprovider,
      web3Provider,
      loggingIn,
      user,
      loadingProxy,
      assigningProxy,
      proxy,
      externalAccount,
      logIn,
      logOut,
      loadProxy,
    }),
    [web3Auth, web3Authprovider, loggingIn, user, loadingProxy, assigningProxy, proxy, externalAccount]
  );

  console.log("memoizedData", memoizedData);

  return <Web3AuthContext.Provider value={memoizedData} {...props} />;
}

function useWeb3Auth() {
  const context = useContext(Web3AuthContext);
  if (context === undefined) {
    throw new Error(
      `useWeb3Auth must be used within a Web3AuthProvider`
    );
  }
  return context;
}

export { Web3AuthProvider, useWeb3Auth };