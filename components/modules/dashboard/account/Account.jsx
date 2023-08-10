import { useState } from "react"
import { truncateAddress } from "@/utils/address"
import { Button } from "@tutellus/tutellus-components/lib/components/atoms/button"
import { CopyIcon } from "@/components/icons"
import { signOut } from "next-auth/react"
import cx from "classnames"
import styles from "./account.module.css"

export const Account = ({ session, human, subgraphStatus }) => {
  const [extendedAddress, setExtendedAddress] = useState(false)
  const user = session?.user
  const { status, delay } = subgraphStatus || {}
  console.log({ subgraphStatus })

  const { address } = human || {}

  const isDeploying = human?.status === "PENDING"
  const isReady = human?.status === "CONFIRMED"
  const isNotReady = !isDeploying && !isReady

  const statusClass = cx({
    [styles.sgHealthy]: status === "HEALTHY",
    [styles.sgUnhealthy]: status === "UNHEALTHY",
  })

  return (
    <div className={styles.accountContainer}>
      <div
        className={cx(styles.account, {
          [styles.pulse]: isDeploying,
        })}
        onMouseEnter={() => setExtendedAddress(true)}
        onMouseLeave={() => setExtendedAddress(false)}
      >
        {address
          ? truncateAddress({
              address,
              extend: extendedAddress,
            })
          : "No human connected"}
        <span>
          <CopyIcon />
        </span>
      </div>
      <span className={styles.accountLabel}>Ver en el explorador</span>
      <div className={styles.subgraphStatus}>
        <span>
          Subgraph status: <span className={statusClass}>{status}</span>
        </span>
      </div>
      <div className={styles.userEmail}>
        {user?.email || "No user"}
        <Button onClick={() => signOut()}>Logout</Button>
      </div>
    </div>
  )
}
