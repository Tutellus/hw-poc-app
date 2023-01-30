import { SessionProvider } from '@/state/session.context'
import { ModalProvider } from '@/state/modal.context'
import { ProposalsProvider } from '@/state/proposals.context'
import { SafeProvider } from '@/state/safe.context'
import { WalletProvider } from '@/state/wallet.context';

export const Providers = ({ children }) => {
  return (
    <ModalProvider>
      <WalletProvider>
        <SessionProvider>
          <SafeProvider>
            <ProposalsProvider>
              {children}
            </ProposalsProvider>
          </SafeProvider>
        </SessionProvider>
      </WalletProvider>
    </ModalProvider>
  )
};