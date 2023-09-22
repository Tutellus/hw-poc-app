import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import styles from "./selectProvider.module.css"

export const SelectProvider = () => {
  const [storedProvider, setStoredProvider] = useState("")
  const router = useRouter()

  useEffect(() => {
    setStoredProvider(localStorage.getItem("provider"))
  }, [])

  const handleProvider = (provider) => {
    localStorage.setItem("provider", provider)
    setStoredProvider(provider)
    router.reload("/dashboard")
  }

  return (
    <div className={styles.selectProvider}>
      <select
        onChange={(e) => handleProvider(e.target.value)}
        value={storedProvider}
      >
        <option value="mock">Mock Provider</option>
        <option value="web3auth">Web3 Auth</option>
      </select>
    </div>
  )
}
