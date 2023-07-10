/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ethers } from "ethers";
import { useHuman } from "./human.context";
import { config } from "@/utils";
import { useSession } from "next-auth/react";

const uri = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
const CONTRACT = config.CONTRACT;

const ContractContext = createContext({
  loadingContract: true,
  contract: CONTRACT,
  balance: "0.0",
  updatingPolicies: false,
  fullApprovedOwner: false,
  functionApprovedOwner: false,
  getTokenBalance: async () => {},
  updateContract: async () => {},
  checkContractAddress: async () => {},
  checkContractData: async () => {},
  updateAddressStatus: async (status) => {},
  updateMask: async () => {},
  updateFunctionStatus: async (status) => {},
});

function ContractProvider(props) {
  const { data: session } = useSession();
  const { accessToken } = session || {};

  const [loadingContract, setLoadingContract] = useState(false);
  const [contract, setContract] = useState(CONTRACT);

  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balance, setBalance] = useState("---");
  const { human, humanSDK } = useHuman();

  const [updatingPolicies, setUpdatingPolicies] = useState(false);
  const [fullApprovedOwner, setFullApprovedOwner] = useState(false);
  const [functionApprovedOwner, setFunctionApprovedOwner] = useState(false);

  const getTokenBalance = async () => {
    try {
      setLoadingBalance(true);

      const USDTToken = {
        token: CONTRACT.address,
        type: "ERC20",
      };

      const { items } = await humanSDK.getTokensBalance({
        address: human.address,
        tokens: [USDTToken],
      });

      const value = items.find((item) => item.token === CONTRACT.address).bigNumber;
      const innerBalance = ethers.utils.formatEther(value);
      setBalance(innerBalance);
      setLoadingBalance(false);
    } catch (error) {
      console.error(error);
    }
  };

  // const getContract = async () => {
  //   try {
  //     setLoadingContract(true);
  //     const response = await humanSDK.getContracts();
  //     setContract(response);
  //     setLoadingContract(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const updateContract = async () => {
    try {
      setLoadingContract(true);

      const params = {
        address: CONTRACT.address,
        abi: CONTRACT.abi,
        chainId: CONTRACT.chainId,
      };

      const response = await fetch("/api/usecases/contracts/updateContractUC", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      const { contract: innerContract } = await response.json();
      setContract(innerContract);
    } catch (error) {
      console.error(error);
    }
    setLoadingContract(false);
  };

  const checkContractAddressData = async () => {
    if (!accessToken || !humanSDK) return;

    const response = await humanSDK.checkContractAddress({
      uri,
      contractAddress: CONTRACT.address,
      projectId,
      accessToken,
    });
    response ? setFullApprovedOwner(response) : setFullApprovedOwner(false);
  };

  const checkContractDataFunction = async () => {
    const response = await humanSDK.checkContractData({
      uri,
      contractAddress: CONTRACT.address,
      projectId,
      accessToken,
    });
    response ? setFunctionApprovedOwner(response) : setFunctionApprovedOwner(false);
  };

  const updateAddressStatus = async (status) => {
    try {
      setUpdatingPolicies(true);
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
      });
      checkContractAddressData();
      setUpdatingPolicies(false);
    } catch (error) {
      console.error(error);
    }
  };

  const updateMask = async () => {
    try {
      const selector = new ethers.utils.Interface(CONTRACT.abi).getSighash("mint");
      const mask = ethers.utils.solidityPack(["uint32"], ["0xffffffff"]);

      const { mask: checkMask } = await fetch("/api/usecases/policies/getMaskUC", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chainId: CONTRACT.chainId,
          address: CONTRACT.address,
          method: "mint",
        }),
      }).then((res) => res.json());

      if (checkMask === mask) {
        return;
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
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateFunctionStatus = async (status) => {
    setUpdatingPolicies(true);
    await updateMask();
    const selector = new ethers.utils.Interface(CONTRACT.abi).getSighash("mint");
    const selectorAndParams = ethers.utils.solidityPack(["bytes4"], [selector]);

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
      });
    } catch (error) {
      console.error(error);
    }

    checkContractAddressData();
    setUpdatingPolicies(false);
  };

  // useEffect(() => {
  //   if (!humanSDK) return;
  //   getContract();
  // }, [chainId, humanSDK]);

  useEffect(() => {
    if (!contract || !humanSDK) return;
    checkContractAddressData();
    checkContractDataFunction();

    const interval = setInterval(() => {
      checkContractAddressData();
      checkContractDataFunction();
    }, 5000);
    return () => clearInterval(interval);
  }, [contract, updatingPolicies, humanSDK]);

  useEffect(() => {
    if (!human || !humanSDK) return;
    getTokenBalance();
    const interval = setInterval(() => {
      getTokenBalance();
    }, 5000);
    return () => clearInterval(interval);
  }, [human, humanSDK]);

  const memoizedData = useMemo(
    () => ({
      loadingBalance,
      loadingContract,
      contract,
      balance,
      updatingPolicies,
      fullApprovedOwner,
      functionApprovedOwner,
      getTokenBalance,
      updateContract,
      checkContractAddress: checkContractAddressData,
      checkContractData: checkContractDataFunction,
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
    throw new Error(`useContract must be used within a ContractProvider`);
  }
  return context;
}

export { ContractProvider, useContract };
