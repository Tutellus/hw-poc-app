import { getExplorerUrl } from "@/utils/explorer"
import { decodeTransactionData } from "@/utils/transaction"
import { useState } from "react"

export const Transaction = ({
  tx,
  abi,
  ownerSafeData,
  confirmFn,
  executeFn,
}) => {

  const [confirming, setConfirming] = useState(false)
  const [executing, setExecuting] = useState(false)

  // TODO: add api call to decode transaction data with saved abis (saving in db with destination)
  const transactionData = decodeTransactionData(abi, tx.originalData)
  const canConfirm = tx.status !== 'EXECUTED' && tx.signatures.length < ownerSafeData.threshold
  const canExecute =
    tx.status !== 'EXECUTED'
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
    <div className="transaction">
      <div>{tx.nonce}</div>
      <div>{tx.status}</div>
      <div>{transactionData.name}</div>
      <div>{`Signatures: ${tx.signatures.length} / ${ownerSafeData.threshold}`}</div>
      {canExecute && <button disabled={executing} onClick={handleExecute}>{executing ? 'Executing...' : 'Execute'}</button>}
      {canConfirm && <button disabled={confirming} onClick={handleConfirm}>{confirming ? 'Confirming...' : 'Confirm'}</button>}
      {tx.status === 'EXECUTED' && <button
        onClick={() => window.open(explorerUrl, '_blank')}
      >View in explorer</button>}
    </div>
  )
}