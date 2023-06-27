/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ethers } from "ethers";
import { Web3Auth } from "@web3auth/modal";
import { useRouter } from "next/router";

const WEB3AUTH_USER_KEY = "web3auth-user";

const UserContext = createContext({
  user: null,
  web3Provider: null,
  externalAccount: null,
  accessToken: null,
  login: () => {},
  logout: () => {},
});

function UserProvider(props) {
  const [user, setUser] = useState(null);
  const [web3Auth, setWeb3Auth] = useState(null);
  const [web3AuthProvider, setWeb3AuthProvider] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);
  const [externalAccount, setExternalAccount] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const router = useRouter();

  const init = async () => {
    try {
      setLoading(true);
      //Initialize within your constructor
      const web3auth = new Web3Auth({
        clientId: "BOCA-dFlRyCGJOUayzaH4yks3g8L7zyHyYfi-WnfAG2vtsP_EHbDS-YYxX_ChVXS66ljISHkpBcmr0ECam-r8fA", // Get your Client ID from Web3Auth Dashboard
        chainConfig: {
          chainNamespace: "eip155",
          chainId: "0x89", // Use 0x13881 for Mumbai Testnet
        },
      });
      await web3auth.initModal();
      setWeb3Auth(web3auth);
      if (web3auth.status === "connected") {
        setWeb3AuthProvider(web3auth.provider);
        await getUserInfo(web3auth);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const getExternalAccount = async (provider) => {
    const signer = await provider.getSigner();
    const account = await signer.getAddress();
    setExternalAccount(account);
  };

  const getUserInfo = async (w3a) => {
    try {
      if (localStorage.getItem(WEB3AUTH_USER_KEY)) {
        const userInfo = JSON.parse(localStorage.getItem(WEB3AUTH_USER_KEY));
        setUser(userInfo);
        setAccessToken(userInfo.idToken);
        return;
      } else {
        const userInfo = await w3a.getUserInfo();
        setUser(userInfo);
        setAccessToken(userInfo.idToken);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const login = async () => {
    if (loggingIn) return;
    setLoggingIn(true);

    try {
      const provider = await web3Auth.connect();
      setWeb3AuthProvider(provider);
      getUserInfo(web3Auth);
    } catch (e) {
      console.error(e);
      setWeb3Provider(null);
      setUser(null);
    }

    setLoggingIn(false);
  };

  const logout = async () => {
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

  useEffect(() => {
    if (web3AuthProvider) {
      const provider = new ethers.providers.Web3Provider(web3AuthProvider);
      setWeb3Provider(provider);
      getExternalAccount(provider);
    }
  }, [web3AuthProvider]);

  const redirect = () => {
    if (user) {
      if (router.pathname !== "/dashboard") {
        router.push("/dashboard");
      }
    } else {
      if (router.pathname !== "/login") {
        router.push("/login");
      }
    }
  };

  useEffect(() => {
    redirect();
  }, [user]);

  const memoizedData = useMemo(
    () => ({
      user,
      accessToken,
      web3Provider,
      externalAccount,
      accessToken,
      login,
      logout,
      loggingIn,
      loading,
    }),
    [web3Auth, web3Provider, externalAccount, user, accessToken, loading, loggingIn]
  );
  console.log({ context: memoizedData });
  return <UserContext.Provider value={memoizedData} {...props} />;
}

function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserProvider`);
  }
  return context;
}

export { UserProvider, useUser };
