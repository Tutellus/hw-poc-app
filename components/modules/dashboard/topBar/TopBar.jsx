import { useEffect } from "react"
import { useRouter } from "next/router"
import { HumanWalletDesktop, HumanWalletMobile } from "@/components/icons"
import { Account } from "@/components/modules/dashboard"
import { useSession } from "next-auth/react"
import { useHuman } from "@/state/human.context"

import styles from "./topBar.module.css"

export const TopBar = () => {
  const { data: session } = useSession()
  const { human } = useHuman()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/login")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return (
    <div className={styles.container}>
      <span className={styles.logoDesktop}>
        <HumanWalletDesktop />
      </span>
      <span className={styles.logoMobile}>
        <HumanWalletMobile />
      </span>
      <Account status={human?.status} address={human?.address} />
    </div>
  )
}
