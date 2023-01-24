import { getExplorerUrl } from "@/utils/explorer"
import { useState } from "react"

export const Transaction = ({
  tx,
  ownerSafeData,
  confirmFn,
  executeFn,
}) => {

  const [confirming, setConfirming] = useState(false)
  const [executing, setExecuting] = useState(false)

  const isExecuted = tx.status === 'EXECUTED'
  const canConfirm = !isExecuted && tx.signatures.length < ownerSafeData.threshold
  const canExecute =
    !isExecuted
    && tx.signatures.length >= ownerSafeData.threshold
    && ownerSafeData.nonce === tx.nonce

  const handleConfirm = async () => {
    setConfirming(true)
    await confirmFn(tx._id, tx.code2fa)
    setConfirming(false)
  }

  const handleExecute = async () => {
    setExecuting(true)
    await executeFn(tx._id)
    setExecuting(false)
  }

  const explorerUrl = getExplorerUrl(process.env.CHAIN_ID || 5, 'tx', tx.executionTxHash)

  return (
    <tr>
      <div
        onClick={() => window.open(explorerUrl, '_blank')}
        style={{
          color: isExecuted ? 'var(--color-primary-light)' : '',
          cursor: 'pointer',
        }}
      >{tx.nonce}</div>
      <div>{tx.status}</div>
      {/* <div>{tx}</div> */}
      <div>{`${tx.signatures.length} / ${ownerSafeData.threshold}`}</div>
      {canExecute && <button disabled={executing} onClick={handleExecute}>{executing ? 'Executing...' : 'Execute'}</button>}
      {canConfirm && <button disabled={confirming} onClick={handleConfirm}>{confirming ? 'Confirming...' : 'Confirm'}</button>}
      {isExecuted && <button
        onClick={() => window.open(explorerUrl, '_blank')}
      >View in explorer</button>}
    </tr>
  )
}