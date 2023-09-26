/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react"
import { HumanWalletSDK, ProviderMock } from "@tutellus/humanwalletsdk"
import { useSession } from "next-auth/react"
import { tokens } from "@/config"
import { Web3AuthNoModal } from "@web3auth/no-modal"
import { OpenloginAdapter } from "@web3auth/openlogin-adapter"
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { ethers } from "ethers"

const WEB3AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const WEB3AUTH_CUSTOMAUTH = process.env.NEXT_PUBLIC_WEB3AUTH_CUSTOMAUTH
const WEB3AUTH_NETWORK = process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK
const RPC_URL = "https://polygon-mumbai-bor.publicnode.com"

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: CHAIN_ID,
  rpcTarget: RPC_URL,
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
      defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
      dark: true, // whether to enable dark mode. defaultValue: false
      theme: {
        primary: "#DDDDDD",
      },
    },
  },
  privateKeyProvider,
})

web3auth.configureAdapter(openloginAdapter)

const HumanContext = createContext({
  humanSDK: null,
  human: null,
  proposals: [],
  loadingProposals: false,
  processingProposal: false,
  requestProposal: async () => {},
  confirmProposal: async () => {},
  getTokensBalance: async () => {},
})

const uri = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

// We build the HumanWalletSDK instance here
const humanSDK = HumanWalletSDK.build({
  uri,
  projectId,
  options: {
    MAX_RETRIES: 50,
    INTERVAL: 5000,
  },
})

const events = humanSDK.events()

function activateLogger() {
  localStorage.setItem("debug", "hw:index,hw:monitor")
}

function HumanProvider(props) {
  const { data: session } = useSession()
  const { accessToken } = session?.user || {}
  const [connected, setConnected] = useState(false)
  const [human, setHuman] = useState(null)
  const [proposals, setProposals] = useState([])
  const [loadingProposals, setLoadingProposals] = useState(false)
  const [processingProposal, setProcessingProposal] = useState(false)
  const [subgraphStatus, setSubgraphStatus] = useState(null)
  const [balances, setBalances] = useState(null)
  const [updateDate, setUpdateDate] = useState(Date.now())
  const [eventsProposals, setEventsProposals] = useState([])
  const [activeProvider, setActiveProvider] = useState("mock")
  const [mockedProvider, setMockedProvider] = useState(undefined)

  const mockedProviderConnect = () => {
    const providerMock = ProviderMock.build({
      key: localStorage.getItem("key") || "0x000000",
      rpcUrl: RPC_URL,
    })

    const provider = providerMock.getProvider()
    return provider
  }

  const web3authConnect = async () => {
    if (!accessToken) return
    if (web3auth.status !== "ready") {
      await web3auth.init()
    }

    let provider
    if (web3auth.connected) {
      provider = new ethers.providers.Web3Provider(web3auth.provider)
    } else {
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
      provider = new ethers.providers.Web3Provider(web3authProvider)
    }
    return provider
  }

  const login = async () => {
    if (!accessToken) return
    let provider
    if (activeProvider === "web3auth") {
      provider = await web3authConnect()
    } else {
      provider = mockedProviderConnect()
    }

    humanSDK.connect({
      provider,
      accessToken,
    })

    setConnected(true)
  }

  const logout = async () => {
    if (!web3auth.connected) {
      return
    }
    await web3auth.logout()
    setLoggedIn(false)
  }

  const loadProposals = async () => {
    if (!humanSDK.isReady()) return
    setLoadingProposals(true)
    const response = await humanSDK.getProposals()
    setProposals(response)
    setLoadingProposals(false)
  }

  const requestProposal = async ({ title, description, calls }) => {
    if (!humanSDK.isReady()) return
    setProcessingProposal(true)
    let response
    try {
      response = await humanSDK.requestProposal({
        title,
        calls,
        description,
      })
    } catch (error) {
      console.error("Invalid proposal request", error)
    }
    setProcessingProposal(false)
    loadProposals()
    return response
  }

  const confirmProposal = async ({ proposalId, code }) => {
    if (!humanSDK.isReady()) return
    setProcessingProposal(true)
    let response
    try {
      response = await humanSDK.confirmProposal({ proposalId, code })
    } catch (error) {
      console.error("Invalid proposal confirmation", error)
    }
    setProcessingProposal(false)
    loadProposals()
    return response
  }

  const getTokensBalance = async () => {
    if (!humanSDK.isReady()) {
      return
    }
    const balances = await humanSDK.getTokensBalance({
      tokens: tokens?.map(({ token, type, ids }) => ({
        token,
        type,
        ids,
      })),
      address: human?.address,
    })
    return balances
  }

  const onHumanStatus = (human) => {
    if (humanSDK.isReady()) {
      setHuman(human)
      loadProposals()
      activateLogger()
    }
  }

  const onProposalEventShowLog =
    (event) =>
    ({ proposal, proposals, context }) => {
      loadProposals()
    }

  const onConfirmReloadBalance = async ({ proposal }) => {
    setUpdateDate(Date.now())
  }

  const updateBalance = async () => {
    const balances = await getTokensBalance()
    if (!balances) return
    setBalances(balances)
  }

  useEffect(() => {
    if (!humanSDK.isReady()) return
    updateBalance()
  }, [updateDate, humanSDK.isReady()])

  useEffect(() => {
    events.on("humanStatus", onHumanStatus)
    events.on("statusUpdate", ({ proposals }) => {
      const reversed = proposals.sort((a, b) => a.nonce - b.nonce)
      setEventsProposals(reversed)
    })

    events.on("proposalPending", onProposalEventShowLog("proposalPending"))
    events.on("proposalProcessed", onProposalEventShowLog("proposalProcessed"))
    events.on("proposalExecuted", onProposalEventShowLog("proposalExecuted"))
    events.on("proposalExecuting", onProposalEventShowLog("proposalExecuting"))
    events.on("proposalConfirmed", onProposalEventShowLog("proposalConfirmed"))
    events.on("proposalReverted", onProposalEventShowLog("proposalReverted"))

    events.on("proposalConfirmed", onConfirmReloadBalance)

    return () => {
      events.removeAllListeners()
    }
  }, [])

  useEffect(() => {
    login()
    setActiveProvider(localStorage.getItem("provider") || "mock")
  }, [accessToken])

  const memoizedData = useMemo(
    () => ({
      connected,
      human,
      humanSDK,
      balances,
      proposals,
      loadingProposals,
      processingProposal,
      subgraphStatus,
      eventsProposals,
      requestProposal,
      confirmProposal,
      getTokensBalance,
      login,
      logout,
    }),
    [
      humanSDK,
      human,
      balances,
      proposals,
      loadingProposals,
      processingProposal,
      subgraphStatus,
      eventsProposals,
    ]
  )

  return <HumanContext.Provider value={memoizedData} {...props} />
}

function useHuman() {
  const context = useContext(HumanContext)
  if (context === undefined) {
    throw new Error(`useHuman must be used within a HumanProvider`)
  }
  return context
}

export { HumanProvider, useHuman }
