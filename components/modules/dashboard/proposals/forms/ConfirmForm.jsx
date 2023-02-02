import { useSafe } from "@/state/safe.context";
import { useProposals } from "@/state/proposals.context";
import { signProposal } from "@/utils/safe";
import { ethers } from "ethers";
import { useState } from "react"
import { useWallet } from "@/state/wallet.context";

export const ConfirmForm = ({
  proposal,
  onConfirmed,
}) => {

  const { masterSafeData } = useSafe()
  const { confirmingTransaction, confirmByCode, confirmBySignature } = useProposals()
  const { wallet, correctChain, settingChain, connect, handleSwitch } = useWallet();
  const [code, setCode] = useState(proposal?.code2fa || '');

  const [confirmingByCode, setConfirmingByCode] = useState(false)
  const [confirmingBySignature, setConfirmingBySignature] = useState(false)

  const connectedWallet = wallet?.accounts[0]?.address;

  const canConfirmByCode = !confirmingByCode && !confirmingBySignature
  const canConfirmBySignature = !confirmingByCode && !confirmingBySignature && masterSafeData?.owners?.map(owner => owner.toLowerCase()).includes(connectedWallet?.toLowerCase())

  const handleConfirmByCode = async () => {
    setConfirmingByCode(true)
    await confirmByCode(proposal, code)
    onConfirmed()
    setConfirmingByCode(false)
  }

  const handleConfirmBySignature = async () => {
    setConfirmingBySignature(true)
    const provider = new ethers.providers.Web3Provider(wallet.provider)
    const signer = provider.getSigner()
    const signature = await signProposal({
      proposal,
      signer,
    });
    await confirmBySignature(proposal, signature)
    onConfirmed()
    setConfirmingBySignature(false)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div>Confirm transaction</div>
      <input
        disabled={confirmingTransaction}
        onChange={(e) => setCode(e.target.value)}
        value={code}
        placeholder="Insert 2FA code"
      />
      {!confirmingTransaction && <div style={{
        display: 'flex',
        gap: '1rem',
      }}>
        <button
          disabled={!canConfirmByCode}
          onClick={handleConfirmByCode}
        >{confirmingByCode ? 'Confirming...' : 'Confirm by code'}
        </button>
        {connectedWallet && !correctChain && <button
          style={{
            backgroundColor: 'red',
          }}
          disabled={settingChain}
          onClick={handleSwitch}
        >{settingChain ? 'Switching...' : 'Switch to Goerli'}
        </button>}
        {connectedWallet && correctChain && <button
          disabled={!canConfirmBySignature}
          onClick={handleConfirmBySignature}
        >{confirmingBySignature ? 'Confirming...' : 'Confirm by signature'}
        </button>}
        {!connectedWallet && <button
          onClick={() => connect()}
        >Connect to sign</button>}
      </div>}
      {confirmingTransaction && <div>Confirming transaction...</div>}
    </div>
  )
}