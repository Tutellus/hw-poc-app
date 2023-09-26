import {
  Button,
  buttonTypes,
} from "@tutellus/tutellus-components/lib/components/atoms/button"
import { ethers } from "ethers"
import { HumanWalletDesktop } from "../icons"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/router"
import styles from "./dashboard.module.css"
import {
  MobileAnimation,
  SelectProviderIcon,
} from "@/components/modules/dashboard"

export const Login = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [emailError, showEmailError] = useState(false)
  const [secretKey, setSecretKey] = useState("")

  const noEmptyEmail = email === "" || email === "Email address"
  const keccaKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(secretKey))

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
      localStorage.setItem("key", keccaKey)
      signIn("customJWT", { email })
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.logoContainer}>
          <HumanWalletDesktop />
        </div>
        <div className={styles.formContainer}>
          <h2 className={styles.loginSubtitle}>Sign up for an account</h2>
          <input
            disabled={isLoading}
            type="text"
            placeholder="Email address"
            value={email}
            onFocus={() => {
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
          {!noEmptyEmail && (
            <input
              className={styles.secretKey}
              disabled={isLoading}
              type="text"
              placeholder="Enter secret key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          )}
          {emailError && (
            <p className={styles.error}>Please insert a valid email address</p>
          )}
          <SelectProviderIcon
            isDisabled={isLoading || noEmptyEmail || secretKey === ""}
          />
          <Button
            type={buttonTypes.PRIMARY}
            onClick={handleSignIn}
            isDisabled={isLoading || noEmptyEmail || secretKey === ""}
          >
            {isLoading ? "Logging in..." : "SIGN UP"}
          </Button>
        </div>
      </div>
      <div className={styles.rightPanel}>
        <h1 className={styles.subTitle}>Web3 wallet for Web2 users</h1>
        <p className={styles.description}>
          HumanWallet solves the pain DAPPs have in the crypto scene, attracting
          new users with zero knowledge about crypto and Web3 wallets.
        </p>
        <MobileAnimation />
      </div>
    </div>
  )
}
