import { useHuman } from "@/state/human.context"
import { ProcessedProposal } from "./ProcessedProposal"
import styles from "./proposals.module.css"

export const ProposalsList = () => {
  const { proposals } = useHuman()

  return (
    <div className={styles.container}>
      <div className={styles.title}>Historial</div>
      <div className={styles.list}>
        {proposals.length > 0 ? (
          proposals
            ?.filter((proposal) => proposal.status === "CONFIRMED")
            .map((mappedProposal, index) => (
              <div key={index}>
                <ProcessedProposal proposal={mappedProposal} />
              </div>
            ))
        ) : (
          <p className={styles.text}>No hay transacciones disponibles</p>
        )}
      </div>
    </div>
  )
}
