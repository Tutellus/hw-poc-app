import { useEffect, useState } from "react"
import Head from "next/head"
import { ArrowLeftIcon } from "@tutellus/tutellus-components/lib/components/icons/shared/ArrowLeftIcon"
import {
  Button,
  buttonTypes,
} from "@tutellus/tutellus-components/lib/components/atoms/button"
import { ProposalDetail } from "@/components/modules"
import { useHuman } from "@/state/human.context"
import { HumanWalletLogo } from "@/components/icons"
import styles from "./proposalDetailPage.module.css"

const Page = ({ id }) => {
  const { humanSDK } = useHuman()
  const [proposal, setProposal] = useState()

  useEffect(() => {
    document.body.classList.add("dark")
    if (!humanSDK) return
    humanSDK.getProposal({ proposalId: id }).then((proposal) => {
      console.log("proposal", proposal)
      setProposal(proposal)
    })
  }, [humanSDK, id])

  const title = proposal?.title || "Loading Proposal title"
  const description = proposal?.description || "Loading Proposal description"

  return (
    <>
      <Head>
        <title>HumanWallet Proposal</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.logo}>
          <HumanWalletLogo />
        </div>
        <Button
          iconLeft={<ArrowLeftIcon />}
          onClick={() => window.history.back()}
          type={buttonTypes.OUTLINE}
        >
          Back
        </Button>
        <h2 className={styles.title}>{title}</h2>
        <h3 className={styles.description}>{description}</h3>
        <ProposalDetail proposal={proposal} />
      </div>
    </>
  )
}

export default Page

export const getServerSideProps = async ({ query }) => {
  return {
    props: {
      id: query.id,
    },
  }
}
