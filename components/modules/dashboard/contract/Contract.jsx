import { useState } from "react"
import { useContract } from "@/state/contract.context";

export const Contract = () => {

  const {
    loadingContract,
    contract,
    updatingPolicies,
    fullApprovedOwner,
    functionApprovedOwner,
    updateContract,
    updateAddressStatus,
    updateFunctionStatus,
  } = useContract();

  return (
    <div className="box" style={{
      gridColumn: '1 / 5',
    }}>
      <div className="title">My contract</div>
      <div className="data">
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          {contract
            ? <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
            }}>
              {fullApprovedOwner ? <div>FULL APPROVED</div>
              : functionApprovedOwner ? <div>FUNCTION APPROVED</div>
              : <div>NOT APPROVED</div>
              }
              {fullApprovedOwner ?
                <button
                  disabled={updatingPolicies}
                  onClick={() => updateAddressStatus(false)}
                >Set full approve FALSE</button>
                :
                functionApprovedOwner ?
                <button
                  disabled={updatingPolicies}
                  onClick={() => updateFunctionStatus(false)}
                >Set function approve FALSE</button>
                : <div>
                  <button
                    disabled={updatingPolicies}
                    onClick={() => updateAddressStatus(true)}
                  >Set full approve TRUE</button>
                  <> </>
                  <button
                    disabled={updatingPolicies}
                    onClick={() => updateFunctionStatus(true)}
                  >Set function approve TRUE</button>
                </div>
              }
              </div>
            : <button
                disabled={loadingContract}
                onClick={updateContract}
              >
                {loadingContract ? 'Loading...' : 'Load contract'}
              </button>
          }
          {contract && updatingPolicies ? <div>Updating policies...</div> : null}
        </div>
      </div>
    </div>
  )
}