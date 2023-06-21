import { useEffect } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { Human } from "../modules/dashboard/human/Human"
import { Account } from "../modules/dashboard/account/Account"
import { Tokens } from "../modules/dashboard/tokens/Tokens"
import { Contract } from "../modules/dashboard/contract/Contract"
import { PreUserOps } from "../modules/dashboard/preUserOps/PreUserOps"

export const Dashboard = () => {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/login")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return (
    <div className="dashboard">
      {/* my email */}
      <Account />

      {/* my wallet */}
      <Human />

      {/* your tokens */}
      <Tokens />

      {/* your contract */}
      <Contract />

      {/* owner proposals list */}
      <PreUserOps />
    </div>
  )
}
