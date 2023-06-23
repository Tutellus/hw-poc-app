/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react"
import { useWeb3Auth } from "./web3auth.context"
import { HumanWalletSDK } from "@/sdk"

const HumanContext = createContext({
  address: null,
  human: null,
  preUserOps: [],
  processing: false,
  loadingHuman: false,
  loadingAddress: false,
  loadingPreUserOps: false,
  gettingProposals: false,
  loadingDeployment: false,
  signMessageFromOwner: async (message) => {},
  getPreUserOpHash: async ({ preUserOpId }) => {},
  submitUserOp: async ({ preUserOpId, signature }) => {},
  confirmProposal: async ({ preUserOpId, code }) => {},
  signAndSubmitProposal: async ({ preUserOpId }) => {},
})

const projectID = process.env.NEXT_PUBLIC_PROJECT_ID
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

function HumanProvider(props) {
  const { user, externalAccount, web3Provider, accessToken } = useWeb3Auth()
  const humanSDK = useMemo(
    () =>
      HumanWalletSDK.build({
        projectID,
        accessToken,
        provider: web3Provider,
        user,
      }),
    [web3Provider, accessToken]
  )

  // state
  const [address, setAddress] = useState(null)
  const [human, setHuman] = useState(null)
  const [preUserOps, setPreUserOps] = useState([])

  // loadings
  const [processing, setProcessing] = useState(false)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [loadingHuman, setLoadingHuman] = useState(false)
  const [loadingDeployment, setLoadingDeployment] = useState(false)
  const [gettingProposals, setGettingProposals] = useState(false)

  const signMessageFromOwnerData = async ({ message }) =>
    await humanSDK.signMessageFromOwner({ web3Provider, message })

  const loadHumanData = async () => {
    setLoadingHuman(true)
    const response = await humanSDK.loadHuman()
    setHuman(response)
    setLoadingHuman(false)
  }

  const getHumanAddressData = async () => {
    setLoadingAddress(true)
    const response = await humanSDK.getHumanAddress()
    setAddress(response?.address)
    setLoadingAddress(false)
  }

  const getProposalsData = async () => {
    setGettingProposals(true)
    const response = await humanSDK.getProposals({
      human,
    })
    setPreUserOps(response)
    setGettingProposals(false)
  }

  const requestProposalData = async ({
    projectId,
    title,
    calls,
    description,
    accessToken,
  }) => {
    const response = await humanSDK.requestProposal({
      projectId,
      title,
      calls,
      description,
      accessToken,
    })
    return response
  }

  const getPreUserOpHashData = async ({ proposalId, accessToken }) => {
    const response = await humanSDK.getPreUserOpHash({
      proposalId,
      accessToken,
    })
    return response
  }

  const signAndSubmitPreUserOpData = async ({
    proposalId,
    accessToken,
    web3Provider,
  }) => {
    setProcessing(true)
    const response = await humanSDK.signAndSubmitProposal({
      proposalId,
      accessToken,
      web3Provider,
    })
    setProcessing(false)
    return response
  }

  const submitUserOpData = async ({ preUserOpId, signature, user }) => {
    const response = await humanSDK.submitUserOp({
      preUserOpId,
      signature,
      user,
    })
    loadUserOpsData()
    return response
  }

  const confirmProposalData = async ({ preUserOpId, code }) => {
    const response = await humanSDK.confirmProposal({
      preUserOpId,
      code,
      user,
    })
    return response
  }

  const deployHumanData = async () => {
    setLoadingDeployment(true)
    const response = await humanSDK.deployHuman({
      projectId,
      owner: externalAccount,
      accessToken,
    })

    setLoadingDeployment(false)
    setHuman(response)
    loadHumanData()
  }

  useEffect(() => {
    getProposalsData()
    const interval = setInterval(() => {
      getProposalsData()
    }, 5000)
    return () => clearInterval(interval)
  }, [human])

  useEffect(() => {
    getHumanAddressData()
    loadHumanData()
    const interval = setInterval(() => {
      getHumanAddressData()
      loadHumanData()
    }, 5000)
    return () => clearInterval(interval)
  }, [user])

  const memoizedData = useMemo(
    () => ({
      address,
      human,
      preUserOps,
      processing,
      loadingAddress,
      loadingHuman,
      loadingDeployment,
      gettingProposals,
      deployHuman: deployHumanData,
      signMessageFromOwner: signMessageFromOwnerData,
      requestProposal: requestProposalData,
      getPreUserOpHash: getPreUserOpHashData,
      submitUserOp: submitUserOpData,
      confirmProposal: confirmProposalData,
      signAndSubmitProposal: signAndSubmitPreUserOpData,
    }),
    [
      address,
      human,
      preUserOps,
      processing,
      loadingAddress,
      loadingHuman,
      loadingDeployment,
      gettingProposals,
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
