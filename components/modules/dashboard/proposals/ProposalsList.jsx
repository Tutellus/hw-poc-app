import { useHuman } from "@/state/human.context"
import { ProcessedProposal } from "./ProcessedProposal"
import styles from "./proposals.module.css"

export const ProposalsList = () => {
  const { proposals } = useHuman()

  return (
    <div className={styles.container}>
      <div className={styles.title}>Proposals History</div>
      <div className={styles.list}>
        {proposals.length > 0 ? (
          proposals
            ?.filter(
              (proposal) =>
                proposal.status === "CONFIRMED" ||
                proposal.status === "REVERTED"
            )
            .map((mappedProposal, index) => (
              <div key={index}>
                <ProcessedProposal proposal={mappedProposal} />
              </div>
            ))
        ) : (
          <p className={styles.text}>There are no proposals yet</p>
        )}
      </div>
    </div>
  )
}
