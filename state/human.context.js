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
  deployHuman: async () => {},
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

  const signMessageFromOwner = async (message) =>
    await web3Provider.getSigner().signMessage(message)

  const loadPreUserOpsData = async () => {
    setLoadingPreUserOps(true)
    const response = await loadPreUserOps({ projectId, chainId, human, user })
    setPreUserOps(response)
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
    user,
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

  const getPreUserOpHash = async ({ preUserOpId }) => {
    const response = await fetch("/api/usecases/userOps/getPreUserOpHashUC", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preUserOpId,
        user,
      }),
    })
    const { hash } = await response.json()
    return hash
  }

  const confirmPreUserOp = async ({ preUserOpId, code }) => {
    const response = await fetch("/api/usecases/userOps/confirmPreUserOpUC", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preUserOpId,
        code,
        user,
      }),
    })
    const { preUserOp } = await response.json()
    loadPreUserOpsData()
    return preUserOp
  }

  const submitUserOp = async ({ preUserOpId, signature }) => {
    const response = await fetch("/api/usecases/userOps/submitUserOpUC", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preUserOpId,
        signature,
        user,
      }),
    })
    const { userOp } = await response.json()
    loadUserOpsData()
    return userOp
  }

  const deployHuman = async () => {
    if (user && externalAccount) {
      setLoadingDeployment(true)
      try {
        const response = await fetch("/api/usecases/humans/deployHumanUC", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            chainId,
            user,
            owner: externalAccount,
          }),
        })
        const { human } = await response.json()
        setHuman(human)
      } catch (error) {
        console.error(error)
      }
      setLoadingDeployment(false)
      loadHumanData()
    }
  }

  const signAndSubmitPreUserOp = async ({ preUserOpId }) => {
    setProcessing(true)
    // 2. gets hash of preUserOp if is valid
    const hash = await getPreUserOpHash({
      preUserOpId,
    })
    // 3. signs hash with owner account (includes master signature if required)
    const signature = await signMessageFromOwner(hash)
    // 4. submits preUserOp with signature
    await submitUserOp({
      preUserOpId,
      signature,
    })
    await loadPreUserOpsData()
    setProcessing(false)
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
      deployHuman,
      signMessageFromOwner,
      requestPreUserOp: getRequestPreUserOpData,
      getPreUserOpHash,
      submitUserOp,
      confirmPreUserOp,
      signAndSubmitPreUserOp,
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
