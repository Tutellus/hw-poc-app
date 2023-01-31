/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from "next/router";
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
  executableByOwner: false,
  updateContract: async () => {},
  mint: async (amount) => {},
});

function ContractProvider(props) {
  
  const { session, proxy } = useSession();
  const { ownerProposals, masterProposals } = useProposals();
  const [loadingContract, setLoadingContract] = useState(false);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState('0.0');
  const [executableByOwner, setExecutableByOwner] = useState(false);

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

  const forwardCheckOwner = async () => {
    try {
      const method = 'mint';
      const params = [proxy.address, 100];
      const value = 0;

      const result = await fetch('/api/usecases/policies/forwardCheckOwner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contract._id,
          proxyId: proxy._id,
          method,
          params,
          value,
        }),
      })
      const { response } = await result.json()
      setExecutableByOwner(response)
    } catch (error) {
      console.error(error)
      setExecutableByOwner(false)
    }
  }

  useEffect(() => {
    if (proxy) {
      getContract();
    }
  }, [proxy])
  
  useEffect(() => {
    if (!contract) {
      getContract();
    } else {
      getBalance();
      forwardCheckOwner();
    }
  }, [contract, ownerProposals, masterProposals])

  console.log('forwardCheckOwner', executableByOwner)

  const memoizedData = useMemo(
    () => ({
      loadingContract,
      contract,
      balance,
      executableByOwner,
      updateContract,
      mint,
    }),
    [loadingContract, contract, balance, executableByOwner]
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