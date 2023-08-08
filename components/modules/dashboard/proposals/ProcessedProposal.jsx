import { CheckOKIcon, CheckKOIcon } from "@/components/icons"
import styles from "./processedProposal.module.css"

export const ProcessedProposal = ({ key, proposal }) => {
  console.log("ProcessedProposal", { key, proposal })
  return (
    <div key={key} className={styles.container}>
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
        {proposal?.status === "CONFIRMED" ? <CheckOKIcon /> : <CheckKOIcon />}
      </div>
    </div>
  )
}
