import { useModal } from "@/state/modal.context"
import { useSession } from "@/state/session.context"
import { useTransactions } from "@/state/transactions.context"
import { getExplorerUrl } from "@/utils/explorer"
import { ConfirmForm } from "./ConfirmForm"

export const Transaction = ({
  tx
}) => {

  const { ownerSafeData } = useSession()
  const { openModal, closeModal } = useModal()
  const { executingTransaction, executeTransaction } = useTransactions()

  const isExecuted = tx.status === 'EXECUTED'
  const canConfirm = !isExecuted && tx.signatures.length < ownerSafeData.threshold
  const canExecute =
    !isExecuted
    && tx.signatures.length >= ownerSafeData.threshold
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
      <div>{`${tx.signatures.length} / ${ownerSafeData.threshold}`}</div>
      {canExecute && <button disabled={executingTransaction} onClick={handleExecute}>{executingTransaction ? 'Executing...' : 'Execute'}</button>}
      {canConfirm && <button onClick={handleConfirm}>Confirm</button>}
      {isExecuted && <button
        onClick={() => window.open(explorerUrl, '_blank')}
      >View in explorer</button>}
    </div>
  )
}