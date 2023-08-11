import styles from "./proposals.module.css"
export const ProposalDetail = ({ proposal }) => {
  console.log({ proposal })

  return (
    <div className={styles.container}>
      <div className={styles.block}>
        <div className={styles.keys}>
          <div>Title</div>
          <div>Description</div>
        </div>
        <div className={styles.values}>
          <div>{proposal?.title}</div>
          <div>{proposal?.description}</div>
        </div>
      </div>
    </div>
  )
}
