import { Button } from "@tutellus/tutellus-components/lib/components/atoms/button"
import { DiscordIcon } from "@tutellus/tutellus-components/lib/components/icons/brands/DiscordIcon"
import { HumanWalletDesktop } from "../icons"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/router"
import styles from "./dashboard.module.css"

export const Login = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("dave74@gmail.com")

  useEffect(() => {
    session ? router.push("/dashboard") : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const isLoading = status === "loading"
  const handleSignIn = () => {
    console.log(">>>>> handleSignIn", email)
    signIn("customJWT", { email })
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoContainer}>
        <HumanWalletDesktop />
      </div>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        iconLeft={<DiscordIcon />}
        onClick={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "LOGIN WITH EMAIL"}
      </Button>
    </div>
  )
}
