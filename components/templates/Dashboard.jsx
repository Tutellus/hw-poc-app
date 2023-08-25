import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { ethers } from "ethers"
import { CONTRACT } from "@/config"
import cx from "classnames"

import {
  Account,
  TrxTypePanel,
  ProposalsList,
  PendingProposalsList,
  Balance,
} from "../modules/dashboard"
import { HumanWalletLogo, ThumbIcon, MailIcon, FailedIcon } from "../icons"
import { useHuman } from "@/state/human.context"
import styles from "./dashboard.module.css"

export const Dashboard = () => {
  const { data: session } = useSession()
  const {
    human,
    processingProposal,
    requestProposal,
    subgraphStatus,
    getTokensBalance,
  } = useHuman()

  const router = useRouter()

  const [minting, setMinting] = useState(false)

  const canMint =
    human?.status === "CONFIRMED" && !minting && !processingProposal

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

    if (!session) {
      router.push("/login")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const proposalsContainerClass = cx(styles.proposalsContainer, {
    [styles.pulse]: !canMint,
  })

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.loginContainer}>
        <HumanWalletLogo />
      </div>
      <div>
        <Account
          session={session}
          human={human}
          subgraphStatus={subgraphStatus}
        />
        <Balance getTokensBalance={getTokensBalance} human={human} />
      </div>
      <div className={styles.title}>
        <h2>Prueba distintas operaciones en nuestro Human Wallet</h2>
      </div>
      <div className={styles.modesContainer}>
        <TrxTypePanel
          literal="Minteo de 10 tokens sin 2FA"
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
          literal="Minteo de 20 tokens con 2FA"
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
          literal="Acción sin 2FA que da error"
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
