import { ModalProvider } from "@/state/modal.context";
import { ContractProvider } from "@/state/contract.context";
import { UserProvider } from "@/state/user.context";
import { HumanProvider } from "@/state/human.context";

export const Providers = ({ children }) => {
  return (
    <ModalProvider>
      <UserProvider>
        <HumanProvider>
          <ContractProvider>{children}</ContractProvider>
        </HumanProvider>
      </UserProvider>
    </ModalProvider>
  );
};
