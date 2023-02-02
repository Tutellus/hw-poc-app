import { useState } from "react"
import { useContract } from "@/state/contract.context";
import ShieldCheckIcon from "@heroicons/react/24/outline/ShieldCheckIcon";
import ExclamationTriangleIcon from "@heroicons/react/24/outline/ExclamationTriangleIcon";

export const Tokens = () => {

  const { loadingContract, contract, balance, updateContract, mint, mintAndTransfer } = useContract();

  const [minting, setMinting] = useState(false)

  const canMint = !minting;

  const executeMint = async () => {
    setMinting(true)
    await mint()
    setMinting(false)

  }

  const executeMintAndTransfer = async () => {
    setMinting(true)
    await mintAndTransfer()
    setMinting(false)
  }

  return (
    <div className="box">
      <div className="title">Token Interaction</div>
      <div className="data">
        <div>My balance: {balance}</div>
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
            }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  disabled={!canMint}
                  onClick={executeMint}
                >
                  {minting ? 'Processing...' : 'Mint'}
                  <ShieldCheckIcon style={{
                    marginLeft: '8px',
                    height: '20px',
                    width: '20px',
                  }} />
                  
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'red',
                  }}
                  disabled={!canMint}
                  onClick={executeMintAndTransfer}
                >
                  {minting ? 'Processing...' : 'Mint and transfer'}
                  <ExclamationTriangleIcon style={{
                    marginLeft: '8px',
                    height: '20px',
                    width: '20px',
                  }} />
                </button>
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