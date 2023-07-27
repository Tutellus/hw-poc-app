import { explorerLink, truncateAddress } from "@/utils/address";
import { useState } from "react";
import { Button, buttonColors } from "@tutellus/tutellus-components/lib/components/atoms/button";

export const Proposal = ({ proposal, processingProposal, confirmProposal }) => {
  const [code, setCode] = useState("123456");

  const changeCode = (e) => {
    setCode(e.target.value);
  };

  const requiresConfirmation = proposal.required2FA && proposal.status === "PENDING";
  const showNonce = proposal.status !== "PENDING" && proposal.status !== "SIGNABLE";

  return (
    <div className="proposal">
      <div className="block">
        <div className="keys">
          <div>Title</div>
          <div>Description</div>
          <div>Contract</div>
          <div>Status</div>
          {showNonce && <div>Nonce</div>}
        </div>
        <div className="values">
          <div>{proposal.title}</div>
          <div>{proposal.description}</div>
          <a
            style={{ color: "white" }}
            href={explorerLink({ value: proposal.sender, type: "address" })}
            target="_blank"
            rel="noreferrer"
          >
            {truncateAddress(
              {
                address: proposal.sender,
              },
              { noLink: true }
            )}
          </a>

          <div>{proposal.status}</div>
          {showNonce && <div>{proposal.userOp?.nonce}</div>}
        </div>
      </div>

      {requiresConfirmation && (
        <div className="block">
          <input type="text" placeholder="2FA Code" value={code} onChange={changeCode} />
          <Button
            disabled={processingProposal}
            onClick={() => confirmProposal({ proposalId: proposal._id, code })}
            color={buttonColors.ACCENT}
          >
            Verify
          </Button>
        </div>
      )}

      {proposal.txHash && (
        <div className="block">
          <a
            style={{ color: "white" }}
            href={explorerLink({ value: proposal.txHash, type: "tx" })}
            target="_blank"
            rel="noreferrer"
          >
            Watch on Explorer
          </a>
        </div>
      )}
    </div>
  );
};
