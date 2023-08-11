import { useEffect, useState } from "react"
import Head from "next/head"
import { ProposalDetail } from "@/components/modules"
import { useHuman } from "@/state/human.context"

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

  return (
    <>
      <Head>
        <title>HumanWallet Proposal</title>
      </Head>
      <div>
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
