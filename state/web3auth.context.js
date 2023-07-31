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
  const [web3authProvider, setWeb3authProvider] = useState(null)
  const [web3Provider, setWeb3Provider] = useState(null)
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
          rpcTarget: "https://rpc.ankr.com/polygon_mumbai",
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
            clientId: WEB3AUTH_CLIENT_ID,
            network: "testnet",
            uxMode: "popup",
            whiteLabel: {
              name: "HumanWallet",
              logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
              logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
              defaultLanguage: "en",
              dark: true, // whether to enable dark mode. defaultValue: false
            },
            loginConfig: {
              jwt: {
                name: "Web3Auth-Auth0-JWT",
                verifier: WEB3AUTH_CUSTOMAUTH,
                typeOfLogin: "jwt",
                clientId: WEB3AUTH_CLIENT_ID,
              },
            },
          },
          privateKeyProvider,
        })

        web3auth.configureAdapter(openloginAdapter)
        setWeb3auth(web3auth)

        await web3auth.init()
        if (web3auth.connected) {
          setWeb3authProvider(web3auth.provider)
          setLoggedIn(true)
        }
      } catch (error) {
        console.error(error)
      }
    }

    init()
  }, [])

  const PRIV_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY
  const RPC_URL = "https://rpc.ankr.com/polygon_mumbai"

  const ProviderMock = (privateKey, rpcUrl) => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const signer = new ethers.Wallet(privateKey).connect(provider)

    return {
      getSigner: () => signer,
    }
  }

  const init = async (hash) => {
    const provider = ProviderMock(PRIV_KEY, RPC_URL)
    setWeb3Provider(provider)

    const signer = provider.getSigner()
    const signature = await signer._signingKey(hash)
    console.log("\n>>>>>>\n SIGNATURE:", signature, "\n>>>>>>\n")
    const account = await signer.address
    setExternalAccount(account)
    console.log("\n>>>>>>\n ACCOUNT:", account, "\n>>>>>>\n")

    return `${account}:${signature}`
  }

  useEffect(() => {
    if (accessToken) {
      init(process.argv[2]).then(console.log)
    }
  }, [accessToken])

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet")
      return
    }
    setLoggedIn(true)
    setWeb3authProvider(web3authProvider)
  }

  useEffect(() => {
    if (accessToken && web3authStatus === "ready") login()
  }, [web3authStatus, accessToken])

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
    const user = data?.user
    console.log("USER", { user })
    setUser(user)
  }

  useEffect(() => {
    getUser()
  }, [loggedIn, accessToken])

  const memoizedData = useMemo(
    () => ({
      web3Provider,
      externalAccount,
      user,
      accessToken,
      loggedIn,
      login,
      logout,
    }),
    [web3Provider, externalAccount, user, loggedIn]
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
