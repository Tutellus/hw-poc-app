import { ContractProvider } from "@/state/contract.context";
import { Web3AuthProvider } from "@/state/web3auth.context";
import { HumanProvider } from "@/state/human.context";

export const Providers = ({ children }) => {
  return (
    <Web3AuthProvider>
      <HumanProvider>
        <ContractProvider>{children}</ContractProvider>
      </HumanProvider>
    </Web3AuthProvider>
  );
};
