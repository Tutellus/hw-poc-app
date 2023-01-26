import { useModal } from "@/state/modal.context"
import { useSafe } from "@/state/safe.context"
import { useTransactions } from "@/state/transactions.context"
import { getExplorerUrl } from "@/utils/explorer"
import { ConfirmForm } from "./forms/ConfirmForm"

export const Transaction = ({ tx }) => {

  const { ownerSafeData } = useSafe()
  const { openModal, closeModal } = useModal()
  const { executingTransaction, executeTransaction } = useTransactions()

  const isCreated = tx.status === 'CREATED'
  const isExecuted = tx.status === 'EXECUTED'

  const canConfirm = isCreated && tx.signatures?.length < ownerSafeData.threshold
  const canExecute =
    isCreated
    && tx.signatures?.length >= ownerSafeData.threshold
    && ownerSafeData.nonce === tx.nonce
  const handleConfirm = async () => {
    openModal(<ConfirmForm
      tx={tx}
      onConfirmed={closeModal}
    />)
  }

  const handleExecute = async () => {
    await executeTransaction(tx)
  }

  const explorerUrl = getExplorerUrl(process.env.CHAIN_ID || 5, 'tx', tx.executionTxHash)

  return (
    <div className="table-row">
      <div
        onClick={() => window.open(explorerUrl, '_blank')}
        style={{
          color: isExecuted ? 'var(--color-primary-light)' : '',
          cursor: 'pointer',
        }}
      >{tx.nonce}</div>
      <div>{tx.status}</div>
      {/* <div>{tx}</div> */}
      <div>{`${tx.signatures?.length || 0} / ${ownerSafeData.threshold}`}</div>
      {canExecute && <button disabled={executingTransaction} onClick={handleExecute}>{executingTransaction ? 'Executing...' : 'Execute'}</button>}
      {canConfirm && <button onClick={handleConfirm}>Confirm</button>}
      {isExecuted && <button
        onClick={() => window.open(explorerUrl, '_blank')}
      >View in explorer</button>}
    </div>
  )
}