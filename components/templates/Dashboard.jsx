import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { ethers } from "ethers"
import { CONTRACT } from "@/config"

import {
  Account,
  TrxTypePanel,
  ProposalsList,
  PendingProposalsList,
} from "../modules/dashboard"
import { HumanWalletLogo, ThumbIcon, MailIcon, FailedIcon } from "../icons"
import { useHuman } from "@/state/human.context"
import styles from "./Dashboard.module.css"

export const Dashboard = () => {
  const { data: session } = useSession()
  const { human, processingProposal, requestProposal, getTokensBalance } =
    useHuman()

  const router = useRouter()

  const [balance, setBalance] = useState("0")
  const [minting, setMinting] = useState(false)

  const canMint =
    human?.status === "CONFIRMED" && !minting && !processingProposal

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
    if (!session) {
      router.push("/login")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    getTokenBalance()
    const interval = setInterval(() => {
      getTokenBalance()
    }, 5000)
    return () => clearInterval(interval)
  }, [human])

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.loginContainer}>
        <HumanWalletLogo />
      </div>
      <div>
        <Account session={session} human={human} />
      </div>
      <div className={styles.title}>
        <h2>Prueba distintas operaciones en nuestro Human Wallet</h2>
      </div>
      <div className={styles.modesContainer}>
        <TrxTypePanel
          literal="Acción sin 2FA que se confirma"
          icon={<ThumbIcon />}
          callback={requestMint}
        />{" "}
        <TrxTypePanel
          literal="Acción con 2FA que se confirma"
          icon={<MailIcon />}
          callback={requestMint}
        />{" "}
        <TrxTypePanel
          literal="Acción sin 2FA que da error"
          icon={<FailedIcon />}
          callback={requestMint}
        />
      </div>
      <div className={styles.proposalsContainer}>
        <PendingProposalsList />
        <ProposalsList />
      </div>
    </div>
  )
}
