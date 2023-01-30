import { useModal } from "@/state/modal.context"
import { getExplorerUrl } from "@/utils/explorer"
import { ConfirmForm } from "./forms/ConfirmForm"
import { default as ClockIcon } from "@heroicons/react/24/outline/ClockIcon";
import { default as PlusCircleIcon } from "@heroicons/react/24/outline/PlusCircleIcon";
import { default as CheckCircleIcon } from "@heroicons/react/24/outline/CheckCircleIcon";
import { default as XCircleIcon } from "@heroicons/react/24/outline/XCircleIcon";

const ProposalStatusIcon = ({ status }) => {
  let body, color;
  switch (status) {
    case 'PENDING':
      body = <PlusCircleIcon />
      color = 'var(--color-yellow)'
      break;
    case 'EXECUTING':
      body = <ClockIcon />
      color = 'var(--color-orange)'
      break;
    case 'EXECUTED':
      body = <CheckCircleIcon />
      color = 'var(--color-green)'
      break;
    case 'FAILED':
      body = <XCircleIcon />
      color = 'var(--color-red)'
      break;
    default:
      body = null
  }
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: '24px',
      width: '24px',
      color,
    }}>{body}</div>
  )
}

export const Proposal = ({ safeData, proposal }) => {

  const { openModal, closeModal } = useModal()

  const isPending = proposal.status === 'PENDING'
  const isExecuted = proposal.status === 'EXECUTED'

  const canConfirm = isPending && proposal.signatures?.length < safeData?.threshold

  const handleConfirm = async () => {
    openModal(<ConfirmForm
      proposal={proposal}
      onConfirmed={closeModal}
    />)
  }

  const explorerUrl = getExplorerUrl(proposal.chainId, 'tx', proposal.receipt?.transactionHash)

  return (
    <div className="table-row">
      <div>{proposal.nonce}</div>
      <ProposalStatusIcon status={proposal.status} />
      {canConfirm && <button onClick={handleConfirm}>Confirm</button>}
      {isExecuted && <button
        onClick={() => window.open(explorerUrl, '_blank')}
      >View</button>}
    </div>
  )
}