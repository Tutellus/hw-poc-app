/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react"
import { useWeb3Auth } from "./web3auth.context"
import { humanSDK } from "@/sdk"
import { set } from "lodash"

const HumanContext = createContext({
  address: null,
  human: null,
  preUserOps: [],
  userOps: [],
  processing: false,
  loadingHuman: false,
  loadingAddress: false,
  loadingPreUserOps: false,
  loadingUserOps: false,
  loadingDeployment: false,
  signMessageFromOwner: async (message) => {},
  requestPreUserOp: async ({ contractId, method, params, value }) => {},
  getPreUserOpHash: async ({ preUserOpId }) => {},
  submitUserOp: async ({ preUserOpId, signature }) => {},
  confirmPreUserOp: async ({ preUserOpId, code }) => {},
  signAndSubmitPreUserOp: async ({ preUserOpId }) => {},
})

function HumanProvider(props) {
  const { chainId, projectId, user, externalAccount, web3Provider } =
    useWeb3Auth()

  const {
    requestPreUserOp,
    loadPreUserOps,
    loadHumanAddress,
    loadUserOps,
    loadHuman,
    signAndSubmitPreUserOp,
    getPreUserOpHash,
    submitUserOp,
    signMessageFromOwner,
    confirmPreUserOp,
    deployHuman,
  } = humanSDK

  // state
  const [address, setAddress] = useState(null)
  const [human, setHuman] = useState(null)
  const [preUserOps, setPreUserOps] = useState([])
  const [userOps, setUserOps] = useState([])

  // loadings
  const [processing, setProcessing] = useState(false)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [loadingHuman, setLoadingHuman] = useState(false)
  const [loadingDeployment, setLoadingDeployment] = useState(false)
  const [loadingPreUserOps, setLoadingPreUserOps] = useState(false)
  const [loadingUserOps, setLoadingUserOps] = useState(false)

  const signMessageFromOwnerData = async ({ message }) =>
    await signMessageFromOwner({ web3Provider, message })

  const loadPreUserOpsData = async () => {
    setLoadingPreUserOps(true)
    const response = await loadPreUserOps({ projectId, chainId, human, user })
    setPreUserOps(response)
    setLoadingPreUserOps(false)
  }

  const loadHumanData = async () => {
    setLoadingHuman(true)
    const response = await loadHuman({ projectId, chainId, user })
    setHuman(response)
    setLoadingHuman(false)
  }

  const loadHumanAddressData = async () => {
    setLoadingAddress(true)
    const response = await loadHumanAddress({ projectId, chainId, user })
    setAddress(response)
    setLoadingAddress(false)
  }

  const loadUserOpsData = async () => {
    setLoadingUserOps(true)
    const response = await loadUserOps({ projectId, chainId, human, user })
    setUserOps(response)
    setLoadingUserOps(false)
  }

  const getRequestPreUserOpData = async ({
    projectId,
    chainId,
    address,
    method,
    params,
    value,
  }) => {
    const response = await requestPreUserOp({
      projectId,
      chainId,
      address,
      method,
      params,
      value,
      user,
    })
    loadPreUserOpsData()
    return response
  }

  const signAndSubmitPreUserOpData = async ({ preUserOpId }) => {
    setProcessing(true)
    const response = await signAndSubmitPreUserOp({
      web3Provider,
      preUserOpId,
      user,
    })
    loadPreUserOpsData()
    setProcessing(false)
    return response
  }

  const submitUserOpData = async ({ preUserOpId, signature, user }) => {
    const response = await submitUserOp({
      preUserOpId,
      signature,
      user,
    })
    loadUserOpsData()
    return response
  }

  const confirmPreUserOpData = async ({ preUserOpId, code }) => {
    const response = await confirmPreUserOp({
      preUserOpId,
      code,
      user,
    })
    loadPreUserOpsData()
    return response
  }

  const deployHumanData = async () => {
    setLoadingDeployment(true)
    const response = await deployHuman({
      projectId,
      chainId,
      user,
      externalAccount,
    })

    setLoadingDeployment(false)
    setHuman(response)
    loadHumanData()
  }

  useEffect(() => {
    loadPreUserOpsData()
    loadUserOpsData()
    const interval = setInterval(() => {
      loadPreUserOpsData()
      loadUserOpsData()
    }, 5000)
    return () => clearInterval(interval)
  }, [human])

  useEffect(() => {
    loadHumanAddressData()
    loadHumanData()
    const interval = setInterval(() => {
      loadHumanAddressData()
      loadHumanData()
    }, 5000)
    return () => clearInterval(interval)
  }, [user])

  const memoizedData = useMemo(
    () => ({
      address,
      human,
      preUserOps,
      userOps,
      processing,
      loadingAddress,
      loadingHuman,
      loadingDeployment,
      loadingPreUserOps,
      loadingUserOps,
      deployHuman: deployHumanData,
      signMessageFromOwner: signMessageFromOwnerData,
      requestPreUserOp: getRequestPreUserOpData,
      getPreUserOpHash,
      submitUserOp: submitUserOpData,
      confirmPreUserOp: confirmPreUserOpData,
      signAndSubmitPreUserOp: signAndSubmitPreUserOpData,
    }),
    [
      address,
      human,
      preUserOps,
      userOps,
      processing,
      loadingAddress,
      loadingHuman,
      loadingDeployment,
      loadingPreUserOps,
      loadingUserOps,
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
