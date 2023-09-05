import { Button } from "@tutellus/tutellus-components/lib/components/atoms/button"
import { DiscordIcon } from "@tutellus/tutellus-components/lib/components/icons/brands/DiscordIcon"
import { HumanWalletDesktop } from "../icons"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/router"
import styles from "./dashboard.module.css"

export const Login = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const isLoading = status === "loading"

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoContainer}>
        <HumanWalletDesktop />
      </div>
      <Button
        iconLeft={<DiscordIcon />}
        onClick={() => signIn("discord")}
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "CONNECT WITH DISCORD"}
      </Button>
    </div>
  )
}
