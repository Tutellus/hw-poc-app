import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { truncateAddress } from "@/utils/address"
import {
  Button,
  buttonTypes,
} from "@tutellus/tutellus-components/lib/components/atoms/button"
import { LinkIcon, SignOutIcon } from "@/components/icons"
import { SelectProvider } from "@/components/modules/dashboard"
import { signOut } from "next-auth/react"
import cx from "classnames"
import styles from "./account.module.css"

export const Account = ({ status, address }) => {
  const [storedProvider, setStoredProvider] = useState("")
  const router = useRouter()
  const isDeploying = status === "PENDING"

  const addressClass = cx(styles.account, {
    [styles.pulse]: isDeploying,
  })

  const handleProvider = (provider) => {
    localStorage.setItem("provider", provider)
    setStoredProvider(provider)
    router.reload("/dashboard")
  }

  const handleSignOut = () => {
    localStorage.setItem("provider", "mock")
    signOut()
  }

  useEffect(() => {
    const previousValue = localStorage.getItem("provider")
    setStoredProvider(previousValue)
  }, [storedProvider])

  return (
    <div className={styles.accountContainer}>
      <SelectProvider
        handleProvider={handleProvider}
        storedProvider={storedProvider}
      />
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
          onClick={handleSignOut}
        ></Button>
      </div>
    </div>
  )
}
