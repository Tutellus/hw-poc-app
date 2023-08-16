import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { CONTRACT, tokens } from "@/config"
import cx from "classnames"
import styles from "./balance.module.css"

export const Balance = ({ human, getTokensBalance }) => {
  const [balance, setBalance] = useState("0")

  const isDeploying = human?.status === "PENDING"
  const isReady = human?.status === "CONFIRMED"
  const isNotReady = !isDeploying && !isReady

  const updateTokenBalance = async () => {
    try {
      const response = await getTokensBalance({
        tokens,
      })

      if (response) {
        const value = response.items.find(
          (item) => item.token === CONTRACT.address
        ).bigNumber
        const innerBalance = ethers.utils.formatEther(value)
        console.log("innerBalance", innerBalance)
        setBalance(innerBalance)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const balanceClass = cx(styles.container, {
    [styles.pulse]: isNotReady,
  })

  useEffect(() => {
    updateTokenBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [human?.status, balance])

  return (
    <div className={balanceClass}>
      <div className={styles.title}>Balance</div>
      <div className="balance">{balance}</div>
    </div>
  )
}
