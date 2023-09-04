import { useHuman } from "@/state/human.context"
import { Proposal } from "./Proposal"
import styles from "./proposals.module.css"

export const PendingProposalsList = () => {
  const { processingProposal, confirmProposal, eventsProposals } = useHuman()
  return (
    <div className={styles.container}>
      <div className={styles.title}>Pending Proposals</div>
      {eventsProposals?.length > 0 &&
        eventsProposals
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
      {eventsProposals.filter(
        (proposal) =>
          proposal.status !== "CONFIRMED" || proposal.status !== "REVERTED"
      ).length === 0 && (
        <p className={styles.text}>There are no pending proposals</p>
      )}
    </div>
  )
}
