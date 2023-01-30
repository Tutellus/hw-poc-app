import { useModal } from "@/state/modal.context"
import { getExplorerUrl } from "@/utils/explorer"
import { ConfirmForm } from "./forms/ConfirmForm"

export const Proposal = ({ safeData, proposal }) => {

  const { openModal, closeModal } = useModal()

  const isPending = proposal.status === 'PENDING'
  const isExecuted = proposal.status === 'EXECUTED'

  const canConfirm = isPending && proposal.signatures?.length < safeData.threshold

  const handleConfirm = async () => {
    openModal(<ConfirmForm
      proposal={proposal}
      onConfirmed={closeModal}
    />)
  }

  const handleExecute = async () => {
    // await executeTransaction(proposal)
  }

  const explorerUrl = getExplorerUrl(proposal.chainId, 'tx', proposal.receipt?.transactionHash)

  return (
    <div className="table-row">
      <div>{proposal.nonce}</div>
      <div>{`${proposal.signatures?.length || 0} / ${safeData.threshold}`}</div>
      {canConfirm && <button onClick={handleConfirm}>Confirm</button>}
      {isExecuted && <button
        onClick={() => window.open(explorerUrl, '_blank')}
      >View</button>}
    </div>
  )
}