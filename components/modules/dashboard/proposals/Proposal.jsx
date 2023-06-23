import { explorerLink, truncateAddress } from "@/utils/address"
import { ethers } from "ethers"

export const Proposal = ({
  proposal,
  canSign,
  confirmSignAndSubmitFn,
  signAndSubmitFn,
}) => {
  const renderParam = (param) => {
    if (ethers.utils.isAddress(param)) {
      return truncateAddress({
        address: param,
        stringify: true,
      })
    }
    return param
  }

  const renderParams = (params) => {
    if (!params) return ""
    return params.reduce((acc, param) => {
      if (acc === "") {
        return renderParam(param)
      }
      return `${acc}, ${renderParam(param)}`
    }, "")
  }

  const requiresConfirmation =
    proposal.isMasterRequired && proposal.masterSignature === "0x"
  const isSignable = !requiresConfirmation && proposal.status === "SIGNABLE"

  console.log("proposal", proposal)
  return (
    <div className="proposal">
      <div className="block">
        <div className="keys">
          <div>ID</div>
          <div>Contract</div>
          <div>Description</div>
          <div>Status</div>
        </div>
        <div className="values">
          <div>{proposal._id}</div>
          <a
            style={{ color: "white" }}
            href={explorerLink({ value: proposal.sender, type: "address" })}
            target="_blank"
            rel="noreferrer"
          >
            {truncateAddress({
              address: proposal.sender,
            })}
          </a>
          <div>{proposal.description}</div>
          <div>{proposal.status}</div>
        </div>
      </div>

      {requiresConfirmation && (
        <div className="block">
          <input type="text" placeholder="2FA Code" value={proposal.code2fa} />
          <button onClick={() => confirmSignAndSubmitFn(proposal)}>
            {" "}
            Verify{" "}
          </button>
        </div>
      )}

      {isSignable && (
        <div className="block">
          <button
            disabled={!canSign}
            onClick={() =>
              signAndSubmitFn({
                proposalId: proposal._id,
              })
            }
          >
            {" "}
            Sign{" "}
          </button>
        </div>
      )}
    </div>
  )
}
