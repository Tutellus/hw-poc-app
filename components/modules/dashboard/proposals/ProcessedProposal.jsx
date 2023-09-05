import { CheckOKIcon, CheckKOIcon } from "@/components/icons"
import styles from "./processedProposal.module.css"
import { useRouter } from "next/router"

export const ProcessedProposal = ({ proposal }) => {
  const router = useRouter()
  const handleDetailPage = () => router.push(`/proposal/${proposal._id}`)

  return (
    <div className={styles.container} onClick={handleDetailPage}>
      <div className={styles.block}>
        <div className={styles.values}>
          <div className={styles.labelTitle}>{proposal?.title}</div>
          <div>{proposal?.description}</div>
        </div>
      </div>
      <div>
        {proposal?.status === "CONFIRMED" ? (
          <CheckOKIcon />
        ) : proposal?.status === "REVERTED" ? (
          <span className={styles.reverted}>
            <CheckKOIcon />
          </span>
        ) : null}
      </div>
    </div>
  )
}
