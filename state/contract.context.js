/* eslint-disable react-hooks/exhaustive-deps */
import { ethers } from "ethers"
import { createContext, useContext, useState, useMemo, useEffect } from "react"
import { useHuman } from "./human.context"
import { useWeb3Auth } from "./web3auth.context"
import { config, contractSDK } from "@/sdk"

const { CONTRACT } = config
const { checkContractAddress, checkContractData } = contractSDK

const ContractContext = createContext({
  loadingContract: false,
  contract: null,
  balance: "0.0",
  updatingPolicies: false,
  fullApprovedOwner: false,
  functionApprovedOwner: false,
  getBalance: async () => {},
  getContract: async () => {},
  updateContract: async () => {},
  checkContractAddress: async () => {},
  checkContractData: async () => {},
  updateAddressStatus: async (status) => {},
  updateMask: async () => {},
  updateFunctionStatus: async (status) => {},
})

function ContractProvider(props) {
  const { projectId, chainId } = useWeb3Auth()
  const { address } = useHuman()
  const [loadingContract, setLoadingContract] = useState(false)
  const [contract, setContract] = useState(null)

  const [loadingBalance, setLoadingBalance] = useState(false)
  const [balance, setBalance] = useState("---")

  const [updatingPolicies, setUpdatingPolicies] = useState(false)
  const [fullApprovedOwner, setFullApprovedOwner] = useState(false)
  const [functionApprovedOwner, setFunctionApprovedOwner] = useState(false)

  const getBalance = async () => {
    try {
      setLoadingBalance(true)
      const response = await fetch("/api/usecases/tokens/getTokenBalanceUC", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chainId: CONTRACT.chainId,
          token: CONTRACT.address,
          address: address,
        }),
      })
      const { balance: innerBalance } = await response.json()
      setBalance(innerBalance)
      setLoadingBalance(false)
    } catch (error) {
      console.error(error)
    }
  }

  const getContract = async () => {
    try {
      setLoadingContract(true)
      const filter = {
        address: CONTRACT.address,
        chainId: CONTRACT.chainId,
      }
      const response = await fetch("/api/usecases/contracts/getContractUC", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filter }),
      })
      const { contract: innerContract } = await response.json()
      setContract(innerContract)
      setLoadingContract(false)
    } catch (error) {
      console.error(error)
    }
  }

  const updateContract = async () => {
    try {
      setLoadingContract(true)

      const params = {
        address: CONTRACT.address,
        abi: CONTRACT.abi,
        chainId: CONTRACT.chainId,
      }

      const response = await fetch("/api/usecases/contracts/updateContractUC", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
      const { contract: innerContract } = await response.json()
      setContract(innerContract)
    } catch (error) {
      console.error(error)
    }
    setLoadingContract(false)
  }

  const checkContractAddressData = async () => {
    const response = await checkContractAddress(CONTRACT)
    response ? setFullApprovedOwner(response) : setFullApprovedOwner(false)
  }

  const checkContractDataFunction = async () => {
    const response = await checkContractData(CONTRACT)
    response
      ? setFunctionApprovedOwner(response)
      : setFunctionApprovedOwner(false)
  }

  const updateAddressStatus = async (status) => {
    try {
      setUpdatingPolicies(true)
      await fetch("/api/usecases/policies/updateAddressStatusUC", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          chainId: CONTRACT.chainId,
          address: CONTRACT.address,
          status,
        }),
      })
      checkContractAddress()
      setUpdatingPolicies(false)
    } catch (error) {
      console.error(error)
    }
  }

  const updateMask = async () => {
    try {
      const selector = new ethers.utils.Interface(CONTRACT.abi).getSighash(
        "mint"
      )
      const mask = ethers.utils.solidityPack(["uint32"], ["0xffffffff"])

      const { mask: checkMask } = await fetch(
        "/api/usecases/policies/getMaskUC",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chainId: CONTRACT.chainId,
            address: CONTRACT.address,
            method: "mint",
          }),
        }
      ).then((res) => res.json())

      if (checkMask === mask) {
        return
      }

      await fetch("/api/usecases/policies/updateMaskUC", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          chainId,
          address: CONTRACT.address,
          selector,
          mask,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const updateFunctionStatus = async (status) => {
    setUpdatingPolicies(true)
    await updateMask()
    const selector = new ethers.utils.Interface(CONTRACT.abi).getSighash("mint")
    const selectorAndParams = ethers.utils.solidityPack(["bytes4"], [selector])

    try {
      await fetch("/api/usecases/policies/updateFunctionStatusUC", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chainId: CONTRACT.chainId,
          address: CONTRACT.address,
          selectorAndParams,
          status,
        }),
      })
    } catch (error) {
      console.error(error)
    }

    checkContractAddress()
    setUpdatingPolicies(false)
  }

  useEffect(() => {
    getContract()
  }, [chainId])

  useEffect(() => {
    if (!contract) return
    checkContractAddress()
    checkContractDataFunction()

    const interval = setInterval(() => {
      checkContractAddress()
      checkContractDataFunction()
    }, 5000)
    return () => clearInterval(interval)
  }, [contract, updatingPolicies])

  useEffect(() => {
    if (!address) return
    getBalance()
    const interval = setInterval(() => {
      getBalance()
    }, 5000)
    return () => clearInterval(interval)
  }, [address])

  const memoizedData = useMemo(
    () => ({
      loadingBalance,
      loadingContract,
      contract,
      balance,
      updatingPolicies,
      fullApprovedOwner,
      functionApprovedOwner,
      getBalance,
      getContract,
      updateContract,
      checkContractAddress: checkContractAddressData,
      checkContractData: checkContractDataFunction,
      updateAddressStatus,
      updateMask,
      updateFunctionStatus,
    }),
    [
      loadingContract,
      contract,
      balance,
      updatingPolicies,
      fullApprovedOwner,
      functionApprovedOwner,
    ]
  )

  return <ContractContext.Provider value={memoizedData} {...props} />
}

function useContract() {
  const context = useContext(ContractContext)
  if (context === undefined) {
    throw new Error(`useContract must be used within a ContractProvider`)
  }
  return context
}

export { ContractProvider, useContract }
