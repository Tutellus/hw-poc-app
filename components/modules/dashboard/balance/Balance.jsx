import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { CONTRACT } from "@/config"
import cx from "classnames"
import styles from "./balance.module.css"

export const Balance = ({ human, getTokensBalance }) => {
  const [balance, setBalance] = useState("0")

  const isDeploying = human?.status === "PENDING"
  const isReady = human?.status === "CONFIRMED"
  const isNotReady = !isDeploying && !isReady

  const getTokenBalance = async () => {
    try {
      const response = await getTokensBalance([
        {
          token: CONTRACT.address,
          type: "ERC20",
        },
      ])

      if (response) {
        const value = response.items.find(
          (item) => item.token === CONTRACT.address
        ).bigNumber
        const innerBalance = ethers.utils.formatEther(value)
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
    getTokenBalance()
    const interval = setInterval(() => {
      getTokenBalance()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={balanceClass}>
      <div className={styles.title}>Balance</div>
      <div className="balance">{balance}</div>
    </div>
  )
}
