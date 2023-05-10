/* eslint-disable react-hooks/exhaustive-deps */
import { ethers } from "ethers";
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useHuman } from "./human.context";

const CHAIN_ID = '0x13881';
const PROJECT_ID = "63d3c3a83d55158bfb36d502";
const CONTRACT = {
  chainId: '0x13881',
  address: '0x2CEDFf179BF88F7B4b1FFF9ca6d53393E956B74F',
  abi: [
    "function mint(address to, uint256 amount) public",
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function decimals() public view returns (uint8)",
  ],
};

const TOKEN_ADDRESS = CONTRACT.address;
const TOKEN_ABI = CONTRACT.abi;

const ContractContext = createContext({
  loadingContract: false,
  contract: null,
  balance: '0.0',
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
});

function ContractProvider(props) {
  
  const { address } = useHuman();
  const [loadingContract, setLoadingContract] = useState(false);
  const [contract, setContract] = useState(null);

  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balance, setBalance] = useState('---');

  const [updatingPolicies, setUpdatingPolicies] = useState(false);
  const [fullApprovedOwner, setFullApprovedOwner] = useState(false);
  const [functionApprovedOwner, setFunctionApprovedOwner] = useState(false);

  const getBalance = async () => {
    try {
      setLoadingBalance(true)
      const response = await fetch('/api/usecases/tokens/getTokenBalanceUC', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chainId: CHAIN_ID,
          token: TOKEN_ADDRESS,
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
        address: TOKEN_ADDRESS,
        chainId: CHAIN_ID,
      };
      const response = await fetch('/api/usecases/contracts/getContractUC', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        chainId: CHAIN_ID,
      }
  
      const response = await fetch('/api/usecases/contracts/updateContractUC', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const checkContractAddress = async () => {
    try {
      const result = await fetch('/api/usecases/policies/checkContractAddressUC', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contract._id,
        }),
      })
      const { response } = await result.json()
      setFullApprovedOwner(response)
    } catch (error) {
      console.error(error)
      setFullApprovedOwner(false)
    }
  }

  const checkContractData = async () => {
    try {
      const method = 'mint';
      const params = [address, ethers.constants.One];

      const result = await fetch('/api/usecases/policies/checkContractDataUC', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contract._id,
          method,
          params,
        }),
      })
      const { response } = await result.json()
      setFunctionApprovedOwner(response)
    } catch (error) {
      console.error(error)
      setFunctionApprovedOwner(false)
    }
  }

  const updateAddressStatus = async (status) => {
    try {
      setUpdatingPolicies(true)
      await fetch('/api/usecases/policies/updateAddressStatusUC', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: PROJECT_ID,
          chainId: CHAIN_ID,
          address: TOKEN_ADDRESS,
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
      const selector = new ethers.utils.Interface(TOKEN_ABI).getSighash('mint');
      const mask = ethers.utils.solidityPack(
        ['uint32'],
        ['0xffffffff']
      );

      const { mask: checkMask } = await fetch('/api/usecases/policies/getMaskUC', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contract._id,
          method: 'mint',
        }),
      }).then((res) => res.json())
    
      if (checkMask === mask) {
        return;
      }

      await fetch('/api/usecases/policies/updateMaskUC', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: PROJECT_ID,
          chainId: CHAIN_ID,
          address: TOKEN_ADDRESS,
          selector,
          mask,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const updateFunctionStatus = async (status) => {
    setUpdatingPolicies(true);
    await updateMask();
    const selector = new ethers.utils.Interface(TOKEN_ABI).getSighash('mint');
    const selectorAndParams = ethers.utils.solidityPack(['bytes4'], [selector])

    try {
      await fetch('/api/usecases/policies/updateFunctionStatusUC', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: PROJECT_ID,
          chainId: CHAIN_ID,
          address: TOKEN_ADDRESS,
          selectorAndParams,
          status,
        }),
      })
    } catch (error) {
      console.error(error)
    }

    checkContractAddress();
    setUpdatingPolicies(false)

  }
  
  useEffect(() => {
    if (contract) {
      checkContractAddress();
      checkContractData();
    }
  }, [contract])

  useEffect(() => {
    getContract()
  }, [])

  useEffect(() => {
    if(!address) return
    getBalance()
    const interval = setInterval(() => {
      getBalance()
    }, 5000);
    return () => clearInterval(interval);
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
      checkContractAddress,
      checkContractData,
      updateAddressStatus,
      updateMask,
      updateFunctionStatus,
    }),
    [loadingContract, contract, balance, updatingPolicies, fullApprovedOwner, functionApprovedOwner]
  );

  return <ContractContext.Provider value={memoizedData} {...props} />;
}

function useContract() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error(
      `useContract must be used within a ContractProvider`
    );
  }
  return context;
}

export { ContractProvider, useContract };