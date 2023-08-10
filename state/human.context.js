/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react"
import { HumanWalletSDK } from "@tutellus/humanwalletsdk"
import { useSession } from "next-auth/react"
// import { useMagicLink } from "./magicLink.context";
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

function HumanProvider(props) {
  const { web3Provider } = useWeb3Auth()
  const { data: session } = useSession()
  const { accessToken, user } = session || {}

  const [humanSDK, setHumanSDK] = useState(null)
  const [human, setHuman] = useState(null)
  const [proposals, setProposals] = useState([])
  const [currentProposal, setCurrentProposal] = useState(null)
  const [loadingProposals, setLoadingProposals] = useState(false)
  const [processingProposal, setProcessingProposal] = useState(false)
  const [subgraphStatus, setSubgraphStatus] = useState(null)

  const loadProposals = async () => {
    setLoadingProposals(true)
    const response = await humanSDK.getProposals()
    setProposals(response)
    setLoadingProposals(false)
  }

  const requestProposal = async ({ title, description, calls }) => {
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

  const getTokensBalance = async (tokens) => {
    if (!human) return

    try {
      const balances = await humanSDK.getTokensBalance({
        tokens: tokens.map(({ token, type, ids }) => ({
          token,
          type,
          ids,
        })),
        address: human.address,
      })
      return balances
    } catch (error) {
      console.error("Invalid tokens balance request", error)
    }
  }

  useEffect(() => {
    if (web3Provider && accessToken) {
      console.log("Building HumanWalletSDK")
      const humanSDK = HumanWalletSDK.build({
        uri,
        projectId,
        accessToken,
        provider: web3Provider,
        options: {
          MAX_RETRIES: 50,
          INTERVAL: 5000,
        },
      })

      setHumanSDK(humanSDK)
    }
  }, [web3Provider, accessToken])

  useEffect(() => {
    if (!humanSDK) return
    humanSDK.events().on("humanStatus", async (human) => {
      const response = await humanSDK.getSubgraphStatus()
      setSubgraphStatus(response)
      console.log(
        "\n>>>>>>\n HUMAN STATUS:",
        {
          ADDRESS: human.address,
          STATUS: human.status,
          IS_READY: humanSDK.isReady(),
        },
        "\n",
        "\n>>>>>>\n"
      )
      if (humanSDK.isReady()) {
        console.log("\n>>>>>>\n HUMAN IS READY:", human, "\n>>>>>>\n")
        setHuman(human)
        loadProposals()
      }
    })
  }, [humanSDK, proposals, human])

  useEffect(() => {
    if (!humanSDK) return
    humanSDK.events().on("proposalUpdate", async ({ proposal }) => {
      const response = await humanSDK.getSubgraphStatus()
      setSubgraphStatus(response)
      if (proposal.status === "PENDING") {
        // await humanSDK.confirmProposal({
        //   proposalId: proposal._id,
        //   code: "123456",
        // })
      }
      if (proposal.status === "PROCESSED") {
        console.log("proposalUpdate = PROPOSAL IS", proposal.status)
      }

      if (proposal.status === "EXECUTED") {
        console.log("proposalUpdate", proposal.status, proposal.txHash)
      }

      if (proposal.status === "CONFIRMED") {
        console.log("proposalUpdate", proposal.status, proposal.txHash)
        loadProposals()
      }
    })
  }, [humanSDK, proposals])

  const memoizedData = useMemo(
    () => ({
      humanSDK,
      human,
      proposals,
      currentProposal,
      loadingProposals,
      processingProposal,
      requestProposal,
      confirmProposal,
      getTokensBalance,
      subgraphStatus,
    }),
    [
      humanSDK,
      human,
      proposals,
      currentProposal,
      loadingProposals,
      processingProposal,
      subgraphStatus,
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
