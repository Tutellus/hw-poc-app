import { truncateAddress } from "@/utils/address"
import {
  Button,
  buttonTypes,
} from "@tutellus/tutellus-components/lib/components/atoms/button"
import { LinkIcon, SignOutIcon } from "@/components/icons"
import { signOut } from "next-auth/react"
import cx from "classnames"
import styles from "./account.module.css"

export const Account = ({ session, human, subgraphStatus }) => {
  const user = session?.user
  const { status } = subgraphStatus || {}
  const { address } = human || {}

  const isDeploying = human?.status === "PENDING"
  const isReady = human?.status === "CONFIRMED"
  const isNotReady = !isDeploying && !isReady

  const statusClass = cx({
    [styles.sgHealthy]: status === "HEALTHY",
    [styles.sgUnhealthy]: status === "UNHEALTHY",
  })

  const addressClass = cx(styles.account, {
    [styles.pulse]: isNotReady,
  })

  return (
    <div className={styles.accountContainer}>
      {subgraphStatus && (
        <div className={styles.subgraphStatus}>
          <span className={styles.label}>Status</span>
          <span className={statusClass}></span>
        </div>
      )}
      <div className={addressClass}>
        {address
          ? truncateAddress({
              address,
            })
          : "No human connected"}
        <span className={styles.link}>
          <LinkIcon />
        </span>
      </div>
      <div className={styles.userEmail}>
        <Button
          type={buttonTypes.OUTLINE}
          iconLeft={<SignOutIcon />}
          onClick={() => signOut()}
        ></Button>
      </div>
    </div>
  )
}
