import { useHuman } from "@/state/human.context"
import { Proposal } from "./Proposal"

export const ProposalsList = () => {
  const { proposals, processingProposal, confirmProposal } = useHuman()

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
              processingProposal={processingProposal}
              confirmProposal={confirmProposal}
            />
          ))
        ) : (
          <p>No available proposals yet</p>
        )}
      </div>
    </div>
  )
}
