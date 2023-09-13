import { truncateAddress } from "@/utils/address"
import {
  Button,
  buttonTypes,
} from "@tutellus/tutellus-components/lib/components/atoms/button"
import { LinkIcon, SignOutIcon } from "@/components/icons"
import { signOut } from "next-auth/react"
import cx from "classnames"
import styles from "./account.module.css"

export const Account = ({ status, address }) => {
  const isDeploying = status === "PENDING"
  const isReady = status === "CONFIRMED"
  const isNotReady = !isDeploying && !isReady

  const addressClass = cx(styles.account, {
    [styles.pulse]: isNotReady,
  })

  return (
    <div className={styles.accountContainer}>
      <div className={addressClass}>
        {address
          ? truncateAddress({
              address,
              chars: 6,
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
