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

  const requestMint = async () => {
    setMinting(true)
    const contractInterface = new ethers.utils.Interface(CONTRACT.abi)
    const calldata = contractInterface.encodeFunctionData("mint", [
      human.address,
      ethers.utils.parseEther("5"),
    ])
    await requestProposal({
      title: "Mint 5 tokens",
      description: "We will mint 5 tokens for you",
      calls: [
        {
          target: CONTRACT.address,
          method: "mint(address,uint256)",
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
          literal="Minteo de 5 tokens con 2FA"
          icon={<ThumbIcon />}
          callback={requestMint}
          isDisabled={!canMint}
        />
        <TrxTypePanel
          literal="Acción con 2FA que se confirma"
          icon={<MailIcon />}
          callback={requestMint}
          isDisabled={!canMint}
        />
        <TrxTypePanel
          literal="Acción sin 2FA que da error"
          icon={<FailedIcon />}
          callback={requestMint}
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
