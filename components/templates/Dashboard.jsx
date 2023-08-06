import { useEffect } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { Human } from "../modules/dashboard/human/Human"
import { Account } from "../modules/dashboard/account/Account"
import { Tokens } from "../modules/dashboard/tokens/Tokens"
import { ProposalsList } from "../modules/dashboard/proposals/ProposalsList"
import { HumanWalletLogo } from "../icons"
import { useHuman } from "@/state/human.context"
import styles from "./Dashboard.module.css"

export const Dashboard = () => {
  const { data: session } = useSession()
  const { human } = useHuman()

  const router = useRouter()
  console.log({ session })

  useEffect(() => {
    if (!session) {
      router.push("/login")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.loginContainer}>
        <HumanWalletLogo />
      </div>
      <div>
        <Account session={session} human={human} />
      </div>
      <div className={styles.title}>
        <h2>Prueba distintas operaciones en nuestro Human Wallet</h2>
      </div>
      <div className={styles.modesContainer}>
        <Tokens />
        <ProposalsList />
      </div>
    </div>
  )
}
