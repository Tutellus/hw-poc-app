import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { CONTRACT, tokens } from "@/config"
import cx from "classnames"

import {
  TrxTypePanel,
  ProposalsList,
  PendingProposalsList,
  Balance,
} from "../modules/dashboard"
import { ThumbIcon, MailIcon, FailedIcon } from "../icons"
import { useHuman } from "@/state/human.context"
import styles from "./dashboard.module.css"

export const Dashboard = () => {
  const { human, processingProposal, requestProposal, getTokensBalance } =
    useHuman()

  const [minting, setMinting] = useState(false)
  const [balance, setBalance] = useState("0")
  const isDeploying = human?.status === "PENDING"
  const isReady = human?.status === "CONFIRMED"
  const isNotReady = !isDeploying && !isReady

  const canMint =
    human?.status === "CONFIRMED" && !minting && !processingProposal

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
        setBalance(innerBalance)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const balanceClass = cx(styles.balanceContainer, {
    [styles.pulse]: isNotReady,
  })

  useEffect(() => {
    updateTokenBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [human?.status])

  const requestMint = async ({
    title = "Mint",
    description = "Minting",
    value = "0",
    isTransfer = false,
  }) => {
    setMinting(true)
    const method = isTransfer ? "transfer" : "mint"
    const callMethod = isTransfer
      ? "transfer(address,uint256)"
      : "mint(address,uint256)"

    const contractInterface = new ethers.utils.Interface(CONTRACT.abi)
    const calldata = contractInterface.encodeFunctionData(method, [
      human.address,
      ethers.utils.parseEther(value.toString()),
    ])
    await requestProposal({
      title,
      description,
      calls: [
        {
          target: CONTRACT.address,
          method: callMethod,
          data: calldata,
          value: "0",
        },
      ],
    })
    setMinting(false)
  }

  useEffect(() => {
    document.body.classList.add("dark")
  }, [])

  const proposalsContainerClass = cx(styles.proposalsContainer, {
    [styles.pulse]: !canMint,
  })

  return (
    <div className={styles.dashboardContainer}>
      <Balance balanceClass={balanceClass} balance={balance} />

      <div className={styles.title}>
        <h2>Try different operations in our Human Wallet</h2>
      </div>
      <div className={styles.modesContainer}>
        <TrxTypePanel
          literal="Mint 10 tokens without 2FA"
          icon={<ThumbIcon />}
          callback={() =>
            requestMint({
              title: "Mint without 2FA",
              description: "Minting 10 tokens without 2FA",
              value: "10",
            })
          }
          isDisabled={!canMint}
        />
        <TrxTypePanel
          literal="Mint 20 tokens with 2FA"
          icon={<MailIcon />}
          callback={() =>
            requestMint({
              title: "Mint with 2FA",
              description: "Minting 20 tokens with 2FA",
              value: "20",
            })
          }
          isDisabled={!canMint}
        />
        <TrxTypePanel
          literal="Error transferring tokens with 2FA"
          icon={<FailedIcon />}
          callback={() =>
            requestMint({
              title: "Transfer tokens",
              description: "Transfering 1000 tokens",
              value: "1000",
              isTransfer: true,
            })
          }
          isDisabled={!canMint}
        />
      </div>
      <div className={proposalsContainerClass}>
        <PendingProposalsList />
        <ProposalsList />
      </div>
    </div>
  )
}
