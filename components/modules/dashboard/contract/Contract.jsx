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
      <div className="title">Execution policies</div>
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
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'center',
            }}>
              {fullApprovedOwner ? <div>Contract completely approved</div>
              : functionApprovedOwner ? <div>Mint function approved</div>
              : <div>Contract not approved</div>
              }
              {fullApprovedOwner ?
                <button
                  disabled={updatingPolicies}
                  onClick={() => updateAddressStatus(false)}
                >Revoke</button>
                :
                functionApprovedOwner ?
                <button
                  disabled={updatingPolicies}
                  onClick={() => updateFunctionStatus(false)}
                >Revoke</button>
                : <div>
                  <button
                    disabled={updatingPolicies}
                    onClick={() => updateAddressStatus(true)}
                  >Approve contract</button>
                  <> </>
                  <button
                    disabled={updatingPolicies}
                    onClick={() => updateFunctionStatus(true)}
                  >Approve mint function</button>
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
        </div>
      </div>
    </div>
  )
}