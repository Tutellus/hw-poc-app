/* eslint-disable react-hooks/exhaustive-deps */
import { ethers } from "ethers";
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useProposals } from "./proposals.context";
import { useSession } from "./session.context";
import { DEFAULT_CHAIN_ID } from "./wallet.context";

const AMOUNT = 10;
const EXTERNAL_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const CHAIN_ID = DEFAULT_CHAIN_ID

const CONTRACT_GOERLI = {
  chainId: '0x5',
  address: '0xdC588c35a53B81d6B9DeB0995A5582236f89B7a2',
  abi: [
    "function mint(address to, uint256 amount) public",
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function decimals() public view returns (uint8)",
  ],
};

const CONTRACT_BSCTESTNET = {
  chainId: '0x61',
  address: '0x9E09fA248ed2067764F438c8C49421a73F538596',
  abi: [
    "function mint(address to, uint256 amount) public",
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function decimals() public view returns (uint8)",
  ],
};

const CONTRACT = CHAIN_ID === '0x5' ? CONTRACT_GOERLI : CONTRACT_BSCTESTNET;
const TOKEN_ADDRESS = CONTRACT.address;
const TOKEN_ABI = CONTRACT.abi;

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
  mintAndTransfer: async (amount, to) => {},
});

function ContractProvider(props) {
  
  const { session, proxy } = useSession();
  const { ownerProposals, submit } = useProposals();
  const [loadingContract, setLoadingContract] = useState(false);
  const [contract, setContract] = useState(null);

  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balance, setBalance] = useState('---');

  const [updatingPolicies, setUpdatingPolicies] = useState(false);
  const [fullApprovedOwner, setFullApprovedOwner] = useState(false);
  const [functionApprovedOwner, setFunctionApprovedOwner] = useState(false);

  const getBalance = async () => {
    if (!proxy) return
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
    } catch (error) {
      console.error(error)
    }
    setLoadingContract(false)
  }

  const mint = async (amount = AMOUNT) => {
    try {
      const decimals = 18;
      const amountBN = ethers.utils.parseUnits(amount.toString(), decimals);
      await submit({
        chainId: CHAIN_ID,
        contractId: [contract._id],
        method: ['mint'],
        params: [[proxy.address, amountBN]],
        value: [0],
        projectId: proxy.projectId,
        user: session,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const mintAndTransfer = async (amount = AMOUNT) => {
    try {
        const decimals = 18;
        const amountBN = ethers.utils.parseUnits(amount.toString(), decimals);
        await submit({
          chainId: CHAIN_ID,
          contractId: [
            contract._id,
            contract._id,
          ],
          method: [
            'mint',
            'transfer'
          ],
          params: [
            [proxy.address, amountBN],
            [EXTERNAL_ADDRESS, amountBN],
          ],
          value: [
            0,
            0,
          ],
          projectId: proxy.projectId,
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
      setUpdatingPolicies(true)
      await fetch('/api/usecases/policies/updateAddressStatus', {
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

      const { mask: checkMask } = await fetch('/api/usecases/policies/getMask', {
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
    setUpdatingPolicies(true);
    await updateMask();
    const selector = new ethers.utils.Interface(TOKEN_ABI).getSighash('mint');
    const selectorAndParams = ethers.utils.solidityPack(['bytes4'], [selector])

    try {
      await fetch('/api/usecases/policies/updateFunctionStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: proxy.projectId,
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
    getContract();
  }, [proxy])
  
  useEffect(() => {
    if (contract) {
      checkContractAddress();
      checkContractData();
    }
  }, [contract])

  useEffect(() => {
    if (!loadingBalance) {
      setTimeout(() => {
        getBalance();
      }
      , 3000)
    }
  }, [ownerProposals])

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
      mintAndTransfer,
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