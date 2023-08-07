import { useHuman } from "@/state/human.context"
import { Proposal } from "./Proposal"
import styles from "./proposals.module.css"

export const PendingProposalsList = () => {
  const { proposals, processingProposal, confirmProposal } = useHuman()

  return (
    <div className={styles.proposalsContainer}>
      <div className={styles.title}>Proposals</div>
      <div className="data">
        {proposals?.length > 0 ? (
          proposals.map((proposal, index) => (
            <Proposal
              key={index}
              proposal={proposal}
              processingProposal={processingProposal}
              confirmProposal={confirmProposal}
            />
          ))
        ) : (
          <p className={styles.text}>No hay transacciones en cola</p>
        )}
      </div>
    </div>
  )
}
