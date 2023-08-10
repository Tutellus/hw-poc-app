import { CheckOKIcon, CheckKOIcon } from "@/components/icons"
import styles from "./processedProposal.module.css"

export const ProcessedProposal = ({ proposal }) => {
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
      <div>
        {proposal?.status === "CONFIRMED" ? (
          <CheckOKIcon />
        ) : proposal?.status === "REJECTED" ? (
          <CheckKOIcon />
        ) : null}
      </div>
    </div>
  )
}
