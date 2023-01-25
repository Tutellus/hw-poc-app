import { useSession } from "@/state/session.context";
import { useTransactions } from "@/state/transactions.context";
import { signTransaction } from "@/utils/safe";
import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { useState } from "react"

export const ConfirmForm = ({
  tx,
  onConfirmed,
}) => {

  const { ownerSafeData } = useSession()
  const { confirmByCode, confirmBySignature } = useTransactions()
  const [{ wallet }, connect] = useConnectWallet()
  const [code, setCode] = useState(tx?.code2fa || '');

  const [confirmingByCode, setConfirmingByCode] = useState(false)
  const [confirmingBySignature, setConfirmingBySignature] = useState(false)

  const connectedWallet = wallet?.accounts[0]?.address;

  const canConfirmByCode = !confirmingByCode && !confirmingBySignature
  const canConfirmBySignature = !confirmingByCode && !confirmingBySignature && ownerSafeData?.owners?.map(owner => owner.toLowerCase()).includes(connectedWallet?.toLowerCase())

  const handleConfirmByCode = async () => {
    setConfirmingByCode(true)
    await confirmByCode(tx, code)
    onConfirmed()
    setConfirmingByCode(false)
  }

  const handleConfirmBySignature = async () => {
    setConfirmingBySignature(true)
    const provider = new ethers.providers.Web3Provider(wallet.provider)
    const signer = provider.getSigner()
    const signature = await signTransaction({
      safe: ownerSafeData.address,
      chainId: tx.chainId,
      tx,
      signer,
    });
    await confirmBySignature(tx, signature)
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
      <h2>Confirm transaction</h2>
      <input
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
        {connectedWallet && <button
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