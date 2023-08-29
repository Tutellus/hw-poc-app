import { useHuman } from "@/state/human.context"
import { Proposal } from "./Proposal"
import styles from "./proposals.module.css"

export const PendingProposalsList = () => {
  const { proposals, processingProposal, confirmProposal } = useHuman()

  return (
    <div className={styles.container}>
      <div className={styles.title}>Proposals pendientes</div>
      {proposals?.length > 0 &&
        proposals
          .filter(
            (proposal) =>
              proposal.status !== "CONFIRMED" && proposal.status !== "REVERTED"
          )
          .map((proposal, index) => (
            <div className={styles.max} key={index}>
              <Proposal
                proposal={proposal}
                processingProposal={processingProposal}
                confirmProposal={confirmProposal}
              />
            </div>
          ))}
      {proposals.filter(
        (proposal) =>
          proposal.status !== "CONFIRMED" || proposal.status !== "REVERTED"
      ).length === 0 && (
        <p className={styles.text}>No hay transacciones en cola</p>
      )}
    </div>
  )
}
