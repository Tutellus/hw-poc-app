import { useState } from "react"
import { useContract } from "@/state/contract.context";

export const Tokens = () => {

  const { loadingContract, contract, balance, updateContract, mint } = useContract();

  const [amount, setAmount] = useState('')
  const [minting, setMinting] = useState(false)

  const amountFloat = parseFloat(amount)
  const canMint = !minting && amountFloat !== NaN && amountFloat > 0

  const innerMint = async () => {
    setMinting(true)
    await mint(amount)
    setMinting(false)
    setAmount('')
  }

  return (
    <div className="box">
      <div className="title">My tokens</div>
      <div className="data">
        <div>{balance}</div>
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
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                />
                <button
                  disabled={!canMint}
                  onClick={innerMint}
                >
                  {minting ? 'Processing...' : 'Mint'}
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