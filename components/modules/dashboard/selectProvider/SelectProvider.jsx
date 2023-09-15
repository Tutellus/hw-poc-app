import { useEffect, useState } from "react"
import styles from "./selectProvider.module.css"

export const SelectProvider = () => {
  const [storedProvider, setStoredProvider] = useState("")
  useEffect(() => {
    setStoredProvider(localStorage.getItem("provider"))
    console.log(">>>> handleProvider SELECT PROVIDER", storedProvider)
  }, [])

  const handleProvider = (provider) => {
    localStorage.setItem("provider", provider)
    setStoredProvider(provider)
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
