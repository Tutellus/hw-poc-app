import { useState } from "react"
import { truncateAddress } from "@/utils/address"
import { Button } from "@tutellus/tutellus-components/lib/components/atoms/button"
import { CopyIcon, SignOutIcon } from "@/components/icons"
import { signOut } from "next-auth/react"
import cx from "classnames"
import styles from "./account.module.css"

export const Account = ({ session, human, subgraphStatus }) => {
  const [extendedAddress, setExtendedAddress] = useState(false)
  const user = session?.user
  const { status, delay } = subgraphStatus || {}
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
      <div className={styles.subgraphStatus}>
        <span className={styles.label}>Status</span>
        <span className={statusClass}></span>
      </div>
      <div
        className={cx(styles.account, {
          [styles.pulse]: isNotReady,
        })}
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
      <div className={styles.userEmail}>
        <Button iconLeft={<SignOutIcon />} onClick={() => signOut()}></Button>
      </div>
    </div>
  )
}
