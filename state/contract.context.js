/* eslint-disable react-hooks/exhaustive-deps */
import { ethers } from "ethers";
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useProposals } from "./proposals.context";
import { useSession } from "./session.context";

const TOKEN_ADDRESS = "0xdC588c35a53B81d6B9DeB0995A5582236f89B7a2"
const TOKEN_ABI = [
  "function mint(address to, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
];
const CHAIN_ID = 5

const ContractContext = createContext({
  loadingContract: false,
  contract: null,
  balance: '0.0',
  updatingPolicies: false,
  fullApprovedOwner: false,
  functionApprovedOwner: false,
  updateContract: async () => {},
  updateAddressStatus: async (status) => {},
  updateFunctionStatus: async (status) => {},
  mint: async (amount) => {},
});

function ContractProvider(props) {
  
  const { session, proxy } = useSession();
  const { ownerProposals, masterProposals } = useProposals();
  const [loadingContract, setLoadingContract] = useState(false);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState('0.0');

  const [updatingPolicies, setUpdatingPolicies] = useState(false);
  const [fullApprovedOwner, setFullApprovedOwner] = useState(false);
  const [functionApprovedOwner, setFunctionApprovedOwner] = useState(false);

  const getBalance = async () => {
    const response = await fetch('/api/usecases/tokens/getTokenBalance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chainId: CHAIN_ID,
        token: TOKEN_ADDRESS,
        address: proxy.address,
      }),
    })
    const { balance: innerBalance } = await response.json()
    setBalance(innerBalance)
  }

  const getContract = async () => {
    try {
      setLoadingContract(true)
      const filter = {
        address: TOKEN_ADDRESS,
        chainId: CHAIN_ID,
      };
      const response = await fetch('/api/usecases/contracts/getContract', {
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
  
      const response = await fetch('/api/usecases/contracts/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })
      const { contract: innerContract } = await response.json()
      setContract(innerContract)
      setLoadingContract(false)
    } catch (error) {
      console.error(error)
    }
  }

  const mint = async (amount) => {
    try {
      const decimals = 18;
      const amountBN = ethers.utils.parseUnits(amount.toString(), decimals);
      await submit({
        contractId: contract._id,
        projectId: proxy.projectId,
        method: 'mint',
        params: [proxy.address, amountBN],
        value: 0,
        user: session,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const checkContractAddress = async () => {
    try {
      const result = await fetch('/api/usecases/policies/checkContractAddress', {
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
      const params = [proxy.address, ethers.constants.One];

      const result = await fetch('/api/usecases/policies/checkContractData', {
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
      const result = await fetch('/api/usecases/policies/updateAddressStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: proxy.projectId,
          chainId: CHAIN_ID,
          address: TOKEN_ADDRESS,
          status,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const updateMask = async () => {
    try {

      const selector = new ethers.utils.Interface(TOKEN_ABI).getSighash('mint');
      const mask = ethers.utils.solidityPack(
        ['uint32', 'uint256'],
        ['0xffffffff', ethers.constants.MaxUint256]
      );

      await fetch('/api/usecases/policies/updateMask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: proxy.projectId,
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
    setUpdatingPolicies(true)
    await updateMask();
    setUpdatingPolicies(false)
    // try {
    //   const result = await fetch('/api/usecases/policies/updateFunctionStatus', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       projectId: proxy.projectId,
    //       chainId: CHAIN_ID,
    //       address: TOKEN_ADDRESS,
    //       method: 'mint',
    //       status,
    //     }),
    //   })
    // } catch (error) {
    //   console.error(error)
    // }
  }

  useEffect(() => {
    if (!fullApprovedOwner) {
      checkContractData();
    }
  }, [fullApprovedOwner])

  useEffect(() => {
    getContract();
  }, [proxy])
  
  useEffect(() => {
    if (proxy && contract) {
      getBalance();
      checkContractAddress();
    }
  }, [contract, ownerProposals, masterProposals])

  const memoizedData = useMemo(
    () => ({
      loadingContract,
      contract,
      balance,
      updatingPolicies,
      fullApprovedOwner,
      functionApprovedOwner,
      updateContract,
      updateAddressStatus,
      updateFunctionStatus,
      mint,
    }),
    [loadingContract, contract, balance, updatingPolicies, fullApprovedOwner, functionApprovedOwner]
  );

  return <ContractContext.Provider value={memoizedData} {...props} />;
}

function useContract() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error(
      `useContractContext must be used within a ContractContextProvider`
    );
  }
  return context;
}

export { ContractProvider, useContract };