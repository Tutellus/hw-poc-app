import { ModalProvider } from '@/state/modal.context'
import { ContractProvider } from '@/state/contract.context';
import { Web3AuthProvider } from '@/state/web3auth.context';
import { HumanProvider } from '@/state/human.context';
import { MagicLinkProvider } from '@/state/magicLink.context';

export const Providers = ({ children }) => {
  return (
    <ModalProvider>
      <Web3AuthProvider>
      {/* <MagicLinkProvider> */}
        <HumanProvider>
          <ContractProvider>
            {children}
          </ContractProvider>
        </HumanProvider>
      {/* </MagicLinkProvider> */}
      </Web3AuthProvider>
    </ModalProvider>
  )
};