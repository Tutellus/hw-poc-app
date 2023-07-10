import { useState } from "react"
import { useContract } from "@/state/contract.context"
import { useHuman } from "@/state/human.context"

export const Tokens = () => {
  const { loadingContract, contract, balance, updateContract } = useContract()
  const { human, processingProposal, requestProposal } = useHuman()

  const [minting, setMinting] = useState(false)

  const canMint = human?.status === "CONFIRMED" && !minting && !processingProposal

  const requestMint = async () => {
    setMinting(true)
    await requestProposal({
      title: "Mint 5 tokens",
      description: "We will mint 5 tokens for you",
      calls: [
        {
          target: contract.address,
          method: "mint(address,uint256)",
          data: "0x40c10f19000000000000000000000000297596275eebe2c7dd9145030a0364389285340b0000000000000000000000000000000000000000000000004563918244f40000",
          value: '0',
        },
      ],
    })
    setMinting(false)
  }

  return (
    <div className="box">
      <div className="title">Token Interaction</div>
      <div className="data">
        <div>My balance: {balance}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {contract ? (
            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
                disabled={!canMint}
                onClick={requestMint}
              >
                {minting ? "Processing..." : "Mint 5 tokens"}
              </button>
            </div>
          ) : (
            <button disabled={loadingContract} onClick={updateContract}>
              {loadingContract ? "Loading..." : "Load contract"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
