import { useHuman } from "@/state/human.context"
import { Proposal } from "./Proposal"
import styles from "./proposals.module.css"

export const ProposalsList = () => {
  const { proposals, processingProposal, confirmProposal } = useHuman()

  return (
    <div className={styles.container}>
      <div className={styles.title}>Historial</div>
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
          <p className={styles.text}>No hay transacciones disponibles</p>
        )}
      </div>
    </div>
  )
}
