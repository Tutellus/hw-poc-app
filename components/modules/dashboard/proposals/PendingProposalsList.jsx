import { useHuman } from "@/state/human.context"
import { Proposal } from "./Proposal"
import styles from "./proposals.module.css"

export const PendingProposalsList = () => {
  const { processingProposal, confirmProposal, currentProposal } = useHuman()

  return (
    <div className={styles.container}>
      <div className={styles.title}>Proposals</div>
      <div className={styles.list}>
        <Proposal
          key={currentProposal?._id}
          proposal={currentProposal}
          processingProposal={processingProposal}
          confirmProposal={confirmProposal}
        />
      </div>
    </div>
  )
}
