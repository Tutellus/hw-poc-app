import { useEffect, useState } from "react"
import { GearIcon, Web3authIcon } from "@/components/icons"
import cx from "classnames"

import styles from "./selectProviderIcon.module.css"

export const SelectProviderIcon = ({ isDisabled }) => {
  const [storedProvider, setStoredProvider] = useState("")

  useEffect(() => {
    setStoredProvider(localStorage.getItem("provider"))
  }, [])

  const handleProvider = (provider) => {
    localStorage.setItem("provider", provider)
    setStoredProvider(provider)
  }

  const mockIconClass = cx(styles.selectorWithIcon, {
    [styles.mockIsSelected]: storedProvider === "mock",
    [styles.isDisabled]: isDisabled,
  })

  const w3authIconClass = cx(styles.selectorWithIcon, {
    [styles.web3authIsSelected]: storedProvider === "web3auth",
    [styles.isDisabled]: isDisabled,
  })

  const selectorTitleClass = cx(styles.selectorTitle, {
    [styles.isDisabled]: isDisabled,
  })

  return (
    <div className={styles.providerSelect}>
      <p className={selectorTitleClass}>Select your Provider</p>
      <div className={styles.selectorContainer}>
        <div className={mockIconClass} onClick={() => handleProvider("mock")}>
          <GearIcon />
          <span className={styles.selectorLabel}>Mocked Provider</span>
        </div>
        <div
          className={w3authIconClass}
          onClick={() => handleProvider("web3auth")}
        >
          <Web3authIcon />
          <span className={styles.selectorLabel}>Web3Auth Provider</span>
        </div>
      </div>
    </div>
  )
}
