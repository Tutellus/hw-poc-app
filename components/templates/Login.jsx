import {
  Button,
  buttonTypes,
} from "@tutellus/tutellus-components/lib/components/atoms/button"
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
  const [email, setEmail] = useState("insert email here")
  const [emailError, showEmailError] = useState(false)

  const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    return regex.test(email)
  }

  useEffect(() => {
    session ? router.push("/dashboard") : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const isLoading = status === "loading"
  const handleSignIn = () => {
    if (!isValidEmail(email)) {
      showEmailError(true)
      return
    } else {
      showEmailError(false)
      signIn("customJWT", { email })
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoContainer}>
        <HumanWalletDesktop />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSignIn()
        }}
      >
        <input
          type="text"
          placeholder="insert email here"
          value={email}
          onFocus={() => {
            setEmail("")
            showEmailError(false)
          }}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleSignIn()
            }
          }}
        />
        {emailError && (
          <p className={styles.error}>Please insert a valid email address</p>
        )}
        <Button
          type={buttonTypes.PRIMARY}
          iconLeft={<DiscordIcon />}
          onClick={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "LOGIN WITH EMAIL"}
        </Button>
      </form>
    </div>
  )
}
