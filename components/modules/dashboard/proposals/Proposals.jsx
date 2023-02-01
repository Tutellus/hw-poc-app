/* eslint-disable react-hooks/exhaustive-deps */
import { useProposals } from "@/state/proposals.context";
import { useSafe } from "@/state/safe.context";
import { Proposal } from "./Proposal"

export const Proposals = () => {

  const { ownerSafeData, masterSafeData } = useSafe();
  const { ownerProposals, masterProposals } = useProposals();

  return (
    <div className="proposals">
      <div className="box">
          <div className="title">{`Safe Transactions`}</div>
          {ownerProposals?.length > 0
              ? <table>
                <thead>
                    <th>#</th>
                    <th>Status</th>
                    <th>Actions</th>
                </thead>
                <div className="table-body">
                  {ownerProposals.map((proposal, index) =>
                    <Proposal
                      key={index}
                      safeData={ownerSafeData}
                      proposal={proposal}
                    />
                  )}
                </div>
              </table>
              : <div className="data">No proposals yet</div>
          }
      </div>
      <div className="box">
      <div className="title">{`Risky Transactions`}</div>
        {masterProposals?.length > 0
            ? <table>
              <thead>
                  <th>#</th>
                  <th>Status</th>
                  <th>Actions</th>
              </thead>
              <div className="table-body">
                {masterProposals.map((proposal, index) =>
                  <Proposal
                    key={index}
                    safeData={masterSafeData}
                    proposal={proposal}
                />)}
              </div>
            </table>
            : <div className="data">No proposals yet</div>
        }
      </div>
    </div>
  
  );
};

