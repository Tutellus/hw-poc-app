import { useEffect, useState } from "react"
import Head from "next/head"
import { ProposalDetail } from "@/components/modules"
import { useHuman } from "@/state/human.context"
import styles from "./proposalDetailPage.module.css"

const Page = ({ id }) => {
  const { humanSDK } = useHuman()
  const [proposal, setProposal] = useState()

  useEffect(() => {
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
