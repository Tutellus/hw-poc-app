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
  const [idToken, setIdToken] = useState(null)
  const data = useSession()

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
          web3AuthNetwork: "cyan",
          useCoreKitKey: false,
        })

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        })

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            loginConfig: {
              jwt: {
                verifier: "web3auth-custom-jwt",
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
        setWeb3authProvider(web3auth.provider)
        if (web3auth.connected) {
          setLoggedIn(true)
        }
      } catch (error) {
        console.error(error)
      }
    }

    init()
  }, [])

  const getExternalAccount = async (provider) => {
    const signer = await provider.getSigner()
    const account = await signer.getAddress()
    setExternalAccount(account)
  }

  useEffect(() => {
    if (web3authProvider && idToken) {
      const provider = new ethers.providers.Web3Provider(web3authProvider)
      setWeb3Provider(provider)
      getExternalAccount(provider)
    } else {
      setWeb3Provider(null)
      setExternalAccount(null)
      getIdToken()
    }
  }, [web3authProvider, idToken])

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
          id_token: idToken,
          verifierIdField: "sub",
          domain: "http://localhost:3000",
        },
      }
    )
    setLoggedIn(true)
    setWeb3authProvider(web3authProvider)
  }

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet")
      return
    }
    await web3auth.logout()
    setWeb3authProvider(null)
    setLoggedIn(false)
  }

  const getIdToken = async () => {
    console.log({ web3auth }, "getIDtoken")
    // setIdToken(data?.token)
  }

  const getUser = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet")
      return
    }
    const user = await web3auth?.getUserInfo()
    setUser(user)
  }

  useEffect(() => {
    if (loggedIn) {
      getUser()
    } else {
      setUser(null)
    }
  }, [loggedIn])

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
