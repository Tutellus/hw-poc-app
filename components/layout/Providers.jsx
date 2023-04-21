import { SessionProvider } from '@/state/session.context'
import { ModalProvider } from '@/state/modal.context'
import { ProposalsProvider } from '@/state/proposals.context'
import { SafeProvider } from '@/state/safe.context'
import { WalletProvider } from '@/state/wallet.context';
import { ContractProvider } from '@/state/contract.context';
import { Web3AuthProvider } from '@/state/web3auth.context';

export const Providers = ({ children }) => {
  return (
    <ModalProvider>
      <WalletProvider>
        <Web3AuthProvider>
          {/* <SessionProvider> */}
            <SafeProvider>
              <ProposalsProvider>
                <ContractProvider>
                  {children}
                </ContractProvider>
              </ProposalsProvider>
            </SafeProvider>
          {/* </SessionProvider> */}
        </Web3AuthProvider>
      </WalletProvider>
    </ModalProvider>
  )
};