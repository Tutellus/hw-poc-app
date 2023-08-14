/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react"
import { Web3AuthNoModal } from "@web3auth/no-modal"
import { OpenloginAdapter } from "@web3auth/openlogin-adapter"
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base"
import { useSession } from "next-auth/react"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { ethers } from "ethers"

const WEB3AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const WEB3AUTH_CUSTOMAUTH = process.env.NEXT_PUBLIC_WEB3AUTH_CUSTOMAUTH
const WEB3AUTH_NETWORK = process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK

const Web3AuthContext = createContext({
  web3Provider: null,
  externalAccount: null,
  loggedIn: false,
  login: () => {},
  logout: () => {},
  redirect: () => {},
})

function Web3AuthProvider(props) {
  const [web3auth, setWeb3auth] = useState(null)
  const [provider, setProvider] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [externalAccount, setExternalAccount] = useState(null)
  const [user, setUser] = useState(null)
  const { data } = useSession()
  const accessToken = data?.accessToken
  const web3authStatus = web3auth?.status

  // Initialize Web3Auth
  useEffect(() => {
    const init = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: CHAIN_ID,
          rpcTarget: "https://endpoints.omniatech.io/v1/matic/mumbai/public",
          displayName: "Mumbai Testnet",
          blockExplorer: "https://mumbai.polygonscan.com/",
          ticker: "MATIC",
          tickerName: "Matic",
        }

        const web3auth = new Web3AuthNoModal({
          clientId: WEB3AUTH_CLIENT_ID,
          chainConfig,
          web3AuthNetwork: WEB3AUTH_NETWORK,
          useCoreKitKey: false,
        })

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        })

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            uxMode: "redirect",
            loginConfig: {
              jwt: {
                verifier: WEB3AUTH_CUSTOMAUTH,
                typeOfLogin: "jwt",
                clientId: WEB3AUTH_CLIENT_ID,
              },
            },
            whiteLabel: {
              name: "Human Wallet",
              url: "https://www.tutellus.com/",
              logoLight:
                "https://d1ddeojt5lrj1t.cloudfront.net/images/tutellus-logo-large.png",
              logoDark:
                "https://d1ddeojt5lrj1t.cloudfront.net/images/tutellus-logo-large.png",
              defaultLanguage: "es", // en, de, ja, ko, zh, es, fr, pt, nl
              dark: false, // whether to enable dark mode. defaultValue: false
              theme: {
                primary: "#2020df",
              },
            },
          },
          privateKeyProvider,
        })

        web3auth.configureAdapter(openloginAdapter)

        await web3auth.init()
        setWeb3auth(web3auth)

        if (web3auth.connected) {
          const provider = new ethers.providers.Web3Provider(web3auth.provider)
          setProvider(provider)
        }
      } catch (error) {
        console.error(error)
      }
    }

    init()
  }, [])

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet")
      return
    }

    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: "jwt",
        extraLoginOptions: {
          id_token: accessToken,
          verifierIdField: "sub",
          domain: "http://localhost:3000",
        },
      }
    )
    const provider = new ethers.providers.Web3Provider(web3authProvider)

    setLoggedIn(true)
    setProvider(provider)
  }

  useEffect(() => {
    if (accessToken && web3authStatus === "ready") login()
  }, [web3authStatus, accessToken])

  useEffect(() => {
    if (provider) {
      const getExternalAccount = async () => {
        const signer = provider.getSigner()
        const externalAccount = await signer.getAddress()
        setExternalAccount(externalAccount)
      }
      getExternalAccount()
    } else {
      setExternalAccount(null)
    }
  }, [provider])

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet")
      return
    }
    await web3auth.logout()
    setWeb3authProvider(null)
    setLoggedIn(false)
  }

  const getUser = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet")
      return
    }
    const user = data.user
    setUser(user)
  }

  useEffect(() => {
    if (loggedIn) getUser()
  }, [loggedIn, accessToken])

  const memoizedData = useMemo(
    () => ({
      web3Provider: provider,
      externalAccount,
      user,
      accessToken,
      loggedIn,
      login,
      logout,
    }),
    [provider, externalAccount, user, loggedIn]
  )

  return <Web3AuthContext.Provider value={memoizedData} {...props} />
}

function useWeb3Auth() {
  const context = useContext(Web3AuthContext)
  if (context === undefined) {
    throw new Error(`useWeb3Auth must be used within a Web3AuthProvider`)
  }
  return context
}

export { Web3AuthProvider, useWeb3Auth }
