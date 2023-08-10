import { useHuman } from "@/state/human.context"
import { ProcessedProposal } from "./ProcessedProposal"
import styles from "./proposals.module.css"

export const ProposalsList = () => {
  const { proposals } = useHuman()
  // const proposals = [
  //   {
  //     _id: "1",
  //     title: "Mint 5 tokens",
  //     description: "We will mint 5 tokens for you",
  //     status: "CONFIRMED",
  //     createdAt: "2021-09-30T15:00:00.000Z",
  //     updatedAt: "2021-09-30T15:00:00.000Z",
  //   },
  //   {
  //     _id: "2",
  //     title: "Mint 5 tokens",
  //     description: "We will mint 5 tokens for you",
  //     status: "REJECTED",
  //     createdAt: "2021-09-30T15:00:00.000Z",
  //     updatedAt: "2021-09-30T15:00:00.000Z",
  //   },
  // ]

  return (
    <div className={styles.container}>
      <div className={styles.title}>Historial</div>
      <div className={styles.list}>
        {proposals?.length > 0 ? (
          proposals.map((proposal, index) => (
            <ProcessedProposal key={index} proposal={proposal} />
          ))
        ) : (
          <p className={styles.text}>No hay transacciones disponibles</p>
        )}
      </div>
    </div>
  )
}
