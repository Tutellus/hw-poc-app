/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ethers } from "ethers";
import { useHuman } from "./human.context";
import { config } from "@/utils";

const CONTRACT = config.CONTRACT;

const ContractContext = createContext({
  balance: "0.0",
  loadingBalance: false,
});

function ContractProvider(props) {
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balance, setBalance] = useState("---");
  const { human, humanSDK } = useHuman();

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
      balance,
      loadingBalance,
    }),
    [balance, loadingBalance]
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
