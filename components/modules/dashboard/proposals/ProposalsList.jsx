import { useHuman } from "@/state/human.context"
import { Proposal } from "./Proposal"

export const ProposalsList = () => {
  const { proposals, processing, confirmProposal, signAndSubmitProposal } =
    useHuman()
  const confirmSignAndSubmitFn = async (proposal) => {
    try {
      const innerPreUserOp = await confirmProposal({
        proposalId: proposal._id,
        code: proposal.code2fa,
      })
      await signAndSubmitProposal({
        proposalId: innerPreUserOp._id,
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div
      className="box"
      style={{
        gridColumn: "1 / 5",
      }}
    >
      <div className="title">Proposals</div>
      <div className="data">
        {proposals?.length > 0 ? (
          proposals.map((proposal, index) => (
            <Proposal
              key={index}
              proposal={proposal}
              canSign={!processing}
              confirmSignAndSubmitFn={confirmSignAndSubmitFn}
              signAndSubmitFn={signAndSubmitProposal}
            />
          ))
        ) : (
          <p>No available proposals yet</p>
        )}
      </div>
    </div>
  )
}
