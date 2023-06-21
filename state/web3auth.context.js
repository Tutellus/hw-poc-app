/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { useSession } from "next-auth/react";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ethers } from "ethers";

const WEB3AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
const WEB3AUTH_CUSTOMAUTH = process.env.NEXT_PUBLIC_WEB3AUTH_CUSTOMAUTH;
const WEB3AUTH_NETWORK = process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK;

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;

const Web3AuthContext = createContext({
  web3Provider: null,
  externalAccount: null,
  loggedIn: false,
  login: () => {},
  logout: () => {},
  redirect: () => {},
});

function Web3AuthProvider(props) {
  const [web3auth, setWeb3auth] = useState(null);
  const [web3authProvider, setWeb3authProvider] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [externalAccount, setExternalAccount] = useState(null);
  const [user, setUser] = useState(null);
  const { data } = useSession();
  const accessToken = data?.accessToken;
  const web3authStatus = web3auth?.status;

  // Initialize Web3Auth
  useEffect(() => {
    const init = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: CHAIN_ID,
          rpcTarget: "https://rpc.ankr.com/polygon_mumbai",
          displayName: "Mumbai Testnet",
          blockExplorer: "https://mumbai.polygonscan.com/",
          ticker: "MATIC",
          tickerName: "Matic",
        };
        const web3auth = new Web3AuthNoModal({
          clientId: WEB3AUTH_CLIENT_ID,
          chainConfig,
          web3AuthNetwork: WEB3AUTH_NETWORK,
          useCoreKitKey: false,
        });

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            loginConfig: {
              jwt: {
                verifier: WEB3AUTH_CUSTOMAUTH,
                typeOfLogin: "jwt",
                clientId: WEB3AUTH_CLIENT_ID,
              },
            },
          },
          privateKeyProvider,
        });
        web3auth.configureAdapter(openloginAdapter);
        setWeb3auth(web3auth);

        await web3auth.init();
        if (web3auth.connected) {
          setWeb3authProvider(web3auth.provider);
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const getExternalAccount = async (provider) => {
    const signer = await provider.getSigner();
    const account = await signer.getAddress();
    setExternalAccount(account);
  };

  useEffect(() => {
    if (web3authProvider && accessToken) {
      const provider = new ethers.providers.Web3Provider(web3authProvider);
      setWeb3Provider(provider);
      getExternalAccount(provider);
    } else {
      setWeb3Provider(null);
      setExternalAccount(null);
    }
  }, [web3authProvider, accessToken]);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }

    try {
      console.log("LOGIN", { accessToken });
      const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
        loginProvider: "jwt",
        extraLoginOptions: {
          id_token: accessToken,
          verifierIdField: "sub",
          domain: "http://localhost:3000",
        },
      });
      console.log("LOGIN OK", { web3authProvider });
      setLoggedIn(true);
      setWeb3authProvider(web3authProvider);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (accessToken && web3authStatus === "ready") login();
  }, [web3authStatus, accessToken]);

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setWeb3authProvider(null);
    setLoggedIn(false);
  };

  const getUser = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth?.getUserInfo();
    setUser(user);
  };

  useEffect(() => {
    if (loggedIn) {
      getUser();
    } else {
      setUser(null);
    }
  }, [loggedIn]);

  console.log({ web3authStatus, loggedIn, accessToken, web3Provider, user, externalAccount });
  
  const memoizedData = useMemo(
    () => ({
      web3Provider,
      externalAccount,
      user,
      loggedIn,
      login,
      logout,
    }),
    [web3Provider, externalAccount, user, loggedIn]
  );

  return <Web3AuthContext.Provider value={memoizedData} {...props} />;
}

function useWeb3Auth() {
  const context = useContext(Web3AuthContext);
  if (context === undefined) {
    throw new Error(`useWeb3Auth must be used within a Web3AuthProvider`);
  }
  return context;
}

export { Web3AuthProvider, useWeb3Auth };
