/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react"
import { HumanWalletSDK } from "@tutellus/humanwalletsdk"
import { useSession } from "next-auth/react"
import { tokens } from "@/config"
import { useWeb3Auth } from "./web3auth.context"

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

function activateLogger() {
  localStorage.setItem("debug", "hw:index,hw:monitor")
}

function HumanProvider(props) {
  const { web3Provider } = useWeb3Auth()
  const { data: session } = useSession()
  const { accessToken } = session || {}

  const [connected, setConnected] = useState(false)
  const [human, setHuman] = useState(null)
  const [proposals, setProposals] = useState([])
  const [loadingProposals, setLoadingProposals] = useState(false)
  const [processingProposal, setProcessingProposal] = useState(false)
  const [subgraphStatus, setSubgraphStatus] = useState(null)
  const [balances, setBalances] = useState(null)
  const [updateDate, setUpdateDate] = useState(Date.now())
  const [eventsProposals, setEventsProposals] = useState([])

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

  const getSubgraphStatus = async () => {
    const response = await humanSDK.getSubgraphStatus()
    setSubgraphStatus(response)
  }

  const onHumanStatus = (human) => {
    if (humanSDK.isReady()) {
      setHuman(human)
      loadProposals()
      getSubgraphStatus()
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
    const events = humanSDK.events()

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
    if (web3Provider && accessToken) {
      if (!connected) {
        setConnected(true)
        humanSDK.connect({
          provider: web3Provider,
          accessToken,
        })
      }
    }
  }, [web3Provider, accessToken, connected, setConnected])

  const memoizedData = useMemo(
    () => ({
      human,
      humanSDK,
      balances,
      proposals,
      loadingProposals,
      processingProposal,
      requestProposal,
      confirmProposal,
      getTokensBalance,
      subgraphStatus,
      eventsProposals,
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
