import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useHuman } from "@/state/human.context"
import { CONTRACT } from "@/config"
import styles from "./balance.module.css"

export const Balance = () => {
  const [balance, setBalance] = useState("0")

  const { getTokensBalance } = useHuman()

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

  useEffect(() => {
    getTokenBalance()
    const interval = setInterval(() => {
      getTokenBalance()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.title}>Balance</div>
      <div className="balance">{balance}</div>
    </div>
  )
}
