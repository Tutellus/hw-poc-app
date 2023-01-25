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
  const { confirmingTransaction, confirmByCode, confirmBySignature } = useTransactions()
  const [{ wallet }, connect] = useConnectWallet()
  const [code, setCode] = useState(tx?.code2fa || '');

  const connectedWallet = wallet?.accounts[0]?.address;
  const canConfirmBySignature = ownerSafeData?.owners?.map(owner => owner.toLowerCase()).includes(connectedWallet?.toLowerCase())

  const handleConfirmByCode = async () => {
    await confirmByCode(tx, code)
    onConfirmed()
  }

  const handleConfirmBySignature = async () => {
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
          onClick={handleConfirmByCode}
        >Confirm by code</button>
        {connectedWallet && <button
          disabled={!canConfirmBySignature}
          onClick={handleConfirmBySignature}
        >Confirm by signature</button>}
        {!connectedWallet && <button
          onClick={() => connect()}
        >Connect to sign</button>}
      </div>}
      {confirmingTransaction && <div>Confirming transaction...</div>}
    </div>
  )
}