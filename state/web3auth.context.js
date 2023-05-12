/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";
import { useRouter } from "next/router";

const WEB3AUTH_USER_KEY = 'web3auth-user';

const Web3AuthContext = createContext({
  chainId: null,
  projectId: null,
  web3Auth: null,
  web3Authprovider: null,
  web3Provider: null,
  user: null,
  loading: false,
  loggingIn: false,
  externalAccount: null,
  logIn: () => {},
  logOut: () => {},
  redirect: () => {},
});

function Web3AuthProvider(props) {

  const [chainId, setChainId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [web3Auth, setWeb3Auth] = useState(null);
  const [web3Authprovider, setWeb3AuthProvider] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [user, setUser] = useState(null);
  const [externalAccount, setExternalAccount] = useState(null);

  const router = useRouter();

  const logIn = async () => {
    if (loggingIn) {
      return;
    }
    setLoggingIn(true);
    try {
      const provider = await web3Auth.connect();
      setWeb3AuthProvider(provider);
      getUserInfo(web3Auth);
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
      setExternalAccount(null);
      localStorage.removeItem(WEB3AUTH_USER_KEY);
    } catch (e) {
      console.error(e);
    }
  };

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

  const getUserInfo = async (w3a) => {
    try {
      if (localStorage.getItem(WEB3AUTH_USER_KEY)) {
        const userInfo = JSON.parse(localStorage.getItem(WEB3AUTH_USER_KEY));
        setUser(userInfo);
        return;
      } else {
        const userInfo = await w3a.getUserInfo();
        setUser(userInfo);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const init = async () => {
    try {
      const innerChainId = process.env.NEXT_PUBLIC_CHAIN_ID;
      const innerProjectId = process.env.NEXT_PUBLIC_PROJECT_ID;

      setLoading(true);
      const w3a = new Web3Auth({
        clientId: innerChainId,
        chainConfig: {
          chainNamespace: "eip155",
          chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
        },
      });
      await w3a.initModal();
      setWeb3Auth(w3a);
      setWeb3AuthProvider(w3a.provider);
      setChainId(innerChainId);
      setProjectId(innerProjectId);
      await getUserInfo(w3a);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
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
  }, [user]);

  const memoizedData = useMemo(
    () => ({
      chainId,
      projectId,
      web3Auth,
      web3Authprovider,
      web3Provider,
      loading,
      loggingIn,
      user,
      externalAccount,
      logIn,
      logOut,
      redirect,
    }),
    [chainId, projectId, web3Auth, web3Authprovider, loading, loggingIn, user, externalAccount]
  );

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